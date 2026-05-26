import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { trainingLogTypeLabels, trainingLogTypes } from '../../lib/format';
import { useHone } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';
import type { TrainingLogType } from '../../lib/types';

type HitDraft = {
  partnerName: string;
  count: string;
};

export default function TrainingLogScreen() {
  const { skillId } = useLocalSearchParams<{ skillId: string }>();
  const router = useRouter();
  const { addTrainingLog, partners, skills } = useHone();
  const skill = skills.find((item) => item.id === skillId);
  const [type, setType] = useState<TrainingLogType>('rolling');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [hits, setHits] = useState<HitDraft[]>([{ partnerName: '', count: '' }]);
  const totalHits = hits.reduce((sum, hit) => sum + Number(hit.count || 0), 0);

  if (!skill) {
    return <Screen title="Skill not found" subtitle="This skill is not in the local data set." />;
  }

  return (
    <Screen title="Log Training" subtitle={skill.name}>
      <View style={styles.form}>
        <View style={styles.panel}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.segment}>
            {trainingLogTypes.map((item) => (
              <Button
                key={item}
                label={trainingLogTypeLabels[item]}
                onPress={() => setType(item)}
                variant={type === item ? 'primary' : 'secondary'}
              />
            ))}
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.label}>Duration</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setDurationMinutes}
            placeholder="Minutes, optional"
            placeholderTextColor={colors.quiet}
            style={styles.input}
            value={durationMinutes}
          />
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.label}>Hits</Text>
            <Text style={styles.total}>{totalHits} total</Text>
          </View>
          <View style={styles.stack}>
            {hits.map((hit, index) => (
              <View key={index} style={styles.hitRow}>
                <TextInput
                  autoCapitalize="words"
                  onChangeText={(value) =>
                    setHits((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, partnerName: value } : item,
                      ),
                    )
                  }
                  placeholder="Partner or leave blank"
                  placeholderTextColor={colors.quiet}
                  style={[styles.input, styles.partnerInput]}
                  value={hit.partnerName}
                />
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={(value) =>
                    setHits((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, count: value } : item,
                      ),
                    )
                  }
                  placeholder="0"
                  placeholderTextColor={colors.quiet}
                  style={[styles.input, styles.countInput]}
                  value={hit.count}
                />
              </View>
            ))}
          </View>
          {partners.length > 0 ? (
            <View style={styles.partnerChips}>
              {partners.slice(0, 4).map((partner) => (
                <Button
                  key={partner.id}
                  label={partner.name}
                  onPress={() =>
                    setHits((current) => {
                      const firstEmptyIndex = current.findIndex((hit) => !hit.partnerName.trim());
                      if (firstEmptyIndex === -1) {
                        return [...current, { partnerName: partner.name, count: '1' }];
                      }
                      return current.map((hit, index) =>
                        index === firstEmptyIndex
                          ? { partnerName: partner.name, count: hit.count || '1' }
                          : hit,
                      );
                    })
                  }
                  variant="secondary"
                />
              ))}
            </View>
          ) : null}
          <Button
            label="+ Hit Row"
            onPress={() => setHits((current) => [...current, { partnerName: '', count: '' }])}
            variant="secondary"
          />
        </View>

        <View style={styles.panel}>
          <Text style={styles.label}>Note</Text>
          <TextInput
            multiline
            onChangeText={setNoteBody}
            placeholder="What did you notice?"
            placeholderTextColor={colors.quiet}
            style={[styles.input, styles.textarea]}
            value={noteBody}
          />
        </View>

        <Button
          label="Save Log"
          onPress={() => {
            addTrainingLog({
              skillId: skill.id,
              type,
              durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
              noteBody,
              hits: hits.map((hit) => ({
                partnerName: hit.partnerName,
                count: Number(hit.count || 0),
              })),
            });
            router.back();
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  countInput: {
    flex: 0.34,
  },
  form: {
    gap: spacing.md,
  },
  hitRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  partnerInput: {
    flex: 1,
  },
  partnerChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  segment: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stack: {
    gap: spacing.sm,
  },
  textarea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  total: {
    color: colors.sage,
    fontSize: 14,
    fontWeight: '800',
  },
});
