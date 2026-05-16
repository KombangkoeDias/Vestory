const palette = {
  // Dark backgrounds
  bg: '#0F0F14',
  surface: '#1A1A26',
  surfaceElevated: '#24243A',
  surfaceBorder: '#2E2E45',

  // Primary
  primary: '#6C63FF',
  primaryLight: '#8B84FF',
  primaryDark: '#4F47CC',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#9191A8',
  textMuted: '#5A5A72',

  // Semantic
  success: '#4ADE80',
  successBg: '#1A3326',
  error: '#F87171',
  errorBg: '#331A1A',
  warning: '#FBBF24',

  // Category colours
  food: '#F97316',
  transport: '#3B82F6',
  groceries: '#22C55E',
  shopping: '#EC4899',
  entertainment: '#A855F7',
  health: '#14B8A6',
  utilities: '#EAB308',
  travel: '#06B6D4',
  others: '#6B7280',
};

export const Colors = {
  dark: {
    ...palette,
    tabBar: '#13131E',
    tabBarBorder: '#2E2E45',
    tabIconDefault: '#5A5A72',
    tabIconSelected: palette.primary,
    // legacy compat keys
    text: palette.textPrimary,
    background: palette.bg,
    tint: palette.primary,
  },
  light: {
    ...palette,
    tabBar: '#13131E',
    tabBarBorder: '#2E2E45',
    tabIconDefault: '#5A5A72',
    tabIconSelected: palette.primary,
    // legacy compat keys
    text: palette.textPrimary,
    background: palette.bg,
    tint: palette.primary,
  },
};

export default Colors;
