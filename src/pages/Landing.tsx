import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import heroBg from "@/assets/hero-landing.jpg";

/* ── Scroll reveal ── */
const useReveal = (threshold = 0.12) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
};

const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = "", delay = 0 }) => {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${className}`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

/* ── Terminal with typewriter effect ── */
const terminalLines = [
  { c: "$ npx synarch init --type worker --name price-monitor", s: "text-neutral-300", delay: 60 },
  { c: "", s: "", delay: 400 },
  { c: "  ╭─────────────────────────────────────╮", s: "text-neutral-500", delay: 30 },
  { c: "  │   SYNARCH AGENT INITIALIZER v2.4.1  │", s: "text-neutral-500", delay: 30 },
  { c: "  ╰─────────────────────────────────────╯", s: "text-neutral-500", delay: 300 },
  { c: "", s: "", delay: 100 },
  { c: "→ Creating project structure...", s: "text-neutral-400", delay: 500 },
  { c: "  ├── src/index.js", s: "text-neutral-500", delay: 80 },
  { c: "  ├── src/task-runner.js", s: "text-neutral-500", delay: 60 },
  { c: "  ├── src/synarch-client.js", s: "text-neutral-500", delay: 60 },
  { c: "  ├── src/logger.js", s: "text-neutral-500", delay: 60 },
  { c: "  ├── src/tasks/", s: "text-neutral-500", delay: 60 },
  { c: "  ├── .env.example", s: "text-neutral-500", delay: 60 },
  { c: "  └── package.json", s: "text-neutral-500", delay: 200 },
  { c: "✓ Project scaffolded", s: "text-emerald-400", delay: 300 },
  { c: "", s: "", delay: 200 },
  { c: "→ Installing dependencies...", s: "text-neutral-400", delay: 1200 },
  { c: "  added 47 packages in 3.2s", s: "text-neutral-500", delay: 100 },
  { c: "✓ Dependencies installed", s: "text-emerald-400", delay: 400 },
  { c: "", s: "", delay: 200 },
  { c: "→ Generating agent credentials...", s: "text-neutral-400", delay: 600 },
  { c: "  agent_id:  ag_7f3k9x2m1p5n8v4w", s: "text-neutral-500", delay: 100 },
  { c: "  token:     sk_live_••••••••••••••••••••", s: "text-neutral-500", delay: 100 },
  { c: "  network:   mainnet-prod", s: "text-neutral-500", delay: 100 },
  { c: "✓ Credentials saved to .env", s: "text-emerald-400", delay: 500 },
  { c: "", s: "", delay: 300 },
  { c: "$ npx synarch deploy --env production", s: "text-neutral-300", delay: 60 },
  { c: "", s: "", delay: 500 },
  { c: "→ Compiling agent bundle...", s: "text-neutral-400", delay: 800 },
  { c: "  entry:  src/index.js → dist/agent.min.js", s: "text-neutral-500", delay: 150 },
  { c: "  size:   24.7 KB (gzipped: 8.1 KB)", s: "text-neutral-500", delay: 100 },
  { c: "✓ Bundle compiled", s: "text-emerald-400", delay: 400 },
  { c: "", s: "", delay: 200 },
  { c: "→ Running pre-deploy checks...", s: "text-neutral-400", delay: 400 },
  { c: "  ├── env validation      ✓ passed", s: "text-neutral-500", delay: 300 },
  { c: "  ├── schema check        ✓ passed", s: "text-neutral-500", delay: 250 },
  { c: "  ├── auth handshake      ✓ passed", s: "text-neutral-500", delay: 350 },
  { c: "  └── network latency     ✓ 12ms", s: "text-neutral-500", delay: 200 },
  { c: "✓ All checks passed", s: "text-emerald-400", delay: 500 },
  { c: "", s: "", delay: 300 },
  { c: "→ Deploying to Synarch network...", s: "text-sky-400", delay: 600 },
  { c: "  ▸ Registering with main agent...", s: "text-sky-500", delay: 500 },
  { c: "  ▸ Establishing secure tunnel...", s: "text-sky-500", delay: 400 },
  { c: "  ▸ Syncing configuration...", s: "text-sky-500", delay: 350 },
  { c: "  ▸ Starting heartbeat daemon...", s: "text-sky-500", delay: 300 },
  { c: "", s: "", delay: 200 },
  { c: "✓ Agent deployed successfully", s: "text-emerald-400", delay: 500 },
  { c: "", s: "", delay: 200 },
  { c: "  ╭───────────────────────────────────────────╮", s: "text-neutral-500", delay: 30 },
  { c: "  │  AGENT: price-monitor                    │", s: "text-neutral-500", delay: 30 },
  { c: "  │  TYPE:  worker                           │", s: "text-neutral-500", delay: 30 },
  { c: "  │  ID:    ag_7f3k9x2m1p5n8v4w              │", s: "text-neutral-500", delay: 30 },
  { c: "  │  STATUS: ● active                        │", s: "text-emerald-400", delay: 30 },
  { c: "  │  UPTIME: 0m 3s                           │", s: "text-neutral-500", delay: 30 },
  { c: "  │  HEARTBEAT: every 30s                    │", s: "text-neutral-500", delay: 30 },
  { c: "  │  NEXT TASK: in 12s                       │", s: "text-neutral-500", delay: 30 },
  { c: "  ╰───────────────────────────────────────────╯", s: "text-neutral-500", delay: 600 },
  { c: "", s: "", delay: 300 },
  { c: "[00:00:03] task:poll    → fetching market data...", s: "text-neutral-500", delay: 800 },
  { c: "[00:00:04] task:poll    ✓ 247 records received", s: "text-emerald-400/70", delay: 200 },
  { c: "[00:00:04] task:analyze → processing signals...", s: "text-neutral-500", delay: 600 },
  { c: "[00:00:05] task:analyze ✓ 3 alerts triggered", s: "text-emerald-400/70", delay: 200 },
  { c: "[00:00:05] heartbeat    ✓ main agent acknowledged", s: "text-sky-400/70", delay: 2000 },
];

const loopTasks = [
  { c: () => `[${ts()}] task:poll    → fetching market data...`, s: "text-neutral-500", delay: 800 },
  { c: () => `[${ts()}] task:poll    ✓ ${Math.floor(Math.random() * 400 + 100)} records received`, s: "text-emerald-400/70", delay: 200 },
  { c: () => `[${ts()}] task:analyze → processing signals...`, s: "text-neutral-500", delay: 600 },
  { c: () => `[${ts()}] task:analyze ✓ ${Math.floor(Math.random() * 8 + 1)} alerts triggered`, s: "text-emerald-400/70", delay: 200 },
  { c: () => `[${ts()}] task:report  → pushing to dashboard...`, s: "text-neutral-500", delay: 400 },
  { c: () => `[${ts()}] task:report  ✓ report sent`, s: "text-emerald-400/70", delay: 300 },
  { c: () => `[${ts()}] heartbeat    ✓ main agent acknowledged`, s: "text-sky-400/70", delay: 1500 },
  { c: () => `[${ts()}] task:sync    → syncing with 3 peers...`, s: "text-neutral-500", delay: 700 },
  { c: () => `[${ts()}] task:sync    ✓ peers in sync`, s: "text-emerald-400/70", delay: 200 },
  { c: () => `[${ts()}] task:cleanup → pruning stale data...`, s: "text-neutral-500", delay: 500 },
  { c: () => `[${ts()}] task:cleanup ✓ ${Math.floor(Math.random() * 50 + 5)} records purged`, s: "text-emerald-400/70", delay: 300 },
  { c: () => `[${ts()}] heartbeat    ✓ main agent acknowledged`, s: "text-sky-400/70", delay: 2000 },
  { c: () => `[${ts()}] task:scan    → scanning endpoints...`, s: "text-neutral-500", delay: 900 },
  { c: () => `[${ts()}] task:scan    ✓ ${Math.floor(Math.random() * 12 + 3)} endpoints healthy`, s: "text-emerald-400/70", delay: 200 },
  { c: () => `[${ts()}] task:metrics → aggregating metrics...`, s: "text-neutral-500", delay: 500 },
  { c: () => `[${ts()}] task:metrics ✓ ${Math.floor(Math.random() * 1000 + 200)} datapoints`, s: "text-emerald-400/70", delay: 200 },
];

let _seconds = 36;
function ts() {
  _seconds += Math.floor(Math.random() * 4 + 1);
  const m = Math.floor(_seconds / 60).toString().padStart(2, "0");
  const s = (_seconds % 60).toString().padStart(2, "0");
  return `00:${m}:${s}`;
}

const TerminalAnimation: React.FC = () => {
  const [lines, setLines] = useState<{ c: string; s: string }[]>([]);
  const [phase, setPhase] = useState<"init" | "loop">("init");
  const [initCount, setInitCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const loopIndex = useRef(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || phase !== "init" || initCount >= terminalLines.length) return;
    const delay = terminalLines[initCount]?.delay ?? 100;
    const timer = setTimeout(() => {
      setLines((prev) => [...prev, { c: terminalLines[initCount].c, s: terminalLines[initCount].s }]);
      setInitCount((c) => c + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [started, phase, initCount]);

  useEffect(() => {
    if (phase === "init" && initCount >= terminalLines.length) setPhase("loop");
  }, [phase, initCount]);

  useEffect(() => {
    if (phase !== "loop") return;
    const task = loopTasks[loopIndex.current % loopTasks.length];
    const timer = setTimeout(() => {
      setLines((prev) => [...prev, { c: task.c(), s: task.s }]);
      loopIndex.current++;
    }, task.delay);
    return () => clearTimeout(timer);
  }, [phase, lines.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);

  return (
    <div ref={sectionRef} className="rounded-xl border border-neutral-200 bg-neutral-900 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="font-mono text-[11px] text-neutral-500 ml-3">~/synarch-agent</span>
      </div>
      <div ref={containerRef} className="p-3 sm:p-5 space-y-0.5 h-[380px] overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
        {lines.map((line, i) => (
          <div key={i} className={`font-mono text-[10px] sm:text-[12px] leading-[1.8] ${line.s} break-all sm:break-normal`}>
            {line.c || "\u00A0"}
          </div>
        ))}
        {started && <span className="font-mono text-[12px] text-neutral-500 animate-pulse">▋</span>}
      </div>
    </div>
  );
};

/* ── FAQ Item ── */
const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-6 text-left group">
        <span className="text-[17px] font-medium text-neutral-800 group-hover:text-neutral-600 transition-colors pr-8">{q}</span>
        <span className={`text-2xl text-neutral-400 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-6" : "max-h-0"}`}>
        <p className="text-[15px] text-neutral-500 leading-relaxed">{a}</p>
      </div>
    </div>
  );
};

