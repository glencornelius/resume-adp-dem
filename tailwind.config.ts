import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        luxury: {
          navy: "#0a1022",
          ink: "#05070f",
          gold: "#d4b273",
          champagne: "#f7e7c0",
          blue: "#4f74ff"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(212,178,115,.35), 0 15px 40px rgba(10,16,34,.45)",
        soft: "0 8px 30px rgba(7,10,25,.35)"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        "fade-up": "fade-up .7s ease-out forwards",
        shimmer: "shimmer 2.8s linear infinite"
      },
      fontFamily: {
        display: ["\"Playfair Display\"", "serif"],
        body: ["\"Manrope\"", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
