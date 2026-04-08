/**
 * Benchmark script for measuring parse performance.
 *
 * Measures:
 * - Total time
 * - Per-phase breakdown (lexer, parser, formatter)
 * - Parser instantiation vs parse execution
 * - Top N slowest messages
 * - Message length (token count) vs parse time correlation
 * - Type detection statistics
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
  const sorted = [...times].sort((a, b) => a - b);
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  return {
    mean: Number.parseFloat(mean.toFixed(2)),
    median: Number.parseFloat(median.toFixed(2)),
    min: Number.parseFloat((sorted[0] ?? 0).toFixed(2)),
    max: Number.parseFloat((sorted[sorted.length - 1] ?? 0).toFixed(2)),
  };
}

const ITERATIONS = 10;
const WARMUP = 3;
const TOP_SLOW = 10;
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

// Phase benchmarks + parser instantiation breakdown
const lexTimes: number[] = [];
const parserInitTimes: number[] = [];
const parserExecTimes: number[] = [];
const formatTimes: number[] = [];

for (let i = 0; i < ITERATIONS; i++) {
  let lexTotal = 0;
  let initTotal = 0;
  let execTotal = 0;
  let formatTotal = 0;

  for (const m of messages) {
    let t0 = performance.now();
    const lexResult = lexer.tokenize(m);
    let t1 = performance.now();
    lexTotal += t1 - t0;

    t0 = t1;
    const parser = new Parser();
    t1 = performance.now();
    initTotal += t1 - t0;

    t0 = t1;
    parser.input = lexResult.tokens;
    const cst = parser.errorMessage();
    t1 = performance.now();
    execTotal += t1 - t0;

    t0 = t1;
    format(cst);
    formatTotal += performance.now() - t0;
  }

  lexTimes.push(lexTotal);
  parserInitTimes.push(initTotal);
  parserExecTimes.push(execTotal);
  formatTimes.push(formatTotal);
}

// Per-message timing for slowest messages
const perMessageTimes: { message: string; time: number; tokenCount: number }[] =
  [];
for (const m of messages) {
  const start = performance.now();
  parse(m);
  const time = performance.now() - start;
  const tokenCount = lexer.tokenize(m).tokens.length;
  perMessageTimes.push({ message: m, time, tokenCount });
}
perMessageTimes.sort((a, b) => b.time - a.time);
const slowest = perMessageTimes.slice(0, TOP_SLOW).map((entry) => ({
  message:
    entry.message.length > 100
      ? `${entry.message.slice(0, 100)}...`
      : entry.message,
  time: Number.parseFloat(entry.time.toFixed(3)),
  tokenCount: entry.tokenCount,
}));

// Message length vs parse time correlation
const buckets: Record<string, { count: number; totalTime: number }> = {};
for (const entry of perMessageTimes) {
  const bucketKey =
    entry.tokenCount < 10
      ? '1-9'
      : entry.tokenCount < 20
        ? '10-19'
        : entry.tokenCount < 30
          ? '20-29'
          : entry.tokenCount < 50
            ? '30-49'
            : '50+';
  const bucket = buckets[bucketKey] ?? { count: 0, totalTime: 0 };
  bucket.count++;
  bucket.totalTime += entry.time;
  buckets[bucketKey] = bucket;
}
const tokenBuckets: Record<string, { count: number; avgTime: number }> = {};
for (const [key, bucket] of Object.entries(buckets)) {
  tokenBuckets[key] = {
    count: bucket.count,
    avgTime: Number.parseFloat((bucket.totalTime / bucket.count).toFixed(4)),
  };
}

// Type detection statistics
let totalTokens = 0;
let typeWords = 0;
let totalWords = 0;
for (const m of messages) {
  const tokens = lexer.tokenize(m).tokens;
  totalTokens += tokens.length;
  const words = parse(m);
  totalWords += words.length;
  typeWords += words.filter((w: { type: string }) => w.type === 'type').length;
}

const totalStats = computeStats(totalTimes);
const result = {
  messages: messages.length,
  iterations: ITERATIONS,
  ...totalStats,
  perMessage: Number.parseFloat((totalStats.mean / messages.length).toFixed(4)),
  phases: {
    lexer: computeStats(lexTimes),
    parserInit: computeStats(parserInitTimes),
    parserExec: computeStats(parserExecTimes),
    formatter: computeStats(formatTimes),
  },
  slowest,
  tokenBuckets,
  typeStats: {
    totalTokens,
    totalWords,
    typeWords,
    typeRatio: Number.parseFloat((typeWords / totalWords).toFixed(4)),
  },
};

console.log(JSON.stringify(result));
