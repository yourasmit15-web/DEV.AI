import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { ink: "#080b12", panel: "#0d111a", panel2: "#111722", line: "#202938", muted: "#8994a7", accent: "#7c5cff", cyan: "#31d7ff", success: "#36d399", warning: "#f7c948", danger: "#ff6b81" },
    boxShadow: { glow: "0 0 40px rgba(124,92,255,.12)" }
  }},
  plugins: []
};
export default config;