import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './supabase/auth';
import {
  createMedia,
  createQuickNote,
  createSkill,
  createSkillWithMedia,
  createStandaloneHit,
  createTrainingLog,
  deleteMedia,
  deleteSkillById,
  completeSkillPackOnboarding,
  importSkillPacks,
  loadHitListData,
  saveMedia,
  saveNote,
  savePartner,
  saveTrainingLog,
  setSkillActive,
  type HitListData,
} from './supabase/repository';
import type {
  Hit,
  Media,
  NewMediaInput,
  NewStandaloneHitInput,
  NewSkillInput,
  NewSkillWithMediaInput,
  NewTrainingLogInput,
  Note,
  Partner,
  Skill,
  SkillPackImportMode,
  SkillStage,
  TrainingLog,
  UpdateMediaInput,
  UpdateNoteInput,
  UpdatePartnerInput,
  UpdateTrainingLogInput,
} from './types';

type HitListState = HitListData & {
  error: string | null;
  loading: boolean;
  reload: () => Promise<void>;
  addSkill: (input: NewSkillInput) => Promise<Skill>;
  addSkillWithMedia: (input: NewSkillWithMediaInput) => Promise<Skill>;
  toggleActive: (skillId: string) => Promise<void>;
  updateStage: (skillId: string, stage: SkillStage) => Promise<void>;
  addQuickNote: (skillId: string, body: string) => Promise<void>;
  updateNote: (input: UpdateNoteInput) => Promise<void>;
  updatePartner: (input: UpdatePartnerInput) => Promise<void>;
  addTrainingLog: (input: NewTrainingLogInput) => Promise<void>;
  updateTrainingLog: (input: UpdateTrainingLogInput) => Promise<void>;
  addStandaloneHit: (input: NewStandaloneHitInput) => Promise<void>;
  addMedia: (input: NewMediaInput) => Promise<void>;
  updateMedia: (input: UpdateMediaInput) => Promise<void>;
  removeMedia: (mediaId: string) => Promise<void>;
  deleteSkill: (skillId: string) => Promise<void>;
  finishSkillPackOnboarding: () => Promise<void>;
  importPacks: (selections: Array<{ packSlug: string; importMode: SkillPackImportMode }>) => Promise<void>;
};

const emptyData: HitListData = {
  hits: [],
  media: [],
  notes: [],
  partners: [],
  skillPackImports: [],
  skillPackOnboardingCompleted: false,
  skills: [],
  trainingLogs: [],
};

const HitListContext = createContext<HitListState | null>(null);

export function HitListProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const [data, setData] = useState<HitListData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!session) {
      setData(emptyData);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setData(await loadHitListData());
    } catch {
      setError('HitList could not load your data. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    reload();
  }, [reload]);

  const runAndReload = useCallback(
    async <T,>(operation: () => Promise<T>) => {
      setError(null);
      try {
        const result = await operation();
        setData(await loadHitListData());
        return result;
      } catch (nextError) {
        setError('HitList could not save your change. Try again.');
        throw nextError;
      }
    },
    [],
  );

  const value = useMemo<HitListState>(
    () => ({
      ...data,
      error,
      loading,
      reload,
      addSkill(input) {
        return runAndReload(() => createSkill(input));
      },
      addSkillWithMedia(input) {
        return runAndReload(() => createSkillWithMedia(input));
      },
      async toggleActive(skillId) {
        const skill = data.skills.find((item) => item.id === skillId);
        if (!skill) return;
        await runAndReload(() => setSkillActive(skillId, !skill.active));
      },
      async updateStage() {
        await Promise.resolve();
      },
      async addQuickNote(skillId, body) {
        await runAndReload(() => createQuickNote(skillId, body));
      },
      async updateNote(input) {
        await runAndReload(() => saveNote(input));
      },
      async updatePartner(input) {
        await runAndReload(() => savePartner(input));
      },
      async addTrainingLog(input) {
        await runAndReload(() => createTrainingLog(input));
      },
      async updateTrainingLog(input) {
        const existingLog = data.trainingLogs.find((log) => log.id === input.id);
        if (!existingLog) return;
        await runAndReload(() => saveTrainingLog(input, existingLog));
      },
      async addStandaloneHit(input) {
        await runAndReload(() => createStandaloneHit(input));
      },
      async addMedia(input) {
        await runAndReload(() => createMedia(input));
      },
      async updateMedia(input) {
        const existing = data.media.find((item) => item.id === input.id);
        await runAndReload(() => saveMedia(input, existing));
      },
      async removeMedia(mediaId) {
        const existing = data.media.find((item) => item.id === mediaId);
        await runAndReload(() => deleteMedia(mediaId, existing));
      },
      async deleteSkill(skillId) {
        await runAndReload(() => deleteSkillById(skillId));
      },
      async finishSkillPackOnboarding() {
        await runAndReload(() => completeSkillPackOnboarding());
      },
      async importPacks(selections) {
        await runAndReload(() => importSkillPacks(selections));
      },
    }),
    [data, error, loading, reload, runAndReload],
  );

  return <HitListContext.Provider value={value}>{children}</HitListContext.Provider>;
}

export function useHitList() {
  const value = useContext(HitListContext);

  if (!value) {
    throw new Error('useHitList must be used inside HitListProvider');
  }

  return value;
}
