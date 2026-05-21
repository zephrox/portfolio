"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  color: string;
  alpha: number;
}

const COLORS = ["#7c3aed", "#00d4ff", "#00ffaa", "#a78bfa", "#ec4899"];

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => { setTimeout(() => setTitleVisible(true), 1200); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 9000), 120);
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.5 + 0.2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const maxDist = 130;

      particles.forEach((p) => {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.vx += (dx / dist) * force * 0.5;
          p.vy += (dy / dist) * force * 0.5;
        }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8; ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pa = particles[i], pb = particles[j];
          const dx = pa.x - pb.x, dy = pa.y - pb.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.25;
            ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
            const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
            grad.addColorStop(0, pa.color); grad.addColorStop(1, pb.color);
            ctx.strokeStyle = grad; ctx.globalAlpha = alpha; ctx.lineWidth = 0.6; ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };

    resize(); draw();
    const onMove = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
  }, []);

  return (
    <section id="hero" style={{ position: "relative", width: "100%", height: "100vh", minHeight: "600px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(6,6,18,0.7) 100%)", zIndex: 1, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "200px", background: "linear-gradient(to bottom, transparent, var(--bg))", zIndex: 2, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "0 1.5rem", maxWidth: "900px" }}>
        {/* Status */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(15,14,42,0.7)", border: "1px solid rgba(0,255,170,0.2)", borderRadius: "50px", padding: "6px 16px", marginBottom: "2rem", opacity: titleVisible ? 1 : 0, transform: titleVisible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--green-neon)", boxShadow: "0 0 8px var(--green-neon)", animation: "pulse 2s ease-in-out infinite", display: "inline-block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--green-neon)", letterSpacing: "0.1em" }}>
            RESEARCH INTERN @ NEDAAS LAB · AIUB · DHAKA
          </span>
        </div>

        {/* Name */}
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(48px, 8vw, 96px)", lineHeight: 1.05, marginBottom: "1.5rem", opacity: titleVisible ? 1 : 0, transform: titleVisible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s ease 0.25s, transform 0.7s ease 0.25s" }}>
          <span style={{ color: "var(--text-1)", display: "block" }}>Md. Anjir</span>
          <span style={{ background: "linear-gradient(135deg, #a78bfa 0%, #00d4ff 50%, #00ffaa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "block" }}>Jaman</span>
        </h1>

        {/* Role tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", marginBottom: "2.5rem", opacity: titleVisible ? 1 : 0, transform: titleVisible ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s" }}>
          {[
            { label: "Computer Vision", color: "#7c3aed" },
            { label: "Deep Learning", color: "#0ea5e9" },
            { label: "Affective Robotics", color: "#00ffaa" },
            { label: "IEEE Author", color: "#ec4899" },
            { label: "Explainable AI", color: "#f59e0b" },
          ].map((tag) => (
            <span key={tag.label} style={{ padding: "6px 16px", borderRadius: "50px", background: `${tag.color}18`, border: `1px solid ${tag.color}40`, color: tag.color, fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.05em" }}>
              {tag.label}
            </span>
          ))}
        </div>

        {/* Description */}
        <p style={{ color: "var(--text-2)", fontSize: "clamp(15px, 2vw, 18px)", lineHeight: 1.7, maxWidth: "580px", margin: "0 auto 2.5rem", opacity: titleVisible ? 1 : 0, transform: titleVisible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.6s ease 0.55s, transform 0.6s ease 0.55s" }}>
          Final-year BSc CSE student at AIUB with 7 IEEE publications. Building AI systems that bridge perception and physical action — from affective robot arms to XAI-powered diagnostics.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", opacity: titleVisible ? 1 : 0, transform: titleVisible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s" }}>
          <button onClick={() => document.getElementById("research")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "14px 32px", borderRadius: "50px", background: "linear-gradient(135deg, #7c3aed, #0ea5e9)", color: "#fff", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 500, border: "none", boxShadow: "0 0 30px rgba(124,58,237,0.35)", letterSpacing: "0.02em" }}>
            View Publications →
          </button>
          <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "14px 32px", borderRadius: "50px", background: "transparent", color: "var(--text-1)", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 400, border: "1px solid rgba(124,58,237,0.35)", letterSpacing: "0.02em" }}>
            Get in Touch
          </button>
        </div>
      </div>

      {/* Scroll cue */}
      <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", opacity: titleVisible ? 0.6 : 0, transition: "opacity 0.6s ease 1s" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-3)", letterSpacing: "0.15em" }}>SCROLL</span>
        <div style={{ width: "1px", height: "48px", background: "linear-gradient(to bottom, var(--purple-light), transparent)", animation: "pulse 2s ease-in-out infinite" }} />
      </div>
    </section>
  );
}
