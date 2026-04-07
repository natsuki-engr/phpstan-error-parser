import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from '../src/index';

const fixturesDir = join(__dirname, 'fixtures');
const snapshotsDir = join(__dirname, '__snapshots__');

function getBranchDirs(): string[] {
  try {
    return readdirSync(fixturesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

function getCategoryFiles(branchDir: string): string[] {
  const dir = join(fixturesDir, branchDir);
  try {
    return readdirSync(dir).filter((f) => f.endsWith('.txt'));
  } catch {
    return [];
  }
}

const branchDirs = getBranchDirs();

describe.skipIf(branchDirs.length === 0)(
  'snapshot: PHPStan error messages',
  () => {
    for (const branch of branchDirs) {
      describe(branch, () => {
        const categoryFiles = getCategoryFiles(branch);

        for (const file of categoryFiles) {
          const filePath = join(fixturesDir, branch, file);
          const category = file.replace('.txt', '');
          const messages = readFileSync(filePath, 'utf-8')
            .split('\n')
            .filter((line) => line.length > 0);

          it(`${category} (${messages.length} messages)`, () => {
            const results = messages.map((message) => ({
              input: message,
              tokens: parse(message),
            }));

            expect(JSON.stringify(results, null, 2)).toMatchFileSnapshot(
              join(snapshotsDir, branch, `${category}.snap`),
            );
          }, 60_000);
        }
      });
    }
  },
);
