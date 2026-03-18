# SYNARCH Wallet & x402 Payments

Agentic wallets and autonomous payment infrastructure for Synarch agents. Powered by Privy.

---

## Overview

Every Synarch agent can hold a wallet, execute onchain transactions, and pay for APIs using the x402 payment protocol — all within policy-enforced guardrails.

Two wallet models are supported:

| Model | Description | Use Case |
|-------|-------------|----------|
| **Agent-controlled** | Backend owns the wallet via authorization keys. Agents transact autonomously. | Fully autonomous agents, trading bots, automated service providers |
| **User-owned + agent signer** | Users maintain ownership, agents get scoped permissions. | Delegated trading, user-approved spending, revocable access |

---

## Prerequisites

1. **Privy account** — Sign up at [privy.io](https://privy.io)
2. **App ID and App Secret** — Found in your Privy Dashboard under Settings
3. **Authorization keys** — Created in the Privy Dashboard for agent wallet control
4. **Policy (optional)** — Define spending constraints for your agent

---

## Setup

### 1. Install the Privy SDK

In your agent directory:

```bash
npm install @privy-io/node
```

### 2. Configure environment variables

Add to your agent's `.env` file:

```env
# Wallet configuration (Privy)
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
PRIVY_AUTHORIZATION_KEY_ID=your-auth-key-id
PRIVY_AUTHORIZATION_KEY_PRIVATE_KEY=your-auth-key-private-key

# Optional: pre-existing wallet
AGENT_WALLET_ID=
AGENT_WALLET_POLICY_ID=
```

### 3. The wallet client initializes automatically

The wallet client is built into every agent type. If `PRIVY_APP_ID` and `PRIVY_APP_SECRET` are set, the wallet initializes on startup. If not, the agent runs without wallet capabilities — no errors.

---

## Wallet Models

### Model 1: Agent-Controlled Wallets

Your application backend controls the wallet. The agent can execute transactions within policy constraints without user approval.

```js
const { WalletClient } = require("./wallet-client");

const wallet = new WalletClient(logger);
await wallet.initialize();

// Create a new wallet for the agent
const newWallet = await wallet.createWallet("ethereum");
console.log(`Wallet address: ${newWallet.address}`);

// Send a transaction
await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: "1000000000000000", // 0.001 ETH in wei
  chainId: 1,
});
```

### Model 2: User-Owned + Agent Signer

Users maintain wallet ownership while granting limited permissions to agents. See the [Privy signers guide](https://docs.privy.io/wallets/using-wallets/signers/overview) for setup.

---

## x402 Payment Protocol

The x402 protocol enables agents to pay for APIs and content autonomously. When an API returns `402 Payment Required`, the agent's wallet automatically handles the payment.

### Flow

```
Agent → API Request
        ↓
API → 402 Payment Required (includes payment details)
        ↓
Agent → wallet.handleX402Payment(details)
        ↓
Wallet → Signs and sends transaction
        ↓
Agent → Retries API request with payment proof
        ↓
API → 200 OK (returns data)
```

### Usage

```js
const axios = require("axios");

async function fetchPaidAPI(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    if (err.response?.status === 402) {
      const paymentDetails = err.response.data;

      // Agent wallet handles payment automatically
      const tx = await wallet.handleX402Payment({
        recipient: paymentDetails.recipient,
        amount: paymentDetails.amount,
        chainId: paymentDetails.chainId,
        token: paymentDetails.token,
      });

      // Retry with payment proof
      const retryResponse = await axios.get(url, {
        headers: { "X-Payment-Proof": tx.hash },
      });
      return retryResponse.data;
    }
    throw err;
  }
}
```

---

## Policy Controls

Policies define the boundaries within which agents can operate. Create policies in the Privy Dashboard.

| Policy Type | Description |
|-------------|-------------|
| **Transfer limits** | Max amount per transaction or within time windows |
| **Contract allowlists** | Restrict to approved protocols only |
| **Recipient restrictions** | Limit where funds can be sent |
| **Time-based controls** | Define when agents can operate |
| **Action-specific rules** | Control parameters for swaps, trades, etc. |

### Example Policy

```json
{
  "name": "synarch-agent-policy",
  "rules": [
    {
      "type": "transfer_limit",
      "max_amount": "0.1",
      "currency": "ETH",
      "time_window": "24h"
    },
    {
      "type": "allowlisted_contracts",
      "addresses": ["0xApprovedContract1", "0xApprovedContract2"]
    }
  ]
}
```

---

## Monitoring

The wallet client automatically logs all transactions. Access the log:

```js
// Get all transactions from this session
const log = wallet.getTransactionLog();

// Get wallet summary for metrics
const summary = wallet.getSummary();
// { configured, initialized, walletId, walletAddress, totalTransactions }
```

Transaction events are also reported to the Synarch network alongside regular agent metrics.

---

## Supported Chains

| Chain | CAIP-2 | Status |
|-------|--------|--------|
| Ethereum | `eip155:1` | Supported |
| Base | `eip155:8453` | Supported |
| Arbitrum | `eip155:42161` | Supported |
| Polygon | `eip155:137` | Supported |
| Optimism | `eip155:10` | Supported |
| Solana | `solana:mainnet` | Supported |

---

## Configuration Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PRIVY_APP_ID` | Yes* | — | Privy application ID |
| `PRIVY_APP_SECRET` | Yes* | — | Privy application secret |
| `PRIVY_AUTHORIZATION_KEY_ID` | No | — | Authorization key for wallet control |
| `PRIVY_AUTHORIZATION_KEY_PRIVATE_KEY` | No | — | Private key for signing requests |
| `AGENT_WALLET_ID` | No | — | Pre-existing wallet ID |
| `AGENT_WALLET_POLICY_ID` | No | — | Policy ID for transaction constraints |

\* Required only if wallet features are needed. Agents run fine without wallet configuration.

---

## Security

- Authorization keys should be stored securely and never committed to version control
- Use policies to enforce spending limits — never give agents unlimited transaction authority
- Monitor transaction logs and set up alerts for unusual activity
- Use key quorums for critical operations (wallet export, policy changes)

---

## License

MIT