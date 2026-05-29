import {
  createContext,
  createElement,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system';

const BRAND_PRIMARY = '#987E55';

export const lightColors = {
  bg: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F3EF',
  ink: '#111111',
  muted: '#666666',
  quiet: '#999999',
  line: '#E0E0E0',
  strongLine: '#DDDDDD',
  sage: BRAND_PRIMARY,
  standardComplete: '#4A7C59',
  clay: '#C64B30',
  gold: BRAND_PRIMARY,
  blue: '#666666',
};

export type ThemeColors = typeof lightColors;

export const darkColors: ThemeColors = {
  bg: '#1E1E1E',
  surface: '#2E2E2E',
  surfaceMuted: '#3D3224',
  ink: '#E0E0E0',
  muted: '#B0B0B0',
  quiet: '#888888',
  line: '#4A4A4C',
  strongLine: '#5A5A5C',
  sage: BRAND_PRIMARY,
  standardComplete: '#4A7C59',
  clay: '#EF5350',
  gold: BRAND_PRIMARY,
  blue: '#B0B0B0',
};

export const colors = lightColors;

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');
  const isDark = preference === 'system' ? systemScheme === 'dark' : preference === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      preference,
      setPreference,
    }),
    [isDark, preference],
  );

  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return value.colors;
}

export function useThemePreference() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useThemePreference must be used inside ThemeProvider');
  }

  return {
    isDark: value.isDark,
    preference: value.preference,
    setPreference: value.setPreference,
  };
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
};
