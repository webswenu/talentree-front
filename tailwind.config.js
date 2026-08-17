/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores Corporativos - Naranja
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Naranja principal
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Colores Corporativos - Turquesa
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Turquesa principal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Colores de acento adicionales
        accent: {
          purple: '#a855f7',
          pink: '#ec4899',
          yellow: '#eab308',
          green: '#22c55e',
          blue: '#3b82f6',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-corporate': 'linear-gradient(135deg, #f97316 0%, #14b8a6 100%)',
        'gradient-corporate-alt': 'linear-gradient(135deg, #14b8a6 0%, #f97316 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      // Las animaciones animate-fade-in, animate-slide-up y animate-float
      // se definen en src/index.css. No duplicarlas aquí: las utilidades que
      // genera Tailwind pertenecen a una capa posterior y pisarían la
      // definición de index.css con otra duración y otros keyframes.
    },
  },
  plugins: [],
}
