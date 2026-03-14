import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AgentDetailDialog } from "@/components/AgentDetailDialog";

interface Agent {
  dbId: string;
  id: string;
  name: string;
  status: "active" | "idle" | "deploying";
  type: string;
  github_username: string | null;
  created_at: string;
  isMain?: boolean;
}

const mainAgent: Agent = {
  dbId: "main",
  id: "AGT-0001",
  name: "MAIN",
  status: "active",
  type: "orchestrator",
  github_username: null,
  created_at: "",
  isMain: true,
};

const typeColor: Record<string, string> = {
  worker: "bg-emerald-100 text-emerald-600",
  analyzer: "bg-violet-100 text-violet-600",
  orchestrator: "bg-sky-100 text-sky-600",
};

export const AgentTable = () => {
  const [agents, setAgents] = useState<Agent[]>([mainAgent]);
  const [selectedForkId, setSelectedForkId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      const { data } = await supabase
        .from("deployed_forks")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) {
        const mapped: Agent[] = data.map((f: any) => ({
          dbId: f.id,
          id: f.id.slice(0, 8).toUpperCase(),
          name: f.agent_name || f.fork_name,
          status: f.status === "idle" ? "idle" : "active",
          type: f.agent_type,
          github_username: f.github_username,
          created_at: f.created_at,
        }));
        setAgents([mainAgent, ...mapped]);
      }
    };

    fetchAgents();

    const channel = supabase
      .channel("agent-table")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "deployed_forks" },
        (payload) => {
          const f = payload.new as any;
          setAgents((prev) => [
            ...prev,
            {
              dbId: f.id,
              id: f.id.slice(0, 8).toUpperCase(),
              name: f.agent_name || f.fork_name,
              status: "active",
              type: f.agent_type,
              github_username: f.github_username,
              created_at: f.created_at,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRowClick = (agent: Agent) => {
    if (agent.isMain) return;
    setSelectedForkId(agent.dbId);
    setDialogOpen(true);
  };

  return (
    <>
      <section id="agents" className="border border-neutral-200 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 font-medium">Agent Registry</span>
            <span className="text-[10px] bg-neutral-100 text-neutral-400 px-2.5 py-0.5 rounded-full font-medium">
              {agents.length} agents
            </span>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-4 px-5 py-2.5 border-b border-neutral-100 bg-neutral-50/30">
          {["ID", "Name", "Status", "Type"].map((col) => (
            <span key={col} className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-neutral-100 max-h-96 overflow-y-auto">
          {agents.map((agent, i) => (
            <div
              key={`${agent.id}-${i}`}
              onClick={() => handleRowClick(agent)}
              className={`grid grid-cols-4 px-5 py-3.5 transition-colors hover:bg-neutral-50 cursor-pointer ${
                agent.isMain ? "bg-neutral-50/50" : ""
              }`}
            >
              <span className="font-mono text-xs text-neutral-400">{agent.id}</span>
              <span className={`text-xs font-medium ${agent.isMain ? "text-neutral-900" : "text-neutral-700"}`}>
                {agent.name}
                {agent.isMain && (
                  <span className="ml-2 text-[9px] bg-neutral-900 text-white px-1.5 py-0.5 rounded-full">
                    root
                  </span>
                )}
              </span>
              <span className="text-xs flex items-center gap-1.5 text-neutral-500">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    agent.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-neutral-300"
                  }`}
                />
                {agent.status}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${typeColor[agent.type] || "bg-neutral-100 text-neutral-500"}`}>
                {agent.type}
              </span>
            </div>
          ))}
        </div>
      </section>

      <AgentDetailDialog
        forkId={selectedForkId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};
