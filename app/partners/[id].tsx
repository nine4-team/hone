import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { HitSummaryList } from '../../components/HitSummaryList';
import { Screen } from '../../components/Screen';
import { formatDate, formatHitCount } from '../../lib/format';
import { hitRowsBySkill } from '../../lib/hits';
import { useHitList } from '../../lib/store';
import { colors, spacing } from '../../lib/theme';
import { textStyles } from '../../lib/typography';

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
  const totalHits = partnerHits.reduce((sum, hit) => sum + hit.count, 0);

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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hit List</Text>
        {skillRows.length === 0 ? (
          <EmptyState
            framed={false}
            title="No hits yet"
            body="Attribute hits to this partner while logging training."
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
        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.timeline}>
          {recent.map((row, index) => {
            const isLast = index === recent.length - 1;
            return (
              <View key={row.hit.id} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={styles.timelineDot} />
                  {!isLast ? <View style={styles.timelineLine} /> : null}
                </View>
                <View style={[styles.timelineContent, isLast && styles.timelineContentLast]}>
                  <Text style={styles.cardTitle}>{row.skillName}</Text>
                  <Text style={styles.cardMeta}>
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
  timeline: {
    marginTop: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineRail: {
    alignItems: 'center',
    width: RAIL_WIDTH,
  },
  timelineDot: {
    backgroundColor: colors.sage,
    borderRadius: DOT_SIZE / 2,
    height: DOT_SIZE,
    marginTop: spacing.xs,
    width: DOT_SIZE,
  },
  timelineLine: {
    backgroundColor: colors.line,
    flex: 1,
    marginTop: spacing.xs,
    width: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.lg,
    paddingLeft: spacing.sm,
  },
  timelineContentLast: {
    paddingBottom: 0,
  },
});
