import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assignLanes, bandCenter, decadeTicks, formatFrequency, logPosition } from './spectrum';

test('logPosition maps decades to equal steps across 0.1 GHz to 1 THz', () => {
  assert.equal(logPosition(0.1), 0);
  assert.equal(logPosition(1000), 1);
  assert.ok(Math.abs(logPosition(1) - 0.25) < 1e-12);
  assert.ok(Math.abs(logPosition(10) - 0.5) < 1e-12);
  assert.ok(Math.abs(logPosition(100) - 0.75) < 1e-12);
});

test('logPosition clamps out-of-range frequencies and rejects nonsense', () => {
  assert.equal(logPosition(0.01), 0);
  assert.equal(logPosition(5000), 1);
  assert.throws(() => logPosition(0));
  assert.throws(() => logPosition(-3));
  assert.throws(() => logPosition(1, 10, 1));
});

test('bandCenter is the geometric mean', () => {
  assert.ok(Math.abs(bandCenter([110, 143]) - Math.sqrt(110 * 143)) < 1e-12);
  assert.equal(bandCenter([90, 90]), 90);
});

test('decadeTicks labels one major tick per decade and fills minors', () => {
  const ticks = decadeTicks();
  const majors = ticks.filter((t) => t.major);
  assert.deepEqual(majors.map((t) => t.label), ['100 MHz', '1 GHz', '10 GHz', '100 GHz', '1 THz']);
  // 4 decades x 8 minors (2..9)
  assert.equal(ticks.filter((t) => !t.major).length, 32);
  assert.ok(ticks.every((t) => t.position >= 0 && t.position <= 1));
});

test('formatFrequency picks the natural unit', () => {
  assert.equal(formatFrequency(0.1), '100 MHz');
  assert.equal(formatFrequency(4.7), '4.7 GHz');
  assert.equal(formatFrequency(920), '920 GHz');
  assert.equal(formatFrequency(1000), '1 THz');
});

test('assignLanes stacks overlapping bands and reuses free lanes', () => {
  const lanes = assignLanes([
    { start: 0.0, end: 0.44 }, // 0.1–6 GHz
    { start: 0.37, end: 0.42 }, // 3.1–4.7 GHz, overlaps the first
    { start: 0.6, end: 0.62 }, // clear of both
  ]);
  assert.deepEqual(lanes, [0, 1, 0]);
});
