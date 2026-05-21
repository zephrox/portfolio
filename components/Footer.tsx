"use client";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      borderTop: "1px solid rgba(124,58,237,0.1)",
      padding: "32px 2rem",
      textAlign: "center",
      background: "rgba(6,6,18,0.8)",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)" }}>
          © {year} Md. Anjir Jaman — All systems operational
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green-neon)", boxShadow: "0 0 6px var(--green-neon)", animation: "pulse 2s ease-in-out infinite" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)" }}>
            Built with Next.js + Love
          </span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)" }}>
          Deployed on Vercel ▲
        </div>
      </div>
    </footer>
  );
}
