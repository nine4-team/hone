import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { HitSummaryList } from '../../components/HitSummaryList';
import { Screen } from '../../components/Screen';
import { Card, IconButton } from '../../components/ui';
import { formatDate, formatHitCount } from '../../lib/format';
import { hitRowsBySkill } from '../../lib/hits';
import { useHitList } from '../../lib/store';
import { spacing, useTheme } from '../../lib/theme';
import { textStyles } from '../../lib/typography';

export default function PartnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const {
    hits,
    partners,
    skills,
    trainingLogs,
    updatePartner,
  } = useHitList();
  const [hitsOpen, setHitsOpen] = useState(true);
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [editingPartner, setEditingPartner] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const partner = partners.find((item) => item.id === id);

  if (!partner) {
    return <Screen title="Partner not found" subtitle="This person is not in the local data set." onBack={router.back} />;
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
      subtitle="Hits by skill and timeline for this person."
      onBack={router.back}
      action={
        <IconButton
          accessibilityLabel="Edit person"
          onPress={() => {
            setPartnerName(partner.name);
            setEditingPartner(true);
          }}
        >
          <MaterialIcons name="edit" size={20} color={colors.sage} />
        </IconButton>
      }
    >
      {editingPartner ? (
        <Card style={styles.editCard}>
          <Text style={[styles.fieldLabel, { color: colors.ink }]}>Name</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={setPartnerName}
            placeholder="Name"
            placeholderTextColor={colors.quiet}
            returnKeyType="done"
            style={[styles.input, { borderColor: colors.line, color: colors.ink }]}
            value={partnerName}
          />
          <View style={styles.formActions}>
            <FormAction
              label="Cancel"
              onPress={() => {
                setEditingPartner(false);
                setPartnerName('');
              }}
            />
            <FormAction
              primary
              label="Save"
              onPress={async () => {
                if (!partnerName.trim()) return;
                try {
                  await updatePartner({ id: partner.id, name: partnerName });
                  setEditingPartner(false);
                } catch {
                  setEditingPartner(false);
                }
              }}
            />
          </View>
        </Card>
      ) : null}

      <View style={styles.section}>
        <CollapsibleSectionHeader
          colors={colors}
          count={skillRows.length}
          open={hitsOpen}
          title="Hits By Skill"
          onToggle={() => setHitsOpen((current) => !current)}
        />
        {hitsOpen ? (
          skillRows.length === 0 ? (
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
          )
        ) : null}
      </View>

      <View style={styles.section}>
        <CollapsibleSectionHeader
          colors={colors}
          count={recent.length}
          open={timelineOpen}
          title="Timeline"
          onToggle={() => setTimelineOpen((current) => !current)}
        />
        {timelineOpen ? (
          recent.length === 0 ? (
            <EmptyState
              framed={false}
              title="No timeline yet"
              body="Logged hits against this person will appear here."
            />
          ) : (
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
          )
        ) : null}
      </View>
    </Screen>
  );
}

function CollapsibleSectionHeader({
  colors,
  count,
  onToggle,
  open,
  title,
}: {
  colors: ReturnType<typeof useTheme>;
  count?: number;
  onToggle: () => void;
  open: boolean;
  title: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={onToggle}
      style={({ pressed }) => [styles.sectionHeader, pressed && styles.pressed]}
    >
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>{title}</Text>
        {typeof count === 'number' ? (
          <Text style={[styles.sectionCount, { color: colors.sage }]}>{count}</Text>
        ) : null}
      </View>
      <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={22} color={colors.muted} />
    </Pressable>
  );
}

function FormAction({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  const colors = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.formAction, pressed && styles.pressed]}
    >
      <Text style={[styles.formActionText, { color: primary ? colors.sage : colors.muted }]}>
        {label}
      </Text>
    </Pressable>
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
  editCard: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  fieldLabel: {
    ...textStyles.formLabel,
  },
  formAction: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  formActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  formActionText: {
    ...textStyles.composerActionPrimary,
  },
  hitListRows: {
    gap: 2,
  },
  input: {
    ...textStyles.formInput,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.72,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionCount: {
    ...textStyles.sectionTitleCount,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 34,
  },
  sectionTitle: {
    ...textStyles.sectionTitle,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
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
