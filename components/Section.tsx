import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

export function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.detailRecordTitle,
    marginBottom: 6,
  },
});
