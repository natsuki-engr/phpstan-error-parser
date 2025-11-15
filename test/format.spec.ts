import { describe, expect, it } from 'vitest';
import { parse } from '../src/index';

describe('test formatted results', () => {
  it('parse function not found error', async () => {
    const message = 'Function format not found.';
    const result = parse(message);

    const expected = [
      {
        type: 'common_word',
        value: 'Function',
        location: {
          startColumn: 0,
          endColumn: 8,
        },
      },
      {
        type: 'function_name',
        value: 'format',
        location: {
          startColumn: 9,
          endColumn: 15,
        },
      },
      {
        type: 'common_word',
        value: 'not',
        location: {
          startColumn: 16,
          endColumn: 19,
        },
      },
      {
        type: 'common_word',
        value: 'found',
        location: {
          startColumn: 20,
          endColumn: 25,
        },
      },
      {
        type: 'period',
        value: '.',
        location: {
          startColumn: 25,
          endColumn: 26,
        },
      },
    ];
    expect(result).toStrictEqual(expected);
  });

  it('parse doc tag', async () => {
    const message = 'PHPDoc tag @mixin contains unresolvable type.';

    const result = parse(message);

    const expected = [
      {
        type: 'common_word',
        value: 'PHPDoc',
        location: {
          startColumn: 0,
          endColumn: 6,
        },
      },
      {
        type: 'common_word',
        value: 'tag',
        location: {
          startColumn: 7,
          endColumn: 10,
        },
      },
      {
        type: 'doc_tag',
        value: '@mixin',
        location: {
          startColumn: 11,
          endColumn: 17,
        },
      },
      {
        type: 'common_word',
        value: 'contains',
        location: {
          startColumn: 18,
          endColumn: 26,
        },
      },
      {
        type: 'common_word',
        value: 'unresolvable',
        location: {
          startColumn: 27,
          endColumn: 39,
        },
      },
      {
        type: 'common_word',
        value: 'type',
        location: {
          startColumn: 40,
          endColumn: 44,
        },
      },
      {
        type: 'period',
        value: '.',
        location: {
          startColumn: 44,
          endColumn: 45,
        },
      },
    ];

    expect(result).toStrictEqual(expected);
  });

  it('parse as common words', async () => {
    const message = 'The method might change in a minor PHPStan version.';
    const result = parse(message);

    const expected = [
      {
        type: 'common_word',
        value: 'The',
        location: {
          startColumn: 0,
          endColumn: 3,
        },
      },
      {
        type: 'common_word',
        value: 'method',
        location: {
          startColumn: 4,
          endColumn: 10,
        },
      },
      {
        type: 'common_word',
        value: 'might',
        location: {
          startColumn: 11,
          endColumn: 16,
        },
      },
      {
        type: 'common_word',
        value: 'change',
        location: {
          startColumn: 17,
          endColumn: 23,
        },
      },
      {
        type: 'common_word',
        value: 'in',
        location: {
          startColumn: 24,
          endColumn: 26,
        },
      },
      {
        type: 'common_word',
        value: 'a',
        location: {
          startColumn: 27,
          endColumn: 28,
        },
      },
      {
        type: 'common_word',
        value: 'minor',
        location: {
          startColumn: 29,
          endColumn: 34,
        },
      },
      {
        type: 'common_word',
        value: 'PHPStan',
        location: {
          startColumn: 35,
          endColumn: 42,
        },
      },
      {
        type: 'common_word',
        value: 'version',
        location: {
          startColumn: 43,
          endColumn: 50,
        },
      },
      {
        type: 'period',
        value: '.',
        location: {
          startColumn: 50,
          endColumn: 51,
        },
      },
    ];

    expect(result).toStrictEqual(expected);
  });

  it('parse comma', () => {
    const message = 'A is B, C is D.';
    const result = parse(message);

    const expected = [
      {
        type: 'common_word',
        value: 'A',
        location: {
          startColumn: 0,
          endColumn: 1,
        },
      },
      {
        type: 'common_word',
        value: 'is',
        location: {
          startColumn: 2,
          endColumn: 4,
        },
      },
      {
        type: 'common_word',
        value: 'B',
        location: {
          startColumn: 5,
          endColumn: 6,
        },
      },
      {
        type: 'comma',
        value: ',',
        location: {
          startColumn: 6,
          endColumn: 7,
        },
      },
      {
        type: 'common_word',
        value: 'C',
        location: {
          startColumn: 8,
          endColumn: 9,
        },
      },
      {
        type: 'common_word',
        value: 'is',
        location: {
          startColumn: 10,
          endColumn: 12,
        },
      },
      {
        type: 'common_word',
        value: 'D',
        location: {
          startColumn: 13,
          endColumn: 14,
        },
      },
      {
        type: 'period',
        value: '.',
        location: {
          startColumn: 14,
          endColumn: 15,
        },
      },
    ];

    expect(result).toStrictEqual(expected);
  });

  it('parse static method', () => {
    const message =
      'Call to static method PHPStan\\Tests\\AssertionClass::assertInt() with int will always evaluate to true.';

    const result = parse(message);

    const expected = [
      {
        type: 'common_word',
        value: 'Call',
        location: {
          startColumn: 0,
          endColumn: 4,
        },
      },
      {
        type: 'common_word',
        value: 'to',
        location: {
          startColumn: 5,
          endColumn: 7,
        },
      },
      {
        type: 'common_word',
        value: 'static',
        location: {
          startColumn: 8,
          endColumn: 14,
        },
      },
      {
        type: 'common_word',
        value: 'method',
        location: {
          startColumn: 15,
          endColumn: 21,
        },
      },
      {
        type: 'method_name',
        value: 'PHPStan\\Tests\\AssertionClass::assertInt()',
        location: {
          startColumn: 22,
          endColumn: 63,
        },
      },
      {
        type: 'common_word',
        value: 'with',
        location: {
          startColumn: 64,
          endColumn: 68,
        },
      },
      {
        type: 'common_word',
        value: 'int',
        location: {
          startColumn: 69,
          endColumn: 72,
        },
      },
      {
        type: 'common_word',
        value: 'will',
        location: {
          startColumn: 73,
          endColumn: 77,
        },
      },
      {
        type: 'common_word',
        value: 'always',
        location: {
          startColumn: 78,
          endColumn: 84,
        },
      },
      {
        type: 'common_word',
        value: 'evaluate',
        location: {
          startColumn: 85,
          endColumn: 93,
        },
      },
      {
        type: 'common_word',
        value: 'to',
        location: {
          startColumn: 94,
          endColumn: 96,
        },
      },
      {
        type: 'common_word',
        value: 'true',
        location: {
          startColumn: 97,
          endColumn: 101,
        },
      },
      {
        type: 'period',
        value: '.',
        location: {
          startColumn: 101,
          endColumn: 102,
        },
      },
    ];

    expect(result).toStrictEqual(expected);
  });
});
