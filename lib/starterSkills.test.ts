import assert from 'node:assert/strict';
import { test } from 'node:test';
import { skillPacks } from './starterSkills';

test('starter pack video notes live on media, not standalone skill notes', () => {
  for (const pack of skillPacks) {
    for (const skill of pack.skills) {
      assert.equal(
        skill.notes.length,
        0,
        `${pack.title} / ${skill.name} should not seed standalone skill notes`,
      );

      for (const media of skill.media) {
        assert.match(media.notes, /^Video notes: .+/);
      }
    }
  }
});
