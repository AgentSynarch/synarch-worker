class MetricsCollector {
  constructor(logger, client) {
    this.logger = logger;
    this.client = client;
    this.runs = [];
    this.timer = null;
    this.circuitBreakers = new Map();
  }

  recordSuccess(taskName, duration) {
    this.runs.push({ task: taskName, status: "success", duration, timestamp: Date.now() });
    this._resetCircuitBreaker(taskName);
  }

  recordFailure(taskName, duration, error) {
    this.runs.push({ task: taskName, status: "failed", duration, error, timestamp: Date.now() });
    this._tripCircuitBreaker(taskName);
  }

  // Circuit breaker: if a task fails 5 times in a row, block it temporarily
  _tripCircuitBreaker(taskName) {
    const cb = this.circuitBreakers.get(taskName) || { failures: 0, blocked: false, blockedUntil: 0 };
    cb.failures++;
    if (cb.failures >= 5) {
      cb.blocked = true;
      cb.blockedUntil = Date.now() + 60000; // block for 60 seconds
      this.logger.warn(`Circuit breaker OPEN for "${taskName}" — blocked for 60s after ${cb.failures} consecutive failures`);
    }
    this.circuitBreakers.set(taskName, cb);
  }

  _resetCircuitBreaker(taskName) {
    this.circuitBreakers.delete(taskName);
  }

  isCircuitOpen(taskName) {
    const cb = this.circuitBreakers.get(taskName);
    if (!cb || !cb.blocked) return false;
    if (Date.now() > cb.blockedUntil) {
      cb.blocked = false;
      cb.failures = 0;
      this.logger.info(`Circuit breaker CLOSED for "${taskName}" — resuming execution`);
      return false;
    }
    return true;
  }

  getTaskStats(taskName) {
    const taskRuns = this.runs.filter((r) => r.task === taskName);
    if (taskRuns.length === 0) return null;
    const successes = taskRuns.filter((r) => r.status === "success").length;
    const durations = taskRuns.map((r) => r.duration);
    return {
      runs: taskRuns.length,
      successes,
      failures: taskRuns.length - successes,
      successRate: Math.round((successes / taskRuns.length) * 100),
      avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      p95Duration: durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)] || 0,
      lastRun: new Date(taskRuns[taskRuns.length - 1].timestamp).toISOString(),
    };
  }

  getSummary() {
    const total = this.runs.length;
    if (total === 0) return { totalRuns: 0, successRate: 100, avgDuration: 0, tasks: {} };

    const successes = this.runs.filter((r) => r.status === "success").length;
    const durations = this.runs.map((r) => r.duration);
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / total);

    // Per-task breakdown
    const taskNames = [...new Set(this.runs.map((r) => r.task))];
    const tasks = {};
    for (const name of taskNames) {
      tasks[name] = this.getTaskStats(name);
    }

    return {
      totalRuns: total,
      successRate: Math.round((successes / total) * 100),
      avgDuration,
      p95Duration: durations.sort((a, b) => a - b)[Math.floor(total * 0.95)] || 0,
      uptime: Math.round(process.uptime()),
      memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      rssMemoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100,
      activeCircuitBreakers: [...this.circuitBreakers.entries()]
        .filter(([, cb]) => cb.blocked)
        .map(([name]) => name),
      tasks,
    };
  }

  startReporting(interval = 60000) {
    this.timer = setInterval(() => {
      const summary = this.getSummary();
      this.logger.separator("METRICS");
      this.logger.info(`Runs: ${summary.totalRuns} | Success: ${summary.successRate}% | Avg: ${summary.avgDuration}ms | P95: ${summary.p95Duration}ms | Mem: ${summary.memoryMB}MB (${summary.rssMemoryMB}MB RSS) | Uptime: ${summary.uptime}s`);

      if (Object.keys(summary.tasks).length > 0) {
        const tableData = Object.entries(summary.tasks).map(([name, stats]) => ({
          task: name,
          runs: stats.runs,
          success: `${stats.successRate}%`,
          avg: `${stats.avgDuration}ms`,
          p95: `${stats.p95Duration}ms`,
          last: stats.lastRun.slice(11, 19),
        }));
        this.logger.table(tableData);
      }

      if (summary.activeCircuitBreakers.length > 0) {
        this.logger.warn(`Circuit breakers open: ${summary.activeCircuitBreakers.join(", ")}`);
      }

      this.client.reportLog("info", "Metrics report", { metrics: summary });
    }, interval);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}

module.exports = { MetricsCollector };
