import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#122117",
        moss: "#264733",
        sand: "#f4efe4",
        ember: "#b85c38",
        leaf: "#d7e5c7"
      }
    }
  },
  plugins: []
};

export default config;
