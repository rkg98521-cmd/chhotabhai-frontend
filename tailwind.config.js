/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-black': '#ffffff',      // Re-mapped to pure white
        'brand-card': '#ffffff',       // Pure white cards
        'brand-surface': '#f8fafc',    // Clean slate-50 surface
        'brand-border': '#e2e8f0',     // Slate-200 border
        'brand-red': '#e11d48',        // Crimson rose accent
        'brand-red-hover': '#be123c',  // Deeper crimson hover
        'brand-gray': '#f1f5f9',       // Slate-100 neutral
        'brand-text': '#0f172a',       // Deep slate-900 typography
        'brand-text-dim': '#475569',   // Slate-600 subtext
        'brand-muted': '#64748b',      // Slate-500 secondary text
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 4px 20px -2px rgba(225, 29, 72, 0.25)',
        'glow-red-sm': '0 2px 10px -1px rgba(225, 29, 72, 0.18)',
        'card-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
