import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
        primary: "#FFFFFF",
        "primary-hover": "#E0E0E0",
        secondary: "#A0A0A0",
        accent: "#C8FF00",
        "accent-hover": "#B8EF00",
        surface: "#0A0A0A",
        "surface-hover": "#141414",
        "surface-light": "#1A1A1A",
        muted: "#71717A",
        gold: "#FFD700",
        success: "#22C55E",
        error: "#EF4444",
        border: "#1E1E1E",
        "border-light": "#2A2A2A",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "Geist", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "marquee": "marquee 30s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
