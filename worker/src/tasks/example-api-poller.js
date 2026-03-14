// Task: API Poller
// Polls an HTTP endpoint and detects response changes using content hashing.
// Stores a hash of each response and compares against the previous run.

const axios = require("axios");
const crypto = require("crypto");

module.exports = {
  name: "api-poller",

  async run(logger, client, ctx) {
    const url = process.env.POLL_URL || "https://httpbin.org/uuid";
    const method = (process.env.POLL_METHOD || "GET").toUpperCase();
    const headers = process.env.POLL_HEADERS ? JSON.parse(process.env.POLL_HEADERS) : {};

    logger.info(`Polling: ${method} ${url}`);

    const start = Date.now();
    const res = await axios({ method, url, headers, timeout: 15000 });
    const duration = Date.now() - start;
    const body = JSON.stringify(res.data);
    const hash = crypto.createHash("sha256").update(body).digest("hex").slice(0, 16);

    const prev = ctx.previousResults?.get("api-poller")?.data;
    let changed = false;

    if (prev && prev.hash !== hash) {
      logger.info(`Change detected`, { prev: prev.hash, curr: hash, duration: `${duration}ms` });
      changed = true;
    } else if (prev) {
      logger.info(`No change`, { hash, duration: `${duration}ms` });
    } else {
      logger.info(`First poll`, { hash, duration: `${duration}ms` });
    }

    return {
      url,
      status: res.status,
      hash,
      changed,
      bodyLength: body.length,
      duration,
      timestamp: Date.now(),
    };
  },
};
