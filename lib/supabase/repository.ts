import { inferMediaType, resolveMediaMetadata } from '../mediaMetadata';
import { SKILL_PACK_VERSION, skillPacks, type SkillPackImportMode } from '../starterSkills';
import type { SkillPackSkill } from '../starterSkills';
import type {
  Belt,
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
  SkillPackImport,
  TrainingLog,
  UpdateMediaInput,
  UpdateNoteInput,
  UpdatePartnerInput,
  UpdateSkillDetailsInput,
  UpdateTrainingLogInput,
} from '../types';
import { supabase } from './client';

type SkillRow = {
  id: string;
  name: string;
  description: string | null;
  hit_condition: string | null;
  active: boolean;
  current_focus: string | null;
  last_touched_at: string;
  created_at: string;
  updated_at: string;
};

type PartnerRow = {
  id: string;
  name: string;
  belt: Belt | null;
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

type StarterSeedRow = {
  starter_skill_version: number;
  seeded_at: string;
};

type SkillPackImportRow = {
  pack_slug: string;
  import_mode: SkillPackImportMode;
  imported_at: string;
};

type SkillPackOnboardingStateRow = {
  completed_at: string;
};

type SkillPackImportItemRow = {
  skill_id: string;
  template_key: string;
};

export type HitListData = {
  skills: Skill[];
  notes: Note[];
  trainingLogs: TrainingLog[];
  hits: Hit[];
  skillPackImports: SkillPackImport[];
  skillPackOnboardingCompleted: boolean;
  partners: Partner[];
  media: Media[];
};

export async function loadHitListData(): Promise<HitListData> {
  await reconcileImportedSkillPackContent();

  const [skills, notes, trainingLogs, hits, partners, media, skillPackImports, skillPackOnboardingCompleted] = await Promise.all([
    selectRows<SkillRow>('skills', 'last_touched_at', false),
    selectRows<NoteRow>('notes', 'created_at', false),
    selectRows<TrainingLogRow>('training_logs', 'occurred_at', false),
    selectRows<HitRow>('hits', 'created_at', false),
    selectRows<PartnerRow>('partners', 'name', true),
    selectRows<MediaRow>('media', 'created_at', false),
    loadSkillPackImports(),
    loadSkillPackOnboardingCompleted(),
  ]);

  return {
    hits: hits.map(mapHit),
    media: media.map(mapMedia),
    notes: notes.map(mapNote),
    partners: partners.map(mapPartner),
    skillPackImports,
    skillPackOnboardingCompleted,
    skills: skills.map(mapSkill),
    trainingLogs: trainingLogs.map(mapTrainingLog),
  };
}

async function loadSkillPackImports(): Promise<SkillPackImport[]> {
  const { data, error } = await supabase
    .from('skill_pack_imports')
    .select('pack_slug, import_mode, imported_at')
    .order('imported_at', { ascending: false });

  if (isMissingRelationError(error)) return [];
  if (error) throw error;

  return ((data ?? []) as SkillPackImportRow[]).map(mapSkillPackImport);
}

async function loadSkillPackOnboardingCompleted(): Promise<boolean> {
  const { data, error } = await supabase
    .from('skill_pack_onboarding_state')
    .select('completed_at')
    .maybeSingle<SkillPackOnboardingStateRow>();

  if (isMissingRelationError(error)) {
    const starterSeed = await loadStarterSeedState();
    return Boolean(starterSeed);
  }
  if (error) throw error;
  return Boolean(data);
}

async function loadStarterSeedState(): Promise<StarterSeedRow | null> {
  const { data, error } = await supabase
    .from('starter_seed_state')
    .select('starter_skill_version, seeded_at')
    .maybeSingle<StarterSeedRow>();

  if (isMissingRelationError(error)) return null;
  if (error) throw error;
  return data;
}

export async function completeSkillPackOnboarding() {
  await mutate(
    supabase
      .from('skill_pack_onboarding_state')
      .upsert({ completed_at: new Date().toISOString() }, { onConflict: 'user_id' }),
  );
}

export async function importSkillPacks(
  selections: Array<{ packSlug: string; importMode: SkillPackImportMode }>,
) {
  for (const selection of selections) {
    await importSkillPack(selection.packSlug, selection.importMode);
  }

  await completeSkillPackOnboarding();
}

async function importSkillPack(packSlug: string, importMode: SkillPackImportMode) {
  const pack = skillPacks.find((item) => item.slug === packSlug);
  if (!pack) throw new Error(`Unknown skill pack: ${packSlug}`);

  const { data: importRow, error: importError } = await supabase
    .from('skill_pack_imports')
    .upsert(
      {
        import_mode: importMode,
        pack_slug: pack.slug,
        pack_version: SKILL_PACK_VERSION,
      },
      { onConflict: 'user_id,pack_slug' },
    )
    .select('id')
    .single<{ id: string }>();

  if (importError) throw importError;

  const { data: existingItems, error: existingItemsError } = await supabase
    .from('skill_pack_import_items')
    .select('skill_id, template_key')
    .in(
      'template_key',
      pack.skills.map((skill) => skill.key),
    );

  if (existingItemsError) throw existingItemsError;

  const existingSkillsByKey = new Map(
    ((existingItems ?? []) as Array<{ skill_id: string; template_key: string }>).map((item) => [
      item.template_key,
      item.skill_id,
    ]),
  );

  for (const packSkill of pack.skills) {
    const existingSkillId = existingSkillsByKey.get(packSkill.key);

    if (existingSkillId) {
      await ensurePackSkillContent(existingSkillId, packSkill);
      continue;
    }

    const { data: skillRow, error: skillError } = await supabase
      .from('skills')
      .insert({
        active: importMode === 'active',
        name: packSkill.name,
      })
      .select()
      .single<SkillRow>();

    if (skillError) throw skillError;

    await mutate(
      supabase
        .from('skill_pack_import_items')
        .insert({
          import_id: importRow.id,
          skill_id: skillRow.id,
          template_key: packSkill.key,
        }),
    );

    const mediaRows = packSkill.media.map((item) => ({
      notes: item.notes,
      skill_id: skillRow.id,
      thumbnail_url: item.thumbnailUrl,
      title: item.title,
      type: inferMediaType(item.url),
      url: item.url,
    }));

    await mutate(supabase.from('media').insert(mediaRows));
  }
}

async function ensurePackSkillContent(skillId: string, packSkill: SkillPackSkill) {
  const [{ data: existingNotes, error: notesError }, { data: existingMedia, error: mediaError }] = await Promise.all([
    supabase.from('notes').select('id, body, training_log_id').eq('skill_id', skillId),
    supabase.from('media').select('id, url, notes').eq('skill_id', skillId),
  ]);

  if (notesError) throw notesError;
  if (mediaError) throw mediaError;

  const existingMediaByUrl = new Map(
    ((existingMedia ?? []) as Array<{ id: string; notes: string | null; url: string }>).map((item) => [
      item.url,
      item,
    ]),
  );
  const generatedNoteIds = ((existingNotes ?? []) as Array<{
    body: string;
    id: string;
    training_log_id: string | null;
  }>)
    .filter(
      (note) =>
        note.training_log_id === null &&
        (isGeneratedSkillPackNote(note.body) || packSkill.media.some((media) => media.notes === note.body)),
    )
    .map((note) => note.id);

  const mediaMutations = packSkill.media.map((item) => {
    const existing = existingMediaByUrl.get(item.url);
    if (!existing) {
      return mutate(
        supabase.from('media').insert({
          notes: item.notes,
          skill_id: skillId,
          thumbnail_url: item.thumbnailUrl,
          title: item.title,
          type: inferMediaType(item.url),
          url: item.url,
        }),
      );
    }

    if (existing.notes === item.notes || !shouldReplacePackMediaNotes(existing.notes)) {
      return Promise.resolve();
    }

    return mutate(
      supabase
        .from('media')
        .update({
          notes: item.notes,
          thumbnail_url: item.thumbnailUrl,
          title: item.title,
          type: inferMediaType(item.url),
        })
        .eq('id', existing.id),
    );
  });

  await Promise.all([
    generatedNoteIds.length > 0 ? mutate(supabase.from('notes').delete().in('id', generatedNoteIds)) : Promise.resolve(),
    ...mediaMutations,
  ]);
}

async function reconcileImportedSkillPackContent() {
  const { data, error } = await supabase
    .from('skill_pack_import_items')
    .select('skill_id, template_key');

  if (isMissingRelationError(error)) return;
  if (error) throw error;

  const packSkillsByKey = new Map(skillPacks.flatMap((pack) => pack.skills.map((skill) => [skill.key, skill])));

  for (const item of (data ?? []) as SkillPackImportItemRow[]) {
    const packSkill = packSkillsByKey.get(item.template_key);
    if (packSkill) await ensurePackSkillContent(item.skill_id, packSkill);
  }
}

function isGeneratedSkillPackNote(body: string) {
  return (
    body.startsWith('Video notes:') ||
    body.startsWith('This skill has ') ||
    body.startsWith('Starter-pack video:') ||
    body.includes('system video') ||
    body.includes('reference videos') ||
    body.includes('See the matching video note')
  );
}

function shouldReplacePackMediaNotes(notes: string | null) {
  if (!notes) return true;
  return (
    notes.startsWith('Starter-pack video:') ||
    notes.startsWith('Video notes:') ||
    notes.startsWith('Context: ') ||
    notes.includes('system video') ||
    notes.includes('See the matching video note')
  );
}

export async function createSkill(input: NewSkillInput) {
  const { data, error } = await supabase
    .from('skills')
    .insert({
      active: input.active,
      description: input.description?.trim() || undefined,
      hit_condition: input.hitCondition?.trim() || undefined,
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

export async function saveSkillDetails(input: UpdateSkillDetailsInput) {
  await mutate(
    supabase
      .from('skills')
      .update({
        description: input.description?.trim() || null,
        hit_condition: input.hitCondition?.trim() || null,
        last_touched_at: new Date().toISOString(),
      })
      .eq('id', input.id),
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
      .update({ belt: input.belt ?? null, name: input.name.trim() })
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

function isMissingRelationError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'PGRST205'
  );
}

function mapSkill(row: SkillRow): Skill {
  return {
    active: row.active,
    createdAt: row.created_at,
    description: row.description ?? undefined,
    hitCondition: row.hit_condition ?? undefined,
    id: row.id,
    lastTouchedAt: row.last_touched_at,
    name: row.name,
    stage: 'saved',
    updatedAt: row.updated_at,
  };
}

function mapPartner(row: PartnerRow): Partner {
  return {
    belt: row.belt ?? undefined,
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

function mapSkillPackImport(row: SkillPackImportRow): SkillPackImport {
  return {
    importedAt: row.imported_at,
    importMode: row.import_mode,
    packSlug: row.pack_slug,
  };
}
