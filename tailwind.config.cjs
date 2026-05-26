/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blossom-pink': '#FFD1DC',
        'sage-mist': '#B2C2A2',
        'creamy-vanilla': '#FFFDF5',
        'charcoal-berry': '#4A4A4A',
        'golden-honey': '#FFD700',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        quicksand: ['"Quicksand"', 'sans-serif'],
      },
      borderRadius: {
        'cute': '2rem',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
