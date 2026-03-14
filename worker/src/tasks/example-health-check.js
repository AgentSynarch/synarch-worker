// Task: HTTP Health Check
// Pings configured URLs and reports response times and status codes.
// Throws on failure to trigger retry logic.

const axios = require("axios");

module.exports = {
  name: "health-check",
  priority: 10, // runs first (higher = higher priority)

  async run(logger, client, ctx) {
    const urls = (process.env.HEALTH_CHECK_URLS || process.env.HEALTH_CHECK_URL || "https://httpbin.org/get")
      .split(",")
      .map((u) => u.trim());

    const results = [];

    for (const url of urls) {
      const start = Date.now();
      try {
        const res = await axios.get(url, { timeout: 10000 });
        const duration = Date.now() - start;
        results.push({ url, status: res.status, duration, ok: true });
        logger.info(`${url} -- ${res.status} (${duration}ms)`);
      } catch (err) {
        const duration = Date.now() - start;
        results.push({ url, error: err.message, duration, ok: false });
        logger.error(`${url} -- ${err.message} (${duration}ms)`);
      }
    }

    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      throw new Error(`${failed.length}/${results.length} health checks failed`);
    }

    return results;
  },

  async onError(err, logger, client) {
    logger.warn(`Health check alert: ${err.message}`);
    // Hook: send webhook, email, Slack notification, etc.
  },
};
