import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { Section } from '../../components/Section';
import { formatDate } from '../../lib/format';
import { useHone } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';

export default function PartnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hits, partners, skills, trainingLogs } = useHone();
  const partner = partners.find((item) => item.id === id);

  if (!partner) {
    return <Screen title="Partner not found" subtitle="This partner is not in the local data set." />;
  }

  const partnerHits = hits.filter((hit) => hit.partnerId === partner.id);
  const bySkill = new Map<string, number>();

  partnerHits.forEach((hit) => {
    bySkill.set(hit.skillId, (bySkill.get(hit.skillId) ?? 0) + hit.count);
  });

  const skillRows = Array.from(bySkill.entries())
    .map(([skillId, count]) => ({
      skillName: skills.find((skill) => skill.id === skillId)?.name ?? 'Unknown skill',
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const recent = partnerHits
    .map((hit) => ({
      hit,
      skillName: skills.find((skill) => skill.id === hit.skillId)?.name ?? 'Unknown skill',
      log: trainingLogs.find((log) => log.id === hit.trainingLogId),
    }))
    .sort((a, b) => Date.parse(b.hit.createdAt) - Date.parse(a.hit.createdAt));

  return (
    <Screen title={partner.name} subtitle="Partner hit history.">
      <Section title="Hit On This Partner">
        {skillRows.length === 0 ? (
          <EmptyState title="No hits yet" body="Attribute hits to this partner while logging training." />
        ) : (
          <View style={styles.card}>
            {skillRows.map((row) => (
              <View key={row.skillName} style={styles.statRow}>
                <Text style={styles.statLabel}>{row.skillName}</Text>
                <Text style={styles.statValue}>{row.count}</Text>
              </View>
            ))}
          </View>
        )}
      </Section>

      <Section title="Recent">
        <View style={styles.stack}>
          {recent.map((row) => (
            <View key={row.hit.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                {row.skillName} x{row.hit.count}
              </Text>
              <Text style={styles.cardMeta}>{formatDate(row.log?.occurredAt ?? row.hit.createdAt)}</Text>
            </View>
          ))}
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  cardMeta: {
    color: colors.quiet,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  stack: {
    gap: spacing.md,
  },
  statLabel: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  statValue: {
    color: colors.sage,
    fontSize: 18,
    fontWeight: '800',
  },
});
