require("dotenv").config();
const { APIClient } = require("./api-client");
const output = require("./output");

async function selfTest() {
  const results = [];

  console.log(`
${output.COLORS.cyan}  SYNARCH CLI -- Self-Test${output.COLORS.reset}
`);

  // 1. Node.js
  const nodeVersion = parseInt(process.version.slice(1));
  results.push({
    check: "Node.js",
    status: nodeVersion >= 18 ? "OK" : "FAIL",
    detail: process.version,
  });

  // 2. API URL
  const apiUrl = process.env.SYNARCH_API_URL;
  if (apiUrl) {
    results.push({ check: "API URL", status: "OK", detail: apiUrl });
  } else {
    results.push({ check: "API URL", status: "WARN", detail: "Not set (use --api-url flag)" });
  }

  // 3. API connectivity
  if (apiUrl) {
    try {
      const client = new APIClient(apiUrl);
      const health = await client.checkHealth();
      results.push({ check: "API Health", status: "OK", detail: `${health.latency}ms latency` });
      results.push({ check: "Agents", status: "OK", detail: `${health.data?.total_agents || 0} registered` });
    } catch (err) {
      results.push({ check: "API Health", status: "FAIL", detail: err.message });
    }
  }

  // 4. Dependencies
  const deps = ["axios", "dotenv"];
  for (const dep of deps) {
    try {
      require(dep);
      results.push({ check: `Module: ${dep}`, status: "OK", detail: "loaded" });
    } catch {
      results.push({ check: `Module: ${dep}`, status: "FAIL", detail: "not installed" });
    }
  }

  console.log("");
  output.table(results);

  const failures = results.filter((r) => r.status === "FAIL");
  if (failures.length > 0) {
    console.log(`${output.COLORS.red}  ${failures.length} check(s) failed.${output.COLORS.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${output.COLORS.green}  All checks passed.${output.COLORS.reset}\n`);
  }
}

selfTest().catch((err) => {
  console.error("Self-test crashed:", err.message);
  process.exit(1);
});
