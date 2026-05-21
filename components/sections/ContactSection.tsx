"use client";

import { useEffect, useRef, useState } from "react";

const SOCIALS = [
  { label: "GitHub", icon: "⌥", href: "https://github.com/zephrox", color: "#a78bfa" },
  { label: "LinkedIn", icon: "in", href: "https://www.linkedin.com/in/anjir-jm/", color: "#0ea5e9" },
  { label: "Google Scholar", icon: "◈", href: "https://scholar.google.com/citations?user=ge2vt1EAAAAJ&hl=en", color: "#00ffaa" },
  { label: "Email", icon: "@", href: "mailto:anjir.jm@gmail.com", color: "#f59e0b" },
];

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const rafId = useRef<number>(0);
  const angle = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Radar animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const size = 260;
    canvas.width = size; canvas.height = size;
    const cx = size / 2, cy = size / 2, r = size / 2 - 10;

    const blips: { a: number; d: number; alpha: number }[] = Array.from({ length: 6 }, () => ({
      a: Math.random() * Math.PI * 2,
      d: (0.3 + Math.random() * 0.6) * r,
      alpha: 0,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      angle.current += 0.012;

      // BG
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(6,6,18,0.95)";
      ctx.fill();

      // Rings
      [0.25, 0.5, 0.75, 1].forEach((frac) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r * frac, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,255,170,0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Cross hairs
      ctx.strokeStyle = "rgba(0,255,170,0.08)";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();

      // Sweep gradient
      const sa = angle.current;
      const sweepEnd = sa;
      const sweepStart = sa - Math.PI * 0.6;
      for (let a = sweepStart; a <= sweepEnd; a += 0.05) {
        const alpha = ((a - sweepStart) / (sweepEnd - sweepStart)) * 0.35;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, a, a + 0.05);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,255,170,${alpha})`;
        ctx.fill();
      }

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sa) * r, cy + Math.sin(sa) * r);
      ctx.strokeStyle = "rgba(0,255,170,0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.save();
      ctx.shadowColor = "#00ffaa";
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();

      // Blips
      blips.forEach((b) => {
        const da = ((sa % (Math.PI * 2)) - b.a + Math.PI * 4) % (Math.PI * 2);
        if (da < 0.15) b.alpha = 1;
        else b.alpha = Math.max(0, b.alpha - 0.008);

        if (b.alpha > 0) {
          const bx = cx + Math.cos(b.a) * b.d;
          const by = cy + Math.sin(b.a) * b.d;
          ctx.beginPath();
          ctx.arc(bx, by, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,255,170,${b.alpha})`;
          ctx.save();
          ctx.shadowColor = "#00ffaa";
          ctx.shadowBlur = 12 * b.alpha;
          ctx.fill();
          ctx.restore();
        }
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#00ffaa";
      ctx.save(); ctx.shadowColor = "#00ffaa"; ctx.shadowBlur = 10; ctx.fill(); ctx.restore();

      // Border
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,255,170,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      rafId.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1800));
    setSending(false);
    setSent(true);
  };

  return (
    <section id="contact" ref={sectionRef} style={{ padding: "120px 0 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "20%", right: "-150px", width: "450px", height: "450px", background: "radial-gradient(circle, rgba(0,255,170,0.04) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "70px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--green-neon)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>// 06 — Contact</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(36px,5vw,60px)", color: "var(--text-1)", lineHeight: 1.1 }}>
            Send a{" "}
            <span style={{ background: "linear-gradient(135deg,#00ffaa,#0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Signal</span>
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: "16px", marginTop: "16px", maxWidth: "440px", margin: "16px auto 0", lineHeight: 1.7 }}>
            Open to research collaborations, internships, and interesting problems at the intersection of computer vision, affective computing, and robotics.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "60px", alignItems: "start" }}>
          {/* Radar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-30px)", transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s" }}>
            <canvas ref={canvasRef} style={{ borderRadius: "50%", display: "block" }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-3)", letterSpacing: "0.1em", textAlign: "center" }}>
              SIGNAL ACTIVE<br />SCANNING FOR COLLABORATORS<br />Dhaka, Bangladesh
            </div>
            {/* Social links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 14px", borderRadius: "10px",
                    background: `${s.color}0d`, border: `1px solid ${s.color}20`,
                    textDecoration: "none", transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${s.color}20`; e.currentTarget.style.borderColor = `${s.color}40`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = `${s.color}0d`; e.currentTarget.style.borderColor = `${s.color}20`; }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: s.color, width: "20px", textAlign: "center" }}>{s.icon}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-2)" }}>{s.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--text-3)" }}>↗</span>
                </a>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(30px)", transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "60px 24px", background: "rgba(0,255,170,0.05)", border: "1px solid rgba(0,255,170,0.2)", borderRadius: "20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📡</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "24px", color: "var(--green-neon)", marginBottom: "8px" }}>Signal Transmitted!</div>
                <div style={{ color: "var(--text-2)", fontSize: "14px" }}>I'll get back to you within 24 hours.</div>
              </div>
            ) : (
              <div style={{ background: "rgba(15,14,42,0.6)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "20px", padding: "36px", backdropFilter: "blur(16px)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)", letterSpacing: "0.15em", marginBottom: "24px" }}>
                  &gt; compose_message.sh
                </div>
                {(["name", "email", "message"] as const).map((field, i) => (
                  <div key={field} style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--purple-light)", letterSpacing: "0.1em", marginBottom: "8px" }}>
                      {["--name", "--email", "--message"][i]}
                    </label>
                    {field === "message" ? (
                      <textarea
                        value={form[field]}
                        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                        rows={4}
                        placeholder="What's on your mind?"
                        style={{
                          width: "100%", padding: "12px 16px", borderRadius: "10px",
                          background: "rgba(6,6,18,0.6)", border: "1px solid rgba(124,58,237,0.2)",
                          color: "var(--text-1)", fontFamily: "var(--font-mono)", fontSize: "13px",
                          resize: "vertical", outline: "none",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.08)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.2)"; e.target.style.boxShadow = "none"; }}
                      />
                    ) : (
                      <input
                        type={field === "email" ? "email" : "text"}
                        value={form[field]}
                        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                        placeholder={field === "email" ? "you@example.com" : "Your name"}
                        style={{
                          width: "100%", padding: "12px 16px", borderRadius: "10px",
                          background: "rgba(6,6,18,0.6)", border: "1px solid rgba(124,58,237,0.2)",
                          color: "var(--text-1)", fontFamily: "var(--font-mono)", fontSize: "13px",
                          outline: "none",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.08)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.2)"; e.target.style.boxShadow = "none"; }}
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  style={{
                    width: "100%", padding: "14px", borderRadius: "10px",
                    background: sending ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg, #7c3aed, #0ea5e9)",
                    border: "none", color: "#fff",
                    fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 500,
                    boxShadow: sending ? "none" : "0 0 24px rgba(124,58,237,0.3)",
                    transition: "all 0.3s",
                    letterSpacing: "0.02em",
                  }}
                >
                  {sending ? "Transmitting signal..." : "Transmit Signal 📡"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
