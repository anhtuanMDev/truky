export const Theme = {
  colors: {
    primary: '#0EA5E9', // Trustful sky blue
    primaryLight: '#E0F2FE',
    primaryDark: '#0369A1',
    background: '#F8FAFC', // Clean, bright background
    surface: '#FFFFFF',
    text: '#0F172A', // High contrast text
    textSecondary: '#64748B', // Soft secondary text
    border: '#E2E8F0',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
  },
  typography: {
    size: {
      small: 16,
      body: 18,
      subtitle: 22,
      title: 28,
      heading: 36,
    },
    weight: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  hitSlop: { top: 12, bottom: 12, left: 12, right: 12 }, // Enhances touch area
};
