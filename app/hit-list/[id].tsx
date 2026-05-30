import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { HitSummaryList } from '../../components/HitSummaryList';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/ui';
import { formatDate, formatHitCount } from '../../lib/format';
import { hitRowsBySkill } from '../../lib/hits';
import { useHitList } from '../../lib/store';
import { spacing, useTheme } from '../../lib/theme';
import { textStyles } from '../../lib/typography';

export default function HitListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { hitListEntries, hits, partners, skills, trainingLogs } = useHitList();
  const partner = partners.find((item) => item.id === id);

  if (!partner) {
    return <Screen title="Hit List entry not found" subtitle="This person is not in the local data set." onBack={router.back} />;
  }

  const partnerHits = hits.filter((hit) => hit.partnerId === partner.id);
  const skillRows = hitRowsBySkill(partnerHits, skills);
  const totalHits = partnerHits.reduce((sum, hit) => sum + hit.count, 0);
  const targets = hitListEntries
    .filter((entry) => entry.partnerId === partner.id)
    .map((entry) => ({
      entry,
      skill: skills.find((skill) => skill.id === entry.skillId),
    }));

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
      subtitle="Targets, history, and proof against this person."
      onBack={router.back}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>Targets</Text>
        {targets.length === 0 ? (
          <EmptyState
            framed={false}
            title="No targets yet"
            body="Put this person on a skill Hit List when they represent useful resistance."
          />
        ) : (
          <View style={styles.stack}>
            {targets.map(({ entry, skill }) => (
              <Card key={entry.id} style={styles.targetCard}>
                <Text style={[styles.cardTitle, { color: colors.ink }]}>{skill?.name ?? 'Unknown skill'}</Text>
                <Text style={[styles.cardMeta, { color: colors.muted }]}>{entry.reason}</Text>
              </Card>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>Hits By Skill</Text>
        {skillRows.length === 0 ? (
          <EmptyState
            framed={false}
            title="No hits yet"
            body="Attribute hits to this person while logging training."
          />
        ) : (
          <View style={styles.hitListRows}>
            <HitSummaryList
              alignWithSectionAction
              emphasizeLabels
              rows={[
                ...skillRows,
                {
                  id: 'total',
                  label: 'Total',
                  count: totalHits,
                  total: true,
                },
              ]}
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>Timeline</Text>
        <View style={styles.timeline}>
          {recent.map((row, index) => {
            const isLast = index === recent.length - 1;
            return (
              <View key={row.hit.id} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.sage }]} />
                  {!isLast ? <View style={[styles.timelineLine, { backgroundColor: colors.line }]} /> : null}
                </View>
                <View style={[styles.timelineContent, isLast && styles.timelineContentLast]}>
                  <Text style={[styles.cardTitle, { color: colors.ink }]}>{row.skillName}</Text>
                  <Text style={[styles.cardMeta, { color: colors.quiet }]}>
                    {formatDate(row.log?.occurredAt ?? row.hit.createdAt)} · {formatHitCount(row.hit.count)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const DOT_SIZE = 10;
const RAIL_WIDTH = 20;

const styles = StyleSheet.create({
  cardMeta: {
    ...textStyles.detailRecordMeta,
    marginTop: spacing.xs,
  },
  cardTitle: {
    ...textStyles.detailRecordBody,
  },
  hitListRows: {
    gap: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.sectionTitle,
    marginBottom: 6,
  },
  stack: {
    gap: spacing.md,
  },
  targetCard: {
    padding: spacing.lg,
  },
  timeline: {
    marginTop: spacing.xs,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.lg,
    paddingLeft: spacing.sm,
  },
  timelineContentLast: {
    paddingBottom: 0,
  },
  timelineDot: {
    borderRadius: DOT_SIZE / 2,
    height: DOT_SIZE,
    marginTop: spacing.xs,
    width: DOT_SIZE,
  },
  timelineLine: {
    flex: 1,
    marginTop: spacing.xs,
    width: 2,
  },
  timelineRail: {
    alignItems: 'center',
    width: RAIL_WIDTH,
  },
  timelineRow: {
    flexDirection: 'row',
  },
});
