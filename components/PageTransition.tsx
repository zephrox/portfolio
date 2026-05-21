"use client";

import { useEffect, useState } from "react";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<"loading" | "entering" | "visible">(
    "loading"
  );
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("Initializing neural weights...");

  const labels = [
    "Initializing neural weights...",
    "Compiling research nodes...",
    "Calibrating robot sensors...",
    "Launching MLOps pipeline...",
    "Neural Frontier online ✓",
  ];

  useEffect(() => {
    let labelIdx = 0;
    const labelInterval = setInterval(() => {
      labelIdx = Math.min(labelIdx + 1, labels.length - 1);
      setLabel(labels[labelIdx]);
    }, 480);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressInterval);
          clearInterval(labelInterval);
          setTimeout(() => setPhase("entering"), 300);
          setTimeout(() => setPhase("visible"), 900);
          return 100;
        }
        return p + Math.random() * 8 + 2;
      });
    }, 80);

    return () => {
      clearInterval(progressInterval);
      clearInterval(labelInterval);
    };
  }, []);

  return (
    <>
      {/* Loading screen */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.23,1,0.32,1)",
          opacity: phase === "loading" ? 1 : 0,
          transform: phase === "entering" ? "translateY(-4px)" : "translateY(0)",
          pointerEvents: phase === "visible" ? "none" : "all",
        }}
      >
        {/* Logo mark */}
        <div style={{ marginBottom: "2.5rem", position: "relative" }}>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle
              cx="36" cy="36" r="30"
              fill="none"
              stroke="rgba(124,58,237,0.2)"
              strokeWidth="1"
            />
            <circle
              cx="36" cy="36" r="30"
              fill="none"
              stroke="url(#lg)"
              strokeWidth="2"
              strokeDasharray="188"
              strokeDashoffset={188 - (188 * Math.min(progress, 100)) / 100}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
              transform="rotate(-90 36 36)"
            />
            <defs>
              <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#00ffaa" />
              </linearGradient>
            </defs>
            {/* Neural nodes */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const x = 36 + 22 * Math.cos(rad);
              const y = 36 + 22 * Math.sin(rad);
              return (
                <circle
                  key={i}
                  cx={x} cy={y} r="3"
                  fill={
                    progress > i * 16
                      ? "#a78bfa"
                      : "rgba(124,58,237,0.2)"
                  }
                  style={{ transition: "fill 0.3s" }}
                />
              );
            })}
            <circle cx="36" cy="36" r="5" fill="#7c3aed" opacity="0.8" />
          </svg>
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-3)",
            letterSpacing: "0.08em",
            marginBottom: "1.5rem",
            minHeight: "18px",
            transition: "opacity 0.3s",
          }}
        >
          {label}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "240px",
            height: "2px",
            background: "rgba(124,58,237,0.15)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(progress, 100)}%`,
              background: "linear-gradient(90deg, #7c3aed, #00d4ff, #00ffaa)",
              transition: "width 0.1s linear",
              borderRadius: "2px",
            }}
          />
        </div>

        {/* Progress number */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-3)",
            marginTop: "0.75rem",
            opacity: 0.5,
          }}
        >
          {Math.min(Math.round(progress), 100)}%
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          opacity: phase === "visible" ? 1 : 0,
          transform: phase === "visible" ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        {children}
      </div>
    </>
  );
}
