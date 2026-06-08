export type SkillStage = 'saved' | 'mechanics' | 'resistance' | 'proven';

export type TrainingLogType = 'study' | 'dialogue_drilling' | 'constraint_game' | 'rolling';

export type Skill = {
  id: string;
  name: string;
  stage: SkillStage;
  active: boolean;
  lastTouchedAt: string;
  createdAt: string;
  updatedAt: string;
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

export type Partner = {
  id: string;
  name: string;
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
};
