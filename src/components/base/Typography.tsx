import React from 'react';
import { Text, TextProps } from 'react-native';
import { Theme } from '../../constants/theme';

export interface TypographyProps extends TextProps {
  variant?: 'body' | 'small' | 'subtitle' | 'title' | 'heading';
  weight?: 'regular' | 'medium' | 'bold';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function Typography({
  variant = 'body',
  weight = 'regular',
  color = Theme.colors.text,
  align = 'left',
  style,
  children,
  ...props
}: TypographyProps) {
  return (
    <Text
      style={[
        {
          fontSize: Theme.typography.size[variant],
          fontWeight: Theme.typography.weight[weight] as '400' | '500' | '700',
          color,
          textAlign: align,
        },
        style,
      ]}
      allowFontScaling={true} // Important for accessibility
      maxFontSizeMultiplier={2} // Allows text to grow but not break layout completely
      {...props}
    >
      {children}
    </Text>
  );
}
