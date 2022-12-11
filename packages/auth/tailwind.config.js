/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('tailwindcss').Config} */
const { safelist, theme } = require('@apptoolkit/ui/dist/tailwind');
const colorTheme = require('./colorTheme.json');

module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  plugins: [],
  safelist: [...safelist],
  theme: {
    extend: {
      colors: {
        ...theme.colors,
        background: '#e2e8f0',
        primary: {
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          50: '#f5f3ff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        ...colorTheme,
      },
    },
  },
};
