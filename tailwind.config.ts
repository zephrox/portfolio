import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-syne)"],
        body: ["var(--font-dm-sans)"],
        mono: ["var(--font-jetbrains)"],
      },
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        border: "var(--border)",
        purple: {
          DEFAULT: "#7c3aed",
          light: "#a78bfa",
          dark: "#4c1d95",
        },
        green: {
          neon: "#00ffaa",
          DEFAULT: "#10b981",
        },
        blue: {
          neon: "#00d4ff",
          DEFAULT: "#0ea5e9",
        },
        amber: { DEFAULT: "#f59e0b" },
        pink: { DEFAULT: "#ec4899" },
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "marquee": "marquee 25s linear infinite",
        "border-spin": "border-spin 4s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "border-spin": {
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
