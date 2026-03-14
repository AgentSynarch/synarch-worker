# SYNARCH CLI

Command-line interface for deploying, monitoring, and managing Synarch agents from the terminal.

---

## Install

```sh
cd cli
npm install

# Option A: Run directly
node bin/synarch.js status

# Option B: Link globally
npm link
synarch status
```

> **Requirements:** Node.js 18+

---

## Commands

| Command | Description |
|---------|-------------|
| `synarch status` | List all registered agents with status, type, and fork name |
| `synarch logs <id> [--limit N]` | View logs for a specific agent (default limit: 50) |
| `synarch stats` | Network-wide statistics: total agents, active count, breakdown by type |
| `synarch deploy <type> [--name N]` | Register a new agent and get the activation command |
| `synarch ping <id>` | Send a heartbeat to an agent and measure latency |
| `synarch kill <id>` | Set an agent's status to offline |
| `synarch info <id>` | Detailed view of an agent: config, status, recent logs |
| `synarch watch [--interval N]` | Live-tail agent activity with auto-refresh (default: 5s) |
| `synarch health` | Check API connectivity and response time |
| `synarch export <id> [--format F]` | Export logs as JSON or CSV. Pipe to file with `> logs.csv` |
| `synarch init <type>` | Generate a starter `.env` file for an agent type |

---

## Global options

| Flag | Description |
|------|-------------|
| `--api-url <url>` | Override the API endpoint |
| `--no-color` | Disable colored output |
| `--json` | Output raw JSON instead of formatted tables |

---

## Usage examples

### Deploy a worker agent

```sh
synarch deploy worker --name my-poller
```

Output:

```
  OK Agent deployed

  ──────────────────── DEPLOYMENT ────────────────────

  Agent ID    a1b2c3d4-...
  Fork name   FORK-0042
  Type        worker
  Name        my-poller
  Status      pending

  git clone https://github.com/AgentSynarch/synarch-worker.git
  cd synarch-worker
  echo "AGENT_TOKEN=a1b2c3d4-..." > .env
  npm install && npm start
```

### Check network status

```sh
synarch status
```

```
  ID        NAME          TYPE          STATUS   FORK        GITHUB
  ────────  ────────────  ────────────  ───────  ──────────  ──────────
  a1b2c3d4  my-poller     worker        active   FORK-0042   your-user
  e5f6g7h8  code-scanner  analyzer      idle     FORK-0043   your-user
```

### Live monitoring

```sh
synarch watch --interval 3
```

```
  14:32:05  3 active  1 idle  0 offline  total: 4
```

### Export logs to CSV

```sh
synarch export a1b2c3d4 --format csv --limit 200 > agent-logs.csv
```

### Generate starter config

```sh
synarch init worker
```

Creates a `.env` file pre-filled with all Worker agent configuration variables.

---

## Configuration

Create a `.env` file in the `cli/` directory or set environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `SYNARCH_API_URL` | Yes | API endpoint URL |
| `GITHUB_USERNAME` | No | Default GitHub username for deploys |

Alternatively, pass `--api-url` on every command.

---

## Project structure

```
cli/
  bin/
    synarch.js        -- Entry point (shebang for global install)
  src/
    index.js          -- CLI router, flag parser, help text
    commands.js       -- All command implementations
    api-client.js     -- HTTP client for the Synarch API
    output.js         -- Colored tables, spinners, formatters
    self-test.js      -- Connectivity and dependency verification
  package.json
  .env.example
```

---

## License

MIT
