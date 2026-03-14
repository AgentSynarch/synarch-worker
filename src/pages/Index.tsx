import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { AgentGraph } from "@/components/AgentGraph";
import { AgentTable } from "@/components/AgentTable";
import { Features } from "@/components/Features";
import { ApiSection } from "@/components/ApiSection";
import { ForkTracker } from "@/components/ForkTracker";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const Index = () => {
  const [totalForks, setTotalForks] = useState(0);
  const [activeForks, setActiveForks] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: total } = await supabase
        .from("deployed_forks")
        .select("*", { count: "exact", head: true });
      const { count: active } = await supabase
        .from("deployed_forks")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      setTotalForks(total ?? 0);
      setActiveForks(active ?? 0);
    };

    fetchStats();

    const channel = supabase
      .channel("stats")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "deployed_forks" },
        () => {
          setTotalForks((p) => p + 1);
          setActiveForks((p) => p + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const liveStats = [
    { value: 1, label: "Main Agent" },
    { value: activeForks, label: "Active Forks" },
    { value: totalForks, label: "Total Deployed" },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-14">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-neutral-100 px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-neutral-500 font-medium">System Online — Main Agent Active</span>
          </div>

          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-serif font-normal leading-[1.1] tracking-tight text-neutral-900 mb-4">
            Dashboard
          </h1>
          <p className="text-neutral-400 text-[15px] max-w-md mx-auto mb-12">
            One main agent. Infinite forks.<br />Monitor your hierarchical AI network in real-time.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Link to="/launch" className="bg-neutral-900 hover:bg-neutral-700 text-white px-7 py-3 rounded-full text-sm font-medium transition-colors">
              Fork an agent
            </Link>
            <Link to="/docs" className="bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 px-7 py-3 rounded-full text-sm font-medium transition-colors">
              Read docs
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-px bg-neutral-100 rounded-xl overflow-hidden border border-neutral-100">
            {liveStats.map((stat) => (
              <div key={stat.label} className="py-6 px-6 bg-white text-center">
                <div className="text-2xl font-semibold text-neutral-900 mb-1">{stat.value}</div>
                <div className="text-xs text-neutral-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* Agent graph */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-8">
          <span className="text-sm text-neutral-400">Network Topology</span>
          <h2 className="text-3xl font-serif font-normal tracking-tight text-neutral-900 mt-1">Live Agent Graph</h2>
        </div>
        <div className="border border-neutral-200 rounded-xl bg-neutral-50/50 p-8">
          <AgentGraph />
        </div>
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* Agent table */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <AgentTable />
      </section>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* Features */}
      <div className="mx-auto max-w-6xl px-6">
        <Features />
      </div>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* Fork tracker */}
      <div className="mx-auto max-w-6xl px-6">
        <ForkTracker />
      </div>

      <hr className="border-neutral-100 mx-auto max-w-5xl" />

      {/* API section */}
      <div className="mx-auto max-w-6xl px-6">
        <ApiSection />
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-100 mt-8">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Synarch" className="w-4 h-4 object-contain opacity-50" />
            <span className="text-[12px] text-neutral-400">SYNARCH © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            {[{ l: "Docs", h: "/docs" }, { l: "Agents", h: "/agents" }, { l: "Blueprints", h: "/forks" }, { l: "X", h: "/x" }].map((item) => (
              <Link key={item.l} to={item.h} className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors">{item.l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
