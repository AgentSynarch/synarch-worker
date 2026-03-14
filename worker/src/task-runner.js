const cron = require("node-cron");
const { EventEmitter } = require("events");

class TaskRunner extends EventEmitter {
  constructor(logger, client, metrics, options = {}) {
    super();
    this.logger = logger;
    this.client = client;
    this.metrics = metrics;
    this.maxConcurrent = options.maxConcurrent || 5;
    this.taskTimeout = options.taskTimeout || 30000;
    this.cronSchedule = options.cronSchedule || "*/5 * * * *";
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.running = 0;
    this.cronJob = null;
    this.queue = [];
    this.results = new Map();
    this.isShuttingDown = false;
    this.runCount = 0;
    this.taskTimers = new Map(); // per-task timing
  }

  start(tasks) {
    this.tasks = this._sortByDependencies(tasks);
    this.isShuttingDown = false;

    this.logger.info(`Registered ${this.tasks.length} task(s):`);
    for (const t of this.tasks) {
      const deps = t.dependsOn ? ` -> depends on [${t.dependsOn.join(", ")}]` : "";
      const prio = t.priority ? ` (priority: ${t.priority})` : "";
      this.logger.info(`  ${t.name}${deps}${prio}`);
    }

    // Sort by priority within dependency groups (higher = runs first)
    this.tasks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    this.tasks = this._sortByDependencies(this.tasks);

    // Run once immediately
    this._runAll();

    // Then run on cron schedule
    this.cronJob = cron.schedule(this.cronSchedule, () => {
      if (!this.isShuttingDown) {
        this.runCount++;
        this.logger.separator(`CYCLE ${this.runCount}`);
        this._runAll();
      }
    });

    this.logger.info(`Task runner started`, {
      schedule: this.cronSchedule,
      concurrency: this.maxConcurrent,
      timeout: `${this.taskTimeout}ms`,
    });
  }

  stop() {
    this.isShuttingDown = true;
    if (this.cronJob) {
      this.cronJob.stop();
      this.logger.info("Task runner stopped");
    }
    this.emit("stop");
  }

  _sortByDependencies(tasks) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set(); // cycle detection
    const taskMap = new Map(tasks.map((t) => [t.name, t]));

    const visit = (task) => {
      if (visited.has(task.name)) return;
      if (visiting.has(task.name)) {
        this.logger.error(`Circular dependency detected: ${task.name}`);
        return;
      }
      visiting.add(task.name);
      if (task.dependsOn) {
        for (const dep of task.dependsOn) {
          if (taskMap.has(dep)) visit(taskMap.get(dep));
          else this.logger.warn(`Task "${task.name}" depends on unknown task "${dep}"`);
        }
      }
      visiting.delete(task.name);
      visited.add(task.name);
      sorted.push(task);
    };

    tasks.forEach(visit);
    return sorted;
  }

  async _runAll() {
    const cycleStart = Date.now();
    let executed = 0;
    let skipped = 0;

    for (const task of this.tasks) {
      if (this.isShuttingDown) break;

      // Circuit breaker check
      if (this.metrics.isCircuitOpen(task.name)) {
        this.logger.warn(`[${task.name}] Circuit breaker open, skipping`);
        skipped++;
        continue;
      }

      // Check dependencies
      if (task.dependsOn && task.dependsOn.length > 0) {
        const unmet = task.dependsOn.filter((dep) => {
          const result = this.results.get(dep);
          return !result || result.status === "failed";
        });
        if (unmet.length > 0) {
          this.logger.warn(`[${task.name}] Skipped: unmet dependencies [${unmet.join(", ")}]`);
          skipped++;
          continue;
        }
      }

      // Check condition
      if (task.condition && typeof task.condition === "function") {
        try {
          const shouldRun = await task.condition(this.results);
          if (!shouldRun) {
            this.logger.info(`[${task.name}] Skipped: condition not met`);
            skipped++;
            continue;
          }
        } catch {
          // condition threw, run anyway
        }
      }

      if (this.running >= this.maxConcurrent) {
        this.queue.push(task);
        continue;
      }

      await this._executeWithRetry(task);
      executed++;
    }

    const cycleDuration = Date.now() - cycleStart;
    this.logger.info(`Cycle complete`, { executed, skipped, queued: this.queue.length, duration: `${cycleDuration}ms` });
    this.emit("cycle-complete", { executed, skipped, duration: cycleDuration });
  }

  async _executeWithRetry(task, attempt = 1) {
    this.running++;
    const name = task.name || "unnamed";
    const startTime = Date.now();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${this.taskTimeout}ms`)), this.taskTimeout)
    );

    try {
      const prefix = attempt > 1 ? ` (retry ${attempt - 1}/${this.maxRetries})` : "";
      this.logger.info(`> ${name}${prefix}`);

      const taskLogger = this.logger.child(name);

      const result = await Promise.race([
        task.run(taskLogger, this.client, {
          attempt,
          previousResults: this.results,
          metrics: this.metrics,
        }),
        timeoutPromise,
      ]);

      const duration = Date.now() - startTime;
      this.results.set(name, { status: "success", data: result, duration, timestamp: Date.now() });
      this.metrics.recordSuccess(name, duration);

      this.logger.info(`  OK: ${name}`, { duration: `${duration}ms` });
      this.client.reportLog("info", `Task completed: ${name}`, { duration, attempt });
      this.emit("task-success", { name, duration, attempt });
    } catch (err) {
      const duration = Date.now() - startTime;

      if (attempt <= this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        this.logger.warn(`  FAIL: ${name} (attempt ${attempt}) -- ${err.message}, retrying in ${delay}ms`);
        this.running--;
        await new Promise((r) => setTimeout(r, delay));
        return this._executeWithRetry(task, attempt + 1);
      }

      this.results.set(name, { status: "failed", error: err.message, duration, timestamp: Date.now() });
      this.metrics.recordFailure(name, duration, err.message);

      this.logger.error(`  FAIL: ${name} permanently after ${attempt} attempts -- ${err.message}`);
      this.client.reportLog("error", `Task failed: ${name}`, {
        error: err.message,
        attempts: attempt,
        duration,
      });
      this.emit("task-failure", { name, error: err.message, attempts: attempt });

      if (task.onError && typeof task.onError === "function") {
        try {
          await task.onError(err, this.logger.child(name), this.client);
        } catch (handlerErr) {
          this.logger.error(`Error handler for ${name} threw: ${handlerErr.message}`);
        }
      }
    } finally {
      this.running--;
      if (this.queue.length > 0 && !this.isShuttingDown) {
        this._executeWithRetry(this.queue.shift());
      }
    }
  }
}

module.exports = { TaskRunner };
