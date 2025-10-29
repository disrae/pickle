/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#000000",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#1E40AF", // blue-700 - deeper tennis court blue
          foreground: "#FFFFFF",
        },
        background: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        foreground: {
          DEFAULT: "#000000",
          muted: "#737373",
        },
        muted: {
          DEFAULT: "#737373",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444", // red-500
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#22C55E", // green-500
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#EAB308", // yellow-500
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "#3B82F6", // blue-500
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        accent: {
          DEFAULT: "#F5F5F5",
          foreground: "#000000",
        },
        border: {
          DEFAULT: "#E5E7EB",
          foreground: "#000000",
        },
        input: {
          DEFAULT: "#E5E7EB",
          foreground: "#000000",
        },
        toggle: {
          active: "#2D2D2D",
          "active-foreground": "#FFFFFF",
          border: "#E5E7EB",
        },
        "court-red": {
          DEFAULT: "#B91C1C", // Tennis court clay red
          foreground: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
