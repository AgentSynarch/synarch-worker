const { APIClient } = require("./api-client");
const output = require("./output");
const fs = require("fs");

class Commands {
  _client(flags) {
    return new APIClient(flags?.["api-url"]);
  }

  // ─── synarch status ───────────────────────────────────────────

  async status(flags) {
    const client = this._client(flags);
    const s = output.spinner("Fetching agents...");

    try {
      const agents = await client.getAgents();
      s.stop(`${agents.length} agent(s) found`);

      if (flags.json) {
        output.json(agents);
        return;
      }

      if (agents.length === 0) {
        output.info("No agents registered. Deploy one with: synarch deploy worker");
        return;
      }

      const tableData = agents.map((a) => ({
        id: a.id.slice(0, 8),
        name: a.agent_name || "--",
        type: a.agent_type,
        status: a.status,
        fork: a.fork_name,
        github: a.github_username || "--",
        created: a.created_at?.slice(0, 10) || "--",
      }));

      output.table(tableData);
    } catch (err) {
      s.fail(`Failed: ${err.message}`);
    }
  }

  // ─── synarch logs ─────────────────────────────────────────────

  async logs(agentId, flags) {
    const client = this._client(flags);
    const limit = parseInt(flags.limit || "50");

    if (!agentId) {
      output.fail("Usage: synarch logs <agent-id> [--limit N]");
      return;
    }

    const s = output.spinner(`Fetching logs for ${agentId.slice(0, 8)}...`);

    try {
      const logs = await client.getLogs(agentId, limit);
      s.stop(`${logs.length} log(s)`);

      if (flags.json) {
        output.json(logs);
        return;
      }

      if (logs.length === 0) {
        output.info("No logs found for this agent.");
        return;
      }

      const tableData = logs.map((l) => ({
        time: l.created_at?.slice(11, 19) || "--",
        level: l.level,
        message: l.message.length > 80 ? l.message.slice(0, 77) + "..." : l.message,
      }));

      output.table(tableData);
    } catch (err) {
      s.fail(`Failed: ${err.message}`);
    }
  }

  // ─── synarch stats ────────────────────────────────────────────

  async stats(flags) {
    const client = this._client(flags);
    const s = output.spinner("Fetching network stats...");

    try {
      const stats = await client.getStats();
      s.stop("Done");

      if (flags.json) {
        output.json(stats);
        return;
      }

      output.kvPairs({
        "Total agents": stats.total_agents || 0,
        "Active": stats.active_agents || 0,
        "Total logs": stats.total_logs || 0,
        "Workers": stats.by_type?.worker || 0,
        "Analyzers": stats.by_type?.analyzer || 0,
        "Orchestrators": stats.by_type?.orchestrator || 0,
      });
    } catch (err) {
      s.fail(`Failed: ${err.message}`);
    }
  }

  // ─── synarch deploy ───────────────────────────────────────────

  async deploy(type, flags) {
    const validTypes = ["worker", "analyzer", "orchestrator"];
    if (!type || !validTypes.includes(type)) {
      output.fail(`Usage: synarch deploy <${validTypes.join("|")}> [--name N]`);
      return;
    }

    const client = this._client(flags);
    const name = flags.name || `${type}-${Date.now().toString(36)}`;
    const s = output.spinner(`Deploying ${type} agent "${name}"...`);

    try {
      const result = await client.register(type, {
        name,
        github: flags.github,
        description: flags.description,
      });
      s.stop(`Agent deployed`);

      output.separator("DEPLOYMENT");
      output.kvPairs({
        "Agent ID": result.id,
        "Fork name": result.fork_name,
        "Type": type,
        "Name": name,
        "Status": "pending",
      });

      console.log(`  ${output.COLORS.dim}To activate, clone the agent repo and set AGENT_TOKEN:${output.COLORS.reset}`);
      console.log("");
      console.log(`  ${output.COLORS.cyan}git clone https://github.com/AgentSynarch/synarch-${type}.git${output.COLORS.reset}`);
      console.log(`  ${output.COLORS.cyan}cd synarch-${type}${output.COLORS.reset}`);
      console.log(`  ${output.COLORS.cyan}echo "AGENT_TOKEN=${result.id}" > .env${output.COLORS.reset}`);
      console.log(`  ${output.COLORS.cyan}npm install && npm start${output.COLORS.reset}`);
      console.log("");
    } catch (err) {
      s.fail(`Failed: ${err.message}`);
    }
  }

  // ─── synarch ping ─────────────────────────────────────────────

