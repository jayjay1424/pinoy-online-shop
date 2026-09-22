/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alabaster: {
          50: '#FFFFFF',
          100: '#FAF8F5',
          200: '#F2ECE4',
          300: '#E5DBD0',
        },
        espresso: {
          800: '#341E15',
          900: '#24140E',
          950: '#180D09',
        },
        chestnut: {
          500: '#7E4F2D',
          600: '#5C3A21',
          700: '#432916',
        },
        vachetta: {
          400: '#A67C52',
          500: '#8C5A3C',
          600: '#6D442C',
        },
        pandan: {
          300: '#EAD7B2',
          400: '#D8B781',
          500: '#BF985A',
        },
        brass: {
          400: '#D8B277',
          500: '#C4975D',
          600: '#A6793F',
        },
        taupe: {
          400: '#8A776C',
          500: '#6E5D53',
          600: '#55463E',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Montserrat"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Cabin"', '"Montserrat"', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 20px 40px -15px rgba(92, 58, 33, 0.08)',
        'warm-lg': '0 25px 50px -12px rgba(36, 20, 14, 0.15)',
        'glass': '0 8px 32px 0 rgba(92, 58, 33, 0.05)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}

