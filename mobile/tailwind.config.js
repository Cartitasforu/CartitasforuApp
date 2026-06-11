/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bgPink: "#FFD6E0",
        bgSoft: "#FFF0F4",
        primary: "#FF6B8B",
        primaryDeep: "#C9477E",
        primaryMid: "#FF9BB5",
        warmCream: "#FFF3DC",
        lavender: "#E8D5F5",
        peach: "#FFE4CC",
        wineDark: "#3D2030",
        roseGray: "#8C5A6B",
        roseBorder: "#F2C2CE",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      fontSize: {
        display: ["2.5rem", { lineHeight: "2.75rem", fontWeight: "500" }], // 40 / 44
        h1: ["1.75rem", { lineHeight: "2.125rem", fontWeight: "500" }], // 28 / 34
        h2: ["1.375rem", { lineHeight: "1.75rem", fontWeight: "500" }], // 22 / 28
        h3: ["1.125rem", { lineHeight: "1.5rem", fontWeight: "500" }], // 18 / 24
        "body-l": ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }], // 16 / 24
        "body-m": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }], // 14 / 20
        button: ["0.9375rem", { lineHeight: "1.25rem", fontWeight: "500" }], // 15 / 20
        label: ["0.75rem", { lineHeight: "1rem", fontWeight: "500" }], // 12 / 16
        caption: ["0.6875rem", { lineHeight: "1rem", fontWeight: "400" }], // 11 / 16
        tiny: ["0.625rem", { lineHeight: "0.875rem", fontWeight: "500" }], // 10 / 14
      },
      borderRadius: {
        card: "16px",
        pill: "9999px",
      },
      minHeight: {
        touch: "44px",
        button: "48px",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
        12: "48px",
      },
    },
  },
  plugins: [],
};
