import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from '../src/index';

const fixturesDir = join(__dirname, 'fixtures');

function getErrorFiles(): string[] {
  try {
    return readdirSync(fixturesDir).filter((f) =>
      f.startsWith('phpstan-errors-'),
    );
  } catch {
    return [];
  }
}

const errorFiles = getErrorFiles();

describe.skipIf(errorFiles.length === 0)(
  'snapshot: PHPStan error messages',
  () => {
    for (const file of errorFiles) {
      describe(file, () => {
        const filePath = join(fixturesDir, file);
        const messages = readFileSync(filePath, 'utf-8')
          .split('\n')
          .filter((line) => line.length > 0);

        it(`parses ${messages.length} messages and matches snapshot`, () => {
          const results = messages.map((message) => ({
            input: message,
            tokens: parse(message),
          }));

          expect(results).toMatchSnapshot();
        });
      });
    }
  },
);
