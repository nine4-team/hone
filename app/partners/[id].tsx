import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { HitSummaryList } from '../../components/HitSummaryList';
import { Screen } from '../../components/Screen';
import { Section } from '../../components/Section';
import { formatDate, formatHitCount } from '../../lib/format';
import { hitRowsBySkill } from '../../lib/hits';
import { useHitList } from '../../lib/store';
import { spacing } from '../../lib/theme';
import { textStyles } from '../../lib/typography';
import { Card } from '../../components/ui';

export default function PartnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { hits, partners, skills, trainingLogs } = useHitList();
  const partner = partners.find((item) => item.id === id);

  if (!partner) {
    return <Screen title="Partner not found" subtitle="This partner is not in the local data set." onBack={router.back} />;
  }

  const partnerHits = hits.filter((hit) => hit.partnerId === partner.id);
  const skillRows = hitRowsBySkill(partnerHits, skills);

  const recent = partnerHits
    .map((hit) => ({
      hit,
      skillName: skills.find((skill) => skill.id === hit.skillId)?.name ?? 'Unknown skill',
      log: trainingLogs.find((log) => log.id === hit.trainingLogId),
    }))
    .sort((a, b) => Date.parse(b.hit.createdAt) - Date.parse(a.hit.createdAt));

  return (
    <Screen
      title={partner.name}
      subtitle="All hits attributed to this partner."
      onBack={router.back}
    >
      <Section title="Skills Hit">
        {skillRows.length === 0 ? (
          <EmptyState title="No hits yet" body="Attribute hits to this partner while logging training." />
        ) : (
          <Card style={styles.card}>
            <HitSummaryList rows={skillRows} />
          </Card>
        )}
      </Section>

      <Section title="Recent">
        <View style={styles.stack}>
          {recent.map((row) => (
            <Card key={row.hit.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                {row.skillName}
              </Text>
              <Text style={styles.cardMeta}>
                {formatDate(row.log?.occurredAt ?? row.hit.createdAt)} · {formatHitCount(row.hit.count)}
              </Text>
            </Card>
          ))}
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  cardMeta: {
    ...textStyles.detailRecordMeta,
    marginTop: spacing.xs,
  },
  cardTitle: {
    ...textStyles.detailRecordTitle,
  },
  stack: {
    gap: spacing.md,
  },
});
