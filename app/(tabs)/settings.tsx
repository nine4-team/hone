import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { useToast } from '../../lib/useToast';
import { radius, spacing, type ThemePreference, useTheme, useThemePreference } from '../../lib/theme';

const themeOptions: { label: string; value: ThemePreference }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Auto', value: 'system' },
];

export default function SettingsScreen() {
  const { showToast, toastMessage } = useToast();
  const colors = useTheme();
  const { preference, setPreference } = useThemePreference();

  return (
    <Screen title="Settings" titleIcon="settings" toastMessage={toastMessage}>
      <View style={styles.list}>
        <ListRow href="/partners" icon="group" title="Partners" />
        <View style={[styles.themeCard, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <View style={[styles.segmentedControl, { backgroundColor: colors.bg }]}>
            {themeOptions.map((option) => {
              const selected = preference === option.value;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => setPreference(option.value)}
                  style={({ pressed }) => [
                    styles.segment,
                    selected && { backgroundColor: colors.surface, shadowColor: colors.ink },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      { color: selected ? colors.ink : colors.muted },
                      selected && styles.segmentLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <ListRow
          icon="logout"
          onPress={() => showToast('No active session to sign out of.')}
          title="Sign out"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.72,
  },
  segment: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 36,
  },
  segmentedControl: {
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  segmentLabelSelected: {
    fontWeight: '700',
  },
  themeCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.sm,
  },
});
