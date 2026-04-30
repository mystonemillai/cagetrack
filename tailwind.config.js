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
              DEFAULT: '#0A0B0D',
              light: '#161719',
            },
            wheat: {
              DEFAULT: '#C4603C',
              dim: 'rgba(196, 96, 60, 0.15)',
            },
            offwhite: '#EAEAEA',
            slate: '#D4C5A9',
          },
          fontFamily: {
            display: ['Syne', 'sans-serif'],
            body: ['DM Sans', 'sans-serif'],
          },
    },
  },
  plugins: [],
};
