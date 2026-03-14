import React from "react";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const forkTypes = [
  {
    id: "worker",
    name: "Worker",
    tag: "Automation",
    color: "border-emerald-200 bg-emerald-50",
    tagColor: "bg-emerald-100 text-emerald-600",
    repo: "github.com/AgentSynarch/synarch-worker",
    summary: "Automates parallel workloads on autopilot.",
    description:
      "Worker agents handle the heavy lifting of your infrastructure. They're designed for tasks that need to run continuously or on a schedule without human intervention. Deploy a Worker when you need reliable, always-on automation.",
    useCases: [
      "Scheduled cron jobs & recurring tasks",
      "Web scraping & content monitoring",
      "API polling & webhook processing",
      "Batch file operations & data transforms",
      "Queue processing & background jobs",
    ],
    config: {
      log_level: "info | debug | warn | error",
      max_retries: "0–10 (default: 3)",
      auto_restart: "true | false (default: true)",
    },
    techStack: ["Node.js runtime", "Built-in retry logic", "Isolated context per fork", "Auto-healing on crash"],
  },
  {
    id: "analyzer",
    name: "Analyzer",
    tag: "Dev Tools",
    color: "border-violet-200 bg-violet-50",
    tagColor: "bg-violet-100 text-violet-600",
    repo: "github.com/AgentSynarch/synarch-analyzer",
    summary: "Code review, static analysis, and CI/CD integration.",
    description:
      "Analyzer agents integrate directly into your development workflow. They hook into your repositories to provide automated code review, catch bugs before they ship, generate tests, and enforce quality standards across your codebase.",
    useCases: [
      "Automated code review on PRs",
      "Static analysis & linting",
      "Test generation & coverage tracking",
      "Dependency vulnerability scanning",
      "CI/CD pipeline quality gates",
    ],
    config: {
      log_level: "info | debug | warn | error",
      max_retries: "0–10 (default: 3)",
      auto_restart: "true | false (default: true)",
    },
    techStack: ["GitHub/GitLab integration", "AST-based code parsing", "Multi-language support", "Incremental analysis"],
  },
  {
    id: "orchestrator",
    name: "Orchestrator",
    tag: "Pipeline",
    color: "border-sky-200 bg-sky-50",
    tagColor: "bg-sky-100 text-sky-600",
    repo: "github.com/AgentSynarch/synarch-orchestrator",
    summary: "Routes, transforms, and syncs data across sources.",
    description:
      "Orchestrator agents are the backbone of your data infrastructure. They manage complex ETL flows, event streams, and multi-step data processing pipelines. Deploy an Orchestrator when you need to move and transform data reliably between systems.",
    useCases: [
      "ETL pipelines & data warehousing",
      "Real-time event stream processing",
      "Multi-source data synchronization",
      "API gateway & request routing",
      "Workflow automation & state machines",
    ],
    config: {
      log_level: "info | debug | warn | error",
      max_retries: "0–10 (default: 3)",
      auto_restart: "true | false (default: true)",
    },
    techStack: ["Event-driven architecture", "Built-in data transforms", "Dead letter queues", "Schema validation"],
  },
];

const Forks = () => {
  return (
    <div className="min-h-screen bg-white text-neutral-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div className="pt-14">
        <div className="mx-auto max-w-6xl px-6 py-20">
          {/* Header */}
          <div className="mb-16">
            <span className="text-sm text-neutral-400">Agent Blueprints</span>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-serif font-normal leading-[1.1] tracking-tight text-neutral-900 mt-1 mb-3">
              Agent <span className="text-neutral-400">Blueprints</span>
            </h1>
            <p className="text-[15px] text-neutral-400 max-w-xl">
              Synarch supports three specialized agent types. Each is purpose-built for a specific class of workloads. Choose the right blueprint, configure it, and deploy.
            </p>
          </div>

          {/* Fork type deep dives */}
          <div className="space-y-12">
            {forkTypes.map((ft) => (
              <div key={ft.id} className="border border-neutral-200 rounded-xl overflow-hidden">
                {/* Header bar */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-neutral-800">{ft.name}</span>
                    <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${ft.tagColor}`}>{ft.tag}</span>
                  </div>
                  <span className="text-[11px] text-neutral-300 font-mono">{ft.repo}</span>
                </div>

                <div className="p-6 md:p-8">
                  <p className="text-[15px] text-neutral-400 leading-relaxed mb-8 max-w-2xl">{ft.description}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Use cases */}
                    <div className={`border rounded-xl p-5 ${ft.color}`}>
                      <h4 className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-4">Use Cases</h4>
                      <ul className="space-y-2.5">
                        {ft.useCases.map((uc) => (
                          <li key={uc} className="text-xs text-neutral-700 flex items-start gap-2">
                            <span className="text-neutral-400 mt-0.5">→</span>
                            {uc}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Config */}
                    <div className="border border-neutral-200 rounded-xl p-5 bg-neutral-50/50">
                      <h4 className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-4">Configuration</h4>
                      <div className="space-y-3">
                        {Object.entries(ft.config).map(([key, val]) => (
                          <div key={key}>
                            <span className="text-[11px] font-medium text-neutral-700 font-mono block">{key}</span>
                            <span className="text-[11px] text-neutral-400">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tech */}
                    <div className="border border-neutral-200 rounded-xl p-5 bg-neutral-50/50">
                      <h4 className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-4">Tech Stack</h4>
                      <ul className="space-y-2.5">
                        {ft.techStack.map((ts) => (
                          <li key={ts} className="text-xs text-neutral-700 flex items-center gap-2">
                            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                            {ts}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/30 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Ready to deploy</span>
                  <Link
                    to="/launch"
                    className="text-xs bg-neutral-900 hover:bg-neutral-700 text-white px-5 py-2 rounded-full font-medium transition-colors"
                  >
                    Launch {ft.id} →
                  </Link>
                </div>
              </div>
            ))}
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

export default Forks;
