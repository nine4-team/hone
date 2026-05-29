import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  format?: (value: number) => string;
};

export function Stepper({ value, onChange, min = 0, step = 1, format }: StepperProps) {
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityLabel="Decrease"
        accessibilityRole="button"
        disabled={value <= min}
        hitSlop={6}
        onPress={() => onChange(Math.max(min, value - step))}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <MaterialIcons name="remove" size={18} color={value <= min ? colors.quiet : colors.ink} />
      </Pressable>
      <Text style={styles.value}>{format ? format(value) : value}</Text>
      <Pressable
        accessibilityLabel="Increase"
        accessibilityRole="button"
        hitSlop={6}
        onPress={() => onChange(value + step)}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <MaterialIcons name="add" size={18} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 42,
  },
  pressed: {
    opacity: 0.6,
  },
  stepper: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  value: {
    ...textStyles.rowSummaryValue,
    minWidth: 28,
    paddingHorizontal: spacing.sm,
    textAlign: 'center',
  },
});
