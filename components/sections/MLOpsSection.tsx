"use client";

import { useEffect, useRef, useState } from "react";

const PIPELINE_STAGES = [
  { id: "ingest",  label: "Data Ingest",  icon: "📥", color: "#7c3aed", desc: "Streaming pipelines with Kafka & Spark. 50GB/day throughput." },
  { id: "train",   label: "Train",        icon: "🧠", color: "#0ea5e9", desc: "Distributed training across 8× A100 GPUs with PyTorch DDP." },
  { id: "eval",    label: "Evaluate",     icon: "📊", color: "#00ffaa", desc: "Automated eval suites: accuracy, latency, fairness, robustness." },
  { id: "deploy",  label: "Deploy",       icon: "🚀", color: "#f59e0b", desc: "Kubernetes + Triton Inference Server. Canary rollouts." },
  { id: "monitor", label: "Monitor",      icon: "👁",  color: "#ec4899", desc: "Real-time drift detection, alerting, and auto-retraining triggers." },
];

const TOOLS = [
  { name: "PyTorch", category: "Deep Learning" },
  { name: "TensorFlow", category: "Deep Learning" },
  { name: "OpenCV", category: "Computer Vision" },
  { name: "MediaPipe", category: "Face / Pose" },
  { name: "Docker", category: "Containerisation" },
  { name: "Hugging Face", category: "NLP / Transformers" },
  { name: "Arduino / ESP32", category: "Embedded / IoT" },
  { name: "Git / GitHub", category: "Version Control" },
];

const TERMINAL_LINES: { text: string; color: string }[] = [
  { text: "$ python train_fer.py --model contrastive_disentangle --epochs 80", color: "#00ffaa" },
  { text: "  Loading FER2013 + AffectNet datasets...", color: "var(--text-2)" },
  { text: "  Epoch 01/80 — loss: 1.2341 — val_acc: 0.4821", color: "var(--text-2)" },
  { text: "  Epoch 20/80 — loss: 0.6712 — val_acc: 0.6934", color: "var(--text-2)" },
  { text: "  Epoch 50/80 — loss: 0.3204 — val_acc: 0.8112 ✓", color: "#00d4ff" },
  { text: "  Epoch 80/80 — loss: 0.1893 — val_acc: 0.8641 ✓", color: "#00d4ff" },
  { text: "$ python cognilink_inference.py --device arduino --dof 5", color: "#00ffaa" },
  { text: "  MediaPipe FaceMesh initialised — 468 landmarks", color: "var(--text-2)" },
  { text: "  Sticky Focus hysteresis: ACTIVE", color: "#a78bfa" },
  { text: "  Cognitive state: FOCUSED → servo_map [J1=42° J2=18° J3=-6°]", color: "var(--text-2)" },
  { text: "  Cognitive state: STRESSED → servo_map [J1=67° J2=33° J3=12°]", color: "#f59e0b" },
  { text: "$ docker build -t disasterx-rover:v2.1 . && docker push registry/disasterx:v2.1", color: "#00ffaa" },
  { text: "  Successfully built ESP32-CAM firmware image ✓", color: "#a78bfa" },
];

