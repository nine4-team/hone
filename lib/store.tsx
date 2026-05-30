import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import {
  seedHits,
  seedHitListEntries,
  seedMedia,
  seedNotes,
  seedPartners,
  seedSkills,
  seedTrainingLogs,
} from './seed';
import { inferMediaType, resolveMediaMetadata } from './mediaMetadata';
import type {
  Hit,
  HitListEntry,
  Media,
  NewMediaInput,
  NewStandaloneHitInput,
  NewSkillInput,
  NewSkillWithMediaInput,
  NewTrainingLogInput,
  Note,
  Partner,
  Skill,
  SkillStage,
  TrainingLog,
  UpdateMediaInput,
  UpdateNoteInput,
} from './types';

type HitListState = {
  skills: Skill[];
  notes: Note[];
  trainingLogs: TrainingLog[];
  hits: Hit[];
  hitListEntries: HitListEntry[];
  partners: Partner[];
  media: Media[];
  addSkill: (input: NewSkillInput) => Skill;
  addSkillWithMedia: (input: NewSkillWithMediaInput) => Promise<Skill>;
  toggleActive: (skillId: string) => void;
  updateStage: (skillId: string, stage: SkillStage) => void;
  addQuickNote: (skillId: string, body: string) => void;
  updateNote: (input: UpdateNoteInput) => void;
  addTrainingLog: (input: NewTrainingLogInput) => void;
  addStandaloneHit: (input: NewStandaloneHitInput) => void;
  addMedia: (input: NewMediaInput) => Promise<void>;
  updateMedia: (input: UpdateMediaInput) => Promise<void>;
  removeMedia: (mediaId: string) => void;
  deleteSkill: (skillId: string) => void;
};

const HitListContext = createContext<HitListState | null>(null);

