import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/ui';
import { formatHitCount } from '../../lib/format';
import { useHitList } from '../../lib/store';
import { spacing, useTheme } from '../../lib/theme';
import { textStyles } from '../../lib/typography';

export default function HitListScreen() {
  const { hitListEntries, hits, partners, skills } = useHitList();
  const colors = useTheme();
  const router = useRouter();

  const rows = partners
    .map((partner) => {
      const partnerEntries = hitListEntries.filter((entry) => entry.partnerId === partner.id);
      const totalHits = hits
        .filter((hit) => hit.partnerId === partner.id)
        .reduce((sum, hit) => sum + hit.count, 0);

      return {
        partner,
        entries: partnerEntries,
        totalHits,
      };
    })
    .sort((a, b) => b.entries.length - a.entries.length || b.totalHits - a.totalHits || a.partner.name.localeCompare(b.partner.name));

  return (
    <Screen
      title="Hit List"
      titleIcon="gps-fixed"
      subtitle="People who create useful resistance for the skills you are leveling."
    >
      <View style={styles.list}>
        {rows.length === 0 ? (
          <EmptyState
            title="No one on your Hit List yet"
            body="Add people while logging hits, then target the ones who expose a skill."
          />
        ) : (
          rows.map(({ entries, partner, totalHits }) => {
            const firstEntry = entries[0];
            const firstSkill = firstEntry
              ? skills.find((skill) => skill.id === firstEntry.skillId)
              : undefined;

            return (
              <Card key={partner.id} style={styles.card}>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => router.push(`/hit-list/${partner.id}`)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                >
                  <View style={styles.titleRow}>
                    <MaterialIcons name="person-search" size={22} color={colors.ink} style={styles.rowIcon} />
                    <View style={styles.textBlock}>
                      <Text style={[styles.rowTitle, { color: colors.ink }]} numberOfLines={1}>{partner.name}</Text>
                      <Text style={[styles.rowMeta, { color: colors.muted }]} numberOfLines={1}>
                        {formatHitCount(totalHits)}
                        {entries.length ? ` · ${entries.length} target${entries.length === 1 ? '' : 's'}` : ''}
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
                </Pressable>
                {firstEntry ? (
                  <View style={[styles.challenge, { borderTopColor: colors.line }]}>
                    <View style={styles.challengeHeader}>
                      <MaterialIcons name="gps-fixed" size={16} color={colors.sage} />
                      <Text style={[styles.challengeSkill, { color: colors.ink }]}>{firstSkill?.name ?? 'Unknown skill'}</Text>
                    </View>
                    <Text style={[styles.challengeReason, { color: colors.muted }]}>{firstEntry.reason}</Text>
                  </View>
                ) : null}
              </Card>
            );
          })
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  challenge: {
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.md,
  },
  challengeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  challengeReason: {
    ...textStyles.listRowMeta,
  },
  challengeSkill: {
    ...textStyles.rowSummaryLabel,
  },
  list: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.72,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
  },
  rowIcon: {
    marginRight: spacing.md,
  },
  rowMeta: {
    ...textStyles.listRowMeta,
    marginTop: 2,
  },
  rowTitle: {
    ...textStyles.listRowTitle,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
});
