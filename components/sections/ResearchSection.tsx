"use client";

import { useEffect, useRef, useState } from "react";

const TAGS = ["All", "Computer Vision", "XAI", "IoT/Robotics", "NLP", "EEG/BCI", "Geospatial"];

const PAPERS = [
  {
    title: "Explainable ML for Human Ancestry Classification and AIM Discovery",
    venue: "IEEE QPAIN 2026",
    tags: ["XAI", "Computer Vision"],
    abstract: "First-author paper applying explainable machine learning to classify human ancestry and discover Ancestry Informative Markers (AIMs), presented at the IEEE 2nd International Conference on Quantum Photonics, AI and Networking.",
    color: "#7c3aed",
    stars: "1st Author",
    year: 2026,
    link: "#",
  },
  {
    title: "BrainXAI-Net: Interpretable Neural Framework for Spectro-Temporal EEG Emotion Recognition",
    venue: "IEEE BECITHCON 2025",
    tags: ["EEG/BCI", "XAI"],
    abstract: "An interpretable deep learning framework for emotion recognition from EEG signals using spectro-temporal analysis, presented at the IEEE International Conference on Biomedical Engineering, Computer and IT for Health.",
    color: "#00d4ff",
    stars: "Co-Author",
    year: 2025,
    link: "#",
  },
  {
    title: "DisasterX: IoT Robotic Rover with ESP32-CAM for Real-Time Disaster Intervention",
    venue: "IEEE CS Bangladesh 2025",
    tags: ["IoT/Robotics"],
    abstract: "First-author paper presenting an ESP32-CAM based autonomous rover designed for real-time visual monitoring and intervention in disaster environments, deployed and tested in field conditions.",
    color: "#00ffaa",
    stars: "1st Author",
    year: 2025,
    link: "https://github.com/zephrox",
  },
  {
    title: "SoilSyncX: Low-Cost IoT Smart Irrigation with LSTM Drought Risk Classification",
    venue: "IEEE QPAIN 2026",
    tags: ["IoT/Robotics"],
    abstract: "A low-cost IoT-enabled smart irrigation system using LSTM networks for drought risk classification and real-time web monitoring, enabling precision agriculture in resource-constrained environments.",
    color: "#f59e0b",
    stars: "Co-Author",
    year: 2026,
    link: "#",
  },
  {
    title: "IoT-Based Seismic Sensor Network for Earthquake Prediction and Early Warning",
    venue: "IEEE CS Bangladesh 2025",
    tags: ["IoT/Robotics"],
    abstract: "A distributed IoT seismic sensor network architecture for real-time earthquake detection and early warning, validated with historical seismic data from Bangladesh.",
    color: "#ec4899",
    stars: "Co-Author",
    year: 2025,
    link: "#",
  },
  {
    title: "Linking Urban Growth and Vector-Borne Diseases: Dengue Hotspots in Metropolitan Bangladesh",
    venue: "ICGSDG 2025",
    tags: ["Geospatial"],
    abstract: "A geospatial ML study correlating urban expansion patterns with dengue fever hotspot emergence in metropolitan Bangladesh, using satellite imagery and epidemiological data.",
    color: "#a78bfa",
    stars: "Co-Author",
    year: 2025,
    link: "#",
  },
];

const THESIS = {
  title: "Improving FER with Anatomical Disentanglement and Contrastive Learning",
  target: "IEEE Transactions on Affective Computing (Q1)",
  desc: "Investigating anatomical disentanglement of facial representations using contrastive learning objectives for robust Facial Emotion Recognition under pose variation and real-world conditions.",
  stack: ["PyTorch", "Contrastive Loss", "FaceMesh", "MediaPipe"],
  status: "In Preparation",
};

