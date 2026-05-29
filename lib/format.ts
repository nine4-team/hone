import type { SkillStage, TrainingLogType } from './types';

export const stageLabels: Record<SkillStage, string> = {
  saved: 'Saved',
  mechanics: 'Mechanics',
  resistance: 'Resistance',
  proven: 'Proven',
};

export const stageDescriptions: Record<SkillStage, string> = {
  saved: 'Remember it for later.',
  mechanics: 'Figure out grips, frames, angles, timing, entries, finishes, and cues.',
  resistance: 'Make it work against opposition.',
  proven: 'Reliable under meaningful resistance.',
};

export const trainingLogTypeLabels: Record<TrainingLogType, string> = {
  study: 'Study',
  dialogue_drilling: 'Dialogue Drilling',
  constraint_game: 'Constraint Game',
  rolling: 'Rolling',
};

export const trainingLogTypeDescriptions: Record<TrainingLogType, string> = {
  study: 'Watch and break down film or instruction.',
  dialogue_drilling: 'Interactive problem-solving.',
  constraint_game: 'Positional rounds with set limits.',
  rolling: 'Live sparring against full resistance.',
};

export const stages: SkillStage[] = ['saved', 'mechanics', 'resistance', 'proven'];

export const trainingLogTypes: TrainingLogType[] = [
  'study',
  'dialogue_drilling',
  'constraint_game',
  'rolling',
];

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function formatRelative(value: string) {
  const date = new Date(value).getTime();
  const now = Date.now();
  const days = Math.max(0, Math.round((now - date) / 86400000));

  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export function formatHitCount(count: number) {
  return `${count} ${count === 1 ? 'hit' : 'hits'}`;
}