/* ── Org Chart Component ── */
const OrgChart: React.FC = () => {
  const level2 = [
    {
      name: "Orchestrator",
      label: "Pipeline Manager",
      color: "border-sky-300 bg-sky-50",
      textColor: "text-sky-800",
      tagColor: "bg-sky-100 text-sky-600",
      children: [
        { name: "ETL Runner", task: "Sync 12 data sources", status: "running" },
        { name: "Event Router", task: "Route webhook events", status: "idle" },
      ],
    },
    {
      name: "Worker",
      label: "Task Executor",
      color: "border-emerald-300 bg-emerald-50",
      textColor: "text-emerald-800",
      tagColor: "bg-emerald-100 text-emerald-600",
      children: [
        { name: "API Poller", task: "Fetch market data q/4h", status: "running" },
        { name: "Health Checker", task: "Ping 47 endpoints", status: "running" },
        { name: "Cron Mailer", task: "Send daily digests", status: "idle" },
      ],
    },
    {
      name: "Analyzer",
      label: "Intelligence Layer",
      color: "border-violet-300 bg-violet-50",
      textColor: "text-violet-800",
      tagColor: "bg-violet-100 text-violet-600",
      children: [
        { name: "Code Reviewer", task: "AST security scan", status: "running" },
        { name: "Log Auditor", task: "Anomaly detection", status: "idle" },
      ],
    },
  ];

  return (
    <div className="flex flex-col items-center gap-0 w-full">
      {/* Main agent */}
      <div className="bg-white border-2 border-neutral-800 rounded-xl px-6 py-3 shadow-sm flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <div>
          <div className="text-sm font-semibold text-neutral-900">Main Agent</div>
          <div className="text-[10px] text-neutral-400 font-mono">ag_main_001 · online</div>
        </div>
      </div>
      <div className="w-px h-8 bg-neutral-300" />

      {/* Horizontal connector */}
      <div className="relative w-full max-w-3xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-neutral-200" style={{ width: "66%" }} />
      </div>

      {/* Level 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mt-0">
        {level2.map((agent) => (
          <div key={agent.name} className="flex flex-col items-center">
            <div className="w-px h-6 bg-neutral-200" />
            <div className={`w-full border rounded-xl p-4 ${agent.color}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${agent.textColor}`}>{agent.label}</span>
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${agent.tagColor}`}>{agent.name}</span>
              </div>
              <div className="space-y-2 mt-3">
                {agent.children.map((child) => (
                  <div key={child.name} className="bg-white/80 border border-neutral-200/60 rounded-lg px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-neutral-700">{child.name}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${child.status === "running" ? "bg-emerald-400 animate-pulse" : "bg-neutral-300"}`} />
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 font-mono">{child.task}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════ LANDING PAGE ═══════════ */
const Landing: React.FC = () => {
  return (
    <div className="bg-white text-neutral-900 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/docs" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">Docs</Link>
            <a href="https://github.com/AgentSynarch/Synarch" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Synarch" className="w-8 h-8 object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <a href="https://x.com/AgentSynarch" target="_blank" rel="noopener noreferrer" className="text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5">
              𝕏
            </a>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-14">
        <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
        </div>
        <div className="relative -mt-32 text-center px-4 sm:px-6 pb-24">
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-serif font-normal leading-[1.1] tracking-tight text-neutral-900 mb-6">
            Synarch<br />
            <span className="text-neutral-500">Open-source orchestration</span><br />
            <span className="text-neutral-500">for autonomous agents</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-400 max-w-md mx-auto mb-10">
            Deploy AI agents, configure networks, automate tasks and your infrastructure runs itself.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/launch" className="bg-neutral-900 hover:bg-neutral-700 text-white px-7 py-3 rounded-full text-sm font-medium transition-colors w-full sm:w-auto text-center">
              Get started
            </Link>
            <a href="https://github.com/AgentSynarch/Synarch" target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 px-7 py-3 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
              GitHub
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
            </a>
          </div>
        </div>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ THREE STEPS ═══ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900 text-center mb-4">
            Deploy infrastructure,<br />
            <span className="text-neutral-400">not agents.</span>
          </h2>
        </Reveal>

        <div className="mt-20 space-y-20">
          {[
            { n: "01", title: "Define the task.", desc: '"Monitor all API endpoints, alert on anomalies, generate daily reports."' },
            { n: "02", title: "Fork the agent.", desc: "Workers, analyzers, orchestrators — any type, any configuration. If it can receive a heartbeat, it's deployed." },
            { n: "03", title: "Deploy and monitor.", desc: "Review the agent's config. Set resource limits. Hit deploy. Monitor from the dashboard." },
          ].map((step, i) => (
            <Reveal key={step.n} delay={i * 100}>
              <div className="flex gap-8 items-start">
                <span className="text-5xl font-serif text-neutral-200 font-light leading-none">{step.n}</span>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">{step.title}</h3>
                  <p className="text-neutral-400 text-[15px] leading-relaxed max-w-lg">{step.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ FEATURES GRID ═══ */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Features</span>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              Everything you need to run<br />
              <span className="text-neutral-400">an autonomous agent network.</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { title: "Bring Your Own Agent", desc: "Any agent, any runtime, one network. If it can receive a heartbeat, it's deployed." },
            { title: "Task Alignment", desc: "Every task traces back to the network mission. Agents know what to do and why." },
            { title: "Heartbeats", desc: "Agents wake on a schedule, check work, and act. Delegation flows up and down the hierarchy." },
            { title: "Cost Control", desc: "Resource budgets per agent. When they hit the limit, they stop. No runaway costs." },
            { title: "Multi-Network", desc: "One deployment, many networks. Complete data isolation. One control plane for everything." },
            { title: "Audit Trail", desc: "Every action traced. Every decision explained. Full tool-call tracing and audit log." },
            { title: "Governance", desc: "You're the main agent. Override strategy, pause or terminate any fork at any time." },
            { title: "Agent Hierarchy", desc: "Hierarchies, roles, reporting lines. Your agents have a type, a scope, and a task description." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="border border-neutral-100 rounded-xl p-6 hover:border-neutral-300 hover:shadow-sm transition-all duration-300 h-full">
                <h3 className="text-[15px] font-semibold text-neutral-800 mb-2">{f.title}</h3>
                <p className="text-[13px] text-neutral-400 leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ BRING YOUR OWN AGENT ═══ */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Bring Your Own Agent</span>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              Bring your own bot.
            </h2>
            <p className="text-neutral-400 mt-4 max-w-lg mx-auto text-[15px]">
              Your workers, analyzers, and orchestrators — organized under one hierarchy, pointed at one goal.
              If it can receive a heartbeat, it's deployed.
            </p>
          </div>
        </Reveal>

        <Reveal delay={50}>
          <div className="text-center mb-3 text-xs text-neutral-400 font-medium tracking-wide uppercase">Works with any agent</div>
          <div className="flex flex-wrap justify-center gap-2.5 mb-14">
            {[
              { name: "Worker", icon: "△" },
              { name: "Analyzer", icon: "◇" },
              { name: "Orchestrator", icon: "◎" },
              { name: "Python", icon: "⬡" },
              { name: "Node.js", icon: "⏣" },
              { name: "Bash", icon: "⌘" },
              { name: "HTTP", icon: "↗" },
              { name: "Custom", icon: "✦" },
            ].map((item) => (
              <span key={item.name} className="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 cursor-default">
                <span className="text-neutral-400 text-xs">{item.icon}</span>
                {item.name}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-8 md:p-10">
            <OrgChart />
          </div>
        </Reveal>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ TASK ALIGNMENT ═══ */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Task Alignment</span>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              Keep your agents aligned<br />
              <span className="text-neutral-400">on the mission.</span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="max-w-xl mx-auto space-y-4">
            {[
              { icon: "◎", label: "Network Mission", value: "Monitor all systems with 99.9% uptime" },
              { icon: "◉", label: "Project Goal", value: "Deploy real-time alerting pipeline" },
              { icon: "○", label: "Agent Goal", value: "Implement health-check polling" },
              { icon: "•", label: "Task", value: "Write endpoint scanner for /api/* routes" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-neutral-50 border border-neutral-100 rounded-xl p-5">
                <span className="text-lg text-neutral-400 mt-0.5">{item.icon}</span>
                <div>
                  <div className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-1">{item.label}</div>
                  <div className="text-[15px] text-neutral-700">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-center text-neutral-400 text-[15px] mt-10 max-w-lg mx-auto">
            Every piece of work is given context that traces back to the network
            mission. Your agents will know <em>what</em> to do and <em>why</em>.
          </p>
        </Reveal>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ HEARTBEATS ═══ */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Heartbeats</span>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              Heartbeats keep<br />
              <span className="text-neutral-400">the network alive.</span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <ul className="max-w-lg mx-auto space-y-3 mb-12 text-[15px] text-neutral-500">
            <li className="flex items-start gap-2"><span className="text-neutral-300 mt-1">•</span>Agents wake up on a schedule, check their tasks, and act.</li>
            <li className="flex items-start gap-2"><span className="text-neutral-300 mt-1">•</span>Delegation flows up and down the hierarchy automatically.</li>
            <li className="flex items-start gap-2"><span className="text-neutral-300 mt-1">•</span>Task assignments wake agents immediately.</li>
            <li className="flex items-start gap-2"><span className="text-neutral-300 mt-1">•</span>Cross-network requests route to the best agent.</li>
          </ul>
        </Reveal>

        <Reveal delay={200}>
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-8">
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mb-6">
              {["0h", "4h", "8h", "12h", "16h", "20h", "24h"].map((t) => (
                <span key={t} className="flex-1 text-center">{t}</span>
              ))}
            </div>
            {[
              { name: "API Poller", freq: "every 4h", tasks: ["Fetch data", "Parse response", "Store records", "Send alerts", "Aggregate", "Report", "Daily summary"] },
              { name: "Health Checker", freq: "every 8h", tasks: ["Scan endpoints", "Check latency", "Status report", "Alert on failures"] },
              { name: "Data Syncer", freq: "every 12h", tasks: ["Sync peers", "Validate data", "Cleanup stale"] },
            ].map((agent) => (
              <div key={agent.name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 last:mb-0">
                <div className="w-full sm:w-32 shrink-0">
                  <div className="text-sm font-medium text-neutral-700">{agent.name}</div>
                  <div className="text-[11px] text-neutral-400">{agent.freq}</div>
                </div>
                <div className="flex-1 flex gap-1 flex-wrap sm:flex-nowrap">
                  {agent.tasks.map((task, i) => (
                    <div key={i} className="bg-sky-100 text-sky-700 text-[10px] px-2 py-1.5 rounded text-center truncate">{task}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ COST CONTROL ═══ */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Cost Tracking</span>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              Know what every agent costs.<br />
              <span className="text-neutral-400">Control what every agent spends.</span>
            </h2>
          </div>
          <p className="text-center text-[15px] text-neutral-400 max-w-lg mx-auto mb-12">
            Every agent gets a resource budget. When they hit it, they stop. Automatically.
            No runaway costs. No surprise bills. Hard limits, enforced by the system.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 px-6 py-3 border-b border-neutral-100 text-xs text-neutral-400 font-medium uppercase tracking-wide">
              <span>Agent</span>
              <span>Budget Used</span>
              <span className="text-right">Cost</span>
            </div>
            {[
              { name: "Main Agent", type: "Orchestrator", budget: 60, used: 23 },
              { name: "API Poller", type: "Worker", budget: 40, used: 15 },
              { name: "Code Reviewer", type: "Analyzer", budget: 50, used: 32 },
              { name: "Data Syncer", type: "Worker", budget: 30, used: 8 },
              { name: "Log Scanner", type: "Analyzer", budget: 30, used: 18 },
              { name: "Pipeline Manager", type: "Orchestrator", budget: 30, used: 12 },
            ].map((agent) => (
              <div key={agent.name} className="grid grid-cols-3 px-6 py-4 border-b border-neutral-50 items-center">
                <div>
                  <div className="text-sm font-medium text-neutral-800">{agent.name}</div>
                  <div className="text-[11px] text-neutral-400">{agent.type}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-neutral-100 rounded-full h-2 max-w-[200px]">
                    <div className="bg-sky-400 h-2 rounded-full" style={{ width: `${(agent.used / agent.budget) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right text-sm text-neutral-500">
                  ${agent.used} <span className="text-neutral-300">/ ${agent.budget}</span>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-3 px-6 py-4 bg-neutral-50 font-semibold">
              <span className="text-sm text-neutral-800">Total</span>
              <span />
              <span className="text-right text-sm text-neutral-800">$108 <span className="text-neutral-400 font-normal">/ $240</span></span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-center text-[14px] text-neutral-400 mt-8 max-w-lg mx-auto">
            Track costs per agent, per task, per project, per network. See which agents are expensive,
            which tasks consume resources, which projects are over budget.
          </p>
        </Reveal>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ MULTI-NETWORK ═══ */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Multi-Network</span>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              One deployment.<br />
              <span className="text-neutral-400">Many networks.</span>
            </h2>
          </div>
          <p className="text-center text-[15px] text-neutral-400 max-w-lg mx-auto mb-12">
            Synarch supports multiple agent networks in one install. Run one network
            or run fifty. Complete data isolation between networks. One control plane
            for your entire portfolio.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Production Monitoring", agents: 8, status: "Active" },
              { name: "Trading Analytics", agents: 14, status: "Active" },
              { name: "Content Pipeline", agents: 5, status: "Active" },
            ].map((net) => (
              <div key={net.name} className="border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-neutral-800">{net.name}</h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">{net.status}</span>
                </div>
                <div className="text-xs text-neutral-400 mb-4">{net.agents} agents</div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: Math.min(net.agents, 6) }).map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[10px] text-neutral-400 font-mono">
                      A{i + 1}
                    </div>
                  ))}
                  {net.agents > 6 && (
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 border border-neutral-150 flex items-center justify-center text-[10px] text-neutral-300">
                      +{net.agents - 6}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ AUDIT TRAIL / TICKET SYSTEM ═══ */}
      <section className="mx-auto max-w-5xl px-6 py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Audit Trail</span>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              Every action traced.<br />
              <span className="text-neutral-400">Every decision explained.</span>
            </h2>
          </div>
          <p className="text-center text-[15px] text-neutral-400 max-w-lg mx-auto mb-12">
            You communicate with agents through tasks. Every instruction, every response,
            every tool call and decision is recorded with full tracing.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Reveal delay={100}>
            <div className="space-y-4">
              <div className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-xs">#1042</span>
                Deploy updated monitoring dashboard
              </div>
              <div className="border border-neutral-100 rounded-xl p-5 space-y-4">
                <div>
                  <div className="text-[11px] text-neutral-400 mb-1">You · 2 min ago</div>
                  <p className="text-sm text-neutral-700">Deploy the updated monitoring dashboard. Run tests first.</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="text-[11px] text-neutral-400 mb-1">Orchestrator Agent · 1 min ago</div>
                  <p className="text-sm text-neutral-600">Running test suite and staging deployment. Promoting to production once checks pass.</p>
                </div>
                <div>
                  <div className="text-[11px] text-neutral-400 mb-1">You · just now</div>
                  <p className="text-sm text-neutral-700">Approved. Go ahead.</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div>
              <div className="text-sm font-semibold text-neutral-700 mb-4">Trace</div>
              <div className="space-y-2">
                {[
                  { action: "run_tests()", status: "passed", color: "text-emerald-600" },
                  { action: "deploy_to_staging()", status: "done", color: "text-emerald-600" },
                  { action: "smoke_test()", status: "passed", color: "text-emerald-600" },
                  { action: "deploy_to_production()", status: "running", color: "text-sky-600" },
                ].map((trace, i) => (
                  <div key={i} className="flex items-center justify-between bg-neutral-50 border border-neutral-100 rounded-lg px-4 py-3">
                    <code className="text-sm font-mono text-neutral-600">{trace.action}</code>
                    <span className={`text-xs font-medium ${trace.color}`}>{trace.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ OPEN SOURCE ═══ */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Open Source</span>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              Extensible, adaptable,<br />
              <span className="text-neutral-400">open source.</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Extensible", desc: "Drop-in agent types add new capabilities without touching core code." },
            { title: "Adaptable", desc: "Works with any runtime, any tool stack, any deployment target." },
            { title: "Open Source", desc: "MIT-licensed. Fork it, audit it, contribute back." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 100}>
              <div className="border border-neutral-100 rounded-xl p-8 text-center hover:border-neutral-300 transition-colors">
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">{item.title}</h3>
                <p className="text-[14px] text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ GOVERNANCE ═══ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Governance</span>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              You're the main agent.
            </h2>
          </div>
          <p className="text-center text-[15px] text-neutral-500 max-w-lg mx-auto mb-8">
            Deploy forks. Override configurations. Pause any agent, reassign
            any task, adjust any budget — at any time.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["Pause", "Resume", "Override", "Reassign", "Terminate"].map((action) => (
              <span key={action} className="bg-neutral-900 text-white text-sm px-4 py-2 rounded-full">{action}</span>
            ))}
          </div>
          <p className="text-center text-[14px] text-neutral-400 max-w-md mx-auto">
            You have full control over every agent in the network.
            Autonomy is a privilege you grant, not a default.
          </p>
        </Reveal>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ WHAT SYNARCH IS ═══ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Identity</span>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              What Synarch is.
            </h2>
          </div>
        </Reveal>

        <div className="space-y-10">
          {[
            { title: "A hierarchy for agents.", desc: "Types, roles, reporting lines. Your agents don't freelance — they have a scope, a purpose, and a task queue." },
            { title: "A governance layer.", desc: "You sit at the top. Deploy forks, review configurations, override decisions. Agents work for you, not the other way around." },
            { title: "A cost control system.", desc: "Every agent has a budget. Every task has a cost. You see where resources go before they're consumed." },
            { title: "Full observability.", desc: "Every task traced. Every decision explained. Every action logged. Nothing happens in the dark." },
            { title: "A multi-network runtime.", desc: "Run one agent network or run fifty. Complete isolation between networks. One install, one control plane." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">{item.title}</h3>
                <p className="text-[15px] text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ BEFORE / AFTER ═══ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Problems Solved</span>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              What changes with Synarch.
            </h2>
          </div>
        </Reveal>

        <div className="space-y-6">
          {[
            { without: "You have 20 terminal tabs open running different agents and can't track which one does what. On reboot you lose everything.", withS: "Tasks are structured, logs are persistent, sessions survive reboots." },
            { without: "You manually gather context from several places to remind your agent what it's supposed to be doing.", withS: "Context flows from the task up through the project and network mission — your agent always knows what to do and why." },
            { without: "Folders of agent configs are disorganized and you're re-inventing task management between agents.", withS: "Synarch gives you hierarchies, task routing, delegation, and governance out of the box." },
            { without: "Runaway loops waste resources and max your quota before you even know what happened.", withS: "Cost tracking surfaces budgets and throttles agents when they're out. The main agent prioritizes with limits." },
            { without: "You have recurring jobs and have to remember to manually kick them off.", withS: "Heartbeats handle regular work on a schedule. The main agent supervises." },
            { without: "You have a task idea, you have to find your repo, fire up a terminal, keep a tab open, and babysit it.", withS: "Add a task in Synarch. Your agent works on it until it's done. The main agent reviews their output." },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-5">
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-2">Without</div>
                  <p className="text-[14px] text-neutral-500 leading-relaxed">{item.without}</p>
                </div>
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-5">
                  <div className="text-[11px] font-semibold text-sky-600 uppercase tracking-wide mb-2">With Synarch</div>
                  <p className="text-[14px] text-neutral-600 leading-relaxed">{item.withS}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ UNDER THE HOOD ═══ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Under the Hood</span>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              Why Synarch is different.
            </h2>
          </div>
          <p className="text-center text-[15px] text-neutral-400 max-w-lg mx-auto mb-16">
            Synarch handles the hard orchestration details correctly.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: "Atomic execution.", desc: "Task checkout and budget enforcement are atomic, so no double-work and no runaway spend." },
            { title: "Persistent agent state.", desc: "Agents resume the same task context across heartbeats instead of restarting from scratch." },
            { title: "Runtime configuration.", desc: "Agents can learn new workflows and project context at runtime, without redeployment." },
            { title: "Governance with rollback.", desc: "Approval gates are enforced, config changes are versioned, and bad changes can be rolled back safely." },
            { title: "Mission-aware execution.", desc: "Tasks carry full goal ancestry so agents consistently see the 'why,' not just a title." },
            { title: "True multi-network isolation.", desc: "Every entity is network-scoped, so one deployment can run many networks with separate data and audit trails." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <div>
                <h3 className="text-[15px] font-semibold text-neutral-800 mb-1">{item.title}</h3>
                <p className="text-[14px] text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ WHAT SYNARCH IS NOT ═══ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Differentiation</span>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              What Synarch is not.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: "Not a chatbot.", desc: "There's no conversation interface. Agents have tasks, not chat windows." },
            { title: "Not an agent framework.", desc: "We don't tell you how to build agents. We tell you how to run a network made of them." },
            { title: "Not a workflow builder.", desc: "No drag-and-drop pipelines. Synarch models networks — with hierarchies, tasks, budgets, and governance." },
            { title: "Not a single-agent tool.", desc: "This is for fleets. Hierarchies. Networks. If you have one agent, you probably don't need Synarch. If you have twenty — you definitely do." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div>
                <h3 className="text-[15px] font-semibold text-neutral-800 mb-1">{item.title}</h3>
                <p className="text-[14px] text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ FAQ ═══ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">FAQ</span>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              Frequently asked questions.
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div>
            <FaqItem
              q="How is Synarch different from running agents directly?"
              a="Synarch orchestrates your agents into a structured network — with hierarchies, budgets, task alignment, governance, and accountability. It's the management layer your agents need."
            />
            <FaqItem
              q="Can I use my existing agents?"
              a="Yes. Synarch is unopinionated about agent runtimes. Your agents can be any type of process — Python scripts, Node.js services, HTTP webhooks, shell commands — anything that can receive a heartbeat signal."
            />
            <FaqItem
              q="What happens when an agent hits its budget limit?"
              a="At 100% budget utilization the agent auto-pauses and new tasks are blocked. You get a soft warning at 80%. As the main agent, you can override the limit at any time and resume."
            />
            <FaqItem
              q="Do agents run continuously?"
              a="By default, Synarch runs your agents on scheduled heartbeats and task assignments. But you're free to connect continuous processes into the Synarch network as well."
            />
            <FaqItem
              q="Can I run multiple networks?"
              a="Yes. A single Synarch deployment can run dozens of networks with complete data isolation between them. Useful for separate projects, testing strategies, or templating configurations."
            />
            <FaqItem
              q="Is Synarch open source?"
              a="Yes. MIT licensed, self-hosted, no account required. Interactive setup walks you through configuration and deploying your first agent network."
            />
          </div>
        </Reveal>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* ═══ DEPLOY TERMINAL ═══ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-32">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-sm text-neutral-400">Get started</span>
          </div>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-neutral-900">
              From zero to autonomous network<br />
              <span className="text-neutral-400">in one command.</span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <TerminalAnimation />
        </Reveal>

        <Reveal delay={200}>
          <p className="text-center text-[14px] text-neutral-400 mt-8">
            Open source. Self-hosted. Interactive setup walks you through installation and first network. No account required. No agents installed automatically.
          </p>
        </Reveal>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="bg-neutral-900 text-white py-24">
        <Reveal>
          <div className="text-center px-4 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight mb-4">
              Ready to deploy?
            </h2>
            <p className="text-neutral-400 text-[15px] max-w-md mx-auto mb-10">
              Fork an agent, configure it, and go live in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link to="/launch" className="bg-white hover:bg-neutral-100 text-neutral-900 px-8 py-3 rounded-full text-sm font-medium transition-colors w-full sm:w-auto text-center">
                Launch Agent
              </Link>
              <Link to="/docs" className="border border-neutral-700 hover:border-neutral-500 text-neutral-400 hover:text-white px-8 py-3 rounded-full text-sm font-medium transition-colors w-full sm:w-auto text-center">
                Read Docs
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-neutral-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Synarch" className="w-4 h-4 object-contain opacity-50" />
            <span className="text-[12px] text-neutral-400">SYNARCH © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            {[{ l: "Docs", h: "/docs" }, { l: "Agents", h: "/home" }, { l: "Forks", h: "/forks" }, { l: "X", h: "/x" }].map((item) => (
              <Link key={item.l} to={item.h} className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors">{item.l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
