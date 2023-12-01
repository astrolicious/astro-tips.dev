import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fcf5ff",
          100: "#f7e9fe",
          200: "#efd7fd",
          300: "#e3b8fa",
          400: "#d28af6",
          500: "#bc52ee",
          600: "#af3ce1",
          700: "#972ac6",
          800: "#7e28a1",
          900: "#672182",
          950: "#480c5f",
        },
        gray: {
          50: "#f6f7f9",
          100: "#edeef1",
          200: "#d7dae0",
          300: "#b4bac5",
          400: "#8b95a5",
          500: "#6c778b",
          600: "#576072",
          700: "#474e5d",
          800: "#3d434f",
          900: "#343841",
          950: "#24262d",
        },
      },
      fontFamily: {
        sans: ["Inter Variable", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono Variable", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
