import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Fork {
  id: string;
  agent_type: string;
  fork_name: string;
  status: string;
  created_at: string;
  github_username: string | null;
}

export const ForkTracker = () => {
  const [forks, setForks] = useState<Fork[]>([]);

  useEffect(() => {
    const fetchForks = async () => {
      const { data } = await supabase
        .from("deployed_forks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setForks(data as Fork[]);
    };

    fetchForks();

    const channel = supabase
      .channel("fork-tracker")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "deployed_forks" },
        (payload) => {
          setForks((prev) => [payload.new as Fork, ...prev].slice(0, 20));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "deployed_forks" },
        (payload) => {
          setForks((prev) =>
            prev.map((f) => (f.id === (payload.new as Fork).id ? (payload.new as Fork) : f))
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const typeColor: Record<string, string> = {
    worker: "bg-emerald-100 text-emerald-600",
    analyzer: "bg-violet-100 text-violet-600",
    orchestrator: "bg-sky-100 text-sky-600",
  };

  return (
    <section className="py-20">
      <div className="mb-8">
        <span className="text-sm text-neutral-400">Network Activity</span>
        <h2 className="text-3xl font-serif font-normal tracking-tight text-neutral-900 mt-1">
          Live fork tracker.
        </h2>
        <p className="mt-3 text-[15px] text-neutral-400 max-w-lg">
          Real-time feed of agents being deployed and connecting across the network.
        </p>
      </div>

      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-50">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[11px] text-neutral-400 font-mono">
            network — live feed
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[11px] text-neutral-400">
              {forks.length} events
            </span>
          </span>
        </div>

        <div className="bg-neutral-900 p-5 max-h-72 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {forks.length === 0 ? (
            <p className="font-mono text-xs text-neutral-500 text-center py-4">
              waiting for fork events...
            </p>
          ) : (
            <div className="space-y-1">
              {forks.map((fork) => (
                <div key={fork.id} className="font-mono text-xs flex items-center gap-2">
                  <span className="text-neutral-600">
                    [{formatTime(fork.created_at)}]
                  </span>
                  <span className="text-neutral-200 font-semibold">
                    {fork.fork_name}
                  </span>
                  <span className="text-neutral-500">
                    {fork.status === "pending" ? "registered" : fork.status === "active" ? "connected" : fork.status} —
                  </span>
                  <span className={`px-1.5 py-0 rounded text-[10px] ${typeColor[fork.agent_type] || "text-neutral-400"}`}>
                    {fork.agent_type}
                  </span>
                  <span className={`text-[10px] ${fork.status === "active" ? "text-emerald-400" : "text-neutral-500"}`}>
                    ● {fork.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
