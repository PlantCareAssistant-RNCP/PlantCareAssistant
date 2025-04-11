import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        leaf: "var(--color-leaf)", // Light Green - Success Color
        plant: "var(--color-plant)", // Medium Green - Primary Brand Color
        teal: "var(--color-teal)", // Teal - Accent Color
        dark: "var(--color-dark)", // Dark Teal - Deep UI Elements
        darkest: "var(--color-darkest)", // Deep Navy - Background, Text
        // "Primary" and "secondary" should be used for neutral, foundational colors (like black, white, gray, navy).
        // Vibrant greens/teals are better suited as accents or theme colors rather than primary.
        // Naming colors based on their use (e.g., "leaf", "teal", "navy") makes your code more readable.
      },
    },
  },
  plugins: [],
} satisfies Config;
