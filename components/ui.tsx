import type { PropsWithChildren, ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';

type CardProps = PropsWithChildren<{
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  onLongPress?: () => void;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}>;

export function Card({
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole,
  children,
  onLongPress,
  onPress,
  style,
}: CardProps) {
  if (onPress || onLongPress) {
    return (
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole ?? 'button'}
        onLongPress={onLongPress}
        onPress={onPress}
        style={({ pressed }) => [styles.card, style, pressed && styles.cardPressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

export function IconButton({
  accessibilityLabel,
  children,
  onPress,
  selected,
}: PropsWithChildren<{
  accessibilityLabel: string;
  onPress: () => void;
  selected?: boolean;
}>) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={8}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

export function CompactButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={6}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      style={({ pressed }) => [styles.compactButton, pressed && styles.pressed]}
    >
      <Text style={styles.compactButtonText}>{label}</Text>
    </Pressable>
  );
}

export function HeaderActionSlot({ children }: { children: ReactNode }) {
  return <View style={styles.headerActionSlot}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.72,
  },
  compactButton: {
    alignItems: 'center',
    backgroundColor: colors.sage,
    borderRadius: radius.sm,
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: spacing.md,
  },
  compactButtonText: {
    ...textStyles.buttonLabelCompact,
    color: colors.surface,
  },
  headerActionSlot: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
    minWidth: 28,
  },
  pressed: {
    opacity: 0.68,
  },
});
