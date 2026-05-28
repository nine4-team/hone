import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';

type EmptyStateProps = {
  framed?: boolean;
  title: string;
  body?: string;
};

export function EmptyState({ framed = true, title, body }: EmptyStateProps) {
  const simpleNoYet = /^no .+ yet$/i.test(title.trim());
  const showFrame = framed && !simpleNoYet;

  return (
    <View style={[styles.wrap, !showFrame && styles.unframed]}>
      <Text style={body ? (simpleNoYet ? styles.simpleTitle : styles.title) : styles.bodyOnly}>
        {title}
      </Text>
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
    ...textStyles.formHelp,
  },
  bodyOnly: {
    ...textStyles.detailRecordBody,
    color: colors.muted,
  },
  simpleTitle: {
    ...textStyles.detailRecordBody,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  unframed: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: spacing.xs,
  },
});
