import { extendTheme } from '@chakra-ui/react'

/*
 * Refined terminal theme.
 * Body text is a humanist sans for readability; headings, labels, and anything
 * "terminal" stay monospace so the site keeps its hacker soul.
 * Base color scales are tuned so existing `gray.*` / `cyan.*` / `yellow.*`
 * usages resolve to the deep blue-black + Nord frost palette.
 */

const fonts = {
  body: "'Inter Variable', 'Noto Sans SC', ui-sans-serif, system-ui, -apple-system, 'PingFang SC', 'Segoe UI', sans-serif",
  heading:
    "'JetBrains Mono Variable', ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  mono: "'JetBrains Mono Variable', ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
}

const colors = {
  gray: {
    50: '#f6f4ef',
    100: '#efece4',
    200: '#e3dfd3',
    300: '#c9c5bb',
    400: '#a09eae',
    500: '#6b727d',
    600: '#4c525e',
    700: '#31303c',
    800: '#1e1c26',
    900: '#16151c',
  },
  cyan: {
    50: '#eef1fd',
    100: '#dbe2fb',
    200: '#bccbf9',
    300: '#a8bbf7',
    400: '#8aa2f2',
    500: '#5c78e0',
    600: '#3a5fd9',
    700: '#2542a6',
    800: '#1d3480',
    900: '#162761',
  },
  yellow: {
    50: '#fdf9ef',
    100: '#faf0d7',
    200: '#f4e0b0',
    300: '#eed28f',
    400: '#e5c07b',
    500: '#c99f52',
    600: '#a37b2c',
    700: '#7d5d20',
    800: '#5c4517',
    900: '#443311',
  },
  green: {
    50: '#f2f8ee',
    100: '#e2efd8',
    200: '#c8dfb5',
    300: '#b5d29b',
    400: '#a3be8c',
    500: '#7da55f',
    600: '#5d8543',
    700: '#476633',
    800: '#354d26',
    900: '#28391d',
  },
}

/* Per-mode tokens — use these in components when raw scale colors would break
 * contrast in one of the modes (e.g. `color="accent"` instead of `cyan.400`). */
const semanticTokens = {
  colors: {
    accent: { default: '#3a5fd9', _dark: '#8aa2f2' },
    accentStrong: { default: '#2542a6', _dark: '#a8bbf7' },
    accentSubtle: { default: 'rgba(58,95,217,0.09)', _dark: 'rgba(138,162,242,0.13)' },
    prompt: { default: '#be4519', _dark: '#f0925e' },
    warm: { default: '#8a3bb0', _dark: '#b877dd' },
    surface: { default: '#fffefb', _dark: '#1a1920' },
    surfaceElevated: { default: '#ffffff', _dark: '#211f2a' },
    surfaceHeader: { default: '#f0ece3', _dark: '#1d1b24' },
    borderSubtle: { default: 'rgba(76,66,43,0.18)', _dark: 'rgba(160,158,180,0.15)' },
    borderStrong: { default: 'rgba(76,66,43,0.3)', _dark: 'rgba(160,158,180,0.3)' },
    textPrimary: { default: '#181a1f', _dark: '#eceaf2' },
    textSecondary: { default: '#565d68', _dark: '#a09eae' },
    textMuted: { default: '#807d73', _dark: '#6c6a78' },
  },
}

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fonts,
  colors,
  semanticTokens,
  styles: {
    global: {
      body: {
        bg: 'var(--bg-color)',
        color: 'var(--text-color)',
        fontSize: '15px',
        lineHeight: 1.7,
      },
      '*:focus-visible': {
        outline: '2px solid var(--accent-color)',
        outlineOffset: '2px',
      },
    },
  },
  shadows: {
    outline: '0 0 0 3px var(--accent-light)',
  },
  components: {
    Button: {
      baseStyle: {
        fontFamily: 'mono',
        fontWeight: '500',
        borderRadius: '8px',
      },
      variants: {
        solid: {
          bg: 'var(--accent-color)',
          color: 'var(--bg-color)',
          _hover: {
            bg: 'var(--accent-strong)',
            transform: 'translateY(-1px)',
            boxShadow: 'var(--glow-accent)',
          },
          _active: { transform: 'translateY(0)' },
        },
        outline: {
          border: '1px solid',
          borderColor: 'var(--border-strong)',
          color: 'var(--text-color)',
          _hover: {
            bg: 'var(--hover-color)',
            borderColor: 'var(--accent-color)',
          },
        },
        ghost: {
          color: 'var(--secondary-text)',
          _hover: {
            bg: 'var(--hover-color)',
            color: 'var(--text-color)',
          },
        },
      },
    },
    Link: {
      baseStyle: {
        color: 'var(--accent-color)',
        transition: 'color 0.15s ease, opacity 0.15s ease',
        _hover: {
          textDecoration: 'none',
          color: 'var(--accent-strong)',
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '600',
        color: 'var(--text-color)',
        letterSpacing: '-0.01em',
      },
    },
    Badge: {
      baseStyle: {
        fontFamily: 'mono',
        fontWeight: '600',
        letterSpacing: '0.04em',
        borderRadius: '6px',
        textTransform: 'uppercase',
      },
    },
    Tooltip: {
      baseStyle: {
        bg: 'var(--elevated-bg)',
        color: 'var(--text-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        fontFamily: 'mono',
        fontSize: 'xs',
        px: 3,
        py: 1.5,
        boxShadow: 'var(--shadow-card)',
        '--popper-arrow-bg': 'var(--elevated-bg)',
      },
    },
    Divider: {
      baseStyle: {
        borderColor: 'var(--border-color)',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'var(--card-bg)',
          border: '1px solid',
          borderColor: 'var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          _hover: {
            transform: 'translateY(-3px)',
            borderColor: 'var(--border-strong)',
            boxShadow: 'var(--shadow-lift)',
          },
        },
      },
    },
  },
})

export default theme
