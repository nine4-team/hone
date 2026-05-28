import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { clearSharedPayloads, getSharedPayloads } from 'expo-sharing';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { FormHelp, FormInput, FormLabel, FormStack } from '../components/FormControls';
import { Screen } from '../components/Screen';
import { Card } from '../components/ui';
import { resolveMediaMetadata, type MediaMetadata } from '../lib/mediaMetadata';
import { normalizeSharedPayloads, normalizeSharedUrl, type SharedUrlChoice } from '../lib/shareIntake';
import { useHone } from '../lib/store';
import { colors, spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';

export default function ShareIntakeScreen() {
  const router = useRouter();
  const { addMedia, addSkillWithMedia, skills } = useHone();
  const [choices, setChoices] = useState<SharedUrlChoice[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [skillName, setSkillName] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [metadata, setMetadata] = useState<MediaMetadata>({});
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedChoice = choices.find((choice) => choice.id === selectedId) ?? choices[0];

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') return;

      try {
        const incomingChoices = normalizeSharedPayloads(getSharedPayloads());
        if (incomingChoices.length === 0) return;

        setChoices(incomingChoices);
        setSelectedId(incomingChoices[0].id);
        setManualUrl(incomingChoices[0].url);
        setError(null);
      } catch {
        setError('HitList could not read the shared item. Paste the link below.');
      }
    }, []),
  );

  useEffect(() => {
    if (!selectedChoice?.url) {
      setMetadata({});
      return;
    }

    let cancelled = false;
    setLoadingMetadata(true);
    resolveMediaMetadata(selectedChoice.url)
      .then((nextMetadata) => {
        if (cancelled) return;
        setMetadata(nextMetadata);
        setSkillName((current) => current || titleToSkillName(nextMetadata.title));
      })
      .catch(() => {
        if (!cancelled) setMetadata({});
      })
      .finally(() => {
        if (!cancelled) setLoadingMetadata(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedChoice?.url]);

  const filteredSkills = useMemo(() => {
    const query = skillSearch.trim().toLowerCase();
    return skills
      .filter((skill) => !query || skill.name.toLowerCase().includes(query))
      .sort((left, right) => right.lastTouchedAt.localeCompare(left.lastTouchedAt))
      .slice(0, 8);
  }, [skillSearch, skills]);

  const useManualUrl = () => {
    const normalized = normalizeSharedUrl(manualUrl);
    if (!normalized) {
      setError('Enter a valid URL to continue.');
      return;
    }

    const choice = { ...normalized, id: `manual-${normalized.url}` };
    setChoices([choice]);
    setSelectedId(choice.id);
    setManualUrl(choice.url);
    setError(null);
  };

  const saveToNewSkill = async () => {
    if (!selectedChoice || !skillName.trim() || saving) return;

    setSaving(true);
    setError(null);
    try {
      const skill = await addSkillWithMedia({
        active: false,
        mediaNotes: notes,
        mediaUrl: selectedChoice.url,
        name: skillName,
        stage: 'saved',
      });
      clearIncomingShare();
      router.replace(`/skills/${skill.id}`);
    } catch {
      setError('HitList could not save this skill. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveToExistingSkill = async (skillId: string) => {
    if (!selectedChoice || saving) return;

    setSaving(true);
    setError(null);
    try {
      await addMedia({ skillId, url: selectedChoice.url, notes });
      clearIncomingShare();
      router.replace(`/skills/${skillId}`);
    } catch {
      setError('HitList could not add this media. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="Shared Link" subtitle="Create a skill or add media." onBack={router.back}>
      <FormStack>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {choices.length > 1 ? (
          <Card style={styles.panel}>
            <FormLabel>Choose link</FormLabel>
            {choices.map((choice) => (
              <ChoiceRow
                key={choice.id}
                choice={choice}
                selected={choice.id === selectedChoice?.id}
                onPress={() => {
                  setSelectedId(choice.id);
                  setManualUrl(choice.url);
                }}
              />
            ))}
          </Card>
        ) : null}

        {selectedChoice ? (
          <Card style={styles.panel}>
            <View style={styles.previewHeader}>
              <View style={styles.previewIcon}>
                <MaterialIcons name={iconForType(selectedChoice.type)} size={20} color={colors.sage} />
              </View>
              <View style={styles.previewText}>
                <Text style={styles.previewTitle} numberOfLines={2}>
                  {metadata.title || providerLabel(selectedChoice.url)}
                </Text>
                <Text style={styles.previewUrl} numberOfLines={2}>
                  {selectedChoice.url}
                </Text>
              </View>
              {loadingMetadata ? <ActivityIndicator color={colors.sage} /> : null}
            </View>
          </Card>
        ) : (
          <Card style={styles.panel}>
            <FormLabel>Link</FormLabel>
            <FormInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              onChangeText={setManualUrl}
              placeholder="https://youtube.com/watch?v=..."
              value={manualUrl}
            />
            <Button label="Use Link" onPress={useManualUrl} variant="secondary" />
          </Card>
        )}

        {selectedChoice ? (
          <>
            <Card style={styles.panel}>
              <FormLabel>Note</FormLabel>
              <FormInput
                multiline
                onChangeText={setNotes}
                placeholder="Optional cue, timestamp, or reason you saved this."
                style={styles.notesInput}
                value={notes}
              />
            </Card>

            <Card style={styles.panel}>
              <FormLabel>Create new skill</FormLabel>
              <FormHelp>Saved to the Arsenal by default. You can equip it later.</FormHelp>
              <FormInput
                onChangeText={setSkillName}
                placeholder="Skill name"
                value={skillName}
              />
              <Button label={saving ? 'Saving...' : 'Create Skill'} onPress={saveToNewSkill} />
            </Card>

            <Card style={styles.panel}>
              <FormLabel>Add to existing skill</FormLabel>
              <FormInput
                onChangeText={setSkillSearch}
                placeholder="Search skills"
                value={skillSearch}
              />
              <View style={styles.skillList}>
                {filteredSkills.map((skill) => (
                  <Pressable
                    accessibilityRole="button"
                    disabled={saving}
                    key={skill.id}
                    onPress={() => saveToExistingSkill(skill.id)}
                    style={({ pressed }) => [styles.skillRow, pressed && styles.pressed]}
                  >
                    <View style={styles.skillText}>
                      <Text style={styles.skillName} numberOfLines={1}>
                        {skill.name}
                      </Text>
                      <Text style={styles.skillMeta}>
                        {skill.active ? 'Equipped' : 'In Arsenal'}
                      </Text>
                    </View>
                    <MaterialIcons name="add-link" size={21} color={colors.sage} />
                  </Pressable>
                ))}
              </View>
            </Card>
          </>
        ) : null}
      </FormStack>
    </Screen>
  );
}

function ChoiceRow({
  choice,
  onPress,
  selected,
}: {
  choice: SharedUrlChoice;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.choiceRow, selected && styles.choiceRowSelected, pressed && styles.pressed]}
    >
      <Text style={styles.choiceText} numberOfLines={1}>{choice.url}</Text>
      {selected ? <MaterialIcons name="check" size={20} color={colors.sage} /> : null}
    </Pressable>
  );
}

function clearIncomingShare() {
  if (Platform.OS === 'web') return;

  try {
    clearSharedPayloads();
  } catch {
    // The payload is best-effort cleanup; failed cleanup should not block saving.
  }
}

function titleToSkillName(title?: string) {
  return title?.replace(/\s+-\s+YouTube$/i, '').trim() ?? '';
}

function iconForType(type: SharedUrlChoice['type']) {
  if (type === 'youtube') return 'play-circle-filled' as const;
  if (type === 'instagram') return 'photo-camera' as const;
  return 'link' as const;
}

function providerLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Shared link';
  }
}

const styles = StyleSheet.create({
  choiceRow: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  choiceRowSelected: {
    borderColor: colors.sage,
    backgroundColor: colors.surfaceMuted,
  },
  choiceText: {
    ...textStyles.detailRecordBody,
    flex: 1,
  },
  error: {
    ...textStyles.formHelp,
    color: colors.clay,
  },
  notesInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  panel: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.72,
  },
  previewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  previewIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  previewText: {
    flex: 1,
    minWidth: 0,
  },
  previewTitle: {
    ...textStyles.listRowTitle,
  },
  previewUrl: {
    ...textStyles.listRowMeta,
    marginTop: 2,
  },
  skillList: {
    gap: spacing.sm,
  },
  skillMeta: {
    ...textStyles.listRowMeta,
  },
  skillName: {
    ...textStyles.listRowTitle,
  },
  skillRow: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  skillText: {
    flex: 1,
    minWidth: 0,
  },
});
