import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f1419',      // Dark background
        surface: '#1a1f29',         // Lighter surface
        primary: '#00d4aa',         // Teal (Darvis brand)
        success: '#10b981',         // Green
        error: '#ef4444',           // Red
        warning: '#f59e0b',         // Orange
        'text-primary': '#f9fafb',  // Off-white
        'text-secondary': '#9ca3af',// Gray
      },
    },
  },
} satisfies Config;
