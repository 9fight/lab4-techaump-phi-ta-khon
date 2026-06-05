import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Thai"', "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 32px rgba(110, 87, 255, 0.34)",
        cyan: "0 0 34px rgba(45, 212, 253, 0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
