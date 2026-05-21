"use client";

import { useEffect, useRef, useState } from "react";

const PROJECTS = [
  {
    name: "CogniLink-5DOF",
    desc: "Real-time affective robot arm that infers cognitive states from facial landmarks (MediaPipe FaceMesh) and drives servo interpolation on a 5-DOF physical manipulator. Features the novel 'Sticky Focus' asymmetrical temporal hysteresis framework to model cognitive inertia.",
    tags: ["Python", "OpenCV", "MediaPipe", "Arduino", "5-DOF"],
    status: "Deployed",
    statusColor: "#00ffaa",
    metric: "Real-time @ 30fps",
    icon: "🦾",
    color: "#7c3aed",
    github: "#",
  },
  {
    name: "DisasterX Rover",
    desc: "ESP32-CAM based autonomous rover for real-time visual monitoring in disaster environments. Features wireless video streaming, obstacle detection, and remote control interface. Published at IEEE CS Bangladesh Chapter Symposium 2025.",
    tags: ["ESP32-CAM", "IoT", "C++", "IEEE Published"],
    status: "Published",
    statusColor: "#00d4ff",
    metric: "IEEE CS Bangladesh 2025",
    icon: "🚗",
    color: "#0ea5e9",
    github: "https://github.com/zephrox",
  },
  {
    name: "FER — Thesis Project",
    desc: "Investigating anatomical disentanglement of facial representations using contrastive learning for robust Facial Emotion Recognition under pose variation and real-world occlusion. Targeting IEEE Transactions on Affective Computing Q1.",
    tags: ["PyTorch", "Contrastive Learning", "FaceMesh", "FER"],
    status: "In Progress",
    statusColor: "#f59e0b",
    metric: "Targeting IEEE TAC Q1",
    icon: "🧠",
    color: "#f59e0b",
    github: "#",
  },
];

