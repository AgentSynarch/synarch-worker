import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface ForkDetail {
  id: string;
  agent_type: string;
  fork_name: string;
  status: string;
  created_at: string;
  github_username: string | null;
  agent_name: string | null;
  description: string | null;
  auto_restart: boolean;
  log_level: string;
  max_retries: number;
}

interface Props {
  forkId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AgentDetailDialog = ({ forkId, open, onOpenChange }: Props) => {
  const [fork, setFork] = useState<ForkDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [githubData, setGithubData] = useState<any>(null);

  useEffect(() => {
    if (!forkId || !open) return;
    setLoading(true);
    setGithubData(null);

    const fetchFork = async () => {
      const { data } = await supabase
        .from("deployed_forks")
        .select("*")
        .eq("id", forkId)
        .single();
      if (data) {
        setFork(data as ForkDetail);
        // Fetch GitHub info if username exists
        if (data.github_username) {
          try {
            const res = await fetch(`https://api.github.com/users/${data.github_username}`);
            if (res.ok) setGithubData(await res.json());
          } catch {
            // GitHub API failed, no big deal
          }
        }
      }
      setLoading(false);
    };

    fetchFork();
  }, [forkId, open]);

  const typeDescriptions: Record<string, string> = {
    worker: "Task automation agent — handles scheduled jobs, file ops, web scraping, API polling, and batch processing.",
    analyzer: "Code/dev tools agent — code review, static analysis, test generation, and CI/CD integration.",
    orchestrator: "Data pipeline agent — routes, transforms, and syncs data between sources.",
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border font-mono max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg flex items-center gap-3">
            {fork?.fork_name || "Loading..."}
            {fork && (
              <span className={`text-[10px] border px-2 py-0.5 ${
                fork.status === "active"
                  ? "border-primary/50 text-primary"
                  : "border-border text-muted-foreground"
              }`}>
                {fork.status}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">loading agent data...</div>
        ) : fork ? (
          <div className="space-y-5">

            {/* Agent info grid */}
            <div className="grid grid-cols-2 gap-px bg-border">
              {[
                ["agent name", fork.agent_name || fork.fork_name],
                ["type", fork.agent_type],
                ["deployed", formatDate(fork.created_at)],
                ["deployed", formatDate(fork.created_at)],
                ["log level", fork.log_level],
                ["max retries", String(fork.max_retries)],
                ["auto restart", fork.auto_restart ? "enabled" : "disabled"],
                ["status", fork.status],
              ].map(([label, value]) => (
                <div key={label} className="bg-background p-3">
                  <span className="text-[10px] text-muted-foreground tracking-widest uppercase block mb-1">
                    {label}
                  </span>
                  <span className="text-xs text-foreground">{value}</span>
                </div>
              ))}
            </div>

            {/* Type description */}
            <div className="p-3 border border-border bg-card/30">
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase block mb-2">
                // description
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {fork.description || typeDescriptions[fork.agent_type] || "No description available."}
              </p>
            </div>

            {/* Fork ID */}
            <div className="text-[10px] text-muted-foreground/50 text-right">
              id: {fork.id}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground">agent not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
