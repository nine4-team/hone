import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Media, TrainingLogType } from '../../lib/types';
import { ActivationSwitch } from '../../components/ActivationSwitch';
import { ArsenalIcon } from '../../components/ArsenalIcon';
import { BottomSheetMenu } from '../../components/BottomSheetMenu';
import { EmptyState } from '../../components/EmptyState';
import { FloatingNavigation } from '../../components/FloatingNavigation';
import { HitSummaryList } from '../../components/HitSummaryList';
import { Screen } from '../../components/Screen';
import { Card, IconButton } from '../../components/ui';
import { formatDate, trainingLogTypeLabels, trainingLogTypes } from '../../lib/format';
import { HITS_PER_LEVEL, MAX_VISIBLE_LEVEL, getSkillLevelProgress, hitRowsByPartner } from '../../lib/hits';
import { inferMediaType } from '../../lib/mediaMetadata';
import { useHitList } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';
import { textStyles } from '../../lib/typography';
import { useToast } from '../../lib/useToast';

export default function SkillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    addQuickNote,
    addMedia,
    addStandaloneHit,
    deleteSkill,
    hits,
    media,
    notes,
    partners,
    skills,
    toggleActive,
    trainingLogs,
    removeMedia,
    updateMedia,
    updateNote,
  } = useHitList();
  const skill = skills.find((item) => item.id === id);
  const [noteBody, setNoteBody] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [logsOpen, setLogsOpen] = useState(false);
  const [hitListOpen, setHitListOpen] = useState(false);
  const [addingHit, setAddingHit] = useState(false);
  const [hitPartnerName, setHitPartnerName] = useState('');
  const [hitCount, setHitCount] = useState('1');
  const [mediaOpen, setMediaOpen] = useState(false);
  const [addingMedia, setAddingMedia] = useState(false);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaNotes, setMediaNotes] = useState('');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const trainingLogsY = useRef(0);
  const { toastMessage, showToast } = useToast();

  const skillNotes = notes
    .filter((note) => note.skillId === id)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const skillLogs = trainingLogs
    .filter((log) => log.skillId === id)
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  const skillMedia = media.filter((item) => item.skillId === id);
  const skillHits = hits.filter((hit) => hit.skillId === id);
  const totalHits = skillHits.reduce((sum, hit) => sum + hit.count, 0);
  const levelProgress = getSkillLevelProgress(totalHits);
  const hitsByTrainingLogId = skillHits.reduce<Record<string, number>>((counts, hit) => {
    if (!hit.trainingLogId) return counts;
    counts[hit.trainingLogId] = (counts[hit.trainingLogId] ?? 0) + hit.count;
    return counts;
  }, {});
  const trainingStats = trainingLogTypes.map((type) => {
    const logsForType = skillLogs.filter((log) => log.type === type);
    const minutes = logsForType.reduce((sum, log) => sum + (log.durationMinutes ?? 0), 0);
    const hitCount = logsForType.reduce((sum, log) => sum + (hitsByTrainingLogId[log.id] ?? 0), 0);

    return {
      type,
      entryCount: logsForType.length,
      hitCount,
      minutes,
    };
  });
  const statsByType = trainingStats.reduce<Partial<Record<TrainingLogType, (typeof trainingStats)[number]>>>(
    (stats, stat) => ({ ...stats, [stat.type]: stat }),
    {},
  );
  const moreStats = [
    ...trainingLogTypes
      .map((type) => ({
        key: `${type}-time`,
        label: getTrainingTimeLabel(type),
        value: formatLoggedHours(statsByType[type]?.minutes ?? 0),
        visible: (statsByType[type]?.minutes ?? 0) > 0,
      }))
      .filter((stat) => stat.visible),
    {
      key: 'constraint_game-hits',
      label: 'Game hits',
      value: formatHitStat(statsByType.constraint_game?.hitCount ?? 0),
      visible: (statsByType.constraint_game?.hitCount ?? 0) > 0,
    },
    {
      key: 'rolling-hits',
      label: 'Rolling hits',
      value: formatHitStat(statsByType.rolling?.hitCount ?? 0),
      visible: (statsByType.rolling?.hitCount ?? 0) > 0,
    },
  ].filter((stat) => stat.visible);
  const hasMoreStats = moreStats.length > 0;

  const hitList = useMemo(() => hitRowsByPartner(skillHits, partners), [partners, skillHits]);

  if (!skill) {
    return <Screen title="Skill not found" subtitle="This skill is not in the local data set." onBack={router.back} />;
  }

  const confirmDeleteSkill = () => {
    Alert.alert(
      'Delete Skill',
      'This removes the skill, media, notes, logs, and hits. Partners stay in your library.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSkill(skill.id);
            router.replace('/library');
          },
        },
      ],
    );
  };

  const scrollToTrainingLogs = () => {
    setLogsOpen(true);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        animated: true,
        y: Math.max(trainingLogsY.current - spacing.md, 0),
      });
    });
  };

  return (
    <Screen
      title={skill.name}
      status={
        <Text style={styles.headerLifetimeHits}>
          <Text style={styles.headerLifetimeHitCount}>{totalHits}</Text>
          {` Lifetime ${totalHits === 1 ? 'Hit' : 'Hits'}`}
        </Text>
      }
      scrollRef={scrollRef}
      onBack={router.back}
      action={
        <ActivationSwitch
          value={skill.active}
          onValueChange={(nextActive) => {
            showToast(nextActive ? 'Skill activated' : 'Skill deactivated');
            toggleActive(skill.id);
          }}
        />
      }
      toastMessage={toastMessage}
      bottomOverlay={
        <>
          <FloatingNavigation
            createLabel="Open quick actions"
            onCreatePress={() => setQuickAddOpen(true)}
            items={[
              {
                key: 'active',
                icon: 'sports-kabaddi',
                label: 'Active skills tab',
                onPress: () => router.push('/'),
              },
              {
                key: 'arsenal',
                icon: ArsenalIcon,
                label: 'Arsenal tab',
                onPress: () => router.push('/library'),
              },
              {
                key: 'settings',
                icon: 'settings',
                label: 'Settings tab',
                onPress: () => router.push('/settings'),
              },
            ]}
          />
          <BottomSheetMenu
            visible={quickAddOpen}
            onRequestClose={() => setQuickAddOpen(false)}
            items={[
              {
                key: 'log',
                label: 'Log Training',
                onPress: () => router.push(`/log/${skill.id}`),
              },
              {
                key: 'skill',
                label: 'New Skill',
                onPress: () => router.push('/skills/new'),
              },
              {
                key: 'delete',
                label: 'Delete Skill',
                destructive: true,
                onPress: confirmDeleteSkill,
              },
            ]}
          />
        </>
      }
    >
      <View style={styles.section}>
        <Card style={styles.levelCard}>
          <View style={styles.progressStack}>
            <ProgressBarStat
              label="level"
              progress={levelProgress.level / MAX_VISIBLE_LEVEL}
              value={`${levelProgress.level}/${MAX_VISIBLE_LEVEL}`}
            />
            <ProgressBarStat
              label="hits this level"
              progress={levelProgress.progressToNextLevel}
              value={`${levelProgress.hitsIntoLevel}/${HITS_PER_LEVEL}`}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: statsOpen }}
            onPress={() => setStatsOpen((current) => !current)}
            style={({ pressed }) => [styles.statsToggle, pressed && styles.pressed]}
          >
            <Text style={styles.statsToggleText}>More</Text>
            <MaterialIcons
              name={statsOpen ? 'expand-less' : 'expand-more'}
              size={18}
              color={colors.muted}
            />
          </Pressable>

          {statsOpen ? (
            <View style={styles.secondaryStats}>
              {hasMoreStats ? (
                <>
                  {moreStats.map((stat) => (
                    <TrainingStatRow
                      key={stat.key}
                      label={stat.label}
                      value={stat.value}
                    />
                  ))}
                </>
              ) : (
                <Text style={styles.emptyTrainingStats}>No training stats recorded yet.</Text>
              )}
            </View>
          ) : null}
        </Card>
      </View>

      <View style={styles.section}>
        <CollapsibleSectionHeader
          title="Hit List"
          open={hitListOpen}
          onToggle={() => setHitListOpen((current) => !current)}
          action={
            <IconButton
              accessibilityLabel="Add standalone hit"
              onPress={() => {
                setHitListOpen(true);
                setAddingHit((current) => !current);
              }}
            >
              <MaterialIcons name="add" size={22} color={colors.sage} />
            </IconButton>
          }
        />
        {hitListOpen ? (
          <View style={styles.stack}>
            {addingHit ? (
              <Card style={styles.hitComposer}>
                <View style={styles.hitComposerRow}>
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={setHitPartnerName}
                    placeholder="Partner"
                    placeholderTextColor={colors.quiet}
                    style={[styles.hitInput, styles.hitPartnerInput]}
                    value={hitPartnerName}
                  />
                  <TextInput
                    keyboardType="number-pad"
                    onChangeText={setHitCount}
                    placeholder="Hits"
                    placeholderTextColor={colors.quiet}
                    style={[styles.hitInput, styles.hitCountInput]}
                    value={hitCount}
                  />
                </View>
                <View style={styles.composerActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setAddingHit(false);
                      setHitPartnerName('');
                      setHitCount('1');
                    }}
                    style={({ pressed }) => [styles.composerButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.composerCancel}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      const count = Number.parseInt(hitCount, 10);
                      if (!Number.isFinite(count) || count <= 0) return;
                      addStandaloneHit({
                        skillId: skill.id,
                        partnerName: hitPartnerName,
                        count,
                      });
                      setAddingHit(false);
                      setHitPartnerName('');
                      setHitCount('1');
                    }}
                    style={({ pressed }) => [styles.composerButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.composerSave}>Save</Text>
                  </Pressable>
                </View>
              </Card>
            ) : null}
            <View style={styles.hitListRows}>
              {hitList.length === 0 ? (
                <EmptyState
                  framed={false}
                  title="No hits yet"
                />
              ) : (
                <HitSummaryList
                  alignWithSectionAction
                  rows={[
                    ...hitList,
                    {
                      id: 'total',
                      label: 'Total',
                      count: totalHits,
                      total: true,
                    },
                  ]}
                />
              )}
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <CollapsibleSectionHeader
          title="Media"
          open={mediaOpen}
          onToggle={() => setMediaOpen((current) => !current)}
          action={
            <IconButton
              accessibilityLabel="Add media"
              onPress={() => {
                setMediaOpen(true);
                setAddingMedia(true);
                setEditingMediaId(null);
                setMediaUrl('');
                setMediaNotes('');
              }}
            >
              <MaterialIcons name="add" size={22} color={colors.sage} />
            </IconButton>
          }
        />
        {mediaOpen ? (
          <View style={styles.stack}>
            {addingMedia || editingMediaId ? (
              <Card style={styles.mediaComposer}>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="url"
                  onChangeText={setMediaUrl}
                  placeholder="URL"
                  placeholderTextColor={colors.quiet}
                  style={styles.mediaInput}
                  value={mediaUrl}
                />
                <TextInput
                  multiline
                  onChangeText={setMediaNotes}
                  placeholder="Note"
                  placeholderTextColor={colors.quiet}
                  style={[styles.mediaInput, styles.mediaNotesInput]}
                  value={mediaNotes}
                />
                {mediaUrl.trim() ? (
                  <View style={styles.mediaPreviewRow}>
                    <MediaThumbnail url={mediaUrl} type={inferMediaType(mediaUrl)} />
                  </View>
                ) : null}
                <View style={styles.composerActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setAddingMedia(false);
                      setEditingMediaId(null);
                      setMediaUrl('');
                      setMediaNotes('');
                    }}
                    style={({ pressed }) => [styles.composerButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.composerCancel}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={async () => {
                      if (!mediaUrl.trim()) return;
                      if (editingMediaId) {
                        await updateMedia({
                          id: editingMediaId,
                          url: mediaUrl,
                          notes: mediaNotes,
                        });
                      } else {
                        await addMedia({
                          skillId: skill.id,
                          url: mediaUrl,
                          notes: mediaNotes,
                        });
                      }
                      setAddingMedia(false);
                      setEditingMediaId(null);
                      setMediaUrl('');
                      setMediaNotes('');
                    }}
                    style={({ pressed }) => [styles.composerButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.composerSave}>Save</Text>
                  </Pressable>
                </View>
              </Card>
            ) : null}
            {skillMedia.length === 0 ? (
              <EmptyState title="No media yet" />
            ) : (
              skillMedia.filter((item) => item.id !== editingMediaId).map((item) => (
                <Card key={item.id} style={styles.mediaCard}>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`Open ${getMediaLinkLabel(item)}`}
                    onPress={() => openMediaUrl(item.url)}
                    style={({ pressed }) => [styles.mediaLinkArea, pressed && styles.pressed]}
                  >
                    <MediaThumbnail thumbnailUrl={item.thumbnailUrl} url={item.url} type={item.type} />
                  </Pressable>
                  <View style={styles.mediaContent}>
                    <View style={styles.mediaHeader}>
                      <Pressable
                        accessibilityRole="link"
                        accessibilityLabel={`Open ${getMediaLinkLabel(item)}`}
                        onPress={() => openMediaUrl(item.url)}
                        style={({ pressed }) => [styles.mediaTitleBlock, pressed && styles.pressed]}
                      >
                        <Text style={styles.cardTitle} numberOfLines={2}>{getMediaPrimaryText(item)}</Text>
                        <Text style={styles.cardMeta} numberOfLines={1}>{getMediaSourceLabel(item.url)}</Text>
                      </Pressable>
                      <View style={styles.mediaActions}>
                        <IconButton
                          accessibilityLabel="Edit media"
                          onPress={() => {
                            setMediaOpen(true);
                            setAddingMedia(false);
                            setEditingMediaId(item.id);
                            setMediaUrl(item.url);
                            setMediaNotes(item.notes ?? '');
                          }}
                        >
                          <MaterialIcons name="edit" size={18} color={colors.sage} />
                        </IconButton>
                        <IconButton
                          accessibilityLabel="Remove media"
                          onPress={() => removeMedia(item.id)}
                        >
                          <MaterialIcons name="delete-outline" size={18} color={colors.muted} />
                        </IconButton>
                      </View>
                    </View>
                    {item.notes ? <Text style={styles.cardBody} numberOfLines={2}>{item.notes}</Text> : null}
                  </View>
                </Card>
              ))
            )}
          </View>
        ) : null}
      </View>
      <View style={styles.section}>
        <CollapsibleSectionHeader
          title="Notes"
          open={notesOpen}
          onToggle={() => setNotesOpen((current) => !current)}
          action={
            <IconButton
              accessibilityLabel="Add note"
              onPress={() => {
                setNotesOpen(true);
                setAddingNote(true);
                setEditingNoteId(null);
                setNoteBody('');
              }}
            >
              <MaterialIcons name="add" size={22} color={colors.sage} />
            </IconButton>
          }
        />
        {notesOpen ? (
          <View style={styles.stack}>
            {addingNote || editingNoteId ? (
              <Card style={styles.noteComposer}>
                <TextInput
                  autoFocus
                  multiline
                  onChangeText={setNoteBody}
                  placeholder="Add a note"
                  placeholderTextColor={colors.quiet}
                  style={styles.noteInput}
                  value={noteBody}
                />
                <View style={styles.composerActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setAddingNote(false);
                      setEditingNoteId(null);
                      setNoteBody('');
                    }}
                    style={({ pressed }) => [styles.composerButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.composerCancel}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      if (!noteBody.trim()) return;
                      if (editingNoteId) {
                        updateNote({ id: editingNoteId, body: noteBody });
                      } else {
                        addQuickNote(skill.id, noteBody);
                      }
                      setNoteBody('');
                      setAddingNote(false);
                      setEditingNoteId(null);
                    }}
                    style={({ pressed }) => [styles.composerButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.composerSave}>Save</Text>
                  </Pressable>
                </View>
              </Card>
            ) : null}
            {skillNotes.length === 0 ? (
              <EmptyState title="No notes yet" body="Add a quick note or include one while logging training." />
            ) : (
              skillNotes.filter((note) => note.id !== editingNoteId).map((note) => (
                <Card key={note.id} style={styles.contentCard}>
                  <View style={styles.noteHeader}>
                    <View style={styles.noteMetaRow}>
                      <Text style={styles.cardMeta}>{formatDate(note.createdAt)}</Text>
                      {note.trainingLogId ? (
                        <>
                          <Text style={styles.cardMeta}> · </Text>
                          <Pressable
                            accessibilityLabel="Jump to training log"
                            accessibilityRole="button"
                            onPress={scrollToTrainingLogs}
                            style={({ pressed }) => pressed && styles.pressed}
                          >
                            <Text style={styles.noteTrainingLogLink}>Training Log</Text>
                          </Pressable>
                        </>
                      ) : null}
                    </View>
                    <IconButton
                      accessibilityLabel="Edit note"
                      onPress={() => {
                        setNotesOpen(true);
                        setAddingNote(false);
                        setEditingNoteId(note.id);
                        setNoteBody(note.body);
                      }}
                    >
                      <MaterialIcons name="edit" size={18} color={colors.sage} />
                    </IconButton>
                  </View>
                  <Text style={styles.cardBody}>{note.body}</Text>
                </Card>
              ))
            )}
          </View>
        ) : null}
      </View>

      <View
        onLayout={(event) => {
          trainingLogsY.current = event.nativeEvent.layout.y;
        }}
        style={styles.section}
      >
        <CollapsibleSectionHeader
          title="Training Logs"
          open={logsOpen}
          onToggle={() => setLogsOpen((current) => !current)}
          action={
            <IconButton
              accessibilityLabel="Log training"
              onPress={() => router.push(`/log/${skill.id}`)}
            >
              <MaterialIcons name="add" size={22} color={colors.sage} />
            </IconButton>
          }
        />
        {logsOpen ? (
          <View style={styles.stack}>
            {skillLogs.length === 0 ? (
              <EmptyState title="No logs yet" body="Log practice after study, drilling, games, or rolling." />
            ) : (
              skillLogs.map((log) => {
                const logHits = hits.filter((hit) => hit.trainingLogId === log.id);
                const logTotalHits = logHits.reduce((sum, hit) => sum + hit.count, 0);
                const logNotes = notes.filter((note) => note.trainingLogId === log.id);

                return (
                  <Card key={log.id} style={styles.logCard}>
                    <View style={styles.logHeader}>
                      <View style={styles.logTitleBlock}>
                        <Text style={styles.logType}>{trainingLogTypeLabels[log.type]}</Text>
                        <Text style={styles.logMeta}>
                          {formatDate(log.occurredAt)}
                          {log.durationMinutes ? ` · ${formatDurationMinutes(log.durationMinutes)}` : ''}
                          {logTotalHits ? ` · ${logTotalHits} hits` : ''}
                        </Text>
                      </View>
                      <IconButton
                        accessibilityLabel="Edit training log"
                        onPress={() => Alert.alert('Edit Training Log', 'Training log editing is planned but not wired yet.')}
                      >
                        <MaterialIcons name="edit" size={18} color={colors.sage} />
                      </IconButton>
                    </View>
                    {logHits.length > 0 ? (
                      <View style={styles.logHits}>
                        <View style={styles.logHitsHeader}>
                          <Text style={styles.logHitsLabel}>Hits</Text>
                          <Text style={styles.logHitsTotal}>{logTotalHits}</Text>
                        </View>
                        <HitSummaryList rows={hitRowsByPartner(logHits, partners)} />
                      </View>
                    ) : null}
                    {logNotes.map((note) => (
                      <Text key={note.id} style={styles.logNote}>
                        {note.body}
                      </Text>
                    ))}
                  </Card>
                );
              })
            )}
          </View>
        ) : null}
      </View>

    </Screen>
  );
}

