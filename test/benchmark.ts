/**
 * Benchmark script for measuring parse performance.
 *
 * Measures total time and per-phase breakdown (lexer, parser, formatter).
 *
 * Usage: npm run build && node --experimental-strip-types test/benchmark.ts
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-expect-error -- runs against dist after build
import { format } from '../dist/format.js';
// @ts-expect-error -- runs against dist after build
import { parse } from '../dist/index.js';
// @ts-expect-error -- runs against dist after build
import { lexer, Parser } from '../dist/parser.js';

const baseDir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(baseDir, 'fixtures');

function loadMessages(): string[] {
  const messages: string[] = [];
  let branchDirs: string[];
  try {
    branchDirs = readdirSync(fixturesDir, { withFileTypes: true })
      .filter((d: { isDirectory: () => boolean }) => d.isDirectory())
      .map((d: { name: string }) => d.name);
  } catch {
    return messages;
  }

  for (const branch of branchDirs) {
    const dir = join(fixturesDir, branch);
    for (const file of readdirSync(dir).filter((f: string) =>
      f.endsWith('.txt'),
    )) {
      const lines = readFileSync(join(dir, file), 'utf-8')
        .split('\n')
        .filter((l: string) => l.length > 0);
      messages.push(...lines);
    }
  }
  return messages;
}

function computeStats(times: number[]) {
  times.sort((a, b) => a - b);
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const median = times[Math.floor(times.length / 2)] ?? 0;
  return {
    mean: Number.parseFloat(mean.toFixed(2)),
    median: Number.parseFloat(median.toFixed(2)),
    min: Number.parseFloat((times[0] ?? 0).toFixed(2)),
    max: Number.parseFloat((times[times.length - 1] ?? 0).toFixed(2)),
  };
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

// Total benchmark
const totalTimes: number[] = [];
for (let i = 0; i < ITERATIONS; i++) {
  const start = performance.now();
  for (const m of messages) parse(m);
  totalTimes.push(performance.now() - start);
}

// Phase benchmarks
const lexTimes: number[] = [];
const parseTimes: number[] = [];
const formatTimes: number[] = [];

for (let i = 0; i < ITERATIONS; i++) {
  let lexTotal = 0;
  let parseTotal = 0;
  let formatTotal = 0;

  for (const m of messages) {
    let t0 = performance.now();
    const lexResult = lexer.tokenize(m);
    let t1 = performance.now();
    lexTotal += t1 - t0;

    t0 = t1;
    const parser = new Parser();
    parser.input = lexResult.tokens;
    const cst = parser.errorMessage();
    t1 = performance.now();
    parseTotal += t1 - t0;

    t0 = t1;
    format(cst);
    formatTotal += performance.now() - t0;
  }

  lexTimes.push(lexTotal);
  parseTimes.push(parseTotal);
  formatTimes.push(formatTotal);
}

const totalStats = computeStats(totalTimes);
const result = {
  messages: messages.length,
  iterations: ITERATIONS,
  ...totalStats,
  perMessage: Number.parseFloat((totalStats.mean / messages.length).toFixed(4)),
  phases: {
    lexer: computeStats(lexTimes),
    parser: computeStats(parseTimes),
    formatter: computeStats(formatTimes),
  },
};

console.log(JSON.stringify(result));
