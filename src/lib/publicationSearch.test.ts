import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { publications, type Publication } from '../data/publications';
import { matchesPublication, searchPublications } from './publicationSearch';
import { words } from './text';

const paper = (over: Partial<Publication>): Publication => ({ authors: 'A. Author', title: 'A Title', venue: 'IEEE JSSC', year: 2025, type: 'journal', ...over });

describe('words', () => {
  it('splits on punctuation and folds case and accents', () => {
    assert.deepEqual(words('IEEE TCAS-II, 2024'), ['ieee', 'tcas', 'ii', '2024']);
    assert.deepEqual(words('Café  Déjà'), ['cafe', 'deja']);
  });
});

describe('matchesPublication', () => {
  it('needs every query word, matched as a word prefix', () => {
    assert.equal(matchesPublication(paper({}), 'jssc 2025'), true);
    assert.equal(matchesPublication(paper({}), 'jssc 2024'), false);
    assert.equal(matchesPublication(paper({ title: 'Closing the gaps' }), 'aps'), false);
    assert.equal(matchesPublication(paper({ venue: 'IEEE APS' }), 'aps'), true);
  });

  it('treats an empty query as a match', () => {
    assert.equal(matchesPublication(paper({}), '   '), true);
  });

  it('finds the real JSSC 2025 papers and nothing else', () => {
    const hits = searchPublications(publications, 'JSSC 2025');
    assert.ok(hits.length >= 1);
    for (const hit of hits) {
      assert.equal(hit.year, 2025);
      assert.match(hit.venue, /JSSC/);
    }
  });
});
