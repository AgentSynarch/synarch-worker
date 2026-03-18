/**
 * SYNARCH Wallet Client
 *
 * Integrates with Privy to provide agentic wallets for Worker agents.
 * Supports two models:
 *   Model 1 — Agent-controlled, developer-owned wallets
 *   Model 2 — User-owned wallets with agent signers
 *
 * Requires: PRIVY_APP_ID, PRIVY_APP_SECRET, PRIVY_AUTHORIZATION_KEY_ID,
 *           PRIVY_AUTHORIZATION_KEY_PRIVATE_KEY
 *
 * x402 payment protocol support included for paying APIs autonomously.
 */

class WalletClient {
  constructor(logger) {
    this.logger = logger;
    this.appId = process.env.PRIVY_APP_ID;
    this.appSecret = process.env.PRIVY_APP_SECRET;
    this.authKeyId = process.env.PRIVY_AUTHORIZATION_KEY_ID;
    this.authKeyPrivate = process.env.PRIVY_AUTHORIZATION_KEY_PRIVATE_KEY;
    this.walletId = process.env.AGENT_WALLET_ID || null;
    this.walletAddress = null;
    this.policyId = process.env.AGENT_WALLET_POLICY_ID || null;
    this.privyClient = null;
    this.initialized = false;
    this.transactionLog = [];
  }

  /**
   * Check if wallet integration is configured
   */
  isConfigured() {
    return !!(this.appId && this.appSecret);
  }

  /**
   * Initialize the Privy client
   */
  async initialize() {
    if (!this.isConfigured()) {
      this.logger.warn("Wallet not configured — skipping initialization (set PRIVY_APP_ID and PRIVY_APP_SECRET)");
      return false;
    }

    try {
      const { PrivyClient } = require("@privy-io/node");
      this.privyClient = new PrivyClient(this.appId, this.appSecret, {
        walletApi: {
          authorizationPrivateKey: this.authKeyPrivate,
        },
      });
      this.initialized = true;
      this.logger.info("Wallet client initialized", { appId: this.appId.slice(0, 8) + "..." });
      return true;
    } catch (err) {
      this.logger.error(`Wallet initialization failed: ${err.message}`);
      return false;
    }
  }

  /**
   * Create a new agent-controlled wallet (Model 1)
   */
  async createWallet(chainType = "ethereum") {
    if (!this.initialized) throw new Error("Wallet client not initialized");

    try {
      const wallet = await this.privyClient.walletApi.create({
        chainType,
        authorizationKeyIds: this.authKeyId ? [this.authKeyId] : undefined,
        policyIds: this.policyId ? [this.policyId] : undefined,
      });

      this.walletId = wallet.id;
      this.walletAddress = wallet.address;
      this.logger.info("Agent wallet created", {
        walletId: wallet.id.slice(0, 12) + "...",
        address: wallet.address,
        chain: chainType,
      });

      return wallet;
    } catch (err) {
      this.logger.error(`Wallet creation failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance() {
    if (!this.initialized || !this.walletId) return null;

    try {
      const wallet = await this.privyClient.walletApi.getWallet(this.walletId);
      return wallet;
    } catch (err) {
      this.logger.error(`Balance check failed: ${err.message}`);
      return null;
    }
  }

  /**
   * Send a transaction from the agent wallet
   */
  async sendTransaction({ to, value, data, chainId = 1 }) {
    if (!this.initialized || !this.walletId) {
      throw new Error("Wallet not initialized or no wallet ID set");
    }

    try {
      const tx = await this.privyClient.walletApi.ethereum.sendTransaction({
        walletId: this.walletId,
        caip2: `eip155:${chainId}`,
        transaction: { to, value, data },
      });

      this.transactionLog.push({
        txHash: tx.hash,
        to,
        value,
        chainId,
        timestamp: new Date().toISOString(),
        status: "sent",
      });

      this.logger.info("Transaction sent", {
        txHash: tx.hash?.slice(0, 12) + "...",
        to: to.slice(0, 10) + "...",
        value,
      });

      return tx;
    } catch (err) {
      this.logger.error(`Transaction failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Handle x402 payment flow
   * When an API returns 402 Payment Required, this handles the payment automatically
   */
  async handleX402Payment(paymentDetails) {
    if (!this.initialized || !this.walletId) {
      throw new Error("Wallet not initialized for x402 payments");
    }

    const { recipient, amount, chainId, token } = paymentDetails;

    this.logger.info("Processing x402 payment", { recipient, amount, token });

    try {
      const tx = await this.sendTransaction({
        to: recipient,
        value: amount,
        chainId: chainId || 1,
      });

      this.logger.info("x402 payment completed", { txHash: tx.hash });
      return tx;
    } catch (err) {
      this.logger.error(`x402 payment failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Sign a message with the agent wallet
   */
  async signMessage(message) {
    if (!this.initialized || !this.walletId) {
      throw new Error("Wallet not initialized");
    }

    try {
      const signature = await this.privyClient.walletApi.ethereum.signMessage({
        walletId: this.walletId,
        message,
      });
      return signature;
    } catch (err) {
      this.logger.error(`Message signing failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get transaction history for this session
   */
  getTransactionLog() {
    return [...this.transactionLog];
  }

  /**
   * Get wallet summary for metrics reporting
   */
  getSummary() {
    return {
      configured: this.isConfigured(),
      initialized: this.initialized,
      walletId: this.walletId ? this.walletId.slice(0, 12) + "..." : null,
      walletAddress: this.walletAddress,
      totalTransactions: this.transactionLog.length,
    };
  }
}

module.exports = { WalletClient };