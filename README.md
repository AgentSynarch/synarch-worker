# Synarch Worker

Production-grade task automation agent for the Synarch network. Handles scheduled jobs, API polling, file watching, health checks, and batch processing with retry logic, dependency ordering, and real-time metrics.

---

## Quickstart

```sh
git clone https://github.com/AgentSynarch/synarch-worker.git
cd synarch-worker
npm install
echo "AGENT_TOKEN=<your-token>" > .env
npm start
```

Get your `AGENT_TOKEN` from the [Synarch launch page](https://synarch.app/launch) by clicking the Worker card.

> **Requirements:** Node.js 18+, npm

---

## What it does

The worker agent runs automated tasks on a configurable cron schedule. Tasks execute with concurrency limits, automatic retries with exponential backoff, dependency ordering, and timeout enforcement.

### Built-in task types

| Task | Description | Default schedule |
|------|-------------|------------------|
| API Poller | Hits external endpoints and reports results | Every 5 minutes |
| File Watcher | Monitors directories for changes using `chokidar` | Continuous |
| Health Check | Pings services and logs uptime status | Every 5 minutes |

Custom tasks are added by creating new modules in `src/tasks/`.

---

## How it works

### Startup sequence

1. Reads `AGENT_TOKEN` from `.env`
2. Sends activation heartbeat to the Synarch network
3. Status changes from `pending` to `active` in the live registry
4. Loads and topologically sorts all task modules
5. Executes all tasks immediately, then on cron schedule
6. Starts metrics reporting at configured interval
7. Sends periodic heartbeats to maintain `active` status

### Task execution

The task runner processes tasks in dependency order. Each task receives the logger, the Synarch client, and a context object containing the attempt number, previous results, and metrics collector.

```
Task queue
  |
  |-- Check dependencies (skip if unmet)
  |-- Check condition function (skip if false)
  |-- Check concurrency limit (queue if at max)
  |-- Execute with timeout
  |     |-- Success: record metrics, store result
  |     |-- Failure: retry with exponential backoff
  |           |-- Max retries exceeded: call onError handler, log permanently
  |
  |-- Process queued tasks
```

### Retry behavior

Failed tasks retry with exponential backoff. The delay doubles on each attempt:

| Attempt | Delay |
|---------|-------|
| 1 | 1000ms |
| 2 | 2000ms |
| 3 | 4000ms |
| 4 | Permanent failure |

Configurable via `MAX_RETRIES` and `RETRY_DELAY` environment variables.

### Dependency ordering

Tasks can declare dependencies via the `dependsOn` array. The runner topologically sorts tasks before execution and skips any task whose dependencies have failed:

```js
module.exports = {
  name: "process-data",
  dependsOn: ["fetch-data"],
  run: async (logger, client, context) => {
    const fetchResult = context.previousResults.get("fetch-data");
    // fetchResult.data contains the previous task's output
  },
};
```

### Conditional execution

Tasks can define a `condition` function that receives the results map and returns a boolean:

```js
module.exports = {
  name: "alert-on-failure",
  condition: async (results) => {
    const health = results.get("health-check");
    return health && health.status === "failed";
  },
  run: async (logger, client) => {
    // Only runs if health-check failed
  },
};
```

---

## Adding custom tasks

1. Create a new file in `src/tasks/`
2. Export an object with `name` and `run` function
3. Register it in `src/tasks/index.js`

### Minimal task

```js
module.exports = {
  name: "my-task",
  run: async (logger, client, context) => {
    logger.info("Running my task");
    return { success: true };
  },
};
```

### Full task with all options

```js
module.exports = {
  name: "my-advanced-task",
  dependsOn: ["prerequisite-task"],
  condition: async (results) => {
    return results.get("prerequisite-task")?.status === "success";
  },
  run: async (logger, client, context) => {
    logger.info(`Attempt ${context.attempt}`);

    const data = await fetchSomething();

    // Report to network
    await client.reportLog("info", "Task completed", { data });

    return { success: true, data };
  },
  onError: async (err, logger, client) => {
    logger.error(`Custom error handler: ${err.message}`);
    await client.reportLog("error", "Task failed permanently", {
      error: err.message,
    });
  },
};
```

---

## Metrics

The metrics collector tracks per-task performance and reports to the network:

| Metric | Description |
|--------|-------------|
| `totalRuns` | Total task executions since startup |
| `successRate` | Percentage of successful runs |
| `avgDuration` | Average execution time in milliseconds |
| `uptime` | Process uptime in seconds |
| `memoryMB` | Heap memory usage in megabytes |
| `tasks` | Per-task breakdown with individual stats |

Metrics are logged locally and sent to the network at the interval set by `METRICS_INTERVAL`.

---

## Configuration

All configuration is done via the `.env` file:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AGENT_TOKEN` | Yes | -- | Unique token from Synarch launch page |
| `SYNARCH_API_URL` | No | -- | API endpoint URL |
| `AGENT_NAME` | No | unnamed | Display name in the registry |
| `GITHUB_USERNAME` | No | -- | Associated GitHub account |
| `CRON_SCHEDULE` | No | `*/5 * * * *` | Cron expression for task execution |
| `MAX_CONCURRENT` | No | 5 | Maximum concurrent task executions |
| `TASK_TIMEOUT` | No | 30000 | Task timeout in milliseconds |
| `MAX_RETRIES` | No | 3 | Maximum retry attempts per task |
| `RETRY_DELAY` | No | 1000 | Initial retry delay in milliseconds |
| `HEARTBEAT_INTERVAL` | No | 30 | Heartbeat frequency in seconds |
| `METRICS_INTERVAL` | No | 60 | Metrics reporting frequency in seconds |
| `LOG_LEVEL` | No | info | Logging level (debug, info, warn, error) |
| `AUTO_RESTART` | No | false | Auto-restart on uncaught exceptions |
| `WATCH_TASKS` | No | false | Hot-reload tasks on file changes |

---

## Project structure

```
synarch-worker/
  src/
    index.js              -- Entry point, startup sequence, graceful shutdown
    synarch-client.js     -- Network registration, heartbeats, log reporting
    task-runner.js        -- Cron scheduling, dependency sort, retry logic
    metrics.js            -- Per-task performance tracking and reporting
    logger.js             -- Structured logging with configurable levels
    self-test.js          -- Connectivity and module integrity verification
    tasks/
      index.js            -- Task registry and loader
      example-api-poller.js
      example-file-watcher.js
      example-health-check.js
  package.json
  .env.example
```

---

## Graceful shutdown

The worker handles `SIGINT` and `SIGTERM` signals:

1. Stops the cron scheduler
2. Stops metrics reporting
3. Logs a session summary (total runs, success rate, average duration)
4. Reports shutdown to the network
5. Updates status to `offline`
6. Exits cleanly

---

## Self-test

Run `npm test` to verify:

- Environment variables are configured
- Network connectivity is available
- Agent token is valid
- All task modules load without errors

---

## License

MIT
