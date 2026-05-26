import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';

type EmptyStateProps = {
  title: string;
  body?: string;
};

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={body ? styles.title : styles.bodyOnly}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.xl,
  },
  title: {
    ...textStyles.detailRecordTitle,
    marginBottom: spacing.xs,
  },
  body: {
    ...textStyles.detailRecordBody,
    color: colors.muted,
  },
  bodyOnly: {
    ...textStyles.detailRecordBody,
    color: colors.muted,
  },
});
