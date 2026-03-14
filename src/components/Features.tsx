import React from "react";

const features = [
  {
    title: "Task Automation",
    desc: "Worker agents handle scheduled jobs, web scraping, API polling, and batch processing — all running on autopilot.",
    tag: "Worker",
    tagColor: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Code Analysis",
    desc: "Analyzer agents plug into your repos for code review, static analysis, test generation, and CI/CD quality gates.",
    tag: "Analyzer",
    tagColor: "bg-violet-100 text-violet-600",
  },
  {
    title: "Data Pipelines",
    desc: "Orchestrator agents route, transform, and sync data across sources — ETL flows, event streams, and more.",
    tag: "Orchestrator",
    tagColor: "bg-sky-100 text-sky-600",
  },
  {
    title: "Fork & Deploy",
    desc: "Fork any agent type from GitHub, configure your environment, and deploy in under a minute.",
    tag: "Core",
    tagColor: "bg-neutral-100 text-neutral-500",
  },
  {
    title: "Live Tracking",
    desc: "Every forked agent is tracked in real-time. See global deployments, statuses, and types at a glance.",
    tag: "Ops",
    tagColor: "bg-neutral-100 text-neutral-500",
  },
  {
    title: "Context Isolation",
    desc: "Each fork runs in isolated context on your own infra. Failures are contained, forks can be killed independently.",
    tag: "Safety",
    tagColor: "bg-neutral-100 text-neutral-500",
  },
];

export const Features = () => {
  return (
    <section id="forks" className="py-20">
      <div className="mb-12">
        <span className="text-sm text-neutral-400">Capabilities</span>
        <h2 className="text-3xl font-serif font-normal tracking-tight text-neutral-900 mt-1">
          Built for agent networks.
        </h2>
        <p className="mt-3 text-[15px] text-neutral-400 max-w-lg">
          Everything you need to build hierarchical AI systems. One main agent. Infinite forks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-white p-6 border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-800 group-hover:text-neutral-600 transition-colors">
                {feature.title}
              </h3>
              <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${feature.tagColor}`}>
                {feature.tag}
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
