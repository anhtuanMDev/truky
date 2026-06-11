import React from 'react';
import { createNanoIconSet } from 'react-native-nano-icons';
import glyphMap from '../../assets/icons/nanoicons/ui.glyphmap.json';
import { Theme } from '../../constants/theme';

const NanoIcon = createNanoIconSet(glyphMap);

export interface IconProps {
  name: keyof typeof glyphMap.i;
  size?: number;
  color?: string | string[];
}

export function Icon({ name, size = 24, color = Theme.colors.text }: IconProps) {
  return <NanoIcon name={name as any} size={size} color={color} />;
}
