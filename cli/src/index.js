const { Commands } = require("./commands");
const { COLORS } = require("./output");

const BANNER = `
${COLORS.cyan}  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   SYNARCH CLI  v2.1.0                     ║
  ║   Agent management from the terminal      ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝${COLORS.reset}
`;

const HELP = `
${COLORS.dim}Usage:${COLORS.reset}  synarch <command> [options]

${COLORS.dim}Commands:${COLORS.reset}
  ${COLORS.cyan}status${COLORS.reset}                         Show all registered agents and their status
  ${COLORS.cyan}logs${COLORS.reset}     [agent-id] [--limit N] View logs for an agent (default: 50)
  ${COLORS.cyan}stats${COLORS.reset}                          Network-wide statistics
  ${COLORS.cyan}deploy${COLORS.reset}   <type> [--name N]     Register a new agent (worker, analyzer, orchestrator)
  ${COLORS.cyan}ping${COLORS.reset}     <agent-id>            Send a heartbeat and check if agent is reachable
  ${COLORS.cyan}kill${COLORS.reset}     <agent-id>            Set agent status to offline
  ${COLORS.cyan}info${COLORS.reset}     <agent-id>            Show detailed info for a specific agent
  ${COLORS.cyan}watch${COLORS.reset}    [--interval N]        Live-tail all agent activity (default: 5s)
  ${COLORS.cyan}health${COLORS.reset}                         Check API connectivity and response time
  ${COLORS.cyan}export${COLORS.reset}   <agent-id> [--format] Export agent logs (json, csv)
  ${COLORS.cyan}init${COLORS.reset}     <type>                Generate a starter .env file for an agent type
  ${COLORS.cyan}version${COLORS.reset}                        Show CLI version
  ${COLORS.cyan}help${COLORS.reset}                           Show this help message

${COLORS.dim}Options:${COLORS.reset}
  --api-url <url>    Override SYNARCH_API_URL
  --no-color         Disable colored output
  --json             Output raw JSON instead of formatted tables

${COLORS.dim}Examples:${COLORS.reset}
  synarch status
  synarch deploy worker --name my-poller
  synarch logs abc123 --limit 100
  synarch watch --interval 3
  synarch export abc123 --format csv > logs.csv
  synarch init worker
`;

class CLI {
  constructor() {
    this.commands = new Commands();
  }

  async run(args) {
    if (args.length === 0 || args[0] === "help" || args[0] === "--help" || args[0] === "-h") {
      console.log(BANNER);
      console.log(HELP);
      return;
    }

    if (args[0] === "version" || args[0] === "--version" || args[0] === "-v") {
      console.log("synarch v2.1.0");
      return;
    }

    const command = args[0];
    const flags = this._parseFlags(args.slice(1));

    // Override API URL if provided
    if (flags["api-url"]) {
      process.env.SYNARCH_API_URL = flags["api-url"];
    }

    // Disable colors
    if (flags["no-color"]) {
      Object.keys(COLORS).forEach((k) => (COLORS[k] = ""));
    }

    try {
      switch (command) {
        case "status":
          await this.commands.status(flags);
          break;
        case "logs":
          await this.commands.logs(flags._positional[0], flags);
          break;
        case "stats":
          await this.commands.stats(flags);
          break;
        case "deploy":
          await this.commands.deploy(flags._positional[0], flags);
          break;
        case "ping":
          await this.commands.ping(flags._positional[0], flags);
          break;
        case "kill":
          await this.commands.kill(flags._positional[0], flags);
          break;
        case "info":
          await this.commands.info(flags._positional[0], flags);
          break;
        case "watch":
          await this.commands.watch(flags);
          break;
        case "health":
          await this.commands.health(flags);
          break;
        case "export":
          await this.commands.exportLogs(flags._positional[0], flags);
          break;
        case "init":
          await this.commands.init(flags._positional[0], flags);
          break;
        default:
          console.log(`${COLORS.red}Unknown command: ${command}${COLORS.reset}`);
          console.log(`Run ${COLORS.cyan}synarch help${COLORS.reset} for available commands.`);
          process.exit(1);
      }
    } catch (err) {
      console.error(`${COLORS.red}Error: ${err.message}${COLORS.reset}`);
      process.exit(1);
    }
  }

  _parseFlags(args) {
    const flags = { _positional: [] };
    let i = 0;
    while (i < args.length) {
      if (args[i].startsWith("--")) {
        const key = args[i].slice(2);
        if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
          flags[key] = args[i + 1];
          i += 2;
        } else {
          flags[key] = true;
          i++;
        }
      } else {
        flags._positional.push(args[i]);
        i++;
      }
    }
    return flags;
  }
}

module.exports = { CLI };
