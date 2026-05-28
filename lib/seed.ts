import type { Hit, Media, Note, Partner, Skill, TrainingLog } from './types';

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

export const seedSkills: Skill[] = [
  {
    id: 'skill-k-guard',
    name: 'K Guard Entry',
    stage: 'mechanics',
    active: true,
    lastTouchedAt: daysAgo(2),
    createdAt: daysAgo(18),
    updatedAt: daysAgo(2),
  },
  {
    id: 'skill-rnc',
    name: 'RNC Finish',
    stage: 'resistance',
    active: true,
    lastTouchedAt: daysAgo(1),
    createdAt: daysAgo(41),
    updatedAt: daysAgo(1),
  },
  {
    id: 'skill-knee-lever',
    name: 'Half Guard Knee Lever',
    stage: 'saved',
    active: false,
    lastTouchedAt: daysAgo(0),
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: 'skill-arm-triangle',
    name: 'Arm Triangle',
    stage: 'proven',
    active: false,
    lastTouchedAt: daysAgo(8),
    createdAt: daysAgo(90),
    updatedAt: daysAgo(8),
  },
  {
    id: 'skill-wrist-ride',
    name: 'Wrist Ride Back Take',
    stage: 'mechanics',
    active: true,
    lastTouchedAt: daysAgo(5),
    createdAt: daysAgo(12),
    updatedAt: daysAgo(5),
  },
];

export const seedPartners: Partner[] = [
  { id: 'partner-alex', name: 'Alex', createdAt: daysAgo(36), updatedAt: daysAgo(1) },
  { id: 'partner-jordan', name: 'Jordan', createdAt: daysAgo(24), updatedAt: daysAgo(2) },
  { id: 'partner-sam', name: 'Sam', createdAt: daysAgo(12), updatedAt: daysAgo(4) },
];

export const seedTrainingLogs: TrainingLog[] = [
  {
    id: 'log-k-guard-1',
    skillId: 'skill-k-guard',
    type: 'constraint_game',
    occurredAt: daysAgo(2),
    durationMinutes: 12,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'log-rnc-1',
    skillId: 'skill-rnc',
    type: 'rolling',
    occurredAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'log-arm-triangle-1',
    skillId: 'skill-arm-triangle',
    type: 'rolling',
    occurredAt: daysAgo(8),
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
  },
];

export const seedNotes: Note[] = [
  {
    id: 'note-k-guard-1',
    skillId: 'skill-k-guard',
    trainingLogId: 'log-k-guard-1',
    body: 'Entry worked when I kept my knee line hidden and framed before turning in.',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'note-rnc-1',
    skillId: 'skill-rnc',
    trainingLogId: 'log-rnc-1',
    body: 'Hand fight improved when I got chest-to-back tighter before attacking the neck.',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'note-wrist-ride-1',
    skillId: 'skill-wrist-ride',
    body: 'Ask coach about the hip switch when they post the free hand.',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
];

export const seedHits: Hit[] = [
  {
    id: 'hit-k-guard-alex',
    skillId: 'skill-k-guard',
    trainingLogId: 'log-k-guard-1',
    partnerId: 'partner-alex',
    count: 4,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'hit-k-guard-jordan',
    skillId: 'skill-k-guard',
    trainingLogId: 'log-k-guard-1',
    partnerId: 'partner-jordan',
    count: 3,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'hit-rnc-alex',
    skillId: 'skill-rnc',
    trainingLogId: 'log-rnc-1',
    partnerId: 'partner-alex',
    count: 12,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'hit-rnc-open',
    skillId: 'skill-rnc',
    trainingLogId: 'log-rnc-1',
    count: 15,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'hit-wrist-ride-alex',
    skillId: 'skill-wrist-ride',
    partnerId: 'partner-alex',
    count: 31,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: 'hit-wrist-ride-sam',
    skillId: 'skill-wrist-ride',
    partnerId: 'partner-sam',
    count: 22,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: 'hit-arm-triangle-sam',
    skillId: 'skill-arm-triangle',
    trainingLogId: 'log-arm-triangle-1',
    partnerId: 'partner-sam',
    count: 2,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
  },
];

export const seedMedia: Media[] = [
  {
    id: 'media-k-guard-1',
    skillId: 'skill-k-guard',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=2b7bqY7iZBs&t=233s',
    title: 'How To Do The Perfect BJJ K Guard by Lachlan Giles',
    thumbnailUrl: 'https://i.ytimg.com/vi/2b7bqY7iZBs/hqdefault.jpg',
    notes: 'Reference for entry angle and knee line.',
    createdAt: daysAgo(18),
    updatedAt: daysAgo(18),
  },
];
