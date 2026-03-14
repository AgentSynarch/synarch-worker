import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Copy, Check, Rocket, Terminal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const agentTypes = [
  {
    id: "worker",
    name: "Worker",
    tag: "Automation",
    tagColor: "bg-emerald-100 text-emerald-600",
    desc: "Scheduled jobs, web scraping, API polling, batch processing.",
    repo: "synarch-worker",
  },
  {
    id: "analyzer",
    name: "Analyzer",
    tag: "Dev Tools",
    tagColor: "bg-violet-100 text-violet-600",
    desc: "Code review, static analysis, security scanning, report generation.",
    repo: "synarch-analyzer",
  },
  {
    id: "orchestrator",
    name: "Orchestrator",
    tag: "Pipeline",
    tagColor: "bg-sky-100 text-sky-600",
    desc: "Data pipelines, ETL flows, event routing, parallel processing.",
    repo: "synarch-orchestrator",
  },
];

type DeployState = "pick" | "deploying" | "deployed";

interface DeployResult {
  id: string;
  fork_name: string;
  agent_type: string;
  repo: string;
}

const Launch = () => {
  const [state, setState] = useState<DeployState>("pick");
  const [result, setResult] = useState<DeployResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleDeploy = async (agent: typeof agentTypes[0]) => {
    setState("deploying");
    setError("");

    try {
      const { count } = await supabase
        .from("deployed_forks")
        .select("*", { count: "exact", head: true });
      const forkName = `Synarch-Agent-${String((count ?? 0) + 1).padStart(4, "0")}`;

      const { data, error: insertError } = await supabase
        .from("deployed_forks")
        .insert({
          agent_type: agent.id,
          fork_name: forkName,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setResult({ id: data.id, fork_name: data.fork_name, agent_type: data.agent_type, repo: agent.repo });
      setState("deployed");
    } catch (err: any) {
      setError(err.message || "Deployment failed.");
      setState("pick");
    }
  };

  const installCommand = result
    ? `git clone https://github.com/AgentSynarch/${result.repo}.git && cd ${result.repo} && npm install && echo "AGENT_TOKEN=${result.id}" > .env && npm start`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div className="pt-14">
        <div className="mx-auto max-w-4xl px-6 py-20">
          {/* Header */}
          <div className="mb-12">
            <span className="text-sm text-neutral-400">Launch Pad</span>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-serif font-normal leading-[1.1] tracking-tight text-neutral-900 mt-1 mb-3">
              Deploy your <span className="text-neutral-400">Agent</span>
            </h1>
            <p className="text-[15px] text-neutral-400 max-w-xl">
              {state === "deployed"
                ? "Your agent is registered. Run the command below to bring it online."
                : "Pick an agent type. One click to deploy."}
            </p>
          </div>

          {state === "deployed" && result ? (
            <div className="space-y-8">
              {/* Success */}
              <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Rocket className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800">
                    {result.fork_name}
                  </span>
                  <span className="text-[10px] font-medium bg-emerald-100 text-emerald-600 px-2.5 py-0.5 rounded-full">
                    {result.agent_type}
                  </span>
                  <span className="text-[10px] font-medium bg-amber-100 text-amber-600 px-2.5 py-0.5 rounded-full">
                    pending
                  </span>
                </div>
                <p className="text-xs text-emerald-600/80">
                  Registered and waiting to connect. Paste the command below into your terminal.
                </p>
              </div>

              {/* Install command */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-[11px] text-neutral-400">
                      Paste in terminal
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "copied" : "copy"}
                  </button>
                </div>
                <div className="bg-neutral-900 p-5 overflow-x-auto">
                  <pre className="font-mono text-xs text-neutral-300 whitespace-pre-wrap break-all leading-relaxed">
                    {installCommand}
                  </pre>
                </div>
              </div>

              {/* What happens */}
              <div className="border border-neutral-200 rounded-xl p-6 bg-neutral-50/50">
                <h3 className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-5">
                  What happens next
                </h3>
                <div className="space-y-4">
                  {[
                    "Clones the repo and installs dependencies automatically",
                    `Connects to the Synarch network using token ${result.fork_name}`,
                    "Status changes from 'pending' → 'active' in the live registry",
                    "Heartbeats, logs, and metrics tracked in real-time",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="text-sm font-serif text-neutral-300 mt-0.5">0{i + 1}</span>
                      <p className="text-sm text-neutral-500">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setState("pick"); setResult(null); }}
                className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors underline underline-offset-4"
              >
                Deploy another →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {agentTypes.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleDeploy(agent)}
                    disabled={state === "deploying"}
                    className="text-left p-6 border border-neutral-200 rounded-xl bg-white hover:border-neutral-300 hover:shadow-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-neutral-800">
                        {agent.name}
                      </span>
                      <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${agent.tagColor}`}>
                        {agent.tag}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-5">
                      {agent.desc}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      <Rocket className="w-3.5 h-3.5" />
                      {state === "deploying" ? "Deploying..." : "Deploy →"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
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

export default Launch;
