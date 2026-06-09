/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildTrainingLogHits,
  findPartnerByName,
  normalizeTrainingLogNote,
  replaceTrainingLogNotes,
} from './trainingLogEditing';
import type { Note, Partner } from './types';

const now = '2026-06-08T00:00:00.000Z';

function makeId(prefix: string) {
  return `${prefix}-1`;
}

const partners: Partner[] = [
  {
    id: 'partner-alex',
    name: 'Alex',
    createdAt: now,
    updatedAt: now,
  },
];

test('findPartnerByName matches existing partners case-insensitively', () => {
  assert.equal(findPartnerByName(partners, ' alex ')?.id, 'partner-alex');
  assert.equal(findPartnerByName(partners, 'Jordan'), undefined);
});

test('normalizeTrainingLogNote trims blank notes to undefined', () => {
  assert.equal(normalizeTrainingLogNote('  cue here  '), 'cue here');
  assert.equal(normalizeTrainingLogNote('   '), undefined);
  assert.equal(normalizeTrainingLogNote(), undefined);
});

test('buildTrainingLogHits creates unattributed, existing-partner, and new-partner hits', () => {
  const result = buildTrainingLogHits({
    hitInputs: [
      { count: 1 },
      { partnerName: 'Alex', count: 2 },
      { partnerName: 'Jordan', count: 3 },
      { partnerName: 'Skipped', count: 0 },
    ],
    makeId,
    now,
    partners,
    skillId: 'skill-1',
    trainingLogId: 'log-1',
  });

  assert.equal(result.createdPartners.length, 1);
  assert.equal(result.createdPartners[0].name, 'Jordan');
  assert.deepEqual(
    result.hits.map((hit) => ({
      count: hit.count,
      partnerId: hit.partnerId,
      skillId: hit.skillId,
      trainingLogId: hit.trainingLogId,
    })),
    [
      { count: 1, partnerId: undefined, skillId: 'skill-1', trainingLogId: 'log-1' },
      { count: 2, partnerId: 'partner-alex', skillId: 'skill-1', trainingLogId: 'log-1' },
      { count: 3, partnerId: 'partner-1', skillId: 'skill-1', trainingLogId: 'log-1' },
    ],
  );
});

test('buildTrainingLogHits reuses a newly-created partner within the same log', () => {
  const result = buildTrainingLogHits({
    hitInputs: [
      { partnerName: 'Jordan', count: 1 },
      { partnerName: 'jordan', count: 2 },
    ],
    makeId,
    now,
    partners: [],
    skillId: 'skill-1',
    trainingLogId: 'log-1',
  });

  assert.equal(result.createdPartners.length, 1);
  assert.deepEqual(
    result.hits.map((hit) => hit.partnerId),
    ['partner-1', 'partner-1'],
  );
});

test('replaceTrainingLogNotes creates, updates, and removes linked training notes', () => {
  const unrelatedNote: Note = {
    id: 'note-unrelated',
    skillId: 'skill-1',
    body: 'keep me',
    createdAt: now,
    updatedAt: now,
  };
  const existingLinkedNote: Note = {
    id: 'note-linked',
    skillId: 'skill-1',
    trainingLogId: 'log-1',
    body: 'old',
    createdAt: '2026-06-07T00:00:00.000Z',
    updatedAt: '2026-06-07T00:00:00.000Z',
  };

  const created = replaceTrainingLogNotes({
    currentNotes: [unrelatedNote],
    makeId,
    noteBody: ' new note ',
    now,
    skillId: 'skill-1',
    trainingLogId: 'log-1',
  });
  assert.equal(created[0].id, 'note-1');
  assert.equal(created[0].body, 'new note');
  assert.equal(created[1].id, unrelatedNote.id);

  const updated = replaceTrainingLogNotes({
    currentNotes: [existingLinkedNote, unrelatedNote],
    makeId,
    noteBody: 'updated',
    now,
    skillId: 'skill-1',
    trainingLogId: 'log-1',
  });
  assert.equal(updated[0].id, existingLinkedNote.id);
  assert.equal(updated[0].body, 'updated');
  assert.equal(updated[0].createdAt, existingLinkedNote.createdAt);

  const removed = replaceTrainingLogNotes({
    currentNotes: [existingLinkedNote, unrelatedNote],
    makeId,
    noteBody: '   ',
    now,
    skillId: 'skill-1',
    trainingLogId: 'log-1',
  });
  assert.deepEqual(removed, [unrelatedNote]);
});
