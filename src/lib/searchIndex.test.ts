import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchIndex, normalize, personSlug, searchIndex } from './searchIndex';

const index = buildSearchIndex();

test('normalize folds case, accents and dash variants', () => {
  assert.equal(normalize('  Émile – TERAHERTZ  '), 'emile - terahertz');
});

test('personSlug drops the title and punctuation', () => {
  assert.equal(personSlug('Prof. Hamidreza Aghasi'), 'hamidreza-aghasi');
  assert.equal(personSlug('Yilun (Allen) Huang'), 'yilun-allen-huang');
});

test('the index covers every content type with unique ids', () => {
  const groups = new Set(index.map((i) => i.group));
  for (const g of ['Pages', 'RF Toolbox', 'People', 'Publications', 'Chips', 'News']) {
    assert.ok(groups.has(g as never), `missing group ${g}`);
  }
  assert.equal(new Set(index.map((i) => i.id)).size, index.length);
});

test('a tool is found by keyword, not only by its name', () => {
  const hits = searchIndex(index, 'friis');
  assert.equal(hits[0]?.title, 'System Cascade Chain Builder');
});

test('all tokens must match, in any order', () => {
  const hits = searchIndex(index, 'radar fmcw 49');
  assert.ok(hits.some((h) => h.group === 'Chips' && h.title.startsWith('49–63 GHz')));
  assert.equal(searchIndex(index, 'fmcw zzzz-no-such-token').length, 0);
});

test('people resolve to anchors on the team page', () => {
  const hit = searchIndex(index, 'aghasi').find((h) => h.group === 'People');
  assert.equal(hit?.href, '/team/#hamidreza-aghasi');
});

test('results are capped per group and ordered by group', () => {
  const hits = searchIndex(index, 'ghz', 3);
  const perGroup = new Map<string, number>();
  hits.forEach((h) => perGroup.set(h.group, (perGroup.get(h.group) ?? 0) + 1));
  assert.ok([...perGroup.values()].every((n) => n <= 3));
  const order: string[] = hits.map((h) => h.group);
  const firstIndex = (g: string) => order.indexOf(g);
  assert.ok(firstIndex('RF Toolbox') === -1 || firstIndex('Chips') === -1 || firstIndex('RF Toolbox') < firstIndex('Chips'));
});

test('an empty query returns nothing', () => {
  assert.deepEqual(searchIndex(index, '   '), []);
});
