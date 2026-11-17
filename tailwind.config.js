/** @type {import('tailwindcss').Config} */
export default {
  content: ['./frontend/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F2EBDA',
        sand: '#E8DEC8',
        amber: {
          DEFAULT: '#D98E2B',
          hover: '#D98E2B'
        },
        brown: {
          DEFAULT: '#3B2418',
          80: 'rgba(59, 36, 24, 0.8)',
          40: 'rgba(59, 36, 24, 0.4)',
          20: 'rgba(59, 36, 24, 0.15)',
          10: 'rgba(59, 36, 24, 0.08)'
        },
        ink: '#3B2418',
        'ink-light': '#3B2418',
        'ink-soft': '#3B2418',
        parchment: '#F2EBDA',
        card: '#F2EBDA',
        'btn-blue': '#8EC5FF',
        'btn-blue-hover': '#6FB3F5',
        'btn-blue-active': '#5AA3EA',
        'baby-blue': '#8EC5FF',
        'baby-blue-soft': '#E3F1FF',
        'baby-blue-deep': '#2F7ACC',
        'baby-blue-text': '#205D96',
        clay: '#D98E2B',
        'clay-light': '#D98E2B',
        'clay-dark': '#205D96',
        sage: '#205D96',
        'sage-light': '#E3F1FF',
        gold: '#D98E2B',
        ash: 'rgba(59, 36, 24, 0.8)'
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Cormorant-Fallback', 'Georgia', 'serif'],
        sans: ['Jost', 'Jost-Fallback', 'Arial', 'sans-serif'],
        roboto: ['Roboto Mono', 'monospace'],
        fraunces: ['"Cormorant Garamond"', 'Cormorant-Fallback', 'Georgia', 'serif']
      }
    }
  }
};
