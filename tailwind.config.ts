
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Enables dark mode based on a 'dark' class on the HTML element
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}", // Adjusted to include src/app
    "./components/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}", // Adjusted to include src/components
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        akshu: {
          saffron: "#FF9933",
          white: "#FFFFFF",
          green: "#138808",
          blue: "#0052A5",
          dark: "#1C1C1C",
        },
        prabh: {
          primary: "#FF9933", // Saffron Orange for Prabh's primary
          secondary: "#0052A5", // Ashoka Blue for Prabh's secondary
          accent: "#FFCC70",   // Lighter Saffron for accents
          background: "#F5F5F5", // Light gray for background (light mode)
          surface: "#FFFFFF",    // White for card surfaces (light mode)
          text: "#1C1C1C",        // Dark text for light mode
          muted: "#888888",       // Muted text
        },
        // Dark mode colors (example, can be refined)
        dark_prabh: {
          primary: "#FFB366", // Lighter Saffron for dark mode primary
          secondary: "#4D82B8", // Lighter Ashoka Blue for dark mode secondary
          accent: "#FFD699",   // Even lighter Saffron accent for dark mode
          background: "#1C1C1C", // Very dark gray/black for background (dark mode)
          surface: "#2A2A2A",    // Darker surface for cards (dark mode)
          text: "#E0E0E0",        // Light gray text for dark mode
          muted: "#A0A0A0",       // Muted text for dark mode
        }
      },
      fontFamily: {
        headline: ['"Baloo 2"', "cursive"],
        body: ['"Poppins"', "sans-serif"],
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 6px 12px rgba(0, 0, 0, 0.08)",
        dark_card: "0 6px 12px rgba(255, 153, 51, 0.1)" // Example for dark mode
      },
      backgroundImage: {
        "hero-pattern": "url('/assets/india-motif-bg.svg')",
        "lotus-shade": "url('/assets/lotus-texture.png')",
      },
    },
  },
  plugins: [require("tailwindcss-animate")], // Kept tailwindcss-animate
};

export default config;
