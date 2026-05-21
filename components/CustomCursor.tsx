"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      setIsHidden(false);
    };

    const onLeave = () => setIsHidden(true);
    const onEnter = () => setIsHidden(false);
    const onDown = () => setIsClicking(true);
    const onUp = () => setIsClicking(false);

    // Magnetic hover detection
    const onHoverStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.dataset.cursor === "hover"
      ) {
        setIsHovering(true);
      }
    };
    const onHoverEnd = () => setIsHovering(false);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("mouseover", onHoverStart);
    document.addEventListener("mouseout", onHoverEnd);

    // Smooth ring follow
    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseover", onHoverStart);
      document.removeEventListener("mouseout", onHoverEnd);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      {/* Dot — snaps to exact cursor */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isHovering ? "6px" : "8px",
          height: isHovering ? "6px" : "8px",
          marginLeft: isHovering ? "-3px" : "-4px",
          marginTop: isHovering ? "-3px" : "-4px",
          background: isHovering ? "var(--green-neon)" : "#fff",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 10001,
          willChange: "transform",
          transition: "width 0.2s, height 0.2s, background 0.2s, margin 0.2s",
          opacity: isHidden ? 0 : 1,
          boxShadow: isHovering
            ? "0 0 12px var(--green-neon)"
            : "0 0 6px rgba(255,255,255,0.5)",
        }}
      />

      {/* Ring — lags behind */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isClicking ? "24px" : isHovering ? "48px" : "32px",
          height: isClicking ? "24px" : isHovering ? "48px" : "32px",
          marginLeft: isClicking ? "-12px" : isHovering ? "-24px" : "-16px",
          marginTop: isClicking ? "-12px" : isHovering ? "-24px" : "-16px",
          border: isHovering
            ? "1.5px solid var(--green-neon)"
            : "1.5px solid rgba(167,139,250,0.7)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 10000,
          willChange: "transform",
          transition: "width 0.25s cubic-bezier(0.23,1,0.32,1), height 0.25s cubic-bezier(0.23,1,0.32,1), margin 0.25s cubic-bezier(0.23,1,0.32,1), border-color 0.2s",
          opacity: isHidden ? 0 : 0.9,
          boxShadow: isHovering
            ? "0 0 20px rgba(0,255,170,0.2)"
            : "0 0 12px rgba(124,58,237,0.2)",
        }}
      />
    </>
  );
}