export default function MLOpsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [terminalLines, setTerminalLines] = useState<{ text: string; color: string }[]>([]);
  const [particlePos, setParticlePos] = useState(0);
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); }
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Animate pipeline particle
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setParticlePos((p) => (p + 1) % (PIPELINE_STAGES.length * 100));
      setActiveStage(Math.floor(((particlePos + 1) % (PIPELINE_STAGES.length * 100)) / 100));
    }, 30);
    return () => clearInterval(interval);
  }, [visible, particlePos]);

  // Type terminal lines
  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < TERMINAL_LINES.length) {
        setTerminalLines((prev) => [...prev, TERMINAL_LINES[i]]);
        i++;
        setTimeout(() => {
          if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
        }, 50);
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <section id="mlops" ref={sectionRef} style={{ padding: "120px 0", position: "relative", background: "linear-gradient(to bottom, var(--bg), var(--bg-2), var(--bg))", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: "-100px", top: "30%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "70px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#ec4899", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>// 05 — MLOps</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(36px,5vw,60px)", color: "var(--text-1)", lineHeight: 1.1 }}>
            The{" "}
            <span style={{ background: "linear-gradient(135deg,#ec4899,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Pipeline</span>
          </h2>
        </div>

        {/* Pipeline visualization */}
        <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.7s ease 0.2s", marginBottom: "48px" }}>
          <div style={{ background: "rgba(15,14,42,0.6)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "20px", padding: "32px 24px", backdropFilter: "blur(16px)" }}>
            {/* Stage buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: "24px", overflowX: "auto" }} className="no-scrollbar">
              {PIPELINE_STAGES.map((stage, i) => (
                <div key={stage.id} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: "100px" }}>
                  <button
                    onClick={() => setActiveStage(i)}
                    style={{
                      flex: 1, padding: "14px 8px", borderRadius: "12px",
                      background: activeStage === i ? `linear-gradient(135deg, ${stage.color}25, rgba(15,14,42,0.8))` : "transparent",
                      border: activeStage === i ? `1px solid ${stage.color}50` : "1px solid transparent",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                      transition: "all 0.3s", boxShadow: activeStage === i ? `0 0 20px ${stage.color}20` : "none",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{stage.icon}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: activeStage === i ? stage.color : "var(--text-3)", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                      {stage.label}
                    </span>
                  </button>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <div style={{ display: "flex", alignItems: "center", padding: "0 4px", flex: 0 }}>
                      <div style={{ width: "24px", height: "2px", background: `linear-gradient(90deg, ${stage.color}60, ${PIPELINE_STAGES[i+1].color}60)`, position: "relative" }}>
                        {/* Particle */}
                        {Math.floor(particlePos / 100) === i && (
                          <div style={{
                            position: "absolute", top: "-3px",
                            left: `${(particlePos % 100)}%`,
                            width: "6px", height: "6px", borderRadius: "50%",
                            background: stage.color,
                            boxShadow: `0 0 8px ${stage.color}`,
                            transform: "translateX(-50%)",
                            transition: "left 0.03s linear",
                          }} />
                        )}
                      </div>
                      <span style={{ color: "var(--text-3)", fontSize: "14px", marginLeft: "4px" }}>›</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Active stage detail */}
            <div style={{
              background: `linear-gradient(135deg, ${PIPELINE_STAGES[activeStage].color}12, rgba(10,10,31,0.4))`,
              border: `1px solid ${PIPELINE_STAGES[activeStage].color}25`,
              borderRadius: "12px", padding: "16px 20px",
              transition: "all 0.3s",
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: PIPELINE_STAGES[activeStage].color }}>
                {PIPELINE_STAGES[activeStage].desc}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Terminal */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-20px)", transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s" }}>
            <div style={{ background: "#0a0a14", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "16px", overflow: "hidden" }}>
              {/* Terminal header */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
                {["#ff5f56","#ffbd2e","#27c93f"].map((c) => <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />)}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)", marginLeft: "8px" }}>zsh — anjir@nedaas-lab:~/research</span>
              </div>
              <div ref={termRef} style={{ padding: "16px", height: "280px", overflowY: "auto", fontFamily: "var(--font-mono)", fontSize: "12px", lineHeight: 1.8 }} className="no-scrollbar">
                {terminalLines.filter(Boolean).map((line, i) => (
                  <div key={i} style={{ color: line.color }}>{line.text}</div>
                ))}
                <span style={{ display: "inline-block", width: "8px", height: "14px", background: "var(--green-neon)", animation: "pulse 1s step-end infinite", marginLeft: "2px", verticalAlign: "middle" }} />
              </div>
            </div>
          </div>

          {/* Tools */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(20px)", transition: "opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s" }}>
            <div style={{ marginBottom: "12px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-3)", letterSpacing: "0.15em" }}>TOOLS IN MY STACK</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {TOOLS.map((tool, i) => (
                <div key={tool.name} style={{
                  background: "rgba(15,14,42,0.5)", border: "1px solid rgba(124,58,237,0.1)",
                  borderRadius: "10px", padding: "14px 16px",
                  opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)",
                  transition: `opacity 0.4s ease ${0.5 + i * 0.05}s, transform 0.4s ease ${0.5 + i * 0.05}s`,
                }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "14px", color: "var(--text-1)", marginBottom: "2px" }}>{tool.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-3)" }}>{tool.category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
