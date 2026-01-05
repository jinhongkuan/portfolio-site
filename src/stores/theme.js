import { writable, derived } from 'svelte/store';
import { theme } from '../styles/theme.js';

// Create a writable store for the theme
export const themeConfig = writable(theme);

// Create derived store for CSS variables
export const cssVariables = derived(themeConfig, ($theme) => {
  return `
    --color-bg: ${$theme.colors.bg};
    --color-text: ${$theme.colors.text};
    --color-accent: ${$theme.colors.accent};
    --color-border: ${$theme.colors.border};
    --color-muted: ${$theme.colors.muted};
    --color-muted-dark: ${$theme.colors.mutedDark};
    --font-serif: ${$theme.fonts.serif};
    --font-sans: ${$theme.fonts.sans};
    --shadow-sm: ${$theme.shadows.sm};
    --shadow-md: ${$theme.shadows.md};
    --shadow-lg: ${$theme.shadows.lg};
    --transition-fast: ${$theme.transitions.fast};
    --transition-base: ${$theme.transitions.base};
    --transition-slow: ${$theme.transitions.slow};
    --max-width: ${$theme.layout.maxWidth};
    --max-width-narrow: ${$theme.layout.maxWidthNarrow};
    --max-width-wide: ${$theme.layout.maxWidthWide};
  `;
});