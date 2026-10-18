/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffe',
          300: '#7cc2fd',
          400: '#36a2fa',
          500: '#0c85eb',
          600: '#0067c8',
          700: '#0152a2',
          800: '#064685',
          900: '#0b3c6f',
          950: '#07264a',
        }
      }
    },
  },
  plugins: [],
}
