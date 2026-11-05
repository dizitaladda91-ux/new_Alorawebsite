/** @type {import('tailwindcss').Config} */
const palette = (token) => `rgb(var(--${token}-rgb) / <alpha-value>)`;
const shades = (light, main, dark = main) => ({
  DEFAULT: main,
  50: light,
  100: light,
  200: light,
  300: main,
  400: main,
  500: main,
  600: main,
  700: dark,
  800: dark,
  900: dark,
  950: dark
});

export default {
  content: ['./frontend/**/*.{html,js}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      white: palette('bg'),
      black: palette('text'),
      primary: palette('primary'),
      accent: palette('accent'),
      'accent-hover': palette('accent-hover'),
      bg: palette('bg'),
      text: palette('text'),
      'on-brand': palette('on-brand'),
      amber: shades(palette('bg'), palette('accent'), palette('accent-hover')),
      orange: shades(palette('bg'), palette('accent'), palette('accent-hover')),
      yellow: shades(palette('bg'), palette('accent'), palette('accent-hover')),
      gold: shades(palette('bg'), palette('accent'), palette('accent-hover')),
      red: shades(palette('bg'), palette('primary')),
      rose: shades(palette('bg'), palette('primary')),
      pink: shades(palette('bg'), palette('primary')),
      brown: shades(palette('bg'), palette('text')),
      gray: shades(palette('bg'), palette('text')),
      slate: shades(palette('bg'), palette('text')),
      stone: shades(palette('bg'), palette('text')),
      zinc: shades(palette('bg'), palette('text')),
      neutral: shades(palette('bg'), palette('text')),
      green: shades(palette('bg'), palette('primary')),
      emerald: shades(palette('bg'), palette('primary')),
      lime: shades(palette('bg'), palette('primary')),
      teal: shades(palette('bg'), palette('primary')),
      cyan: shades(palette('bg'), palette('primary')),
      sky: shades(palette('bg'), palette('primary')),
      blue: shades(palette('bg'), palette('primary')),
      indigo: shades(palette('bg'), palette('primary')),
      violet: shades(palette('bg'), palette('primary')),
      purple: shades(palette('bg'), palette('primary')),
      fuchsia: shades(palette('bg'), palette('primary')),
      ivory: palette('bg'),
      sand: palette('bg'),
      ink: palette('text'),
      'ink-light': palette('text'),
      'ink-soft': palette('text'),
      parchment: palette('bg'),
      card: palette('bg'),
      clay: palette('accent'),
      'clay-light': palette('accent'),
      'clay-dark': palette('accent-hover'),
      sage: palette('primary'),
      'sage-light': palette('bg'),
      ash: palette('text')
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        serif: ['var(--font-heading)', 'serif'],
        heading: ['var(--font-heading)', 'serif'],
        fraunces: ['var(--font-heading)', 'serif'],
        manrope: ['var(--font-body)', 'sans-serif'],
        roboto: ['var(--font-body)', 'sans-serif']
      }
    }
  }
};
