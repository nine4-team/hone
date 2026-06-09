import type { Hit, Note, Partner } from './types';

export type TrainingLogHitInput = {
  partnerName?: string;
  count: number;
};

type IdFactory = (prefix: string) => string;

export function normalizeTrainingLogNote(body?: string) {
  const trimmed = body?.trim();
  return trimmed || undefined;
}

export function findPartnerByName(partners: Partner[], name?: string) {
  const normalized = name?.trim().toLowerCase();
  if (!normalized) return undefined;
  return partners.find((partner) => partner.name.toLowerCase() === normalized);
}

export function createPartner(name: string, now: string, makeId: IdFactory): Partner {
  return {
    id: makeId('partner'),
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

export function resolvePartnerForHit({
  makeId,
  now,
  partnerName,
  partners,
}: {
  makeId: IdFactory;
  now: string;
  partnerName?: string;
  partners: Partner[];
}) {
  const trimmedName = partnerName?.trim();
  if (!trimmedName) return { partnerId: undefined, partner: undefined };

  const existing = findPartnerByName(partners, trimmedName);
  if (existing) return { partnerId: existing.id, partner: undefined };

  const partner = createPartner(trimmedName, now, makeId);
  return { partnerId: partner.id, partner };
}

export function buildTrainingLogHits({
  hitInputs,
  makeId,
  now,
  partners,
  skillId,
  trainingLogId,
}: {
  hitInputs: TrainingLogHitInput[];
  makeId: IdFactory;
  now: string;
  partners: Partner[];
  skillId: string;
  trainingLogId: string;
}) {
  const createdPartners: Partner[] = [];
  const availablePartners = [...partners];
  const hits: Hit[] = [];

  hitInputs
    .filter((hit) => hit.count > 0)
    .forEach((hit) => {
      const { partnerId, partner } = resolvePartnerForHit({
        makeId,
        now,
        partnerName: hit.partnerName,
        partners: availablePartners,
      });

      if (partner) {
        createdPartners.push(partner);
        availablePartners.push(partner);
      }

      hits.push({
        id: makeId('hit'),
        skillId,
        trainingLogId,
        partnerId,
        count: hit.count,
        createdAt: now,
        updatedAt: now,
      });
    });

  return { createdPartners, hits };
}

export function replaceTrainingLogNotes({
  currentNotes,
  makeId,
  noteBody,
  now,
  skillId,
  trainingLogId,
}: {
  currentNotes: Note[];
  makeId: IdFactory;
  noteBody?: string;
  now: string;
  skillId: string;
  trainingLogId: string;
}) {
  const body = normalizeTrainingLogNote(noteBody);
  const linkedNotes = currentNotes.filter((note) => note.trainingLogId === trainingLogId);
  const unlinkedNotes = currentNotes.filter((note) => note.trainingLogId !== trainingLogId);

  if (!body) return unlinkedNotes;

  const existing = linkedNotes[0];
  const note: Note = existing
    ? { ...existing, body, updatedAt: now }
    : {
        id: makeId('note'),
        skillId,
        trainingLogId,
        body,
        createdAt: now,
        updatedAt: now,
      };

  return [note, ...unlinkedNotes];
}
