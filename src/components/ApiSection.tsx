import React from "react";

const codeExample = `// deploy a fork from main agent
POST /v1/agents/main/fork

{
  "name": "analyzer-01",
  "type": "analyzer",
  "context": "inherit",
  "capabilities": ["read", "summarize"]
}

// response
{
  "id": "AGT-0007",
  "name": "FORK-06",
  "status": "deploying",
  "parent": "AGT-0001",
  "endpoint": "wss://core.synarch.io/agents/AGT-0007"
}`;

export const ApiSection = () => {
  return (
    <section id="api" className="py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left */}
        <div>
          <span className="text-sm text-neutral-400">API</span>
          <h2 className="text-3xl font-serif font-normal tracking-tight text-neutral-900 mt-1 mb-4">
            Fork in one call.
          </h2>
          <p className="text-[15px] text-neutral-400 leading-relaxed mb-8">
            The Synarch API is designed for simplicity. Deploy forks, monitor agents, and
            manage the network programmatically. Agents are first-class API citizens.
          </p>

          <div className="space-y-3">
            {[
              { method: "POST", route: "/agents/main/fork", desc: "Deploy a new fork" },
              { method: "GET", route: "/agents", desc: "List all agents" },
              { method: "DELETE", route: "/agents/:id", desc: "Kill a fork" },
              { method: "WS", route: "/agents/:id/stream", desc: "Stream agent output" },
            ].map((endpoint) => (
              <div key={endpoint.route} className="flex items-center gap-4 group">
                <span
                  className={`text-[10px] font-medium w-14 text-center py-0.5 rounded-full ${
                    endpoint.method === "POST"
                      ? "bg-emerald-50 text-emerald-600"
                      : endpoint.method === "DELETE"
                      ? "bg-red-50 text-red-600"
                      : endpoint.method === "WS"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {endpoint.method}
                </span>
                <span className="font-mono text-xs text-neutral-700 flex-1">{endpoint.route}</span>
                <span className="text-xs text-neutral-400 hidden group-hover:block">
                  {endpoint.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — terminal */}
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-50">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-[11px] text-neutral-400 font-mono">
              terminal — api example
            </span>
          </div>
          <div className="bg-neutral-900 p-5 overflow-x-auto">
            <pre className="font-mono text-xs text-neutral-300 leading-relaxed whitespace-pre">
              {codeExample.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {line.startsWith("//") ? (
                    <span className="text-neutral-500">{line}</span>
                  ) : line.includes('"status"') || line.includes('"id"') || line.includes('"name"') ? (
                    <span>
                      {line.split(":").map((part, j) =>
                        j === 0 ? (
                          <span key={j} className="text-sky-400">{part}</span>
                        ) : (
                          <span key={j}>:{part}</span>
                        )
                      )}
                    </span>
                  ) : line.startsWith("POST") || line.startsWith("{") || line.startsWith("}") ? (
                    <span className="text-neutral-200">{line}</span>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};
