const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

const LEVEL_COLORS = {
  debug: COLORS.gray,
  info: COLORS.cyan,
  warn: COLORS.yellow,
  error: COLORS.red,
};

const LEVEL_LABELS = {
  debug: "DBG",
  info: "INF",
  warn: "WRN",
  error: "ERR",
};

class Logger {
  constructor(level = "info", context = "") {
    this.level = LEVELS[level] ?? 1;
    this.context = context;
    this.startTime = Date.now();
  }

  child(context) {
    const child = new Logger("debug", context);
    child.level = this.level;
    child.startTime = this.startTime;
    return child;
  }

  _elapsed() {
    const ms = Date.now() - this.startTime;
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h${m % 60}m`;
    if (m > 0) return `${m}m${s % 60}s`;
    return `${s}s`;
  }

  _log(level, msg, meta) {
    if (LEVELS[level] < this.level) return;

    const ts = new Date().toISOString().slice(11, 23);
    const color = LEVEL_COLORS[level];
    const label = LEVEL_LABELS[level];
    const ctx = this.context ? `${COLORS.magenta}[${this.context}]${COLORS.reset} ` : "";
    const elapsed = `${COLORS.dim}+${this._elapsed()}${COLORS.reset}`;

    let line = `${COLORS.dim}${ts}${COLORS.reset} ${color}${label}${COLORS.reset} ${ctx}${msg} ${elapsed}`;

    if (meta && Object.keys(meta).length > 0) {
      const metaStr = Object.entries(meta)
        .map(([k, v]) => `${COLORS.dim}${k}=${COLORS.reset}${typeof v === "object" ? JSON.stringify(v) : v}`)
        .join(" ");
      line += ` ${metaStr}`;
    }

    console.log(line);
  }

  debug(msg, meta) { this._log("debug", msg, meta); }
  info(msg, meta) { this._log("info", msg, meta); }
  warn(msg, meta) { this._log("warn", msg, meta); }
  error(msg, meta) { this._log("error", msg, meta); }

  separator(label) {
    const line = `${COLORS.dim}${"─".repeat(20)} ${label} ${"─".repeat(20)}${COLORS.reset}`;
    console.log(line);
  }

  table(data) {
    if (!Array.isArray(data) || data.length === 0) return;
    const keys = Object.keys(data[0]);
    const widths = keys.map((k) => Math.max(k.length, ...data.map((row) => String(row[k] ?? "").length)));

    const header = keys.map((k, i) => k.padEnd(widths[i])).join("  ");
    const divider = widths.map((w) => "─".repeat(w)).join("──");

    console.log(`  ${COLORS.dim}${header}${COLORS.reset}`);
    console.log(`  ${COLORS.dim}${divider}${COLORS.reset}`);
    for (const row of data) {
      const line = keys.map((k, i) => String(row[k] ?? "").padEnd(widths[i])).join("  ");
      console.log(`  ${line}`);
    }
  }
}

module.exports = { Logger, COLORS };