  async ping(agentId, flags) {
    if (!agentId) {
      output.fail("Usage: synarch ping <agent-id>");
      return;
    }

    const client = this._client(flags);
    const start = Date.now();

    try {
      await client.heartbeat(agentId, "active");
      const latency = Date.now() - start;
      output.success(`Heartbeat sent to ${agentId.slice(0, 8)} (${latency}ms)`);
    } catch (err) {
      output.fail(`Heartbeat failed: ${err.message}`);
    }
  }

  // ─── synarch kill ─────────────────────────────────────────────

  async kill(agentId, flags) {
    if (!agentId) {
      output.fail("Usage: synarch kill <agent-id>");
      return;
    }

    const client = this._client(flags);

    try {
      await client.heartbeat(agentId, "offline");
      output.success(`Agent ${agentId.slice(0, 8)} set to offline`);
    } catch (err) {
      output.fail(`Failed: ${err.message}`);
    }
  }

  // ─── synarch info ─────────────────────────────────────────────

  async info(agentId, flags) {
    if (!agentId) {
      output.fail("Usage: synarch info <agent-id>");
      return;
    }

    const client = this._client(flags);
    const s = output.spinner(`Fetching agent info...`);

    try {
      const agents = await client.getAgents();
      const agent = agents.find((a) => a.id === agentId || a.id.startsWith(agentId));
      s.stop("Done");

      if (!agent) {
        output.fail(`Agent not found: ${agentId}`);
        return;
      }

      if (flags.json) {
        output.json(agent);
        return;
      }

      output.kvPairs({
        "ID": agent.id,
        "Name": agent.agent_name || "--",
        "Type": agent.agent_type,
        "Status": `${output.STATUS_COLORS[agent.status] || ""}${agent.status}${output.COLORS.reset}`,
        "Fork": agent.fork_name,
        "GitHub": agent.github_username || "--",
        "Log level": agent.log_level,
        "Max retries": agent.max_retries,
        "Auto restart": agent.auto_restart ? "yes" : "no",
        "Description": agent.description || "--",
        "Created": agent.created_at,
      });

      // Also fetch recent logs
      try {
        const logs = await client.getLogs(agentId, 10);
        if (logs.length > 0) {
          output.separator("RECENT LOGS");
          const tableData = logs.map((l) => ({
            time: l.created_at?.slice(11, 19) || "--",
            level: l.level,
            message: l.message.length > 60 ? l.message.slice(0, 57) + "..." : l.message,
          }));
          output.table(tableData);
        }
      } catch { /* no logs available */ }
    } catch (err) {
      s.fail(`Failed: ${err.message}`);
    }
  }

  // ─── synarch watch ────────────────────────────────────────────

  async watch(flags) {
    const client = this._client(flags);
    const interval = parseInt(flags.interval || "5") * 1000;
    let lastLogId = null;

    console.log(`

  ${output.COLORS.dim}Watching agent activity (every ${interval / 1000}s). Press Ctrl+C to stop.${output.COLORS.reset}
`);

    const poll = async () => {
      try {
        const agents = await client.getAgents();
        const active = agents.filter((a) => a.status === "active").length;
        const idle = agents.filter((a) => a.status === "idle").length;
        const offline = agents.filter((a) => a.status === "offline").length;

        const ts = new Date().toISOString().slice(11, 19);
        process.stdout.write(
          `\r  ${output.COLORS.dim}${ts}${output.COLORS.reset}  ` +
          `${output.COLORS.green}${active} active${output.COLORS.reset}  ` +
          `${output.COLORS.yellow}${idle} idle${output.COLORS.reset}  ` +
          `${output.COLORS.red}${offline} offline${output.COLORS.reset}  ` +
          `${output.COLORS.dim}total: ${agents.length}${output.COLORS.reset}   `
        );
      } catch { /* swallow */ }
    };

    await poll();
    setInterval(poll, interval);

    // Keep process alive
    await new Promise(() => {});
  }

  // ─── synarch health ───────────────────────────────────────────

  async health(flags) {
    const client = this._client(flags);
    const s = output.spinner("Checking API health...");

    try {
      const health = await client.checkHealth();
      s.stop("API is reachable");

      output.kvPairs({
        "URL": client.apiUrl,
        "Status": `${health.status}`,
        "Latency": `${health.latency}ms`,
        "Total agents": health.data?.total_agents || 0,
        "Active agents": health.data?.active_agents || 0,
      });
    } catch (err) {
      s.fail(`API unreachable: ${err.message}`);
    }
  }

  // ─── synarch export ───────────────────────────────────────────

