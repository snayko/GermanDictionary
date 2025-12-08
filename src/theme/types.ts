import type { Theme as MuiTheme } from '@mui/material/styles';

// Custom shadows interface
export interface CustomShadows {
  z1: string;
  z4: string;
  z8: string;
  z12: string;
  z16: string;
  z20: string;
  z24: string;
  primary: string;
  secondary: string;
  info: string;
  success: string;
  warning: string;
  error: string;
  card: string;
  dialog: string;
  dropdown: string;
}

// Extended theme interface
export interface Theme extends MuiTheme {
  customShadows: CustomShadows;
}

// Module augmentation for MUI
declare module '@mui/material/styles' {
  interface Theme {
    customShadows: CustomShadows;
  }
  interface ThemeOptions {
    customShadows?: CustomShadows;
  }
  interface TypeBackground {
    neutral: string;
  }
  interface SimplePaletteColorOptions {
    lighter: string;
    darker: string;
  }
  interface PaletteColor {
    lighter: string;
    darker: string;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    soft: true;
  }
}