export default function RoboticsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const angle = useRef(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 300; canvas.height = 300;

    const draw = () => {
      ctx.clearRect(0, 0, 300, 300);
      angle.current += 0.008;
      const t = angle.current;
      const cx = 150, cy = 230;
      const a1 = -Math.PI / 2 + Math.sin(t * 0.7) * 0.4;
      const a2 = Math.PI / 4 + Math.sin(t * 1.1) * 0.5;
      const a3 = -Math.PI / 6 + Math.sin(t * 0.9) * 0.3;
      const a4 = Math.sin(t * 1.3) * 0.4;
      const a5 = Math.sin(t * 0.8) * 0.3;
      const l1 = 55, l2 = 45, l3 = 35, l4 = 25, l5 = 18;

      const x1 = cx + Math.cos(a1) * l1, y1 = cy + Math.sin(a1) * l1;
      const x2 = x1 + Math.cos(a1 + a2) * l2, y2 = y1 + Math.sin(a1 + a2) * l2;
      const x3 = x2 + Math.cos(a1 + a2 + a3) * l3, y3 = y2 + Math.sin(a1 + a2 + a3) * l3;
      const x4 = x3 + Math.cos(a1 + a2 + a3 + a4) * l4, y4 = y3 + Math.sin(a1 + a2 + a3 + a4) * l4;
      const x5 = x4 + Math.cos(a1 + a2 + a3 + a4 + a5) * l5, y5 = y4 + Math.sin(a1 + a2 + a3 + a4 + a5) * l5;

      // Grid
      ctx.strokeStyle = "rgba(124,58,237,0.1)"; ctx.lineWidth = 0.5;
      for (let i = 0; i <= 10; i++) {
        ctx.beginPath(); ctx.moveTo(i * 30, 240); ctx.lineTo(i * 30, 300); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 240 + i * 6); ctx.lineTo(300, 240 + i * 6); ctx.stroke();
      }

      // Shadow
      ctx.beginPath(); ctx.ellipse(cx, 242, 20, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(124,58,237,0.15)"; ctx.fill();

      // Base
      const bg = ctx.createLinearGradient(cx - 22, 220, cx + 22, 240);
      bg.addColorStop(0, "#2d1b69"); bg.addColorStop(1, "#1a0f3c");
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(cx - 22, 224, 44, 18, 4);
      ctx.fill(); ctx.strokeStyle = "rgba(124,58,237,0.5)"; ctx.lineWidth = 1; ctx.stroke();

      const seg = (x1: number, y1: number, x2: number, y2: number, col: string, w: number) => {
        const g = ctx.createLinearGradient(x1, y1, x2, y2);
        g.addColorStop(0, col + "cc"); g.addColorStop(1, col + "66");
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = g; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.stroke();
        ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = col + "22"; ctx.lineWidth = w + 6; ctx.stroke();
        ctx.restore();
      };
      const joint = (x: number, y: number, r: number, col: string) => {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "#0f0e2a"; ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(x, y, r - 2, 0, Math.PI * 2);
        ctx.fillStyle = col + "35"; ctx.fill(); ctx.restore();
      };

      seg(cx, 224, x1, y1, "#7c3aed", 9);
      seg(x1, y1, x2, y2, "#00d4ff", 7);
      seg(x2, y2, x3, y3, "#00ffaa", 5);
      seg(x3, y3, x4, y4, "#f59e0b", 4);
      seg(x4, y4, x5, y5, "#ec4899", 3);

      joint(cx, 224, 8, "#7c3aed");
      joint(x1, y1, 6, "#00d4ff");
      joint(x2, y2, 5, "#00ffaa");
      joint(x3, y3, 4, "#f59e0b");
      joint(x4, y4, 3, "#ec4899");

      // Gripper
      const ga = a1 + a2 + a3 + a4 + a5;
      const gl = 10;
      const px = Math.cos(ga + Math.PI / 2) * 5, py = Math.sin(ga + Math.PI / 2) * 5;
      const fx = Math.cos(ga) * gl, fy = Math.sin(ga) * gl;
      ctx.strokeStyle = "#ec4899"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
      [[1], [-1]].forEach(([s]) => {
        ctx.beginPath();
        ctx.moveTo(x5 + px * s, y5 + py * s);
        ctx.lineTo(x5 + px * s + fx, y5 + py * s + fy);
        ctx.stroke();
      });

      // Readouts
      const joints = [
        { label: "J1", val: ((a1 + Math.PI / 2) * 57.3).toFixed(1) },
        { label: "J2", val: (a2 * 57.3).toFixed(1) },
        { label: "J3", val: (a3 * 57.3).toFixed(1) },
        { label: "J4", val: (a4 * 57.3).toFixed(1) },
        { label: "J5", val: (a5 * 57.3).toFixed(1) },
      ];
      ctx.fillStyle = "rgba(0,255,170,0.75)";
      ctx.font = "9px monospace";
      joints.forEach((j, i) => ctx.fillText(`${j.label}: ${j.val}°`, 8, 16 + i * 14));

      rafId.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const proj = PROJECTS[activeProject];

  return (
    <section id="robotics" ref={sectionRef} style={{ padding: "120px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: "-100px", bottom: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(0,255,170,0.05) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "70px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--green-neon)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>// 04 — Robotics & Projects</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(36px,5vw,60px)", color: "var(--text-1)", lineHeight: 1.1 }}>
            The{" "}
            <span style={{ background: "linear-gradient(135deg,#00ffaa,#00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Workshop</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          {/* Canvas — 5DOF arm */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-30px)", transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s" }}>
            <div style={{ position: "relative", background: "rgba(10,10,31,0.8)", borderRadius: "20px", border: "1px solid rgba(0,255,170,0.15)", padding: "12px", boxShadow: "0 0 40px rgba(0,255,170,0.08)" }}>
              {[["0","0","tl"],["auto","0","tr"],["0","auto","bl"],["auto","auto","br"]].map(([t,r,k]) => (
                <div key={k} style={{ position: "absolute", top: t === "0" ? "8px" : "auto", bottom: t === "auto" ? "8px" : "auto", left: r === "0" ? "8px" : "auto", right: r === "auto" ? "8px" : "auto", width: "12px", height: "12px", borderTop: ["tl","tr"].includes(k) ? "1px solid var(--green-neon)" : "none", borderBottom: ["bl","br"].includes(k) ? "1px solid var(--green-neon)" : "none", borderLeft: ["tl","bl"].includes(k) ? "1px solid var(--green-neon)" : "none", borderRight: ["tr","br"].includes(k) ? "1px solid var(--green-neon)" : "none", opacity: 0.5 }} />
              ))}
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--green-neon)", letterSpacing: "0.12em", marginBottom: "4px", opacity: 0.6 }}>▶ CogniLink-5DOF · LIVE SIM</div>
              <canvas ref={canvasRef} style={{ display: "block", borderRadius: "12px" }} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)", letterSpacing: "0.08em" }}>
              5-DOF Neural Control · Sticky Focus Framework
            </div>
          </div>

          {/* Projects list */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(30px)", transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {PROJECTS.map((p, i) => (
                <button key={p.name} onClick={() => setActiveProject(i)} style={{ background: activeProject === i ? `linear-gradient(135deg, ${p.color}18, rgba(15,14,42,0.8))` : "rgba(15,14,42,0.4)", border: `1px solid ${activeProject === i ? p.color + "40" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "16px 20px", textAlign: "left", transition: "all 0.3s", boxShadow: activeProject === i ? `0 0 24px ${p.color}15` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "22px" }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px", color: "var(--text-1)" }}>{p.name}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: p.statusColor + "18", color: p.statusColor }}>{p.status}</span>
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: activeProject === i ? p.color : "var(--text-3)" }}>{p.metric}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${proj.color}10, rgba(15,14,42,0.6))`, border: `1px solid ${proj.color}25`, borderRadius: "16px", padding: "24px", backdropFilter: "blur(12px)" }}>
              <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.7, marginBottom: "16px" }}>{proj.desc}</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: proj.github !== "#" ? "14px" : "0" }}>
                {proj.tags.map((t) => <span key={t} style={{ padding: "4px 10px", borderRadius: "6px", background: `${proj.color}15`, color: proj.color, fontFamily: "var(--font-mono)", fontSize: "11px" }}>{t}</span>)}
              </div>
              {proj.github !== "#" && (
                <a href={proj.github} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "12px", color: proj.color, textDecoration: "none" }}>
                  View on GitHub ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
