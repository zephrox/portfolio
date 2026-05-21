"use client";

import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { label: "Home",      href: "#hero",     icon: "⬡" },
  { label: "About",     href: "#about",    icon: "◈" },
  { label: "Research",  href: "#research", icon: "⬡" },
  { label: "Robotics",  href: "#robotics", icon: "◈" },
  { label: "MLOps",     href: "#mlops",    icon: "⬡" },
  { label: "Contact",   href: "#contact",  icon: "◈" },
];

export default function Navbar() {
  const [active, setActive] = useState("hero");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Scroll spy
  useEffect(() => {
    const sections = NAV_ITEMS.map((n) => n.href.replace("#", ""));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: scrolled ? "12px 0" : "20px 0",
          transition: "padding 0.4s cubic-bezier(0.23,1,0.32,1), background 0.4s",
          background: scrolled
            ? "rgba(6,6,18,0.85)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(124,58,237,0.12)"
            : "none",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <button
            onClick={() => scrollTo("#hero")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            <LogoMark />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "16px",
                  color: "var(--text-1)",
                  letterSpacing: "0.02em",
                  lineHeight: 1.1,
                }}
              >
                ANJIR<span style={{ color: "var(--purple-light)" }}>JAMAN</span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "var(--text-3)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                CV · Robotics · IEEE Author
              </div>
            </div>
          </button>

          {/* Desktop nav */}
          <div
            ref={navRef}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(15,14,42,0.6)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(124,58,237,0.15)",
              borderRadius: "50px",
              padding: "5px 6px",
            }}
            className="hidden-mobile"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.href.replace("#", "");
              const isHovered = hoveredItem === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => scrollTo(item.href)}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    position: "relative",
                    padding: "7px 16px",
                    borderRadius: "50px",
                    border: "none",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(0,212,255,0.12))"
                      : "transparent",
                    color: isActive
                      ? "var(--text-1)"
                      : isHovered
                      ? "var(--text-1)"
                      : "var(--text-2)",
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    fontWeight: isActive ? 500 : 400,
                    letterSpacing: "0.02em",
                    transition: "all 0.25s ease",
                    boxShadow: isActive
                      ? "0 0 16px rgba(124,58,237,0.15)"
                      : "none",
                  }}
                >
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "var(--green-neon)",
                        boxShadow: "0 0 6px var(--green-neon)",
                        animation: "nav-pulse 2s ease-in-out infinite",
                      }}
                    />
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* CTA + Hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 20px",
                borderRadius: "50px",
                background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
                color: "#fff",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
                letterSpacing: "0.02em",
                boxShadow: "0 0 20px rgba(124,58,237,0.25)",
                transition: "opacity 0.2s, transform 0.2s",
              }}
              className="hidden-mobile"
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.85";
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Resume ↗
            </a>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: "10px",
                padding: "8px",
                display: "none",
              }}
              className="hamburger-btn"
              aria-label="Toggle menu"
            >
              <div style={{ width: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      display: "block",
                      height: "2px",
                      borderRadius: "2px",
                      background: "var(--text-2)",
                      transition: "transform 0.3s, opacity 0.3s",
                      width: i === 1 ? "65%" : "100%",
                    }}
                  />
                ))}
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(6,6,18,0.97)",
            backdropFilter: "blur(24px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onClick={() => setMenuOpen(false)}
        >
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.href)}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--font-display)",
                fontSize: "32px",
                fontWeight: 700,
                color:
                  active === item.href.replace("#", "")
                    ? "var(--purple-light)"
                    : "var(--text-2)",
                padding: "8px 24px",
                letterSpacing: "0.02em",
                transition: "color 0.2s",
                animationDelay: `${i * 0.06}s`,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function LogoMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="17" r="16" stroke="url(#logo-g)" strokeWidth="1.5" />
      {/* Neural nodes */}
      {[
        [17, 5],
        [27, 11],
        [27, 23],
        [17, 29],
        [7, 23],
        [7, 11],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2" fill="url(#logo-g)" opacity={0.7 + i * 0.05} />
      ))}
      {/* Edges */}
      {[
        [17, 5, 27, 11],
        [27, 11, 27, 23],
        [27, 23, 17, 29],
        [17, 29, 7, 23],
        [7, 23, 7, 11],
        [7, 11, 17, 5],
        [17, 5, 17, 29],
        [7, 11, 27, 23],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="url(#logo-g)"
          strokeWidth="0.6"
          opacity="0.35"
        />
      ))}
      <circle cx="17" cy="17" r="3" fill="#7c3aed" />
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#00ffaa" />
        </linearGradient>
      </defs>
    </svg>
  );
}
