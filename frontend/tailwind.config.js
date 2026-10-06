/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        luxury: {
          gold: '#d4af37',
          darkGold: '#b8860b',
          lightGold: '#f0e68c',
        },
        accent: {
          blue: '#3b82f6',
          green: '#10b981',
          red: '#ef4444',
        }
      },
      fontFamily: {
        display: ['Segoe UI', 'Tahoma', 'sans-serif'],
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      boxShadow: {
        'luxury': '0 10px 30px rgba(0, 0, 0, 0.1)',
        'luxury-lg': '0 20px 40px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
