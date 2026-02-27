/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ffd700',
        dark: {
          100: '#2a2a3e',
          200: '#1a1a2e',
          300: '#0f0f1a',
        },
        rarity: {
          common: '#9ca3af',
          rare: '#3b82f6',
          epic: '#a855f7',
          legendary: '#fbbf24',
        },
      },
    },
  },
  plugins: [],
};