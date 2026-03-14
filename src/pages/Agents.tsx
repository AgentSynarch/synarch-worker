import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { AgentDetailDialog } from "@/components/AgentDetailDialog";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

interface Agent {
  id: string;
  fork_name: string;
  agent_name: string | null;
  agent_type: string;
  status: string;
  github_username: string | null;
  description: string | null;
  created_at: string;
  log_level: string;
  max_retries: number;
  auto_restart: boolean;
}

const typeAccent: Record<string, string> = {
  worker: "bg-emerald-50 text-emerald-700 border-emerald-200",
  analyzer: "bg-violet-50 text-violet-700 border-violet-200",
  orchestrator: "bg-sky-50 text-sky-700 border-sky-200",
};

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("deployed_forks")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setAgents(data as Agent[]);
    };
    fetch();

    const channel = supabase
      .channel("agents-page")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "deployed_forks" }, (payload) => {
        setAgents((prev) => [payload.new as Agent, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-white text-neutral-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div className="pt-14">
        <div className="mx-auto max-w-6xl px-6 py-20">
          {/* Header */}
          <div className="mb-16">
            <span className="text-sm text-neutral-400">Agent Registry</span>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-serif font-normal leading-[1.1] tracking-tight text-neutral-900 mt-1 mb-3">
              Deployed <span className="text-neutral-400">Agents</span>
            </h1>
            <p className="text-[15px] text-neutral-400 max-w-lg">
              All forked agents currently deployed across the network. Click any agent to view its full configuration and deployer profile.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <span className="text-xs bg-neutral-100 text-neutral-500 px-3 py-1.5 rounded-full font-medium">
                {agents.length} total agents
              </span>
              <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                {agents.filter((a) => a.status === "active").length} active
              </span>
            </div>
          </div>

          {/* Agent grid */}
          {agents.length === 0 ? (
            <div className="border border-neutral-200 rounded-xl p-16 text-center">
              <p className="text-sm text-neutral-500">No agents deployed yet</p>
              <p className="text-xs text-neutral-400 mt-2">
                Deploy your first agent from the <Link to="/launch" className="text-neutral-800 underline underline-offset-4 hover:text-neutral-600">launch page</Link>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => { setSelectedId(agent.id); setDialogOpen(true); }}
                  className="bg-white border border-neutral-200 rounded-xl p-6 text-left hover:border-neutral-300 hover:shadow-sm transition-all group"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-medium border px-2.5 py-0.5 rounded-full ${typeAccent[agent.agent_type] || "bg-neutral-50 text-neutral-500 border-neutral-200"}`}>
                      {agent.agent_type}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${agent.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-neutral-300"}`} />
                      <span className="text-[10px] text-neutral-400">{agent.status}</span>
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-semibold text-neutral-800 group-hover:text-neutral-600 transition-colors mb-1">
                    {agent.agent_name || agent.fork_name}
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-mono mb-3">{agent.fork_name}</p>

                  {/* Description */}
                  {agent.description && (
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4 line-clamp-2">
                      {agent.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <span className="text-[10px] text-neutral-400">
                      {agent.github_username ? `@${agent.github_username}` : "anonymous"}
                    </span>
                    <span className="text-[10px] text-neutral-300">
                      {formatDate(agent.created_at)}
                    </span>
                  </div>
                </button>
              ))}
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

      <AgentDetailDialog forkId={selectedId} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default Agents;
