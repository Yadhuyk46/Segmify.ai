export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#eef4ff",
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490"
        },
        accent: "#f97316",
        slatecard: "#111827"
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["DM Sans", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 80px rgba(15, 23, 42, 0.12)"
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at top left, rgba(6,182,212,0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(249,115,22,0.16), transparent 28%)"
      }
    },
  },
  plugins: [],
};