export default function ResearchSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeTag, setActiveTag] = useState("All");
  const [flipped, setFlipped] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const filtered = PAPERS.filter((p) => activeTag === "All" || p.tags.includes(activeTag));

  return (
    <section id="research" ref={sectionRef} style={{ padding: "120px 0", position: "relative", background: "linear-gradient(to bottom, var(--bg), var(--bg-2), var(--bg))" }}>
      <div style={{ position: "absolute", left: "-200px", top: "20%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "60px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--blue-neon)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>// 03 — Research</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(36px,5vw,60px)", color: "var(--text-1)", lineHeight: 1.1 }}>
            The{" "}
            <span style={{ background: "linear-gradient(135deg,#00d4ff,#00ffaa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Lab</span>
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: "16px", marginTop: "16px", maxWidth: "520px", margin: "16px auto 0", lineHeight: 1.7 }}>
            7 publications across IEEE conferences. Tap a card to read the abstract and access the paper.
          </p>
        </div>

        {/* Thesis highlight banner */}
        <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(0,212,255,0.08))", border: "1px solid rgba(124,58,237,0.25)", borderRadius: "16px", padding: "24px 28px", marginBottom: "48px", opacity: visible ? 1 : 0, transition: "opacity 0.7s ease 0.15s", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #7c3aed, #00d4ff, #00ffaa)" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", padding: "3px 10px", borderRadius: "6px", letterSpacing: "0.08em" }}>📖 UNDERGRADUATE THESIS</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--green-neon)", background: "rgba(0,255,170,0.1)", border: "1px solid rgba(0,255,170,0.2)", padding: "3px 10px", borderRadius: "6px" }}>In Preparation</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "17px", color: "var(--text-1)", marginBottom: "6px", lineHeight: 1.35 }}>{THESIS.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6, maxWidth: "560px" }}>{THESIS.desc}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-3)", marginBottom: "6px" }}>Targeting</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "13px", color: "#a78bfa" }}>{THESIS.target}</div>
              <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {THESIS.stack.map((t) => <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: "rgba(124,58,237,0.12)", color: "var(--purple-light)" }}>{t}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Filter tags */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginBottom: "40px", opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.2s" }}>
          {TAGS.map((tag) => (
            <button key={tag} onClick={() => { setActiveTag(tag); setFlipped(null); }} style={{ padding: "7px 18px", borderRadius: "50px", background: activeTag === tag ? "linear-gradient(135deg,#7c3aed,#0ea5e9)" : "rgba(15,14,42,0.6)", border: activeTag === tag ? "none" : "1px solid rgba(124,58,237,0.2)", color: activeTag === tag ? "#fff" : "var(--text-2)", fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.05em", transition: "all 0.25s", boxShadow: activeTag === tag ? "0 0 20px rgba(124,58,237,0.25)" : "none" }}>
              {tag}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {filtered.map((paper, i) => {
            const isFlipped = flipped === i;
            return (
              <div key={paper.title} onClick={() => setFlipped(isFlipped ? null : i)} style={{ perspective: "1000px", height: "230px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.5s ease ${0.1 + i * 0.06}s, transform 0.5s ease ${0.1 + i * 0.06}s` }}>
                <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)", transition: "transform 0.6s cubic-bezier(0.23,1,0.32,1)" }}>
                  {/* Front */}
                  <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: "rgba(15,14,42,0.7)", border: `1px solid ${paper.color}25`, borderRadius: "16px", padding: "24px", backdropFilter: "blur(16px)", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${paper.color}, transparent)` }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {paper.tags.map((t) => <span key={t} style={{ padding: "2px 8px", borderRadius: "4px", background: `${paper.color}18`, color: paper.color, fontFamily: "var(--font-mono)", fontSize: "10px" }}>{t}</span>)}
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: paper.stars === "1st Author" ? "#00ffaa" : "var(--text-3)", background: paper.stars === "1st Author" ? "rgba(0,255,170,0.1)" : "transparent", padding: paper.stars === "1st Author" ? "2px 7px" : "0", borderRadius: "4px", whiteSpace: "nowrap" }}>{paper.stars}</span>
                    </div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px", color: "var(--text-1)", lineHeight: 1.35, marginBottom: "10px" }}>{paper.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)" }}>{paper.venue}</span>
                      <span style={{ fontSize: "11px", color: paper.color, opacity: 0.7 }}>tap to flip →</span>
                    </div>
                  </div>
                  {/* Back */}
                  <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: `linear-gradient(135deg, ${paper.color}18, rgba(15,14,42,0.95))`, border: `1px solid ${paper.color}40`, borderRadius: "16px", padding: "24px", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: paper.color, letterSpacing: "0.1em", marginBottom: "10px" }}>ABSTRACT</div>
                      <p style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 1.65 }}>{paper.abstract}</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                      <a href={paper.link} onClick={(e) => e.stopPropagation()} style={{ flex: 1, padding: "8px", borderRadius: "8px", background: `${paper.color}20`, border: `1px solid ${paper.color}30`, color: paper.color, textDecoration: "none", textAlign: "center", fontSize: "12px", fontFamily: "var(--font-mono)" }}>Paper ↗</a>
                      <span style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-3)", textAlign: "center", fontSize: "12px", fontFamily: "var(--font-mono)" }}>{paper.year}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
