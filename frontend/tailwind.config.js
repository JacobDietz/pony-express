/** @type {import('tailwindcss').Config} */
// tailwind.config.js

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Roboto', 'sans-serif'],
        title: ['"Bebas Neue"', 'cursive'],
      },
      colors: {
        sage: '#D4D2A5',
        'c-light-blue': '#8FA6CB',
        'c-darker-blue': '#4C5B5C',
        'c-bright-tan': '#DBF4A7',
      },
    },
  },
  plugins: [],
};
