import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '../lib/theme';
import { textStyles } from '../lib/typography';

export type HitSummaryRow = {
  id: string;
  label: string;
  count: number;
  href?: string;
  total?: boolean;
};

type HitSummaryListProps = {
  alignWithSectionAction?: boolean;
  emphasizeLabels?: boolean;
  rows: HitSummaryRow[];
};

export function HitSummaryList({
  alignWithSectionAction = false,
  emphasizeLabels = false,
  rows,
}: HitSummaryListProps) {
  const router = useRouter();
  const colors = useTheme();

  return (
    <View style={styles.rows}>
      {rows.map((row) => {
        const content = (
          <>
            <Text
              style={[
                styles.label,
                { color: row.total ? colors.sage : colors.muted },
                emphasizeLabels && styles.labelEmphasized,
              ]}
              numberOfLines={1}
            >
              {row.label}
            </Text>
            <Text
              style={[
                styles.value,
                { color: row.total ? colors.sage : colors.muted },
                emphasizeLabels && styles.labelEmphasized,
                alignWithSectionAction && styles.valueAligned,
              ]}
            >
              {row.count}
            </Text>
          </>
        );

        if (row.href) {
          return (
            <Pressable
              key={row.id}
              accessibilityRole="link"
              accessibilityLabel={`Open ${row.label}`}
              onPress={() => router.push(row.href!)}
              style={({ pressed }) => [
                styles.row,
                alignWithSectionAction && styles.rowAligned,
                pressed && styles.pressed,
              ]}
            >
              {content}
            </Pressable>
          );
        }

        return (
          <View
            key={row.id}
            style={[styles.row, alignWithSectionAction && styles.rowAligned]}
          >
            {content}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...textStyles.rowLabel,
    flex: 1,
    minWidth: 0,
  },
  labelEmphasized: {
    ...textStyles.detailRecordBody,
  },
  pressed: {
    opacity: 0.68,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 26,
    paddingHorizontal: 0,
    paddingRight: 8,
    paddingVertical: 2,
  },
  rowAligned: {
    paddingRight: 0,
  },
  rows: {
    gap: 2,
  },
  value: {
    ...textStyles.rowLabel,
    minWidth: 32,
    textAlign: 'right',
  },
  valueAligned: {
    minWidth: 28,
    textAlign: 'center',
    width: 28,
  },
});
