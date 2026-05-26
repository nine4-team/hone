import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HoneProvider } from '../lib/store';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <HoneProvider>
      <StatusBar style="dark" />
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
        <Stack.Screen name="skills/new" options={{ title: 'New Skill', presentation: 'modal' }} />
        <Stack.Screen name="log/[skillId]" options={{ title: 'Training Log', presentation: 'modal' }} />
        <Stack.Screen name="partners/[id]" options={{ title: 'Partner' }} />
      </Stack>
    </HoneProvider>
  );
}
