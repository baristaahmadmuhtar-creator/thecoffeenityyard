/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'flag-red': '#CA222A', // Base Red from Logo Background
        'old-lace': '#FDF2E3', // Cream from Logo Text
        'flag-red-dark': '#A0181F', // Darker shade for active states
        'pastry-yellow': '#F4D03F', // Golden yellow from the pastry icon
        'almond-silk': '#F8DACE',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        heading: ['"DM Serif Display"', 'serif'],
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [],
}