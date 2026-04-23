import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f9f9f9",
        ink: "#282829",
        teal: "#282829",
        aqua: "#64b5ad",
        mist: "#eeeeee",
        coral: "#4a4a4b",
        leaf: "#282829"
      },
      boxShadow: {
        glow: "0 30px 80px rgba(12, 29, 34, 0.08)",
        premium: "0 20px 40px -15px rgba(15, 23, 32, 0.12)",
        "premium-hover": "0 30px 60px -12px rgba(15, 23, 32, 0.18)"
      },
      animation: {
        "fade-in": "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slow-bounce": "slowBounce 3s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        slowBounce: {
          "0%, 100%": { transform: "translateY(-5%)" },
          "50%": { transform: "translateY(0)" }
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"]
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top left, rgba(40, 40, 41, 0.05), transparent 45%), radial-gradient(circle at 80% 10%, rgba(40, 40, 41, 0.03), transparent 35%), linear-gradient(135deg, #ffffff 0%, #f9f9f9 50%, #f2f2f2 100%)"
      }
    }
  },
  plugins: []
};

export default config;
