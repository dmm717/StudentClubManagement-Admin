export const iconSizes = {
  xs: { width: 12, height: 12 },
  sm: { width: 16, height: 16 },
  md: { width: 20, height: 20 },
  lg: { width: 24, height: 24 },
  xl: { width: 32, height: 32 },
  '2xl': { width: 48, height: 48 }
};

export const getIconSize = (size = 'md') => iconSizes[size] || iconSizes.md;

