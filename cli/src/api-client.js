require("dotenv").config();
const axios = require("axios");

class APIClient {
  constructor(apiUrl) {
    this.apiUrl = apiUrl || process.env.SYNARCH_API_URL;
    if (!this.apiUrl) {
      throw new Error(
        "No API URL configured. Set SYNARCH_API_URL in .env or pass --api-url"
      );
    }
  }

  async getAgents() {
    const res = await axios.get(`${this.apiUrl}/agents`, { timeout: 10000 });
    return res.data || [];
  }

  async getStats() {
    const res = await axios.get(`${this.apiUrl}/stats`, { timeout: 10000 });
    return res.data;
  }

  async getLogs(agentId, limit = 50) {
    const params = {};
    if (agentId) params.agent_id = agentId;
    if (limit) params.limit = limit;
    const res = await axios.get(`${this.apiUrl}/logs`, { params, timeout: 10000 });
    return res.data || [];
  }

  async register(agentType, options = {}) {
    const res = await axios.post(`${this.apiUrl}/register`, {
      agent_type: agentType,
      agent_name: options.name || "cli-deployed",
      github_username: options.github || process.env.GITHUB_USERNAME || "unknown",
      description: options.description || `Deployed via CLI at ${new Date().toISOString()}`,
      config: {
        log_level: options.logLevel || "info",
        max_retries: parseInt(options.retries || "3"),
        auto_restart: options.autoRestart === "true",
      },
    }, { timeout: 10000 });
    return res.data;
  }

  async heartbeat(agentId, status = "active") {
    const res = await axios.post(`${this.apiUrl}/heartbeat`, {
      agent_id: agentId,
      status,
    }, { timeout: 10000 });
    return res.data;
  }

  async sendLog(agentId, level, message, meta = {}) {
    await axios.post(`${this.apiUrl}/log`, {
      agent_id: agentId,
      level,
      message,
      meta,
    }, { timeout: 10000 });
  }

  async checkHealth() {
    const start = Date.now();
    const res = await axios.get(`${this.apiUrl}/stats`, { timeout: 10000 });
    const latency = Date.now() - start;
    return { ok: true, latency, status: res.status, data: res.data };
  }
}

module.exports = { APIClient };
