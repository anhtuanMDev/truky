import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { Typography } from './Typography';
import { Theme } from '../../constants/theme';

export interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  icon,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const isOutline = variant === 'outline';
  
  const getBackgroundColor = () => {
    if (disabled) return Theme.colors.border;
    if (isOutline) return 'transparent';
    if (variant === 'danger') return Theme.colors.danger;
    if (variant === 'secondary') return Theme.colors.surface;
    return Theme.colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return Theme.colors.textSecondary;
    if (isOutline || variant === 'secondary') return Theme.colors.text;
    return '#FFFFFF';
  };

  const getBorderColor = () => {
    if (disabled) return Theme.colors.border;
    if (isOutline) return Theme.colors.border;
    return getBackgroundColor();
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: isOutline ? 2 : 0,
        },
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      hitSlop={Theme.hitSlop}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="large" />
      ) : (
        <>
          {icon}
          <Typography
            variant="subtitle" // Large text for older users
            weight="bold"
            color={getTextColor()}
            style={icon ? styles.labelWithIcon : undefined}
          >
            {label}
          </Typography>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    minHeight: 64, // Ensuring large touch target
  },
  labelWithIcon: {
    marginLeft: Theme.spacing.sm,
  },
});
