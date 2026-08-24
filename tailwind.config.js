/** @type {import('tailwindcss').Config} */

// Lets `accent`, `accent/10`, etc. read live from the --accent CSS variable
// (see src/lib/accent.ts), so the user's accent pick recolors every
// interactive element instantly, including opacity variants.
function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) return `rgb(var(${variable}))`;
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B1330",
        plum: "#3A2350",
        glass: "#150E24",
        ember: "#E8956B",
        rosewood: "#C97B84",
        mist: "#F3E9DD",
        accent: withOpacityValue("--accent"),
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        ui: ["Manrope", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      keyframes: {
        spin_slow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(3%, -2%) scale(1.05)" },
        },
        drift2: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-4%, 3%) scale(1.08)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-1%, -1%)" },
          "30%": { transform: "translate(1%, 1%)" },
          "50%": { transform: "translate(-1%, 1%)" },
          "70%": { transform: "translate(1%, -1%)" },
          "90%": { transform: "translate(-1%, -1%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        spin_slow: "spin_slow 14s linear infinite",
        drift: "drift 22s ease-in-out infinite",
        drift2: "drift2 26s ease-in-out infinite",
        grain: "grain 1.2s steps(4) infinite",
        fadeUp: "fadeUp 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
