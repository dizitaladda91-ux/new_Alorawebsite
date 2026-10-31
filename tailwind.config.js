/** @type {import('tailwindcss').Config} */
export default {
  content: ['./frontend/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FBF7F0',
        sand: '#F1E6D3',
        amber: {
          DEFAULT: '#D98E2B',
          hover: '#C47D1F'
        },
        brown: {
          DEFAULT: '#2B1D14',
          80: 'rgba(43, 29, 20, 0.8)',
          40: 'rgba(43, 29, 20, 0.4)',
          20: 'rgba(43, 29, 20, 0.15)',
          10: 'rgba(43, 29, 20, 0.08)'
        },
        ink: '#2B1D14',
        'ink-light': '#2B1D14',
        'ink-soft': '#2B1D14',
        parchment: '#FBF7F0',
        card: '#FBF7F0',
        clay: '#D98E2B',
        'clay-light': '#D98E2B',
        'clay-dark': '#C47D1F',
        sage: '#D98E2B',
        'sage-light': '#F1E6D3',
        gold: '#D98E2B',
        ash: 'rgba(43, 29, 20, 0.8)'
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Poppins', 'sans-serif'],
        fraunces: ['Poppins', 'sans-serif'],
        roboto: ['Poppins', 'sans-serif']
      }
    }
  }
};
