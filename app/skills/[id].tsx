import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Alert, Image, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Media } from '../../lib/types';
import { ActivationSwitch } from '../../components/ActivationSwitch';
import { BottomSheetMenu } from '../../components/BottomSheetMenu';
import { EmptyState } from '../../components/EmptyState';
import { FloatingNavigation } from '../../components/FloatingNavigation';
import { HitSummaryList } from '../../components/HitSummaryList';
import { Screen } from '../../components/Screen';
import { StageSelector } from '../../components/StageDisplay';
import { Card, IconButton } from '../../components/ui';
import { formatDate, trainingLogTypeLabels } from '../../lib/format';
import { hitRowsByPartner } from '../../lib/hits';
import { inferMediaType } from '../../lib/mediaMetadata';
import { useHone } from '../../lib/store';
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
    updateStage,
  } = useHone();
  const skill = skills.find((item) => item.id === id);
  const [noteBody, setNoteBody] = useState('');
  const [notesOpen, setNotesOpen] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [logsOpen, setLogsOpen] = useState(true);
  const [hitListOpen, setHitListOpen] = useState(true);
  const [addingHit, setAddingHit] = useState(false);
  const [hitPartnerName, setHitPartnerName] = useState('');
  const [hitCount, setHitCount] = useState('1');
  const [mediaOpen, setMediaOpen] = useState(true);
  const [addingMedia, setAddingMedia] = useState(false);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaNotes, setMediaNotes] = useState('');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
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
  const totalMinutes = skillLogs.reduce((sum, log) => sum + (log.durationMinutes ?? 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

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

  return (
    <Screen
      title={skill.name}
      status={
        <Text style={styles.headerStatus}>
          <Text style={styles.headerStatusValue}>{totalHits}</Text> Hits
          <Text style={styles.headerStatusDivider}> · </Text>
          <Text style={styles.headerStatusValue}>{totalHours}</Text> Hours
        </Text>
      }
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
      stickyHeader={
        <StageSelector value={skill.stage} onChange={(stage) => updateStage(skill.id, stage)} />
      }
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
                key: 'pipeline',
                icon: 'view-column',
                label: 'Pipeline tab',
                onPress: () => router.push('/pipeline'),
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
        <CollapsibleSectionHeader
          title="Hit List"
          count={totalHits}
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
                <HitSummaryList alignWithSectionAction rows={hitList} />
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
                    <Text style={styles.cardMeta}>
                      {formatDate(note.createdAt)}
                      {note.trainingLogId ? ' · training log' : ''}
                    </Text>
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

      <View style={styles.section}>
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
                          {log.durationMinutes ? ` · ${log.durationMinutes}m` : ''}
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
  pressed: {
    opacity: 0.72,
  },
  section: {
    marginBottom: spacing.lg,
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
  headerStatus: {
    ...textStyles.headerStatus,
    marginTop: 2,
  },
  headerStatusDivider: {
    color: colors.quiet,
  },
  headerStatusValue: {
    ...textStyles.headerStatusValue,
  },
});
