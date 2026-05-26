import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/ui';
import { colors, spacing } from '../../lib/theme';

type SettingsRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
};

function SettingsRow({ icon, label, onPress }: SettingsRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.rowLabel}>
        <MaterialIcons name={icon} size={22} color={colors.ink} style={styles.rowIcon} />
        <Text style={styles.rowText}>{label}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <Screen title="Settings">
      <View style={styles.list}>
        <Card>
          <SettingsRow
            icon="search"
            label="Library"
            onPress={() => router.push('/library')}
          />
        </Card>
        <Card>
          <SettingsRow
            icon="group"
            label="Partners"
            onPress={() => router.push('/partners')}
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.xl,
  },
  pressed: {
    opacity: 0.72,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    marginRight: spacing.md,
  },
  rowLabel: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  rowText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '500',
  },
});
