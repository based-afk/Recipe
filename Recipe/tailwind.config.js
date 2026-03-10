/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#141414",
        "surface-hover": "#1f1f1f",
        border: "#2a2a2a",
        accent: "#f5c518",
        "accent-hover": "#e6b800",
        "text-primary": "#ffffff",
        "text-secondary": "#a0a0a0",
        "text-muted": "#555555",
      },
      fontFamily: {
        heading: ['"Playfair Display"', "serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
