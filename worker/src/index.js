require("dotenv").config();
const { Logger, COLORS } = require("./logger");
const { SynarchClient } = require("./synarch-client");
const { TaskRunner } = require("./task-runner");
const { MetricsCollector } = require("./metrics");
const { loadTasks } = require("./tasks");

const logger = new Logger(process.env.LOG_LEVEL || "info");
const client = new SynarchClient(logger);
const metrics = new MetricsCollector(logger, client);

async function main() {
  console.log(`
${COLORS.cyan}  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   SYNARCH WORKER AGENT  v2.1.0            ║
  ║   Production-grade task automation        ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝${COLORS.reset}
`);

  logger.info("Initializing worker agent", {
    agent: process.env.AGENT_NAME || "unnamed",
    github: process.env.GITHUB_USERNAME || "unknown",
    schedule: process.env.CRON_SCHEDULE || "*/5 * * * *",
    concurrency: process.env.MAX_CONCURRENT || 5,
    retries: process.env.MAX_RETRIES || 3,
    timeout: `${process.env.TASK_TIMEOUT || 30000}ms`,
    pid: process.pid,
    node: process.version,
  });

  // Register with Synarch network
  const registered = await client.register("worker");
  if (!registered) {
    logger.warn("Running in offline mode -- API unavailable");
  } else {
    logger.info("Connected to Synarch network");
  }

  // Start heartbeat
  client.startHeartbeat();

  // Load tasks from src/tasks/
  const tasks = loadTasks(logger);
  logger.info(`Loaded ${tasks.length} task(s)`);

  if (tasks.length === 0) {
    logger.warn("No tasks found. Add .js files to src/tasks/ directory.");
    logger.info("See src/tasks/example-health-check.js for reference.");
  }

  // Initialize the task runner
  const runner = new TaskRunner(logger, client, metrics, {
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT || "5"),
    taskTimeout: parseInt(process.env.TASK_TIMEOUT || "30000"),
    cronSchedule: process.env.CRON_SCHEDULE || "*/5 * * * *",
    maxRetries: parseInt(process.env.MAX_RETRIES || "3"),
    retryDelay: parseInt(process.env.RETRY_DELAY || "1000"),
    enableFileWatch: process.env.WATCH_TASKS === "true",
  });

  // Event listeners for monitoring
  runner.on("task-success", ({ name, duration }) => {
    client.reportLog("debug", `[event] task-success: ${name} (${duration}ms)`);
  });

  runner.on("task-failure", ({ name, error, attempts }) => {
    client.reportLog("warn", `[event] task-failure: ${name} after ${attempts} attempts`, { error });
  });

  runner.on("cycle-complete", ({ executed, skipped, duration }) => {
    client.reportLog("debug", `[event] cycle-complete`, { executed, skipped, duration });
  });

  runner.start(tasks);

  // Start metrics reporting
  metrics.startReporting(parseInt(process.env.METRICS_INTERVAL || "60") * 1000);

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.separator("SHUTDOWN");
    logger.info(`Received ${signal}, shutting down gracefully...`);
    runner.stop();
    metrics.stop();

    const summary = metrics.getSummary();
    logger.info("Session summary", {
      totalRuns: summary.totalRuns,
      successRate: `${summary.successRate}%`,
      avgDuration: `${summary.avgDuration}ms`,
      uptime: `${summary.uptime}s`,
      memory: `${summary.memoryMB}MB`,
    });

    await client.reportLog("info", "Agent shutting down", { summary });
    await client.updateStatus("offline");
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Auto-restart on uncaught errors
  if (process.env.AUTO_RESTART === "true") {
    process.on("uncaughtException", async (err) => {
      logger.error(`Uncaught exception: ${err.message}`, { stack: err.stack });
      await client.reportLog("error", `Uncaught exception: ${err.message}`, { stack: err.stack });
      logger.info("Auto-restarting in 5 seconds...");
      runner.stop();
      setTimeout(() => {
        runner.start(loadTasks(logger));
      }, 5000);
    });

    process.on("unhandledRejection", async (reason) => {
      logger.error(`Unhandled rejection: ${reason}`);
      await client.reportLog("error", `Unhandled rejection: ${String(reason)}`);
    });
  }
}

main().catch((err) => {
  logger.error(`Fatal error: ${err.message}`, { stack: err.stack });
  process.exit(1);
});
