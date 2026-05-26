import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';

type ButtonProps = {
  label: string;
  onPress: () => void;
  size?: 'default' | 'compact';
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ label, onPress, size = 'default', variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'compact' && styles.compact,
        styles[variant],
        pressed && styles.pressed,
      ]}
    >
      <Text style={[
        styles.label,
        size === 'compact' && styles.compactLabel,
        variant === 'primary' ? styles.primaryLabel : styles.darkLabel,
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.md,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  compact: {
    borderRadius: radius.sm,
    minHeight: 34,
    paddingHorizontal: spacing.md,
  },
  compactLabel: {
    ...textStyles.buttonLabelCompact,
  },
  primary: {
    backgroundColor: colors.sage,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    opacity: 0.74,
  },
  label: {
    ...textStyles.buttonLabel,
  },
  primaryLabel: {
    color: colors.surface,
  },
  darkLabel: {
    color: colors.sage,
  },
});