  async exportLogs(agentId, flags) {
    if (!agentId) {
      output.fail("Usage: synarch export <agent-id> [--format json|csv] [--limit N]");
      return;
    }

    const client = this._client(flags);
    const format = flags.format || "json";
    const limit = parseInt(flags.limit || "200");

    try {
      const logs = await client.getLogs(agentId, limit);

      if (format === "csv") {
        console.log("timestamp,level,message");
        for (const l of logs) {
          const msg = l.message.replace(/"/g, '""');
          console.log(`"${l.created_at}","${l.level}","${msg}"`);
        }
      } else {
        console.log(JSON.stringify(logs, null, 2));
      }
    } catch (err) {
      output.fail(`Failed: ${err.message}`);
    }
  }

  // ─── synarch init ─────────────────────────────────────────────

  async init(type, flags) {
    const validTypes = ["worker", "analyzer", "orchestrator"];
    if (!type || !validTypes.includes(type)) {
      output.fail(`Usage: synarch init <${validTypes.join("|")}>`);
      return;
    }

    const envTemplates = {
      worker: `# SYNARCH Worker Agent
# Generated by synarch CLI

AGENT_TOKEN=
SYNARCH_API_URL=
AGENT_NAME=my-worker
GITHUB_USERNAME=

# Scheduling
CRON_SCHEDULE=*/5 * * * *
MAX_CONCURRENT=5
TASK_TIMEOUT=30000

# Retry
MAX_RETRIES=3
RETRY_DELAY=1000
AUTO_RESTART=true

# Monitoring
LOG_LEVEL=info
HEARTBEAT_INTERVAL=30
METRICS_INTERVAL=60

# Tasks
HEALTH_CHECK_URLS=https://httpbin.org/get
POLL_URL=https://httpbin.org/uuid
WATCH_DIR=.

# Wallet & x402 Payments (Optional)
# Sign up at privy.io to get credentials
PRIVY_APP_ID=
PRIVY_APP_SECRET=
PRIVY_AUTHORIZATION_KEY_ID=
PRIVY_AUTHORIZATION_KEY_PRIVATE_KEY=
AGENT_WALLET_ID=
AGENT_WALLET_POLICY_ID=
`,
      analyzer: `# SYNARCH Analyzer Agent
# Generated by synarch CLI

AGENT_TOKEN=
SYNARCH_API_URL=
AGENT_NAME=my-analyzer
GITHUB_USERNAME=

# Analysis
ANALYZE_DIR=.
INCLUDE_PATTERNS=**/*.js,**/*.ts,**/*.jsx,**/*.tsx
EXCLUDE_PATTERNS=node_modules/**,dist/**,build/**,.git/**
ANALYZERS=complexity,unused-vars,code-smells,security,dependencies,duplicates
SEVERITY_THRESHOLD=info
MAX_FILE_SIZE=524288

# Reports
REPORT_FORMAT=json
REPORT_OUTPUT=./reports

# Monitoring
LOG_LEVEL=info
HEARTBEAT_INTERVAL=30
WATCH_INTERVAL=60
`,
      orchestrator: `# SYNARCH Orchestrator Agent
# Generated by synarch CLI

AGENT_TOKEN=
SYNARCH_API_URL=
AGENT_NAME=my-orchestrator
GITHUB_USERNAME=

# Pipeline
PIPELINE_FILE=./pipelines/default.json
PIPELINE_DIR=./pipelines
MAX_PIPELINE_DEPTH=50
RATE_LIMIT_MS=0

# Retry
MAX_RETRIES=3
RETRY_DELAY=1000
ENABLE_DLQ=true

# Monitoring
LOG_LEVEL=info
HEARTBEAT_INTERVAL=30
POLL_INTERVAL=10000
`,
    };

    const content = envTemplates[type];
    const filename = ".env";

    if (fs.existsSync(filename)) {
      output.warn(`.env already exists. Writing to .env.synarch instead.`);
      fs.writeFileSync(".env.synarch", content);
      output.success(`Generated .env.synarch for ${type} agent`);
    } else {
      fs.writeFileSync(filename, content);
      output.success(`Generated .env for ${type} agent`);
    }

    console.log(`

  ${output.COLORS.dim}Next steps:${output.COLORS.reset}`);
    console.log(`  1. Set your AGENT_TOKEN (get one from synarch.app/launch)`);
    console.log(`  2. Set your GITHUB_USERNAME`);
    console.log(`  3. Run ${output.COLORS.cyan}npm start${output.COLORS.reset}
`);
  }
}

module.exports = { Commands };
