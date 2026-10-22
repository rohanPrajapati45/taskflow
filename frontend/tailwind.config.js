/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      colors: {
        ink: '#080b10',
        panel: '#10151d',
        line: '#202a36',
        cyan: '#00D9FF'
      }
    }
  },
  plugins: []
};
