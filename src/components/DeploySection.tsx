import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const agentTypes = [
  {
    id: "worker",
    name: "WORKER",
    tag: "automation",
    repo: "github.com/AgentSynarch/synarch-worker",
    dir: "synarch-worker",
    desc: "Automates parallel workloads: scheduled jobs, file operations, web scraping, API polling, and batch processing. Deploy it to handle repetitive tasks on autopilot.",
  },
  {
    id: "analyzer",
    name: "ANALYZER",
    tag: "dev-tools",
    repo: "github.com/AgentSynarch/synarch-analyzer",
    dir: "synarch-analyzer",
    desc: "Code review, static analysis, test generation, and CI/CD integration. Hooks into your repos to catch bugs, suggest improvements, and automate quality checks.",
  },
  {
    id: "orchestrator",
    name: "ORCHESTRATOR",
    tag: "pipeline",
    repo: "github.com/AgentSynarch/synarch-orchestrator",
    dir: "synarch-orchestrator",
    desc: "Routes, transforms, and syncs data between sources. Manages ETL flows, event streams, and multi-step data processing across your infrastructure.",
  },
];

export const DeploySection = () => {
  const [selected, setSelected] = useState(agentTypes[0]);
  const [copied, setCopied] = useState(false);

  const steps = `# 1. Clone the repo
git clone https://${selected.repo}.git

# 2. Install dependencies
cd ${selected.dir} && npm install

# 3. Configure your agent
# Edit .env with your details
cp .env.example .env

# Set your config:
# GITHUB_USERNAME=<your-github-username>
# AGENT_NAME=<your-agent-name>
# AGENT_DESCRIPTION="<what this agent will do>"
# LOG_LEVEL=info          # debug | info | warn | error
# MAX_RETRIES=3           # 0-10
# AUTO_RESTART=true       # true | false

# 4. Deploy your fork
curl -X POST https://api.synarch.io/v1/agents/main/fork \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "${selected.id}",
    "source": "${selected.repo}",
    "github_username": "<your-github-username>",
    "agent_name": "<your-agent-name>",
    "description": "<what this agent will do>",
    "config": {
      "log_level": "info",
      "max_retries": 3,
      "auto_restart": true
    }
  }'`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(steps);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Log the fork to the database
    const { count } = await supabase
      .from("deployed_forks")
      .select("*", { count: "exact", head: true });
    const forkName = `FORK-${String((count ?? 0) + 1).padStart(4, "0")}`;
    await supabase.from("deployed_forks").insert({
      agent_type: selected.id,
      fork_name: forkName,
      status: "active",
    });
  };

  return (
    <section id="deploy" className="py-20 border-t border-border">
      <div className="mb-8">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-3">
          // deploy
        </p>
        <h2 className="font-mono text-3xl font-bold text-foreground">
          fork your agent
        </h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-lg">
          Choose your agent type, copy the commands, and configure everything in your terminal. Your GitHub username, agent name, and settings are all set via the deploy command.
        </p>
      </div>

      {/* Agent type cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {agentTypes.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setSelected(agent)}
            className={`text-left p-5 border transition-all duration-200 bg-card/40 ${
              selected.id === agent.id
                ? "border-primary glow-green"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm font-bold text-foreground">
                {agent.name}
              </span>
              <span className="font-mono text-[10px] border border-primary/40 text-primary px-2 py-0.5">
                {agent.tag}
              </span>
            </div>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed mb-3">
              {agent.desc}
            </p>
            <span className="font-mono text-[10px] text-muted-foreground/60 break-all">
              {agent.repo}
            </span>
          </button>
        ))}
      </div>

      {/* Terminal block */}
      <div className="border border-border">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
            <span className="ml-2 font-mono text-[10px] text-muted-foreground">
              terminal — deploy {selected.id}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
            {copied ? "copied" : "copy"}
          </button>
        </div>
        <div className="bg-background p-5 overflow-x-auto">
          <pre className="font-mono text-xs text-foreground/80 leading-relaxed whitespace-pre">
            {steps.split("\n").map((line, i) => {
              const trimmed = line.trimStart();
              if (trimmed.startsWith("#")) {
                return <span key={i} className="block text-muted-foreground">{line}</span>;
              }
              if (
                trimmed.startsWith("curl") ||
                trimmed.startsWith("git") ||
                trimmed.startsWith("cd") ||
                trimmed.startsWith("cp")
              ) {
                return <span key={i} className="block text-primary/90">{line}</span>;
              }
              // Highlight <placeholder> values
              const parts = line.split(/(<[^>]+>)/g);
              return (
                <span key={i} className="block">
                  {parts.map((part, j) =>
                    part.startsWith("<") && part.endsWith(">") ? (
                      <span key={j} className="text-accent-foreground bg-accent/20 px-0.5">{part}</span>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </span>
              );
            })}
          </pre>
        </div>
      </div>
    </section>
  );
};
