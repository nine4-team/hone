import 'expo-dev-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HitListProvider } from '../lib/store';
import { ThemeProvider, useTheme, useThemePreference } from '../lib/theme';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppStack />
    </ThemeProvider>
  );
}

function AppStack() {
  const colors = useTheme();
  const { isDark } = useThemePreference();

  return (
    <HitListProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.bg },
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTintColor: colors.sage,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="skills/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="skills/new" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="log/[skillId]" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="partners/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="share-intake" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </HitListProvider>
  );
}
