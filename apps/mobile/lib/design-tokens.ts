/**
 * Design Tokens
 *
 * Centralized design system constants for colors, spacing, typography, and other design primitives.
 * These tokens align with the Tailwind configuration and should be used for any non-Tailwind styling needs.
 */

export const colors = {
  primary: {
    50: '#FFF5F5',
    100: '#FFE5E5',
    200: '#FFCCCC',
    300: '#FFB3B3',
    400: '#FF8E8E',
    500: '#FF6B6B', // Main primary (warm coral)
    600: '#E65555',
    700: '#CC4444',
    800: '#B33333',
    900: '#992222',
  },
  secondary: {
    50: '#F5F3F7',
    100: '#EBE7EF',
    200: '#D7CFE0',
    300: '#C3B7D0',
    400: '#B8A4D3',
    500: '#9B7EBD', // Main secondary (soft purple)
    600: '#8B6EAD',
    700: '#7B5E9D',
    800: '#6B4E8D',
    900: '#5B3E7D',
  },
  accent: {
    50: '#FFFEF0',
    100: '#FFFCE0',
    200: '#FFF9C2',
    300: '#FFF5A3',
    400: '#FFF085',
    500: '#FFD93D', // Main accent (warm yellow)
    600: '#FFC93C',
    700: '#E6B634',
    800: '#CCA32D',
    900: '#B39026',
  },
  neutral: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#868E96',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 8,
  },
} as const;
