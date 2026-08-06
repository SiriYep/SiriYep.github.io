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
    50: '#f6f8fb',
    100: '#eaeef5',
    200: '#dce3ed',
    300: '#c3cddc',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#28324a',
    800: '#161c2a',
    900: '#0f141f',
  },
  cyan: {
    50: '#eef8fb',
    100: '#d5eef4',
    200: '#b4e0ea',
    300: '#9fd8e5',
    400: '#7cc7d8',
    500: '#4d9db2',
    600: '#2f7f95',
    700: '#256478',
    800: '#1e4f5f',
    900: '#173d4a',
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
    accent: { default: '#1f7a99', _dark: '#88c0d0' },
    accentStrong: { default: '#16637e', _dark: '#a5d8e6' },
    accentSubtle: { default: 'rgba(31,122,153,0.09)', _dark: 'rgba(136,192,208,0.12)' },
    prompt: { default: '#36805a', _dark: '#a3be8c' },
    warm: { default: '#a37b2c', _dark: '#ebcb8b' },
    surface: { default: '#ffffff', _dark: '#121826' },
    surfaceElevated: { default: '#ffffff', _dark: '#182233' },
    surfaceHeader: { default: '#edf1f7', _dark: '#151d2b' },
    borderSubtle: { default: 'rgba(15,23,42,0.09)', _dark: 'rgba(148,163,184,0.14)' },
    borderStrong: { default: 'rgba(15,23,42,0.16)', _dark: 'rgba(148,163,184,0.28)' },
    textPrimary: { default: '#1f2a44', _dark: '#e6ebf4' },
    textSecondary: { default: '#5b6b84', _dark: '#9aa8bf' },
    textMuted: { default: '#94a3b8', _dark: '#64748b' },
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
