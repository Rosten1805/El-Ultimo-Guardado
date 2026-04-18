import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // tiken dark palette
        surface: {
          DEFAULT: "#131313",
          elevated: "#1a1a1a",
          modal: "#0d0d0d",
        },
        border: {
          DEFAULT: "rgba(151,151,151,0.34)",
          hover: "rgba(255,255,255,0.8)",
          glass: "rgba(255,255,255,0.1)",
        },
        text: {
          primary: "#ffffff",
          muted: "rgba(255,255,255,0.6)",
          dim: "rgba(255,255,255,0.3)",
        },
        accent: {
          orange: "#ff6b35",
          green: "#4ade80",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "#000000b0 0 26px 30px -10px, #000000ba 0 16px 10px -10px",
        "card-hover": "#000c 0 40px 58px -16px, #000000b8 0 30px 22px -10px",
        modal: "0 20px 60px rgba(0,0,0,0.75)",
      },
      backdropBlur: {
        xs: "4px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
        shimmer: "shimmer 2s infinite",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
