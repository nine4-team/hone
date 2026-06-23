/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  XP_PER_LEVEL,
  beltPoints,
  beltPointsFifths,
  formatXp,
  getSkillLevelProgress,
  skillXpFifths,
} from './hits';
import type { Belt, Hit, Partner } from './types';

const now = '2026-06-21T00:00:00.000Z';

function hit(partnerId: string | undefined, count: number, skillId = 'skill-1'): Hit {
  return { id: `hit-${partnerId ?? 'none'}-${count}`, skillId, partnerId, count, createdAt: now, updatedAt: now };
}

function partner(id: string, belt?: Belt): Partner {
  return { id, name: id, belt, createdAt: now, updatedAt: now };
}

// --- belt point values ---------------------------------------------------

test('adult belts are worth 1..5 points', () => {
  assert.equal(beltPoints('white'), 1);
  assert.equal(beltPoints('blue'), 2);
  assert.equal(beltPoints('purple'), 3);
  assert.equal(beltPoints('brown'), 4);
  assert.equal(beltPoints('black'), 5);
});

test('kids belts are fractional between adult white and blue', () => {
  assert.equal(beltPoints('kids_white'), 1);
  assert.equal(beltPoints('kids_grey'), 1.2);
  assert.equal(beltPoints('kids_yellow'), 1.4);
  assert.equal(beltPoints('kids_orange'), 1.6);
  assert.equal(beltPoints('kids_green'), 1.8);
  // Every kids rank sits strictly inside (white, blue], never above an adult blue.
  for (const belt of ['kids_white', 'kids_grey', 'kids_yellow', 'kids_orange', 'kids_green'] as Belt[]) {
    assert.ok(beltPoints(belt) >= beltPoints('white'));
    assert.ok(beltPoints(belt) < beltPoints('blue'));
  }
});

test('missing or undefined belt defaults to white', () => {
  assert.equal(beltPointsFifths(undefined), 5);
  assert.equal(beltPointsFifths(null), 5);
  assert.equal(beltPoints(undefined), 1);
});

// --- skillXpFifths -------------------------------------------------------

test('hits with no partner count as white', () => {
  const hits = [hit(undefined, 3)];
  // 3 hits × white(5 fifths) = 15 fifths = 3 XP
  assert.equal(skillXpFifths(hits, []), 15);
});

test('a hit on a partner with no belt counts as white', () => {
  const hits = [hit('p1', 4)];
  assert.equal(skillXpFifths(hits, [partner('p1')]), 20); // 4 × 5 fifths
});

test('belt multiplies the hit count', () => {
  const hits = [hit('p1', 2)];
  assert.equal(skillXpFifths(hits, [partner('p1', 'black')]), 50); // 2 × 25 fifths = 10 XP
});

test('kids belt produces a fractional XP total without float drift', () => {
  const hits = [hit('p1', 3)];
  const fifths = skillXpFifths(hits, [partner('p1', 'kids_grey')]); // 3 × 6 = 18 fifths
  assert.equal(fifths, 18);
  assert.equal(getSkillLevelProgress(fifths).totalXp, 3.6);
});

test('mixed belts and unattributed hits sum correctly', () => {
  const hits = [
    hit(undefined, 5), // white: 25
    hit('p1', 3), //      blue: 3 × 10 = 30
    hit('p2', 2), //      kids_orange: 2 × 8 = 16
    hit('p3', 1), //      black: 25
  ];
  const partners = [partner('p1', 'blue'), partner('p2', 'kids_orange'), partner('p3', 'black')];
  assert.equal(skillXpFifths(hits, partners), 25 + 30 + 16 + 25); // 96 fifths = 19.2 XP
});

test('changing a partner belt re-derives past XP (belt read live)', () => {
  const hits = [hit('p1', 10)];
  assert.equal(skillXpFifths(hits, [partner('p1', 'white')]), 50); // level 1 worth
  assert.equal(skillXpFifths(hits, [partner('p1', 'black')]), 250); // same hits, now 5×
});

