/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        indigo: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#adc0fa',
          400: '#8ca7f7',
          500: '#6b8ef4',
          600: '#4a75f1',
          700: '#295ced',
          800: '#0843ea',
          900: '#0636bb',
        }
      }
    },
  },
  plugins: [],
}
