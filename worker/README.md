# SYNARCH Worker Agent v2.0

Production-grade task automation — scheduled jobs, file monitoring, API polling, batch processing with retry logic, dependency resolution, and metrics.

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your settings

# Verify everything is configured correctly
npm test

# Launch
npm start
```

## Features

- **Cron scheduling** — configurable recurring task execution
- **Retry with exponential backoff** — failed tasks retry automatically
- **Task dependencies** — tasks can depend on other tasks
- **Conditional execution** — tasks can have dynamic run conditions
- **Parallel execution** — configurable concurrency limit
- **Task timeout** — prevents stuck tasks from blocking the runner
- **Error handlers** — per-task error callbacks (for alerts, webhooks, etc.)
- **Metrics tracking** — success rates, durations, memory usage
- **Graceful shutdown** — clean exit with summary report
- **Auto-restart** — recovers from uncaught exceptions
- **API registration** — live presence on the Synarch network

## Creating Tasks

Add a `.js` file to `src/tasks/`:

```js
module.exports = {
  name: "my-task",

  // Optional: depend on other tasks
  dependsOn: ["health-check"],

  // Optional: conditional execution
  condition: async (previousResults) => {
    return previousResults.get("health-check")?.status === "success";
  },

  // Required: the task logic
  async run(logger, client, ctx) {
    logger.info("Running my task...");
    // ctx.attempt — current retry attempt number
    // ctx.previousResults — Map of other task results
    // ctx.metrics — metrics collector instance
    return { result: "some data" };
  },

  // Optional: called when all retries exhausted
  async onError(err, logger, client) {
    logger.error(`Alert: ${err.message}`);
    // Send webhook, email, etc.
  },
};
```

## Included Example Tasks

| Task | Description |
|------|-------------|
| `health-check` | Pings URLs and checks HTTP status codes |
| `file-watcher` | Monitors directories for file changes |
| `api-poller` | Polls APIs and detects response changes |

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `SYNARCH_API_URL` | API endpoint | required |
| `AGENT_NAME` | Agent display name | required |
| `GITHUB_USERNAME` | Your GitHub username | required |
| `LOG_LEVEL` | debug/info/warn/error | `info` |
| `MAX_RETRIES` | Retry attempts | `3` |
| `RETRY_DELAY` | Base retry delay (ms) | `1000` |
| `AUTO_RESTART` | Restart on crash | `true` |
| `CRON_SCHEDULE` | Task schedule | `*/5 * * * *` |
| `MAX_CONCURRENT` | Parallel task limit | `5` |
| `TASK_TIMEOUT` | Per-task timeout (ms) | `30000` |
| `METRICS_INTERVAL` | Stats report interval (s) | `60` |
