export type SkillStage = 'saved' | 'mechanics' | 'resistance' | 'proven';

export type TrainingLogType = 'study' | 'dialogue_drilling' | 'constraint_game' | 'rolling';

export type Skill = {
  id: string;
  name: string;
  description?: string;
  hitCondition?: string;
  stage: SkillStage;
  active: boolean;
  lastTouchedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type SkillPackImportMode = 'active' | 'arsenal';

export type SkillPackImport = {
  packSlug: string;
  importMode: SkillPackImportMode;
  importedAt: string;
};

export type TrainingLog = {
  id: string;
  skillId: string;
  type: TrainingLogType;
  occurredAt: string;
  durationMinutes?: number;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  skillId: string;
  trainingLogId?: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type Hit = {
  id: string;
  skillId: string;
  trainingLogId?: string;
  partnerId?: string;
  count: number;
  createdAt: string;
  updatedAt: string;
};

// Belt rank of a partner (or, soon, the user's own shared profile). Adult ranks
// white..black plus kids ranks (no stripe variants). Drives how much XP a hit on
// that partner is worth — see lib/hits.ts. A missing belt is treated as white.
export type Belt =
  | 'white'
  | 'blue'
  | 'purple'
  | 'brown'
  | 'black'
  | 'kids_white'
  | 'kids_grey'
  | 'kids_yellow'
  | 'kids_orange'
  | 'kids_green';

export type Partner = {
  id: string;
  name: string;
  belt?: Belt;
  createdAt: string;
  updatedAt: string;
};

export type Media = {
  id: string;
  skillId: string;
  type: 'youtube' | 'instagram' | 'link';
  url: string;
  title?: string;
  thumbnailUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type NewSkillInput = {
  name: string;
  description?: string;
  hitCondition?: string;
  stage: SkillStage;
  active: boolean;
};

export type NewSkillWithMediaInput = NewSkillInput & {
  mediaUrl: string;
  mediaNotes?: string;
};

export type NewTrainingLogInput = {
  skillId: string;
  type: TrainingLogType;
  durationMinutes?: number;
  noteBody?: string;
  hits: Array<{
    partnerName?: string;
    count: number;
  }>;
};

export type UpdateTrainingLogInput = Omit<NewTrainingLogInput, 'skillId'> & {
  id: string;
};

export type NewStandaloneHitInput = {
  skillId: string;
  partnerName?: string;
  count: number;
};

export type NewMediaInput = {
  skillId: string;
  url: string;
  notes?: string;
};

export type UpdateMediaInput = {
  id: string;
  url: string;
  notes?: string;
};

export type UpdateNoteInput = {
  id: string;
  body: string;
};

export type UpdatePartnerInput = {
  id: string;
  name: string;
  belt?: Belt;
};

export type UpdateSkillDetailsInput = {
  id: string;
  description?: string;
  hitCondition?: string;
};
