import backAttackBasics from '../docs/seed-skill-packs/back-attack-basics.json';
import escapeBasics from '../docs/seed-skill-packs/escape-basics.json';
import highGround from '../docs/seed-skill-packs/high-ground.json';
import scrambler from '../docs/seed-skill-packs/scrambler.json';

export const SKILL_PACK_VERSION = 4;

export type SkillPackImportMode = 'active' | 'arsenal';

export type SkillPackSkill = {
  key: string;
  column?: string;
  name: string;
  notes: string[];
  media: Array<{
    url: string;
    title: string;
    thumbnailUrl: string;
    notes: string;
  }>;
};

export type SkillPack = {
  slug: string;
  title: string;
  description: string;
  level: string;
  skills: SkillPackSkill[];
};

type EditableSkillPack = Omit<SkillPack, 'skills'> & {
  skills: Array<
    Omit<SkillPackSkill, 'media'> & {
      media: Array<Omit<SkillPackSkill['media'][number], 'notes'> & { notes: string[] }>;
    }
  >;
};

function fromEditableSkillPack(pack: EditableSkillPack): SkillPack {
  return {
    ...pack,
    skills: pack.skills.map((skill) => ({
      ...skill,
      media: skill.media.map((media) => ({
        ...media,
        notes: media.notes.join('\n'),
      })),
    })),
  };
}

export const skillPacks: SkillPack[] = [
  fromEditableSkillPack(escapeBasics),
  fromEditableSkillPack(backAttackBasics),
  fromEditableSkillPack(highGround),
];

// Not shown in the app. Add back to skillPacks to re-enable.
export const scramblerPack: SkillPack = fromEditableSkillPack(scrambler);

export const starterSkills = skillPacks.flatMap((pack) => pack.skills);
export const STARTER_SKILL_VERSION = SKILL_PACK_VERSION;
