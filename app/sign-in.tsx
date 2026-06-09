import { useRouter } from 'expo-router';
import { getSharedPayloads } from 'expo-sharing';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { FormHelp, FormInput, FormLabel, FormStack } from '../components/FormControls';
import { Screen } from '../components/Screen';
import { Card } from '../components/ui';
import { normalizeSharedPayloads } from '../lib/shareIntake';
import { useAuth } from '../lib/supabase/auth';
import { spacing, useTheme } from '../lib/theme';

export default function SignInScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { configured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || password.length < 6 || submitting) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const nextSession =
        mode === 'sign-in' ? await signIn(email, password) : await signUp(email, password);

      if (!nextSession) {
        setMessage(
          mode === 'sign-up'
            ? 'Account created. Check your email to confirm it, then sign in.'
            : 'Sign in succeeded, but no session was created. Try again.',
        );
        return;
      }

      router.replace(hasPendingShare() ? '/share-intake' : '/');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!configured) {
    return (
      <Screen title="Connect Supabase" titleIcon="lock">
        <Card style={styles.panel}>
          <Text style={[styles.title, { color: colors.ink }]}>Supabase is not configured</Text>
          <FormHelp>
            Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, or the publishable key equivalent, then restart Expo.
          </FormHelp>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title={mode === 'sign-in' ? 'Sign In' : 'Sign Up'} titleIcon="lock">
      <FormStack>
        <Card style={styles.panel}>
          <FormLabel>Email</FormLabel>
          <FormInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            value={email}
          />
          <FormLabel>Password</FormLabel>
          <FormInput
            autoCapitalize="none"
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            value={password}
          />
          {message ? <Text style={styles.error}>{message}</Text> : null}
          <Button
            label={submitting ? 'Working...' : mode === 'sign-in' ? 'Sign In' : 'Create Account'}
            onPress={submit}
          />
        </Card>
        <View style={styles.switchRow}>
          <Text style={[styles.switchText, { color: colors.muted }]}>
            {mode === 'sign-in' ? 'Need an account?' : 'Already have an account?'}
          </Text>
          <Button
            label={mode === 'sign-in' ? 'Sign Up' : 'Sign In'}
            onPress={() => {
              setMessage(null);
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
            }}
            size="compact"
            variant="ghost"
          />
        </View>
      </FormStack>
    </Screen>
  );
}

function hasPendingShare() {
  if (Platform.OS === 'web') return false;

  try {
    return normalizeSharedPayloads(getSharedPayloads()).length > 0;
  } catch {
    return false;
  }
}

const styles = StyleSheet.create({
  error: {
    color: '#b42318',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  panel: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  switchText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
});
