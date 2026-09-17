import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        midnight: "#07090E",
        surface: "rgba(13, 17, 26, 0.85)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "#b64e28",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
        },
        tertiary: {
          DEFAULT: "var(--tertiary)",
          foreground: "var(--tertiary-foreground)",
        },
        // Kinfolk Academic First-Class Color Tokens
        "on-surface": "#1d1b19",
        "on-surface-variant": "#3d3430",
        "on-primary": "#ffffff",
        "primary-container": "#ffdbcf",
        "on-primary-container": "#390c00",
        "secondary-container": "#c6edc1",
        "on-secondary-container": "#022106",
        "tertiary-container": "#ffdcbc",
        "on-tertiary-container": "#2c1700",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f8f2ef",
        "surface-container": "#f3ede9",
        "surface-container-high": "#ede7e3",
        "surface-container-highest": "#e7e1de",
        "outline-variant": "#dec0b7",
        terracotta: {
          DEFAULT: "#c85a32",
          dark: "#9f3c16",
          light: "#f8efea",
        },
        sage: {
          DEFAULT: "#6b8e68",
          dark: "#456644",
          light: "#eef3ed",
        },
        amber: {
          DEFAULT: "#d98e32",
          dark: "#854f00",
          light: "#fbf4e8",
        },
        sand: "#efece6",
        stone: {
          DEFAULT: "#e6e4dd",
          border: "#dec0b7",
        },
        charcoal: {
          DEFAULT: "#1d1b19",
          dark: "#242220",
        },
        apple: {
          canvas: "#090A0C",
          surface1: "#111215",
          surface2: "#17181D",
          blue: "#0A84FF",
          emerald: "#30D158",
          amber: "#FF9F0A",
          crimson: "#FF453A",
          primary: "#F5F5F7",
          secondary: "#86868B",
          hairline: "#48484A",
        },
        atelier: {
          paper: "#FBF9F5",
          oatmeal: "#F5F1E9",
          card: "#EFE9DF",
          ink: "#132219",
          sage: "#3D5245",
          olive: "#697D72",
          stone: "#E5DDD0",
          terracotta: "#C85A32",
          fadedTerracotta: "#E88965",
          hunter: "#2D5A43",
          ochre: "#9C6328",
          night: "#111614",
          bookcloth: "#17201D",
          slate: "#1F2B26",
          cream: "#F2EFE9",
          nightBorder: "rgba(229, 221, 208, 0.12)",
        },
      },
      boxShadow: {
        specular: "inset 0 1px 0 0 rgba(255, 255, 255, 0.06)",
        "apple-elevated": "0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        stationery: "0 4px 20px -2px rgba(36, 34, 32, 0.04), 0 2px 6px -1px rgba(36, 34, 32, 0.02)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        full: "9999px",
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Product Sans"',
          '"Google Sans"',
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: ['"Newsreader"', '"Playfair Display"', '"Product Sans"', '"SF Pro Display"', "Georgia", "serif"],
        serif: ['"Newsreader"', '"Playfair Display"', "Georgia", "Cambria", '"Times New Roman"', "serif"],
        mono: ['"JetBrains Mono"', "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "aurora-1": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(80px, 60px, 0) scale(1.15)" },
          "100%": { transform: "translate3d(-60px, 120px, 0) scale(0.95)" },
        },
        "aurora-2": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(-100px, -50px, 0) scale(1.1)" },
          "100%": { transform: "translate3d(50px, 80px, 0) scale(0.9)" },
        },
        "aurora-3": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(60px, -80px, 0) scale(1.2)" },
          "100%": { transform: "translate3d(-50px, -40px, 0) scale(1)" },
        },
        "aurora-4": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(-70px, 50px, 0) scale(1.1)" },
          "100%": { transform: "translate3d(60px, -60px, 0) scale(0.95)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "aurora-1": "aurora-1 22s ease-in-out infinite alternate",
        "aurora-2": "aurora-2 26s ease-in-out infinite alternate",
        "aurora-3": "aurora-3 20s ease-in-out infinite alternate",
        "aurora-4": "aurora-4 28s ease-in-out infinite alternate-reverse",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
      transitionTimingFunction: {
        "apple-ease": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