function stamp() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function HitListProvider({ children }: PropsWithChildren) {
  const [skills, setSkills] = useState(seedSkills);
  const [notes, setNotes] = useState(seedNotes);
  const [trainingLogs, setTrainingLogs] = useState(seedTrainingLogs);
  const [hits, setHits] = useState(seedHits);
  const [hitListEntries] = useState(seedHitListEntries);
  const [partners, setPartners] = useState(seedPartners);
  const [media, setMedia] = useState(seedMedia);

  const touchSkill = (skillId: string, when = stamp()) => {
    setSkills((current) =>
      current.map((skill) =>
        skill.id === skillId ? { ...skill, lastTouchedAt: when, updatedAt: when } : skill,
      ),
    );
  };

  const value = useMemo<HitListState>(
    () => ({
      skills,
      notes,
      trainingLogs,
      hits,
      hitListEntries,
      partners,
      media,
      addSkill(input) {
        const now = stamp();
        const skill: Skill = {
          id: id('skill'),
          name: input.name.trim(),
          stage: input.stage,
          active: input.active,
          lastTouchedAt: now,
          createdAt: now,
          updatedAt: now,
        };
        setSkills((current) => [skill, ...current]);
        return skill;
      },
      async addSkillWithMedia(input) {
        const now = stamp();
        const skill: Skill = {
          id: id('skill'),
          name: input.name.trim(),
          stage: input.stage,
          active: input.active,
          lastTouchedAt: now,
          createdAt: now,
          updatedAt: now,
        };
        const url = input.mediaUrl.trim();
        const metadata = await resolveMediaMetadata(url);
        const mediaItem: Media = {
          id: id('media'),
          skillId: skill.id,
          type: inferMediaType(url),
          url,
          title: metadata.title,
          thumbnailUrl: metadata.thumbnailUrl,
          notes: input.mediaNotes?.trim() || undefined,
          createdAt: now,
          updatedAt: now,
        };

        setSkills((current) => [skill, ...current]);
        setMedia((current) => [mediaItem, ...current]);
        return skill;
      },
      toggleActive(skillId) {
        const now = stamp();
        setSkills((current) =>
          current.map((skill) =>
            skill.id === skillId
              ? { ...skill, active: !skill.active, lastTouchedAt: now, updatedAt: now }
              : skill,
          ),
        );
      },
      updateStage(skillId, stage) {
        const now = stamp();
        setSkills((current) =>
          current.map((skill) =>
            skill.id === skillId
              ? { ...skill, stage, lastTouchedAt: now, updatedAt: now }
              : skill,
          ),
        );
      },
      addQuickNote(skillId, body) {
        const now = stamp();
        const note: Note = {
          id: id('note'),
          skillId,
          body: body.trim(),
          createdAt: now,
          updatedAt: now,
        };
        setNotes((current) => [note, ...current]);
        touchSkill(skillId, now);
      },
      updateNote(input) {
        const now = stamp();
        const existing = notes.find((note) => note.id === input.id);

        setNotes((current) =>
          current.map((note) =>
            note.id === input.id
              ? { ...note, body: input.body.trim(), updatedAt: now }
              : note,
          ),
        );

        if (existing) touchSkill(existing.skillId, now);
      },
      addStandaloneHit(input) {
        const now = stamp();
        const partnerName = input.partnerName?.trim();
        let partnerId: string | undefined;

        if (partnerName) {
          const existing = partners.find(
            (partner) => partner.name.toLowerCase() === partnerName.toLowerCase(),
          );

          if (existing) {
            partnerId = existing.id;
          } else {
            const partner: Partner = {
              id: id('partner'),
              name: partnerName,
              createdAt: now,
              updatedAt: now,
            };
            partnerId = partner.id;
            setPartners((current) => [partner, ...current]);
          }
        }

        const hit: Hit = {
          id: id('hit'),
          skillId: input.skillId,
          partnerId,
          count: input.count,
          createdAt: now,
          updatedAt: now,
        };

        setHits((current) => [hit, ...current]);
        touchSkill(input.skillId, now);
      },
      async addMedia(input) {
        const now = stamp();
        const url = input.url.trim();
        const metadata = await resolveMediaMetadata(url);
        const mediaItem: Media = {
          id: id('media'),
          skillId: input.skillId,
          type: inferMediaType(url),
          url,
          title: metadata.title,
          thumbnailUrl: metadata.thumbnailUrl,
          notes: input.notes?.trim() || undefined,
          createdAt: now,
          updatedAt: now,
        };

        setMedia((current) => [mediaItem, ...current]);
        touchSkill(input.skillId, now);
      },
      async updateMedia(input) {
        const now = stamp();
        const existing = media.find((item) => item.id === input.id);
        const url = input.url.trim();
        const metadata =
          existing?.url === url
            ? { title: existing.title, thumbnailUrl: existing.thumbnailUrl }
            : await resolveMediaMetadata(url);

        setMedia((current) =>
          current.map((item) => {
            if (item.id !== input.id) return item;
            return {
              ...item,
              type: inferMediaType(url),
              url,
              title: metadata.title,
              thumbnailUrl: metadata.thumbnailUrl,
              notes: input.notes?.trim() || undefined,
              updatedAt: now,
            };
          }),
        );

        if (existing) touchSkill(existing.skillId, now);
      },
      removeMedia(mediaId) {
        const now = stamp();
        const existing = media.find((item) => item.id === mediaId);

        setMedia((current) => current.filter((item) => item.id !== mediaId));

        if (existing) touchSkill(existing.skillId, now);
      },
      deleteSkill(skillId) {
        setSkills((current) => current.filter((skill) => skill.id !== skillId));
        setNotes((current) => current.filter((note) => note.skillId !== skillId));
        setTrainingLogs((current) => current.filter((log) => log.skillId !== skillId));
        setHits((current) => current.filter((hit) => hit.skillId !== skillId));
        setMedia((current) => current.filter((item) => item.skillId !== skillId));
      },
      addTrainingLog(input) {
        const now = stamp();
        const log: TrainingLog = {
          id: id('log'),
          skillId: input.skillId,
          type: input.type,
          occurredAt: now,
          durationMinutes: input.durationMinutes,
          createdAt: now,
          updatedAt: now,
        };

        setTrainingLogs((current) => [log, ...current]);

        if (input.noteBody?.trim()) {
          const note: Note = {
            id: id('note'),
            skillId: input.skillId,
            trainingLogId: log.id,
            body: input.noteBody.trim(),
            createdAt: now,
            updatedAt: now,
          };
          setNotes((current) => [note, ...current]);
        }

        const newHits: Hit[] = [];

        input.hits
          .filter((hit) => hit.count > 0)
          .forEach((hit) => {
            let partnerId: string | undefined;
            const partnerName = hit.partnerName?.trim();

            if (partnerName) {
              const existing = partners.find(
                (partner) => partner.name.toLowerCase() === partnerName.toLowerCase(),
              );

              if (existing) {
                partnerId = existing.id;
              } else {
                const partner: Partner = {
                  id: id('partner'),
                  name: partnerName,
                  createdAt: now,
                  updatedAt: now,
                };
                partnerId = partner.id;
                setPartners((current) => [partner, ...current]);
              }
            }

            newHits.push({
              id: id('hit'),
              skillId: input.skillId,
              trainingLogId: log.id,
              partnerId,
              count: hit.count,
              createdAt: now,
              updatedAt: now,
            });
          });

        if (newHits.length > 0) {
          setHits((current) => [...newHits, ...current]);
        }

        touchSkill(input.skillId, now);
      },
    }),
    [hitListEntries, hits, media, notes, partners, skills, trainingLogs],
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
