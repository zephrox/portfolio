"use client";

import { useEffect, useRef, useState } from "react";

const SKILLS = [
  { label: "Python / PyTorch / TensorFlow", value: 95, color: "#7c3aed" },
  { label: "Computer Vision / OpenCV / MediaPipe", value: 90, color: "#00d4ff" },
  { label: "Deep Learning Research", value: 88, color: "#00ffaa" },
  { label: "NLP / Hugging Face Transformers", value: 80, color: "#a78bfa" },
  { label: "Embedded / IoT (Arduino, ESP32, RPi)", value: 78, color: "#f59e0b" },
  { label: "C++ / Java / C#", value: 72, color: "#ec4899" },
];

const TIMELINE = [
  { year: "2019–2021", title: "HSC — Science (GPA 5.00/5.00)", desc: "Perfect score. Discovered programming and never looked back.", icon: "🎓" },
  { year: "2022", title: "BSc CSE — AIUB", desc: "Started Computer Science at American International University-Bangladesh. Major: Information Systems.", icon: "🏫" },
  { year: "2024", title: "Technoxian World Robotics Championship", desc: "Competed in robotics competition, sparking a deep interest in embodied AI systems.", icon: "🤖" },
  { year: "2025", title: "4 IEEE Publications", desc: "DisasterX rover, BrainXAI-Net EEG framework, seismic IoT network, urban disease mapping — all published at IEEE venues.", icon: "📄" },
  { year: "Jan 2026", title: "Research Intern — NEDAAS Lab", desc: "Conducting applied research in computer vision, XAI, and ML at the Neural Engineering, Data Analytics & Applied Science Lab.", icon: "🔬" },
  { year: "2026+", title: "Targeting IEEE TAC Q1", desc: "Undergraduate thesis on Facial Emotion Recognition with anatomical disentanglement and contrastive learning — in preparation.", icon: "🚀" },
];

const STATS = [
  { value: "7",    label: "IEEE Publications" },
  { value: "3.60", label: "GPA / 4.00" },
  { value: "5+",   label: "IEEE Conferences" },
  { value: "Q1",   label: "Target Journal Tier" },
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [animatedSkills, setAnimatedSkills] = useState(SKILLS.map(() => 0));

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        SKILLS.forEach((skill, i) => {
          setTimeout(() => {
            setAnimatedSkills((prev) => { const next = [...prev]; next[i] = skill.value; return next; });
          }, 200 + i * 100);
        });
      }
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={sectionRef} style={{ padding: "120px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "10%", right: "-200px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "80px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--green-neon)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>// 02 — About</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(36px,5vw,60px)", color: "var(--text-1)", lineHeight: 1.1 }}>
            The{" "}
            <span style={{ background: "linear-gradient(135deg,#a78bfa,#00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Researcher</span>
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: "16px", maxWidth: "560px", margin: "16px auto 0", lineHeight: 1.7 }}>
            AI/ML Engineer from Dhaka, Bangladesh — bridging the gap between intelligent perception and physical systems.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "80px", opacity: visible ? 1 : 0, transition: "opacity 0.7s ease 0.15s" }}>
          {STATS.map((stat, i) => (
            <div key={i} style={{ background: "rgba(15,14,42,0.6)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "16px", padding: "24px", textAlign: "center", backdropFilter: "blur(12px)", transform: visible ? "translateY(0)" : "translateY(20px)", transition: `transform 0.6s ease ${0.2 + i * 0.08}s, opacity 0.6s ease ${0.2 + i * 0.08}s`, opacity: visible ? 1 : 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "36px", background: "linear-gradient(135deg,#a78bfa,#00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{stat.value}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)", letterSpacing: "0.1em", marginTop: "6px" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
          {/* Timeline */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-30px)", transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "20px", color: "var(--text-1)", marginBottom: "32px" }}>Journey</h3>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "19px", top: "8px", bottom: "8px", width: "1px", background: "linear-gradient(to bottom, var(--purple), transparent)" }} />
              {TIMELINE.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "20px", marginBottom: "28px", opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-20px)", transition: `opacity 0.5s ease ${0.4 + i * 0.08}s, transform 0.5s ease ${0.4 + i * 0.08}s` }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0, zIndex: 1 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--purple-light)", letterSpacing: "0.1em", marginBottom: "4px" }}>{item.year}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "15px", color: "var(--text-1)", marginBottom: "4px" }}>{item.title}</div>
                    <div style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(30px)", transition: "opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "20px", color: "var(--text-1)", marginBottom: "32px" }}>Expertise</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {SKILLS.map((skill, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-2)" }}>{skill.label}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: skill.color }}>{animatedSkills[i]}%</span>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${animatedSkills[i]}%`, background: `linear-gradient(90deg, ${skill.color}80, ${skill.color})`, borderRadius: "4px", transition: "width 1s cubic-bezier(0.23,1,0.32,1)", boxShadow: `0 0 8px ${skill.color}40` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Fun facts */}
            <div style={{ marginTop: "48px", overflow: "hidden", padding: "12px 0" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-3)", letterSpacing: "0.15em", marginBottom: "12px" }}>FUN FACTS ↓</div>
              <div style={{ overflow: "hidden", borderRadius: "8px" }}>
                <div style={{ display: "flex", gap: "32px", whiteSpace: "nowrap", animation: "marquee 20s linear infinite" }}>
                  {[...Array(2)].map((_, ri) => (
                    <div key={ri} style={{ display: "flex", gap: "32px" }}>
                      {["🤖 Talks to robot arms daily", "📄 7 IEEE papers & counting", "🧠 Thinks in tensors", "🔧 Builds IoT from scratch", "🎵 Codes & sings", "🌏 Dhaka → Q1 Journal"].map((f, j) => (
                        <span key={j} style={{ fontSize: "12px", color: "var(--text-3)" }}>{f}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}