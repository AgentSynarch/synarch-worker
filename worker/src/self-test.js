require("dotenv").config();
const { Logger, COLORS } = require("./logger");
const { SynarchClient } = require("./synarch-client");

async function selfTest() {
  const logger = new Logger("info");
  const results = [];

  console.log(`
${COLORS.cyan}  SYNARCH Worker -- Self-Test${COLORS.reset}
`);

  // 1. Environment variables
  const envVars = ["SYNARCH_API_URL", "GITHUB_USERNAME", "AGENT_NAME"];
  const missing = envVars.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    results.push({ check: "Environment", status: "FAIL", detail: `Missing: ${missing.join(", ")}` });
  } else {
    results.push({ check: "Environment", status: "OK", detail: `${envVars.length} required vars set` });
  }

  // 2. Optional vars
  const optionalVars = ["CRON_SCHEDULE", "MAX_CONCURRENT", "TASK_TIMEOUT", "MAX_RETRIES"];
  const setOptional = optionalVars.filter((k) => process.env[k]);
  results.push({ check: "Config", status: "OK", detail: `${setOptional.length}/${optionalVars.length} optional vars set` });

  // 3. Node.js version
  const nodeVersion = parseInt(process.version.slice(1));
  if (nodeVersion < 18) {
    results.push({ check: "Node.js", status: "FAIL", detail: `${process.version} (requires >= 18)` });
  } else {
    results.push({ check: "Node.js", status: "OK", detail: process.version });
  }

  // 4. API connection
  if (missing.length === 0) {
    const client = new SynarchClient(logger);
    const registered = await client.register("worker");
    if (registered) {
      results.push({ check: "API", status: "OK", detail: `Registered as ${client.forkName}` });
      await client.updateStatus("offline");
    } else {
      results.push({ check: "API", status: "WARN", detail: "Connection failed (agent will run offline)" });
    }
  } else {
    results.push({ check: "API", status: "SKIP", detail: "Missing env vars" });
  }

  // 5. Tasks
  try {
    const { loadTasks } = require("./tasks");
    const tasks = loadTasks(logger);
    results.push({ check: "Tasks", status: "OK", detail: `${tasks.length} task(s) loaded` });
    for (const t of tasks) {
      const deps = t.dependsOn ? ` [deps: ${t.dependsOn.join(", ")}]` : "";
      results.push({ check: `  ${t.name}`, status: "OK", detail: `run() defined${deps}` });
    }
  } catch (err) {
    results.push({ check: "Tasks", status: "FAIL", detail: err.message });
  }

  // 6. Dependencies
  const requiredModules = ["node-cron", "axios", "dotenv"];
  for (const mod of requiredModules) {
    try {
      require(mod);
      results.push({ check: `Module: ${mod}`, status: "OK", detail: "loaded" });
    } catch {
      results.push({ check: `Module: ${mod}`, status: "FAIL", detail: "not installed" });
    }
  }

  // Print results
  console.log("");
  logger.table(results);
  console.log("");

  const failures = results.filter((r) => r.status === "FAIL");
  if (failures.length > 0) {
    console.log(`${COLORS.red}  ${failures.length} check(s) failed. Fix the issues above before running.${COLORS.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${COLORS.green}  All checks passed. Run 'npm start' to launch.${COLORS.reset}\n`);
  }
}

selfTest().catch((err) => {
  console.error("Self-test crashed:", err.message);
  process.exit(1);
});
