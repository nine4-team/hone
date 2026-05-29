import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../lib/theme';
import { textStyles } from '../lib/typography';

type EmptyStateProps = {
  framed?: boolean;
  title: string;
  body?: string;
};

export function EmptyState({ framed = true, title, body }: EmptyStateProps) {
  const colors = useTheme();
  const simpleNoYet = /^no .+ yet$/i.test(title.trim());
  const showFrame = framed && !simpleNoYet;

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.surface, borderColor: colors.line },
        !showFrame && styles.unframed,
      ]}
    >
      <Text
        style={[
          body ? (simpleNoYet ? styles.simpleTitle : styles.title) : styles.bodyOnly,
          { color: simpleNoYet || !body ? colors.muted : colors.ink },
        ]}
      >
        {title}
      </Text>
      {body ? <Text style={[styles.body, { color: colors.muted }]}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
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
  },
  simpleTitle: {
    ...textStyles.detailRecordBody,
    marginBottom: spacing.xs,
  },
  unframed: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: spacing.xs,
  },
});
