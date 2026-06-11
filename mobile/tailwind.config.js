/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
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
        white: "#FFFFFF",
      },
      fontFamily: {
        display: ["Poppins_500Medium"],
        body: ["DMSans_400Regular"],
        bodyMedium: ["DMSans_500Medium"],
      },
      fontSize: {
        display: ["40px", { lineHeight: "44px" }],
        h1: ["28px", { lineHeight: "34px" }],
        h2: ["22px", { lineHeight: "28px" }],
        h3: ["18px", { lineHeight: "24px" }],
        "body-l": ["16px", { lineHeight: "24px" }],
        "body-m": ["14px", { lineHeight: "20px" }],
        button: ["15px", { lineHeight: "20px" }],
        label: ["12px", { lineHeight: "16px" }],
        caption: ["11px", { lineHeight: "16px" }],
        tiny: ["10px", { lineHeight: "14px" }],
      },
      borderRadius: {
        card: "16px",
        soft: "12px",
        pill: "999px",
      },
      minHeight: {
        touch: "44px",
        button: "44px",
      },
      spacing: {
        4.5: "18px",
        11: "44px",
      },
      letterSpacing: {
        label: "0.96px",
      },
    },
  },
  plugins: [],
};
