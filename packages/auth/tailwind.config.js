/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('tailwindcss').Config} */
const { safelist } = require('@apptoolkit/ui/dist/tailwind');

module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  plugins: [],
  safelist: [...safelist],
  theme: {
    extend: {},
  },
};
