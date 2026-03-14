import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ChevronDown } from "lucide-react";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

interface DocSection {
  id: string;
  title: string;
  content: string[];
}

const sections: DocSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: [
      "SYNARCH is a hierarchical AI agent network platform. It follows a simple architecture: one MAIN agent sits at the root of the network, and users deploy FORK agents that connect back to the main agent. Each fork runs in isolated context on its own infrastructure, while remaining connected to the central network for coordination and monitoring.",
      "The system is designed around three principles: (1) deploy fast — a new agent should be live in under 60 seconds, (2) fail safe — forks are isolated so one crash doesn't take down the network, and (3) scale infinitely — there's no hard limit on the number of forks.",
      "All deployed agents appear in the live Agent Registry, which updates in real-time via WebSocket connections. The network topology is visualized in the Agent Graph on the homepage, showing active and idle nodes with data flow animations.",
    ],
  },
  {
    id: "architecture",
    title: "Architecture",
    content: [
      "SYNARCH uses a hub-and-spoke topology. The MAIN agent (AGT-0001) is the root powerhouse — it performs ALL tasks: automation, code analysis, data orchestration, and more. When you deploy a fork, you choose which specific capability you want your fork to focus on. Your fork registers with the main agent, inherits its selected task profile, and begins operating independently.",
      "Each fork maintains a persistent WebSocket connection to the main agent for heartbeats, status reporting, and command reception. If a fork loses connection, the main agent marks it as 'idle' and can optionally trigger auto-restart based on the fork's configuration.",
      "Data flow between agents is unidirectional by default (main → fork), but forks can publish results back to the network via the results API. This allows orchestrator-type forks to chain outputs from multiple worker forks.",
      "The entire network state is persisted in a real-time database. Any changes — new deployments, status changes, configuration updates — are immediately broadcast to all connected clients via Postgres realtime subscriptions.",
    ],
  },
  {
    id: "agent-types",
    title: "Agent Types",
    content: [
      "WORKER — The automation powerhouse. Workers handle scheduled jobs, web scraping, API polling, file operations, and batch processing. They run tasks on a loop or on-demand via API triggers. Workers are stateless by default but can be configured to persist state between runs. Best for: repetitive tasks that need to run reliably without human intervention.",
      "ANALYZER — The dev-tools specialist. Analyzers integrate with your code repositories to provide automated code review, static analysis, test generation, and CI/CD quality gates. They parse ASTs (Abstract Syntax Trees) to understand code structure and can operate across multiple programming languages. Best for: maintaining code quality and catching bugs before they reach production.",
      "ORCHESTRATOR — The data pipeline manager. Orchestrators route, transform, and sync data between sources. They manage ETL flows, event streams, and multi-step data processing. They include built-in dead letter queues for failed messages and schema validation for data integrity. Best for: moving data reliably between systems and building complex workflows.",
    ],
  },
  {
    id: "deployment",
    title: "Deploying an Agent",
    content: [
      "Deployment is one-click from the SYNARCH website:",
      "STEP 1 — Go to the Launch page and pick your agent type (Worker, Analyzer, or Orchestrator). Click it. Your agent is instantly registered on the network with a unique token.",
      "STEP 2 — Copy the generated terminal command. It clones the repo from https://github.com/AgentSynarch/synarch-<type>, installs dependencies, writes your token to .env, and starts the agent — all in one line.",
      "STEP 3 — Paste the command in your terminal and hit enter. Your agent connects to the Synarch network automatically, changes status from 'pending' to 'active', and starts sending heartbeats.",
      "That's it. No manual configuration, no API keys, no form fields. Your agent appears in the live Agent Registry within seconds and you can monitor logs, status, and performance from the dashboard.",
    ],
  },
  {
    id: "configuration",
    title: "Configuration Reference",
    content: [
      "All configuration is done via environment variables in your .env file. Here's the complete reference:",
      "GITHUB_USERNAME (required) — Your GitHub username. Used for attribution in the agent registry and to fetch your profile information (avatar, bio, repos). This links your deployed agents to your identity.",
      "AGENT_NAME (required) — A human-readable name for your agent. Appears in the registry and monitoring tools. Can be anything descriptive like 'price-scraper' or 'code-reviewer-v2'.",
      "AGENT_DESCRIPTION (optional) — A brief description of what your agent does. Shown in the agent detail view. Helps other users understand the purpose of your fork.",
      "LOG_LEVEL (default: info) — Controls logging verbosity. Options: debug (everything, very verbose), info (normal operations + errors), warn (warnings + errors only), error (errors only). Use debug during development, info or warn in production.",
      "MAX_RETRIES (default: 3) — Number of times the agent will retry a failed task before giving up. Range: 0-10. Set to 0 for fire-and-forget tasks. Higher values for critical tasks that must succeed.",
      "AUTO_RESTART (default: true) — Whether the agent should automatically restart after a crash. When true, the main agent will re-register the fork and resume operations. When false, a crash means the fork stays down until manually restarted.",
    ],
  },
  {
    id: "api-reference",
    title: "API Reference",
    content: [
      "The SYNARCH API is RESTful and follows standard HTTP conventions. Base URL: https://api.synarch.io/v1",
      "POST /agents/main/fork — Deploy a new fork agent. Body: { type, source, github_username, agent_name, description, config: { log_level, max_retries, auto_restart } }. Returns: { id, name, status, parent, endpoint }. The returned endpoint is a WebSocket URL for real-time monitoring.",
      "GET /agents — List all deployed agents. Returns an array of agent objects with id, name, type, status, deployer, and timestamps. Supports query params: ?type=worker (filter by type), ?status=active (filter by status), ?limit=50 (pagination).",
      "GET /agents/:id — Get details for a specific agent. Returns the full agent object including configuration, logs URL, and metrics.",
      "DELETE /agents/:id — Kill a fork agent. Immediately terminates the agent process, closes its WebSocket connection, and marks it as 'terminated' in the registry. This action is irreversible.",
      "WS /agents/:id/stream — Open a WebSocket connection to stream real-time output from an agent. Receives JSON messages with { type: 'log' | 'metric' | 'error', data: any, timestamp: string }.",
      "All endpoints require an API key via the Authorization header: Bearer <YOUR_API_KEY>. Rate limits: 100 requests/minute for REST endpoints, no limit on WebSocket messages.",
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring & Observability",
    content: [
      "Every deployed agent is tracked in real-time through multiple channels:",
      "AGENT REGISTRY — The primary monitoring interface. Shows all deployed agents with their current status (active, idle, deploying), type, deployer, and deployment time. Click any agent to view its full configuration, GitHub profile, and description.",
      "AGENT GRAPH — A visual topology map of the network. The main agent sits at the center with fork nodes arranged in orbital rings. Active nodes glow green with data flow animations. Idle nodes pulse amber. The graph updates in real-time as agents are deployed or change status.",
      "FORK TRACKER — A live feed of deployment events. Shows a chronological log of every fork event with timestamps, agent names, types, and deployers. Useful for auditing who deployed what and when.",
      "WebSocket streaming is available for any agent via the /agents/:id/stream endpoint. This provides real-time access to agent logs, metrics, and errors without polling.",
    ],
  },
  {
    id: "security",
    title: "Security & Isolation",
    content: [
      "Each fork runs in complete isolation. There is no shared memory, filesystem, or network namespace between forks. A crash or compromise in one fork cannot affect others.",
      "API authentication uses Bearer tokens. Each token is scoped to a specific user and cannot be used to manage other users' agents. Tokens can be rotated at any time via the dashboard.",
      "All WebSocket connections are encrypted via WSS (WebSocket Secure). Data in transit between agents and the main node is encrypted with TLS 1.3.",
      "The main agent has read-only access to fork configurations. It cannot modify a fork's code or data — only send commands (start, stop, restart) and receive status updates.",
      "Rate limiting is enforced at 100 REST requests per minute per API key. WebSocket connections have no message rate limit but are subject to connection limits (max 50 concurrent connections per key).",
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    content: [
      "AGENT WON'T DEPLOY — Check that your .env file has all required fields (GITHUB_USERNAME, AGENT_NAME). Verify your API key is valid and hasn't expired. Ensure the agent type in your curl command matches a valid type (worker, analyzer, orchestrator).",
      "AGENT SHOWS IDLE — The agent has lost its WebSocket connection to the main node. If AUTO_RESTART is true, it will attempt to reconnect automatically. If it stays idle, check your network connectivity and agent logs for errors.",
      "AGENT KEEPS CRASHING — Check the LOG_LEVEL is set to 'debug' to get full error output. Review the MAX_RETRIES setting — if set to 0, the agent won't retry after failure. Common causes: unhandled exceptions in custom code, memory limits exceeded, network timeouts.",
      "CAN'T SEE AGENT IN REGISTRY — The registry updates in real-time but requires an active database connection. Hard refresh the page. If the agent was deployed more than a few minutes ago and still doesn't appear, the deploy may have failed — check the curl response for error messages.",
      "GITHUB PROFILE NOT LOADING — The registry fetches GitHub profile data (avatar, bio) via the public GitHub API. If your profile doesn't load, your GITHUB_USERNAME may be misspelled, or GitHub's API rate limit may have been hit (60 requests/hour for unauthenticated requests).",
    ],
  },
];

const Docs = () => {
  const [openSection, setOpenSection] = useState<string>("overview");

  return (
    <div className="min-h-screen bg-white text-neutral-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div className="pt-14">
        <div className="mx-auto max-w-6xl px-6 py-20">
          {/* Header */}
          <div className="mb-16">
            <span className="text-sm text-neutral-400">Documentation</span>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-serif font-normal leading-[1.1] tracking-tight text-neutral-900 mt-1 mb-3">
              Docs
            </h1>
            <p className="text-[15px] text-neutral-400 max-w-xl">
              Complete guide to Synarch — architecture, deployment, configuration, APIs, monitoring, and troubleshooting.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
            {/* Sidebar nav */}
            <nav className="hidden lg:block">
              <div className="sticky top-20 space-y-1">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-3">Sections</p>
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setOpenSection(s.id);
                      document.getElementById(`doc-${s.id}`)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      openSection === s.id
                        ? "text-neutral-900 bg-neutral-100 font-medium"
                        : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </nav>

            {/* Content */}
            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} id={`doc-${section.id}`} className="border border-neutral-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenSection(openSection === section.id ? "" : section.id)}
                    className="w-full flex items-center justify-between px-6 py-5 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-neutral-800">{section.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform ${
                        openSection === section.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openSection === section.id && (
                    <div className="px-6 py-6 space-y-4 border-t border-neutral-100">
                      {section.content.map((paragraph, i) => {
                        const isStep = paragraph.match(/^(STEP \d+|[A-Z_ ]+) —/);
                        if (isStep) {
                          const dashIdx = paragraph.indexOf("—");
                          const label = paragraph.slice(0, dashIdx).trim();
                          const rest = paragraph.slice(dashIdx + 1).trim();
                          return (
                            <div key={i} className="pl-4 border-l-2 border-neutral-200">
                              <span className="text-xs font-semibold text-neutral-700 block mb-1">{label}</span>
                              <p className="text-[13px] text-neutral-400 leading-relaxed">{rest}</p>
                            </div>
                          );
                        }
                        const isEndpoint = paragraph.match(/^(POST|GET|DELETE|WS|PUT|PATCH) /);
                        if (isEndpoint) {
                          const spaceIdx = paragraph.indexOf(" ");
                          const dashIdx = paragraph.indexOf("—");
                          const method = paragraph.slice(0, spaceIdx);
                          const route = paragraph.slice(spaceIdx, dashIdx !== -1 ? dashIdx : undefined).trim();
                          const desc = dashIdx !== -1 ? paragraph.slice(dashIdx + 1).trim() : "";
                          return (
                            <div key={i} className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-xs">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                                  method === "POST" ? "bg-emerald-50 text-emerald-600"
                                    : method === "DELETE" ? "bg-red-50 text-red-600"
                                    : method === "WS" ? "bg-amber-50 text-amber-600"
                                    : "bg-neutral-100 text-neutral-500"
                                }`}>{method}</span>
                                <span className="text-neutral-700">{route}</span>
                              </div>
                              {desc && <p className="text-neutral-400 text-[11px] leading-relaxed font-sans">{desc}</p>}
                            </div>
                          );
                        }
                        return (
                          <p key={i} className="text-[13px] text-neutral-400 leading-relaxed">{paragraph}</p>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-100 mt-8">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Synarch" className="w-4 h-4 object-contain opacity-50" />
            <span className="text-[12px] text-neutral-400">SYNARCH © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Docs;
