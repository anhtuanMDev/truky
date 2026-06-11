export const Theme = {
  colors: {
    primary: '#0056D2', // High contrast blue
    primaryDark: '#003A8C',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#4B5563',
    border: '#E5E7EB',
    danger: '#DC2626',
    success: '#16A34A',
    warning: '#D97706',
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
