import React, { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ForkRow {
  id: string;
  fork_name: string;
  agent_type: string;
  status: string;
}

interface NodeData {
  id: string;
  x: number;
  y: number;
  type: "main" | "fork";
  label: string;
  active: boolean;
  angle: number;
  agentType?: string;
}

const MAIN_X = 500;
const MAIN_Y = 300;

function buildNodes(forks: ForkRow[]): { nodes: NodeData[]; edges: { from: string; to: string }[] } {
  const nodes: NodeData[] = [
    { id: "main", x: MAIN_X, y: MAIN_Y, type: "main", label: "MAIN", active: true, angle: 0 },
  ];
  const edges: { from: string; to: string }[] = [];

  const count = forks.length;
  const maxPerRing = 8;
  const ringCount = Math.ceil(count / maxPerRing);

  forks.forEach((fork, i) => {
    const ring = Math.floor(i / maxPerRing);
    const indexInRing = i % maxPerRing;
    const nodesInThisRing = Math.min(maxPerRing, count - ring * maxPerRing);
    const radius = 160 + ring * 100;
    const angleStep = (2 * Math.PI) / Math.max(nodesInThisRing, 1);
    const offset = ring * 0.3;
    const angle = angleStep * indexInRing - Math.PI / 2 + offset;

    nodes.push({
      id: fork.id,
      x: MAIN_X + radius * Math.cos(angle),
      y: MAIN_Y + radius * Math.sin(angle),
      type: "fork",
      label: fork.fork_name,
      active: fork.status === "active",
      angle: (angle * 180) / Math.PI,
      agentType: fork.agent_type,
    });
    edges.push({ from: "main", to: fork.id });
  });

  return { nodes, edges };
}

export const AgentGraph = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dataRef = useRef<{ nodes: NodeData[]; edges: { from: string; to: string }[] }>({ nodes: [], edges: [] });
  const timeRef = useRef(0);

  const [forkCount, setForkCount] = useState(0);

  useEffect(() => {
    const fetchAndBuild = async () => {
      const { data } = await supabase
        .from("deployed_forks")
        .select("id, fork_name, agent_type, status")
        .order("created_at", { ascending: true })
        .limit(30);
      if (data) {
        dataRef.current = buildNodes(data as ForkRow[]);
        setForkCount(data.length);
      }
    };

    fetchAndBuild();

    const channel = supabase
      .channel("agent-graph")
      .on("postgres_changes", { event: "*", schema: "public", table: "deployed_forks" }, () => {
        fetchAndBuild();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const { nodes, edges } = dataRef.current;
      const scaleX = w / 1000;
      const scaleY = h / 600;

      timeRef.current += 0.016;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      // Background glow
      const bgGrad = ctx.createRadialGradient(
        MAIN_X * scaleX, MAIN_Y * scaleY, 0,
        MAIN_X * scaleX, MAIN_Y * scaleY, 250 * scaleX
      );
      bgGrad.addColorStop(0, "hsla(210, 80%, 50%, 0.08)");
      bgGrad.addColorStop(1, "transparent");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Orbit rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(MAIN_X * scaleX, MAIN_Y * scaleY, (100 * i) * scaleX, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(210, 50%, 45%, ${0.12 / i})`;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Edges
      edges.forEach((edge) => {
        const from = nodes.find((n) => n.id === edge.from);
        const to = nodes.find((n) => n.id === edge.to);
        if (!from || !to) return;

        const fx = from.x * scaleX;
        const fy = from.y * scaleY;
        const tx = to.x * scaleX;
        const ty = to.y * scaleY;

        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        if (to.active) {
          const grad = ctx.createLinearGradient(fx, fy, tx, ty);
          grad.addColorStop(0, "hsla(210, 80%, 45%, 0.7)");
          grad.addColorStop(1, "hsla(210, 80%, 45%, 0.25)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = "hsla(210, 20%, 50%, 0.4)";
          ctx.lineWidth = 0.8;
          ctx.setLineDash([3, 6]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Data pulse on active edges
        if (to.active) {
          const speed = 0.3 + Math.abs(to.angle) * 0.001;
          const progress = ((t * speed) % 1);
          const px = fx + (tx - fx) * progress;
          const py = fy + (ty - fy) * progress;

          const pulseGrad = ctx.createRadialGradient(px, py, 0, px, py, 6 * scaleX);
          pulseGrad.addColorStop(0, "hsla(210, 85%, 50%, 0.9)");
          pulseGrad.addColorStop(1, "transparent");
          ctx.fillStyle = pulseGrad;
          ctx.beginPath();
          ctx.arc(px, py, 6 * scaleX, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "hsla(210, 85%, 40%, 1)";
          ctx.beginPath();
          ctx.arc(px, py, 1.5 * scaleX, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Nodes
      nodes.forEach((node) => {
        const nx = node.x * scaleX;
        const ny = node.y * scaleY;
        const nodePhase = node.angle * 0.05;

        if (node.type === "main") {
          // Main node glow
          const pulseSize = 40 + Math.sin(t * 2) * 8;
          const outerGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, pulseSize * scaleX);
          outerGlow.addColorStop(0, "hsla(210, 80%, 45%, 0.2)");
          outerGlow.addColorStop(0.5, "hsla(210, 80%, 45%, 0.08)");
          outerGlow.addColorStop(1, "transparent");
          ctx.fillStyle = outerGlow;
          ctx.beginPath();
          ctx.arc(nx, ny, pulseSize * scaleX, 0, Math.PI * 2);
          ctx.fill();

          // Hexagon
          const size = 22 * scaleX;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i - Math.PI / 6;
            const hx = nx + size * Math.cos(a);
            const hy = ny + size * Math.sin(a);
            i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          const hexGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, size);
          hexGrad.addColorStop(0, "hsla(210, 80%, 45%, 0.4)");
          hexGrad.addColorStop(1, "hsla(210, 80%, 45%, 0.1)");
          ctx.fillStyle = hexGrad;
          ctx.fill();
          ctx.strokeStyle = "hsla(210, 80%, 40%, 0.9)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Inner diamond
          const innerSize = 8 * scaleX;
          ctx.beginPath();
          ctx.moveTo(nx, ny - innerSize);
          ctx.lineTo(nx + innerSize, ny);
          ctx.lineTo(nx, ny + innerSize);
          ctx.lineTo(nx - innerSize, ny);
          ctx.closePath();
          ctx.fillStyle = "hsl(210, 80%, 45%)";
          ctx.fill();

          ctx.fillStyle = "hsl(210, 80%, 35%)";
          ctx.font = `bold ${11 * scaleX}px 'JetBrains Mono', monospace`;
          ctx.textAlign = "center";
          ctx.fillText(node.label, nx, ny + 38 * scaleY);
        } else {
          // Fork glow
          if (node.active) {
            const glowSize = 18 + Math.sin(t * 3 + nodePhase) * 4;
            const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, glowSize * scaleX);
            glow.addColorStop(0, "hsla(210, 80%, 45%, 0.18)");
            glow.addColorStop(1, "transparent");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(nx, ny, glowSize * scaleX, 0, Math.PI * 2);
            ctx.fill();
          } else {
            const breathe = 0.04 + Math.sin(t * 1.2 + nodePhase) * 0.03;
            const idleGlowSize = 14 + Math.sin(t * 0.8 + nodePhase) * 5;
            const idleGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, idleGlowSize * scaleX);
            idleGlow.addColorStop(0, `hsla(35, 80%, 50%, ${breathe})`);
            idleGlow.addColorStop(1, "transparent");
            ctx.fillStyle = idleGlow;
            ctx.beginPath();
            ctx.arc(nx, ny, idleGlowSize * scaleX, 0, Math.PI * 2);
            ctx.fill();
          }

          // Circle
          const r = 10 * scaleX;
          ctx.beginPath();
          ctx.arc(nx, ny, r, 0, Math.PI * 2);
          if (node.active) {
            const nodeGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r);
            nodeGrad.addColorStop(0, "hsla(210, 80%, 50%, 0.95)");
            nodeGrad.addColorStop(1, "hsla(210, 80%, 40%, 0.8)");
            ctx.fillStyle = nodeGrad;
          } else {
            const idleBright = 15 + Math.sin(t * 1.5 + nodePhase) * 4;
            const nodeGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r);
            nodeGrad.addColorStop(0, `hsla(35, 50%, ${idleBright}%, 0.7)`);
            nodeGrad.addColorStop(1, `hsla(35, 30%, ${idleBright - 5}%, 0.3)`);
            ctx.fillStyle = nodeGrad;
          }
          ctx.fill();
          ctx.strokeStyle = node.active ? "hsla(210, 80%, 40%, 0.8)" : `hsla(35, 60%, 40%, 0.4)`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Inner dot
          if (node.active) {
            ctx.beginPath();
            ctx.arc(nx, ny, 3 * scaleX, 0, Math.PI * 2);
            ctx.fillStyle = "hsl(210, 85%, 95%)";
            ctx.fill();
          }

          // Label
          ctx.fillStyle = node.active ? "hsla(210, 80%, 35%, 0.95)" : "hsla(35, 50%, 35%, 0.6)";
          ctx.font = `${9 * scaleX}px 'JetBrains Mono', monospace`;
          ctx.textAlign = "center";
          ctx.fillText(node.label, nx, ny + 20 * scaleY);

          // Status
          ctx.fillStyle = node.active ? "hsla(210, 80%, 35%, 0.8)" : "hsla(35, 60%, 35%, 0.4)";
          ctx.font = `${7 * scaleX}px 'JetBrains Mono', monospace`;
          ctx.fillText(node.active ? "● online" : "◐ idle", nx, ny + 30 * scaleY);
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [forkCount]);

  return (
    <div className="relative w-full aspect-[2/1] max-w-3xl mx-auto">
      <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: "auto" }} />
      <div className="absolute inset-0 pointer-events-none scanlines opacity-30" />
    </div>
  );
};
