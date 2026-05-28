import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { FormInput, FormLabel, FormPanel, FormStack, SegmentedControl } from '../../components/FormControls';
import { Screen } from '../../components/Screen';
import { trainingLogTypeLabels, trainingLogTypes } from '../../lib/format';
import { useHone } from '../../lib/store';
import { spacing } from '../../lib/theme';
import { textStyles } from '../../lib/typography';
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
    return <Screen title="Skill not found" subtitle="This skill is not in the local data set." onBack={router.back} />;
  }

  return (
    <Screen title="Log Training" subtitle={skill.name} onBack={router.back}>
      <FormStack>
        <FormPanel>
          <FormLabel>Type</FormLabel>
          <SegmentedControl>
            {trainingLogTypes.map((item) => (
              <Button
                key={item}
                label={trainingLogTypeLabels[item]}
                onPress={() => setType(item)}
                variant={type === item ? 'primary' : 'secondary'}
              />
            ))}
          </SegmentedControl>
        </FormPanel>

        <FormPanel>
          <FormLabel>Duration</FormLabel>
          <FormInput
            keyboardType="number-pad"
            onChangeText={setDurationMinutes}
            placeholder="Minutes, optional"
            value={durationMinutes}
          />
        </FormPanel>

        <FormPanel>
          <View style={styles.panelHeader}>
            <FormLabel>Hits</FormLabel>
            <Text style={styles.total}>{totalHits} total</Text>
          </View>
          <View style={styles.stack}>
            {hits.map((hit, index) => (
              <View key={index} style={styles.hitRow}>
                <FormInput
                  autoCapitalize="words"
                  onChangeText={(value) =>
                    setHits((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, partnerName: value } : item,
                      ),
                    )
                  }
                  placeholder="Partner or leave blank"
                  style={styles.partnerInput}
                  value={hit.partnerName}
                />
                <FormInput
                  keyboardType="number-pad"
                  onChangeText={(value) =>
                    setHits((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, count: value } : item,
                      ),
                    )
                  }
                  placeholder="0"
                  style={styles.countInput}
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
        </FormPanel>

        <FormPanel>
          <FormLabel>Note</FormLabel>
          <FormInput
            multiline
            onChangeText={setNoteBody}
            placeholder="What did you notice?"
            style={styles.textarea}
            value={noteBody}
          />
        </FormPanel>

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
      </FormStack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  countInput: {
    flex: 0.34,
  },
  hitRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  stack: {
    gap: spacing.sm,
  },
  textarea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  total: {
    ...textStyles.rowSummaryValue,
  },
});
