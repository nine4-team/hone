import 'expo-dev-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { HitListProvider } from '../lib/store';
import { AuthProvider, useAuth } from '../lib/supabase/auth';
import { ThemeProvider, useTheme, useThemePreference } from '../lib/theme';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppStack />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppStack() {
  const colors = useTheme();
  const { isDark } = useThemePreference();
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ActivityIndicator color={colors.sage} />
      </View>
    );
  }

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
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="skills/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="skills/new" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="log/[skillId]" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="partners/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="share-intake" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </HitListProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
