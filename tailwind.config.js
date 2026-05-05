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
              DEFAULT: '#111827',
              light: '#1F2937',
            },
            wheat: {
              DEFAULT: '#F97316',
              dim: 'rgba(249, 115, 22, 0.15)',
            },
            offwhite: '#F9FAFB',
            slate: '#E5E7EB',
          },
          fontFamily: {
            display: ['Syne', 'sans-serif'],
            body: ['DM Sans', 'sans-serif'],
          },
    },
  },
  plugins: [],
};
