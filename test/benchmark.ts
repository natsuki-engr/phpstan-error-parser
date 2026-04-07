/**
 * Benchmark script for measuring parse performance.
 *
 * Usage: npm run build && node --experimental-strip-types test/benchmark.ts
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-expect-error -- runs against dist after build
import { parse } from '../dist/index.js';

const baseDir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(baseDir, 'fixtures');

function loadMessages(): string[] {
  const messages: string[] = [];
  let branchDirs: string[];
  try {
    branchDirs = readdirSync(fixturesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return messages;
  }

  for (const branch of branchDirs) {
    const dir = join(fixturesDir, branch);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.txt'))) {
      const lines = readFileSync(join(dir, file), 'utf-8')
        .split('\n')
        .filter((l) => l.length > 0);
      messages.push(...lines);
    }
  }
  return messages;
}

const ITERATIONS = 10;
const WARMUP = 3;
const messages = loadMessages();

if (messages.length === 0) {
  console.error('No fixture files found');
  process.exit(1);
}

// Warmup
for (let i = 0; i < WARMUP; i++) {
  for (const m of messages) parse(m);
}

// Benchmark
const times: number[] = [];
for (let i = 0; i < ITERATIONS; i++) {
  const start = performance.now();
  for (const m of messages) parse(m);
  times.push(performance.now() - start);
}

times.sort((a, b) => a - b);
const mean = times.reduce((a, b) => a + b, 0) / times.length;
const median = times[Math.floor(times.length / 2)];

const result = {
  messages: messages.length,
  iterations: ITERATIONS,
  mean: Number.parseFloat(mean.toFixed(2)),
  median: Number.parseFloat(median.toFixed(2)),
  min: Number.parseFloat(times[0].toFixed(2)),
  max: Number.parseFloat(times[times.length - 1].toFixed(2)),
  perMessage: Number.parseFloat((mean / messages.length).toFixed(4)),
};

console.log(JSON.stringify(result));
