const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

const STATUS_COLORS = {
  active: COLORS.green,
  idle: COLORS.yellow,
  pending: COLORS.blue,
  offline: COLORS.red,
};

function table(data, options = {}) {
  if (!Array.isArray(data) || data.length === 0) {
    console.log(`  ${COLORS.dim}(no data)${COLORS.reset}`);
    return;
  }

  const keys = Object.keys(data[0]);
  const widths = keys.map((k) =>
    Math.max(k.length, ...data.map((row) => String(row[k] ?? "").length))
  );

  const header = keys.map((k, i) => k.toUpperCase().padEnd(widths[i])).join("  ");
  const divider = widths.map((w) => "─".repeat(w)).join("──");

  console.log(`  ${COLORS.dim}${header}${COLORS.reset}`);
  console.log(`  ${COLORS.dim}${divider}${COLORS.reset}`);

  for (const row of data) {
    const cells = keys.map((k, i) => {
      let val = String(row[k] ?? "");
      // Colorize status column
      if (k === "status" && STATUS_COLORS[val]) {
        return `${STATUS_COLORS[val]}${val.padEnd(widths[i])}${COLORS.reset}`;
      }
      // Colorize level column
      if (k === "level") {
        const levelColor = { error: COLORS.red, warn: COLORS.yellow, info: COLORS.cyan, debug: COLORS.gray };
        return `${levelColor[val] || ""}${val.padEnd(widths[i])}${COLORS.reset}`;
      }
      return val.padEnd(widths[i]);
    });
    console.log(`  ${cells.join("  ")}`);
  }
  console.log("");
}

function json(data) {
  console.log(JSON.stringify(data, null, 2));
}

function separator(label) {
  console.log(`\n${COLORS.dim}${"─".repeat(20)} ${label} ${"─".repeat(20)}${COLORS.reset}\n`);
}

function success(msg) {
  console.log(`  ${COLORS.green}OK${COLORS.reset} ${msg}`);
}

function warn(msg) {
  console.log(`  ${COLORS.yellow}!!${COLORS.reset} ${msg}`);
}

function fail(msg) {
  console.log(`  ${COLORS.red}FAIL${COLORS.reset} ${msg}`);
}

function info(msg) {
  console.log(`  ${COLORS.dim}${msg}${COLORS.reset}`);
}

function kvPairs(obj) {
  const maxKeyLen = Math.max(...Object.keys(obj).map((k) => k.length));
  for (const [key, val] of Object.entries(obj)) {
    console.log(`  ${COLORS.dim}${key.padEnd(maxKeyLen)}${COLORS.reset}  ${val}`);
  }
  console.log("");
}

function spinner(text) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const timer = setInterval(() => {
    process.stdout.write(`\r  ${COLORS.cyan}${frames[i]}${COLORS.reset} ${text}`);
    i = (i + 1) % frames.length;
  }, 80);
  return {
    stop(finalText) {
      clearInterval(timer);
      process.stdout.write(`\r  ${COLORS.green}*${COLORS.reset} ${finalText || text}\n`);
    },
    fail(finalText) {
      clearInterval(timer);
      process.stdout.write(`\r  ${COLORS.red}x${COLORS.reset} ${finalText || text}\n`);
    },
  };
}

module.exports = { COLORS, STATUS_COLORS, table, json, separator, success, warn, fail, info, kvPairs, spinner };
