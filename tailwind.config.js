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
              DEFAULT: '#1E1B17',
              light: '#2A2620',
            },
            wheat: {
              DEFAULT: '#C4603C',
              dim: 'rgba(196, 96, 60, 0.15)',
            },
            offwhite: '#EDE5D8',
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
