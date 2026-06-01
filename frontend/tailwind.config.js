/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2329',
        panel: '#f7f7f5',
      },
    },
  },
  plugins: [],
};
