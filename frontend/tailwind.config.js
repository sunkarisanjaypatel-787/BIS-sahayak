/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bis: {
          blue: "#0a3161",
          blueDark: "#072449",
          red: "#e31e24",
          darkblue: "#0a3161",
          teal: "#287581",
          saffron: "#F5B74C",
          offwhite: "#fffdf3",
        },
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        devanagari: ["Noto Sans Devanagari", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(33, 44, 88, 0.06), 0 1px 3px 0 rgba(33, 44, 88, 0.08)",
        header: "0 1px 0 0 rgba(33, 44, 88, 0.08)",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        blink: "blink 1s step-start infinite",
        "fade-in": "fade-in 0.2s ease-out",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
