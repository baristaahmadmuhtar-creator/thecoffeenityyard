/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'flag-red': '#CA222A',
        'old-lace': '#FDF2E3',
        'flag-red-2': '#BE292D',
        'tomato-jam': '#C82B31',
        'almond-silk': '#F8DACE',
      },
      fontFamily: {
        sans: ['"BBH Hegarty"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}