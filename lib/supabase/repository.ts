import { inferMediaType, resolveMediaMetadata } from '../mediaMetadata';
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
  TrainingLog,
  UpdateMediaInput,
  UpdateNoteInput,
  UpdatePartnerInput,
  UpdateTrainingLogInput,
} from '../types';
import { supabase } from './client';

type SkillRow = {
  id: string;
  name: string;
  active: boolean;
  current_focus: string | null;
  last_touched_at: string;
  created_at: string;
  updated_at: string;
};

type PartnerRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type TrainingLogRow = {
  id: string;
  skill_id: string;
  type: TrainingLog['type'];
  occurred_at: string;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
};

type NoteRow = {
  id: string;
  skill_id: string;
  training_log_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
};

type HitRow = {
  id: string;
  skill_id: string;
  training_log_id: string | null;
  partner_id: string | null;
  count: number;
  created_at: string;
  updated_at: string;
};

type MediaRow = {
  id: string;
  skill_id: string;
  type: Media['type'];
  url: string;
  title: string | null;
  thumbnail_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type HitListData = {
  skills: Skill[];
  notes: Note[];
  trainingLogs: TrainingLog[];
  hits: Hit[];
  partners: Partner[];
  media: Media[];
};

export async function loadHitListData(): Promise<HitListData> {
  const [skills, notes, trainingLogs, hits, partners, media] = await Promise.all([
    selectRows<SkillRow>('skills', 'last_touched_at', false),
    selectRows<NoteRow>('notes', 'created_at', false),
    selectRows<TrainingLogRow>('training_logs', 'occurred_at', false),
    selectRows<HitRow>('hits', 'created_at', false),
    selectRows<PartnerRow>('partners', 'name', true),
    selectRows<MediaRow>('media', 'created_at', false),
  ]);

  return {
    hits: hits.map(mapHit),
    media: media.map(mapMedia),
    notes: notes.map(mapNote),
    partners: partners.map(mapPartner),
    skills: skills.map(mapSkill),
    trainingLogs: trainingLogs.map(mapTrainingLog),
  };
}

export async function createSkill(input: NewSkillInput) {
  const { data, error } = await supabase
    .from('skills')
    .insert({
      active: input.active,
      name: input.name.trim(),
    })
    .select()
    .single<SkillRow>();

  if (error) throw error;
  return mapSkill(data);
}

export async function createSkillWithMedia(input: NewSkillWithMediaInput) {
  const skill = await createSkill(input);
  await createMedia({
    notes: input.mediaNotes,
    skillId: skill.id,
    url: input.mediaUrl,
  });
  return skill;
}

export async function setSkillActive(skillId: string, active: boolean) {
  const now = new Date().toISOString();
  await mutate(
    supabase
      .from('skills')
      .update({ active, last_touched_at: now })
      .eq('id', skillId),
  );
}

export async function createQuickNote(skillId: string, body: string) {
  await mutate(
    supabase
      .from('notes')
      .insert({ body: body.trim(), skill_id: skillId }),
  );
  await touchSkill(skillId);
}

export async function saveNote(input: UpdateNoteInput) {
  const { data, error } = await supabase
    .from('notes')
    .update({ body: input.body.trim() })
    .eq('id', input.id)
    .select('skill_id')
    .single<{ skill_id: string }>();

  if (error) throw error;
  await touchSkill(data.skill_id);
}

export async function savePartner(input: UpdatePartnerInput) {
  await mutate(
    supabase
      .from('partners')
      .update({ name: input.name.trim() })
      .eq('id', input.id),
  );
}

export async function createStandaloneHit(input: NewStandaloneHitInput) {
  const partner = await ensurePartner(input.partnerName);
  await mutate(
    supabase
      .from('hits')
      .insert({
        count: input.count,
        partner_id: partner?.id,
        skill_id: input.skillId,
      }),
  );
  await touchSkill(input.skillId);
}

export async function createTrainingLog(input: NewTrainingLogInput) {
  const { data: log, error } = await supabase
    .from('training_logs')
    .insert({
      duration_minutes: input.durationMinutes,
      skill_id: input.skillId,
      type: input.type,
    })
    .select()
    .single<TrainingLogRow>();

  if (error) throw error;
  await replaceTrainingLogChildren(log.id, input.skillId, input.noteBody, input.hits);
  await touchSkill(input.skillId);
}

export async function saveTrainingLog(input: UpdateTrainingLogInput, existingLog: TrainingLog) {
  await mutate(
    supabase
      .from('training_logs')
      .update({
        duration_minutes: input.durationMinutes,
        type: input.type,
      })
      .eq('id', input.id),
  );
  await replaceTrainingLogChildren(input.id, existingLog.skillId, input.noteBody, input.hits);
  await touchSkill(existingLog.skillId);
}

export async function createMedia(input: NewMediaInput) {
  const url = input.url.trim();
  const metadata = await resolveMediaMetadata(url);

  await mutate(
    supabase
      .from('media')
      .insert({
        notes: input.notes?.trim() || undefined,
        skill_id: input.skillId,
        thumbnail_url: metadata.thumbnailUrl,
        title: metadata.title,
        type: inferMediaType(url),
        url,
      }),
  );
  await touchSkill(input.skillId);
}

export async function saveMedia(input: UpdateMediaInput, existing?: Media) {
  const url = input.url.trim();
  const metadata =
    existing?.url === url
      ? { title: existing.title, thumbnailUrl: existing.thumbnailUrl }
      : await resolveMediaMetadata(url);

  const { data, error } = await supabase
    .from('media')
    .update({
      notes: input.notes?.trim() || undefined,
      thumbnail_url: metadata.thumbnailUrl,
      title: metadata.title,
      type: inferMediaType(url),
      url,
    })
    .eq('id', input.id)
    .select('skill_id')
    .single<{ skill_id: string }>();

  if (error) throw error;
  await touchSkill(data.skill_id);
}

export async function deleteMedia(mediaId: string, existing?: Media) {
  await mutate(supabase.from('media').delete().eq('id', mediaId));
  if (existing) await touchSkill(existing.skillId);
}

export async function deleteSkillById(skillId: string) {
  await mutate(supabase.from('skills').delete().eq('id', skillId));
}

async function replaceTrainingLogChildren(
  trainingLogId: string,
  skillId: string,
  noteBody: string | undefined,
  hits: NewTrainingLogInput['hits'],
) {
  await Promise.all([
    mutate(supabase.from('hits').delete().eq('training_log_id', trainingLogId)),
    mutate(supabase.from('notes').delete().eq('training_log_id', trainingLogId)),
  ]);

  const body = noteBody?.trim();
  const hitRows = await Promise.all(
    hits
      .filter((hit) => hit.count > 0)
      .map(async (hit) => {
        const partner = await ensurePartner(hit.partnerName);
        return {
          count: hit.count,
          partner_id: partner?.id,
          skill_id: skillId,
          training_log_id: trainingLogId,
        };
      }),
  );

  await Promise.all([
    body
      ? mutate(
          supabase
            .from('notes')
            .insert({ body, skill_id: skillId, training_log_id: trainingLogId }),
        )
      : Promise.resolve(),
    hitRows.length > 0 ? mutate(supabase.from('hits').insert(hitRows)) : Promise.resolve(),
  ]);
}

async function ensurePartner(partnerName?: string) {
  const name = partnerName?.trim();
  if (!name) return undefined;

  const normalizedName = name.toLowerCase();
  const { data: existing, error: selectError } = await supabase
    .from('partners')
    .select()
    .eq('normalized_name', normalizedName)
    .maybeSingle<PartnerRow>();

  if (selectError) throw selectError;
  if (existing) return mapPartner(existing);

  const { data, error } = await supabase
    .from('partners')
    .insert({ name })
    .select()
    .single<PartnerRow>();

  if (error) {
    const { data: retryData, error: retryError } = await supabase
      .from('partners')
      .select()
      .eq('normalized_name', normalizedName)
      .maybeSingle<PartnerRow>();
    if (retryError || !retryData) throw error;
    return mapPartner(retryData);
  }

  return mapPartner(data);
}

async function touchSkill(skillId: string) {
  await mutate(
    supabase
      .from('skills')
      .update({ last_touched_at: new Date().toISOString() })
      .eq('id', skillId),
  );
}

async function selectRows<T>(table: string, orderColumn: string, ascending: boolean) {
  const { data, error } = await supabase.from(table).select().order(orderColumn, { ascending });
  if (error) throw error;
  return (data ?? []) as T[];
}

async function mutate(query: PromiseLike<{ error: unknown }>) {
  const { error } = await query;
  if (error) throw error;
}

function mapSkill(row: SkillRow): Skill {
  return {
    active: row.active,
    createdAt: row.created_at,
    id: row.id,
    lastTouchedAt: row.last_touched_at,
    name: row.name,
    stage: 'saved',
    updatedAt: row.updated_at,
  };
}

function mapPartner(row: PartnerRow): Partner {
  return {
    createdAt: row.created_at,
    id: row.id,
    name: row.name,
    updatedAt: row.updated_at,
  };
}

function mapTrainingLog(row: TrainingLogRow): TrainingLog {
  return {
    createdAt: row.created_at,
    durationMinutes: row.duration_minutes ?? undefined,
    id: row.id,
    occurredAt: row.occurred_at,
    skillId: row.skill_id,
    type: row.type,
    updatedAt: row.updated_at,
  };
}

function mapNote(row: NoteRow): Note {
  return {
    body: row.body,
    createdAt: row.created_at,
    id: row.id,
    skillId: row.skill_id,
    trainingLogId: row.training_log_id ?? undefined,
    updatedAt: row.updated_at,
  };
}

function mapHit(row: HitRow): Hit {
  return {
    count: row.count,
    createdAt: row.created_at,
    id: row.id,
    partnerId: row.partner_id ?? undefined,
    skillId: row.skill_id,
    trainingLogId: row.training_log_id ?? undefined,
    updatedAt: row.updated_at,
  };
}

function mapMedia(row: MediaRow): Media {
  return {
    createdAt: row.created_at,
    id: row.id,
    notes: row.notes ?? undefined,
    skillId: row.skill_id,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    title: row.title ?? undefined,
    type: row.type,
    updatedAt: row.updated_at,
    url: row.url,
  };
}
