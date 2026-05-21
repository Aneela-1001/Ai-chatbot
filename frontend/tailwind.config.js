import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0f17",
        panel: "#111827",
        line: "#243047",
        brand: "#38bdf8",
        mint: "#34d399",
        rose: "#fb7185"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: [typography]
};