function TrainingStatRow({
  emphasized,
  label,
  value,
}: {
  emphasized?: boolean;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.trainingStatRow, emphasized && styles.trainingStatRowEmphasized]}>
      <Text style={[styles.trainingStatLabel, emphasized && styles.trainingStatLabelEmphasized]}>
        {label}
      </Text>
      <Text style={[styles.trainingStatValue, emphasized && styles.trainingStatValueEmphasized]}>
        {value}
      </Text>
    </View>
  );
}

function ProgressBarStat({
  label,
  progress,
  value,
}: {
  label: string;
  progress: number;
  value: string;
}) {
  const percent = Math.round(progress * 100);

  return (
    <View style={styles.progressBarStat}>
      <View style={styles.progressBarHeader}>
        <View style={styles.progressBarLabelRow}>
          <MaterialIcons name="bar-chart" size={10} color={colors.sage} />
          <Text style={styles.progressBarLabel}>{label}</Text>
        </View>
        <Text style={styles.progressBarValue}>{value}</Text>
      </View>
      <View style={styles.progressBar}>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: percent }}
          style={[styles.progressFill, { width: `${percent}%` }]}
        />
      </View>
    </View>
  );
}

function getTrainingTimeLabel(type: TrainingLogType) {
  switch (type) {
    case 'study':
      return 'Study time';
    case 'dialogue_drilling':
      return 'Drilling time';
    case 'constraint_game':
      return 'Game time';
    case 'rolling':
      return 'Rolling time';
  }
}

