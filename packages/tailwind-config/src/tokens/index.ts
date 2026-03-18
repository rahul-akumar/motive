/**
 * Motive Design Tokens
 *
 * These tokens define the visual language of the Motive design system.
 * They are consumed by the Tailwind preset to generate utility classes.
 */

export const tokens = {
  colors: {
    // Brand
    primary: {
      DEFAULT: '#1B4DFF',
      50: '#EBF0FF',
      100: '#D6E0FF',
      200: '#ADC1FF',
      300: '#85A3FF',
      400: '#5C84FF',
      500: '#1B4DFF',
      600: '#0037E6',
      700: '#002AB3',
      800: '#001D80',
      900: '#00104D',
    },
    secondary: {
      DEFAULT: '#6B7280',
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Semantic
    success: {
      DEFAULT: '#10B981',
      50: '#ECFDF5',
      500: '#10B981',
      700: '#047857',
    },
    warning: {
      DEFAULT: '#F59E0B',
      50: '#FFFBEB',
      500: '#F59E0B',
      700: '#B45309',
    },
    danger: {
      DEFAULT: '#EF4444',
      50: '#FEF2F2',
      500: '#EF4444',
      700: '#B91C1C',
    },
    info: {
      DEFAULT: '#3B82F6',
      50: '#EFF6FF',
      500: '#3B82F6',
      700: '#1D4ED8',
    },

    // UI
    background: '#FFFFFF',
    foreground: '#111827',
    muted: '#F3F4F6',
    border: '#E5E7EB',
    ring: '#1B4DFF',
  },

  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },

  fontSize: {
    '2xs': ['0.5rem', { lineHeight: '0.75rem' }],
    xs: ['0.6875rem', { lineHeight: '1rem' }],
    sm: ['0.8125rem', { lineHeight: '1.25rem' }],
    base: ['0.9375rem', { lineHeight: '1.5rem' }],
    md: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.25rem', { lineHeight: '1.75rem' }],
    xl: ['1.75rem', { lineHeight: '2rem' }],
    '2xl': ['2rem', { lineHeight: '2.5rem' }],
    '3xl': ['3rem', { lineHeight: '3.5rem' }],
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  lineHeight: {
    none: '1',
    tight: '1.3',
    snug: '1.4',
    normal: '1.5',
    relaxed: '1.6',
  },

  letterSpacing: {
    tighter: '-0.01em',
    tight: '0.02em',
    normal: '0.03em',
    wide: '0.04em',
    wider: '0.06em',
    widest: '0.08em',
    loose: '0.10em',
    looser: '0.12em',
    loosest: '0.14em',
  },

  borderRadius: {
    none: '0',
    sm: '0.25rem',
    DEFAULT: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
} as const
