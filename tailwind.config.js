/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1C2B35',
          light: '#253844',
        },
        wheat: {
          DEFAULT: '#D4A96A',
          dim: 'rgba(212, 169, 106, 0.15)',
        },
        offwhite: '#F7F3ED',
        slate: '#3D4F5C',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