function formatHitStat(count: number) {
  return `${count} ${count === 1 ? 'hit' : 'hits'}`;
}

function formatDurationMinutes(minutes: number) {
  return `${minutes} min`;
}

function formatLoggedHours(minutes: number) {
  if (minutes <= 0) return '0 hrs';

  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hrs`;
}

function MediaThumbnail({
  thumbnailUrl,
  type,
  url,
}: Pick<Media, 'thumbnailUrl' | 'type' | 'url'>) {
  const resolvedThumbnailUrl = thumbnailUrl || getYoutubeThumbnailUrl(url);

  return (
    <View style={styles.mediaThumb}>
      {resolvedThumbnailUrl ? (
        <Image source={{ uri: resolvedThumbnailUrl }} style={styles.mediaThumbImage} />
      ) : (
        <View style={styles.mediaThumbFallback}>
          <MaterialIcons
            name={type === 'instagram' ? 'photo-camera' : 'link'}
            size={22}
            color={colors.sage}
          />
        </View>
      )}
      {type === 'youtube' ? (
        <View style={styles.mediaPlayBadge}>
          <MaterialIcons name="play-arrow" size={16} color={colors.surface} />
        </View>
      ) : null}
    </View>
  );
}

function getYoutubeThumbnailUrl(url: string) {
  const youtubeId = getYoutubeVideoId(url);
  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;
}

function getMediaPrimaryText(item: Media) {
  return item.title?.trim() || getMediaSourceLabel(item.url);
}

function getMediaLinkLabel(item: Media) {
  return item.title?.trim() || getMediaSourceLabel(item.url);
}

function getMediaSourceLabel(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function getYoutubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.split('/').filter(Boolean)[0] ?? null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v');
    }
  } catch {
    return null;
  }

  return null;
}

function openMediaUrl(url: string) {
  Linking.openURL(url).catch(() => {
    Alert.alert('Could not open link', url);
  });
}

function CollapsibleSectionHeader({
  action,
  count,
  onToggle,
  open,
  title,
}: {
  action?: ReactNode;
  count?: number;
  onToggle: () => void;
  open: boolean;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Pressable
        accessibilityRole="button"
        onPress={onToggle}
        style={({ pressed }) => [styles.sectionTitleButton, pressed && styles.pressed]}
      >
        <Text style={styles.sectionTitle}>
          {title}
          {typeof count === 'number' ? <Text style={styles.sectionCount}> ({count})</Text> : null}
        </Text>
        <MaterialIcons
          name={open ? 'expand-less' : 'expand-more'}
          size={20}
          color={colors.muted}
        />
      </Pressable>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    ...textStyles.detailRecordBody,
    marginTop: 6,
  },
  cardMeta: {
    ...textStyles.detailRecordMeta,
  },
  cardTitle: {
    ...textStyles.detailRecordTitle,
    marginBottom: 2,
  },
  contentCard: {
    padding: spacing.md,
  },
  composerActions: {
    alignItems: 'center',
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  composerButton: {
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: spacing.md,
  },
  composerCancel: {
    ...textStyles.composerAction,
  },
  composerSave: {
    ...textStyles.composerActionPrimary,
  },
  hitComposer: {
    padding: 0,
  },
  hitComposerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  hitCountInput: {
    textAlign: 'center',
    width: 72,
  },
  hitInput: {
    ...textStyles.formInput,
    minHeight: 36,
  },
  hitPartnerInput: {
    flex: 1,
  },
  hitListRows: {
    gap: 2,
  },
  levelCard: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  logCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  logHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  logTitleBlock: {
    flex: 1,
    gap: 2,
  },
  logHitsHeader: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    minHeight: 26,
    paddingRight: 8,
  },
  logHitsLabel: {
    ...textStyles.rowSummaryLabel,
  },
  logHitsTotal: {
    ...textStyles.rowSummaryValue,
    minWidth: 32,
    textAlign: 'right',
  },
  logHits: {
    gap: 2,
    marginTop: 8,
  },
  logMeta: {
    ...textStyles.detailRecordMeta,
  },
  logNote: {
    ...textStyles.detailRecordBody,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  logType: {
    ...textStyles.detailRecordTitle,
  },
  mediaActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  mediaCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.sm,
  },
  mediaComposer: {
    padding: 0,
  },
  mediaContent: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  mediaHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  mediaInput: {
    ...textStyles.formInput,
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mediaNotesInput: {
    minHeight: 44,
    textAlignVertical: 'top',
  },
  mediaLinkArea: {
    alignSelf: 'flex-start',
  },
  mediaPlayBadge: {
    alignItems: 'center',
    backgroundColor: colors.clay,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
    position: 'absolute',
    top: '50%',
    width: 24,
  },
  mediaPreviewRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mediaThumb: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    height: 72,
    overflow: 'hidden',
    width: 104,
  },
  mediaThumbFallback: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  mediaThumbImage: {
    height: '100%',
    width: '100%',
  },
  mediaTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  noteComposer: {
    padding: 0,
  },
  noteHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noteInput: {
    ...textStyles.detailRecordBody,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
  },
  noteMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  noteTrainingLogLink: {
    ...textStyles.detailRecordMeta,
    color: colors.sage,
    fontWeight: '700',
  },
  emptyTrainingStats: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  progressBar: {
    backgroundColor: colors.line,
    borderRadius: 2,
    height: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarLabel: {
    color: colors.sage,
    fontSize: 10,
    fontWeight: '700',
    includeFontPadding: false,
    textTransform: 'uppercase',
    textAlignVertical: 'center',
  },
  progressBarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBarLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  progressBarStat: {
    gap: 5,
  },
  progressBarValue: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  progressStack: {
    gap: spacing.sm,
  },
  progressFill: {
    backgroundColor: colors.sage,
    borderRadius: 2,
    height: '100%',
  },
  section: {
    marginBottom: spacing.lg,
  },
  secondaryStats: {
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 0,
    paddingTop: spacing.sm,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    ...textStyles.sectionTitle,
  },
  sectionCount: {
    ...textStyles.sectionTitleCount,
  },
  sectionTitleButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 32,
  },
  stack: {
    gap: spacing.sm,
  },
  headerLifetimeHits: {
    color: colors.sage,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  headerLifetimeHitCount: {
    fontWeight: '800',
  },
  statsToggle: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 28,
  },
  statsToggleText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  trainingStatLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  trainingStatLabelEmphasized: {
    color: colors.sage,
  },
  trainingStatRow: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 34,
    paddingVertical: spacing.xs,
  },
  trainingStatRowEmphasized: {
    borderBottomWidth: 0,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
  },
  trainingStatValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'right',
  },
  trainingStatValueEmphasized: {
    color: colors.sage,
  },
});
