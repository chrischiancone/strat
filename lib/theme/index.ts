/**
 * Enterprise Theme Configuration
 * Design system for the Strategic Planning application
 */

export const theme = {
  colors: {
    // Primary Blue-Gray (Professional government aesthetic)
    primary: {
      50: '#f0f4f8',
      100: '#d9e2ec',
      200: '#bcccdc',
      300: '#9fb3c8',
      400: '#829ab1',
      500: '#627d98',
      600: '#486581',
      700: '#334e68',
      800: '#243b53',
      900: '#102a43',
    },
    // Accent Green (Civic, positive actions)
    accent: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    // Semantic colors
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'Monaco', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
      base: ['1rem', { lineHeight: '1.5rem' }], // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
      '3xl': ['2rem', { lineHeight: '2.5rem' }], // 32px
      '4xl': ['2.5rem', { lineHeight: '3rem' }], // 40px
      '5xl': ['3rem', { lineHeight: '3.5rem' }], // 48px
      '6xl': ['3.75rem', { lineHeight: '1' }], // 60px
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    // 4px base unit
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
  },
  borderRadius: {
    none: '0px',
    sm: '2px',
    DEFAULT: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
  },
  boxShadow: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },
  animation: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const

export type Theme = typeof theme

// Component variants
export const componentVariants = {
  button: {
    primary: {
      base: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
      disabled: 'bg-primary-300 text-white cursor-not-allowed',
    },
    secondary: {
      base: 'bg-white text-primary-700 border border-primary-300 hover:bg-primary-50',
      disabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
    },
    success: {
      base: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800',
      disabled: 'bg-accent-300 text-white cursor-not-allowed',
    },
    danger: {
      base: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      disabled: 'bg-red-300 text-white cursor-not-allowed',
    },
    ghost: {
      base: 'text-primary-700 hover:bg-primary-50 hover:text-primary-800',
      disabled: 'text-gray-400 cursor-not-allowed',
    },
  },
  badge: {
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    error: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    neutral: 'bg-gray-100 text-gray-800 border border-gray-200',
  },
  card: {
    base: 'bg-white rounded-lg border border-gray-200 shadow-sm',
    hover: 'hover:shadow-md transition-shadow duration-200',
    interactive: 'cursor-pointer hover:border-primary-300',
  },
  input: {
    base: 'border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    disabled: 'bg-gray-50 text-gray-500 cursor-not-allowed',
  },
  table: {
    header: 'bg-gray-50 border-b border-gray-200',
    row: 'border-b border-gray-100 hover:bg-gray-50',
    rowAlternate: 'bg-gray-50 border-b border-gray-100 hover:bg-gray-100',
  },
} as const

// Status colors mapping
export const statusColors = {
  // Initiative/Project statuses
  NOT_STARTED: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
  },
  IN_PROGRESS: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  COMPLETED: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  ON_HOLD: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  CANCELLED: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  // Priority levels
  NEED: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  WANT: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  NICE_TO_HAVE: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  // Funding statuses
  secured: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  requested: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  projected: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
} as const

// Utility functions
export function getStatusColor(status: keyof typeof statusColors) {
  return statusColors[status] || statusColors.NOT_STARTED
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}
