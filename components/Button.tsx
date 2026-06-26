import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { radius, spacing, useTheme } from '../lib/theme';
import { textStyles } from '../lib/typography';

type ButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  size?: 'default' | 'compact';
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({
  disabled = false,
  label,
  onPress,
  size = 'default',
  style,
  variant = 'primary',
}: ButtonProps) {
  const colors = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'compact' && styles.compact,
        variant === 'primary' && { backgroundColor: colors.sage },
        variant === 'secondary' && {
          backgroundColor: colors.surface,
          borderColor: colors.line,
          borderWidth: 1,
        },
        variant === 'ghost' && styles.ghost,
        disabled && variant === 'primary' && { backgroundColor: colors.surfaceMuted },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[
        styles.label,
        size === 'compact' && styles.compactLabel,
        { color: disabled ? colors.quiet : variant === 'primary' ? colors.surface : colors.sage },
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
  disabled: {
    opacity: 0.72,
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
});
