import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "Arial", "sans-serif"],
      },
      colors: {
        // --- PRD Color Tokens ---
        bg: "#0A0A0F",
        surface: "#0F0F18",
        card: "#13131F",
        border: "#1E1E2E",
        border2: "#2D2D44",
        muted: "#4B5563",
        sub: "#6B7280",
        text: "#E2E8F0",
        accent: "#C8F135",
        accentD: "#86EF3C",
        red: "#EF4444",
        amber: "#F59E0B",
        green: "#22C55E",
        blue: "#60A5FA",

        // --- Shadcn UI Compatibility ---
        input: "#2D2D44",
        ring: "#C8F135",
        background: "#0A0A0F",
        foreground: "#E2E8F0",
        primary: {
          DEFAULT: "#C8F135",
          foreground: "#0A0A0F",
        },
        secondary: {
          DEFAULT: "#0F0F18",
          foreground: "#E2E8F0",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#E2E8F0",
        },
        popover: {
          DEFAULT: "#0F0F18",
          foreground: "#E2E8F0",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