// #2: the user-visible outcome — a skill's level changes when a partner's belt
// is edited, with no change to the underlying hits. This is the full recompute
// path (hits + partners -> XP -> level), the part the UI relies on.
test('editing a partner belt moves the skill level for the same hits', () => {
  const hits = [hit('p1', 4)]; // 4 hits on one partner, never changes

  const asWhite = getSkillLevelProgress(skillXpFifths(hits, [partner('p1', 'white')]));
  assert.equal(asWhite.level, 0); // 4 white XP -> still level 0
  assert.equal(asWhite.totalXp, 4);

  const asBlack = getSkillLevelProgress(skillXpFifths(hits, [partner('p1', 'black')]));
  assert.equal(asBlack.level, 2); // same 4 hits, now 20 XP -> level 2
  assert.equal(asBlack.totalXp, 20);

  // ...and dropping the belt back down lowers the level again — no XP is frozen.
  const backToWhite = getSkillLevelProgress(skillXpFifths(hits, [partner('p1', 'white')]));
  assert.equal(backToWhite.level, 0);
});

// #2, finer grain: a kids-belt edit nudges level via fractional XP, exactly.
test('a kids-belt edit changes the skill level through fractional XP', () => {
  const hits = [hit('p1', 9)]; // 9 hits

  const asWhite = getSkillLevelProgress(skillXpFifths(hits, [partner('p1', 'white')]));
  assert.equal(asWhite.totalXp, 9); // 9 XP -> level 0
  assert.equal(asWhite.level, 0);

  const asGreen = getSkillLevelProgress(skillXpFifths(hits, [partner('p1', 'kids_green')]));
  assert.equal(asGreen.totalXp, 16.2); // 9 × 1.8, exact
  assert.equal(asGreen.level, 1); // crosses into level 1
});

// --- getSkillLevelProgress ----------------------------------------------

test('white-belt XP matches the old one-hit-one-point leveling', () => {
  // 36 white-belt hits = 36 XP = 180 fifths.
  const progress = getSkillLevelProgress(180);
  assert.equal(progress.level, 3);
  assert.equal(progress.xpIntoLevel, 6);
  assert.equal(progress.xpToNextLevel, 4);
  assert.equal(progress.nextLevel, 4);
  assert.equal(progress.totalXp, 36);
  assert.equal(progress.progressToNextLevel, 0.6);
});

test('fractional XP lands on the right level and into-level remainder', () => {
  // 18.6 XP = 93 fifths → level 1, 8.6 XP into level 2.
  const progress = getSkillLevelProgress(93);
  assert.equal(progress.level, 1);
  assert.equal(progress.xpIntoLevel, 8.6);
  assert.equal(progress.xpToNextLevel, 1.4);
  assert.equal(progress.totalXp, 18.6);
});

test('level is unbounded and keeps current-level progress', () => {
  // 437.6 XP.
  const progress = getSkillLevelProgress(2188);
  assert.equal(progress.level, 43);
  assert.equal(progress.nextLevel, 44);
  assert.equal(progress.xpIntoLevel, 7.6);
  assert.equal(progress.xpToNextLevel, 2.4);
  assert.equal(progress.progressToNextLevel, 0.76);
  assert.equal(progress.totalXp, 437.6);
});

test('exactly 500 XP is level 50', () => {
  const progress = getSkillLevelProgress(2500);
  assert.equal(progress.level, 50);
  assert.equal(progress.totalXp, 500);
  assert.equal(progress.xpIntoLevel, 0);
  assert.equal(progress.xpToNextLevel, XP_PER_LEVEL);
  assert.equal(progress.nextLevel, 51);
});

test('large belt-weighted total stays exact (no float error at scale)', () => {
  // 250 black-belt hits = 250 × 25 fifths = 6250 fifths = 1250 XP.
  const hits = [hit('p1', 250)];
  const fifths = skillXpFifths(hits, [partner('p1', 'black')]);
  assert.equal(fifths, 6250);
  const progress = getSkillLevelProgress(fifths);
  assert.equal(progress.totalXp, 1250);
  assert.equal(progress.level, 125);
});

test('negative or zero totals are floored to level 0', () => {
  assert.equal(getSkillLevelProgress(0).level, 0);
  assert.equal(getSkillLevelProgress(-50).level, 0);
  assert.equal(getSkillLevelProgress(-50).totalXp, 0);
});

// --- formatXp ------------------------------------------------------------

test('formatXp shows whole numbers plainly and fractions to one decimal', () => {
  assert.equal(formatXp(6), '6');
  assert.equal(formatXp(0), '0');
  assert.equal(formatXp(3.6), '3.6');
  assert.equal(formatXp(8.6), '8.6');
});
