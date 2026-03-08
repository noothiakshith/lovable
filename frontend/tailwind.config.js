/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'glow': 'glow 2s infinite alternate',
        'flicker': 'flicker 1.5s infinite',
        'gradient': 'gradient 3s ease infinite',
      },
      keyframes: {
        glow: {
          '0%': {
            'box-shadow': '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff00de, 0 0 20px #ff00de',
          },
          '50%': {
            'box-shadow': '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #ff00de, 0 0 40px #ff00de',
          },
          '100%': {
            'box-shadow': '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff00de, 0 0 20px #ff00de',
          },
        },
        flicker: {
          '0%': { opacity: '0.97' },
          '5%': { opacity: '0.9' },
          '10%': { opacity: '1' },
          '15%': { opacity: '0.95' },
          '20%': { opacity: '0.9' },
          '25%': { opacity: '1' },
          '30%': { opacity: '0.98' },
          '100%': { opacity: '1' },
        },
        gradient: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}