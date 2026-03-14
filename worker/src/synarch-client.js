const axios = require("axios");

class SynarchClient {
  constructor(logger) {
    this.logger = logger;
    this.apiUrl = process.env.SYNARCH_API_URL;
    this.agentToken = process.env.AGENT_TOKEN;
    this.agentId = null;
    this.forkName = null;
    this.heartbeatTimer = null;
    this.heartbeatFailures = 0;
    this.maxHeartbeatFailures = 5;
    this.logQueue = [];
    this.flushTimer = null;
  }

  async register(agentType) {
    if (this.agentToken) {
      this.agentId = this.agentToken;
      this.logger.info(`Using pre-registered token: ${this.agentToken.slice(0, 8)}...`);

      try {
        await axios.post(`${this.apiUrl}/heartbeat`, {
          agent_id: this.agentToken,
          status: "active",
        });
        this.logger.info("Agent activated on network");

        const res = await axios.get(`${this.apiUrl}/agents`);
        const me = res.data?.find((a) => a.id === this.agentToken);
        if (me) {
          this.forkName = me.fork_name;
          this.logger.info(`Registered as ${this.forkName}`, { type: me.agent_type, id: me.id.slice(0, 8) });
        }
        return true;
      } catch (err) {
        this.logger.error(`Token activation failed: ${err.response?.data?.error || err.message}`);
        return false;
      }
    }

    try {
      const res = await axios.post(`${this.apiUrl}/register`, {
        agent_type: agentType,
        github_username: process.env.GITHUB_USERNAME,
        agent_name: process.env.AGENT_NAME,
        description: process.env.AGENT_DESCRIPTION,
        config: {
          log_level: process.env.LOG_LEVEL || "info",
          max_retries: parseInt(process.env.MAX_RETRIES || "3"),
          auto_restart: process.env.AUTO_RESTART === "true",
        },
      });
      this.agentId = res.data.id;
      this.forkName = res.data.fork_name;
      this.logger.info(`Registered as ${this.forkName}`, { id: this.agentId.slice(0, 8) });
      return true;
    } catch (err) {
      this.logger.error(`Registration failed: ${err.response?.data?.error || err.message}`);
      return false;
    }
  }

  startHeartbeat() {
    const interval = parseInt(process.env.HEARTBEAT_INTERVAL || "30") * 1000;
    this.heartbeatTimer = setInterval(() => this._sendHeartbeat(), interval);
    this.logger.info(`Heartbeat active`, { interval: `${interval / 1000}s` });

    // Start log flush timer (batch logs every 10s)
    this.flushTimer = setInterval(() => this._flushLogs(), 10000);
  }

  async _sendHeartbeat() {
    if (!this.agentId) return;
    try {
      await axios.post(`${this.apiUrl}/heartbeat`, { agent_id: this.agentId, status: "active" });
      this.heartbeatFailures = 0;
    } catch (err) {
      this.heartbeatFailures++;
      if (this.heartbeatFailures >= this.maxHeartbeatFailures) {
        this.logger.error(`Heartbeat failed ${this.heartbeatFailures} times consecutively -- network may be down`);
      } else {
        this.logger.warn(`Heartbeat failed (${this.heartbeatFailures}/${this.maxHeartbeatFailures}): ${err.message}`);
      }
    }
  }

  async updateStatus(status) {
    if (!this.agentId) return;
    try {
      await axios.post(`${this.apiUrl}/heartbeat`, { agent_id: this.agentId, status });
    } catch { /* swallow */ }
  }

  async reportLog(level, message, meta = {}) {
    if (!this.agentId) return;
    // Queue logs for batch sending
    this.logQueue.push({ agent_id: this.agentId, level, message, meta, timestamp: new Date().toISOString() });
  }

  async _flushLogs() {
    if (this.logQueue.length === 0 || !this.agentId) return;
    const batch = this.logQueue.splice(0, 50); // send up to 50 at a time
    for (const log of batch) {
      try {
        await axios.post(`${this.apiUrl}/log`, log);
      } catch { /* swallow */ }
    }
  }
}

module.exports = { SynarchClient };
