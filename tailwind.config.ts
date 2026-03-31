import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#d8e7ff",
          200: "#b9d4ff",
          300: "#8bb8ff",
          400: "#568fff",
          500: "#2d68f3",
          600: "#1d4fd6",
          700: "#1b42ad",
          800: "#1c3888",
          900: "#1d316b"
        },
        surface: "#f6f8fb",
        ink: "#0f172a",
        success: "#047857",
        warning: "#d97706",
        danger: "#b91c1c"
      },
      boxShadow: {
        panel: "0 12px 35px -18px rgba(15, 23, 42, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
