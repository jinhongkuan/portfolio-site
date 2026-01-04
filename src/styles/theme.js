// Centralized theme configuration for consistent styling across the site

export const theme = {
  colors: {
    bg: '#FAF9F5',
    text: '#1A1A1A',
    accent: '#7A7A52',
    border: '#E7E6E2',
    muted: '#F5F4F0',
    mutedDark: '#EFEDE8',
  },
  
  fonts: {
    serif: "'EB Garamond', Georgia, serif",
    sans: "'Inter', -apple-system, sans-serif",
  },
  
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    xxl: '4rem',
  },
  
  layout: {
    maxWidth: '900px',
    maxWidthNarrow: '720px',
    maxWidthWide: '1200px',
  },
  
  typography: {
    sizes: {
      xs: '0.85rem',
      sm: '0.9rem',
      base: '1rem',
      md: '1.1rem',
      lg: '1.3rem',
      xl: '1.8rem',
      xxl: '2.2rem',
      xxxl: '3.5rem',
    },
    lineHeights: {
      tight: '1.2',
      base: '1.6',
      relaxed: '1.8',
    },
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 4px 6px rgba(0,0,0,0.05)',
    lg: '0 10px 15px rgba(0,0,0,0.08)',
  },
  
  transitions: {
    fast: '0.2s ease',
    base: '0.3s ease',
    slow: '0.5s ease',
  },
  
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
  },
};

export default theme;