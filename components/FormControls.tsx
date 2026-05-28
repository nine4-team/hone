import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { colors, radius, spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';
import { Card } from './ui';

export function FormPanel({ children }: PropsWithChildren) {
  return <Card style={styles.panel}>{children}</Card>;
}

export function FormLabel({ children }: PropsWithChildren) {
  return <Text style={styles.label}>{children}</Text>;
}

export function FormHelp({ children }: PropsWithChildren) {
  return <Text style={styles.help}>{children}</Text>;
}

export function FormInput({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.quiet}
      style={[styles.input, style]}
      {...props}
    />
  );
}

export function FormStack({ children }: PropsWithChildren) {
  return <View style={styles.stack}>{children}</View>;
}

export function SegmentedControl({ children }: PropsWithChildren) {
  return <View style={styles.segment}>{children}</View>;
}

const styles = StyleSheet.create({
  help: {
    ...textStyles.formHelp,
    marginTop: spacing.xs,
  },
  input: {
    ...textStyles.formInput,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: {
    ...textStyles.formLabel,
  },
  panel: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  segment: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stack: {
    gap: spacing.md,
  },
});
