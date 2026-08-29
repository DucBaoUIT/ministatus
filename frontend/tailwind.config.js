/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        base: {
          950: "#0a0d12",
          900: "#0f131a",
          850: "#131822",
          800: "#181f2b",
          700: "#242c3a",
          600: "#37414f",
          400: "#7c8798",
          200: "#c4cbd6",
        },
      },
    },
  },
  plugins: [],
};
