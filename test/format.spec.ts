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

  it('parse variable', () => {
    const message =
      'Parameter $a of anonymous function has unresolvable native type.';
    const result = parse(message);

    const expected = [
      {
        type: 'common_word',
        value: 'Parameter',
        location: {
          startColumn: 0,
          endColumn: 9,
        },
      },
      {
        type: 'variable_name',
        value: '$a',
        location: {
          startColumn: 10,
          endColumn: 12,
        },
      },
      {
        type: 'common_word',
        value: 'of',
        location: {
          startColumn: 13,
          endColumn: 15,
        },
      },
      {
        type: 'common_word',
        value: 'anonymous',
        location: {
          startColumn: 16,
          endColumn: 25,
        },
      },
      {
        type: 'common_word',
        value: 'function',
        location: {
          startColumn: 26,
          endColumn: 34,
        },
      },
      {
        type: 'common_word',
        value: 'has',
        location: {
          startColumn: 35,
          endColumn: 38,
        },
      },
      {
        type: 'common_word',
        value: 'unresolvable',
        location: {
          startColumn: 39,
          endColumn: 51,
        },
      },
      {
        type: 'common_word',
        value: 'native',
        location: {
          startColumn: 52,
          endColumn: 58,
        },
      },
      {
        type: 'common_word',
        value: 'type',
        location: {
          startColumn: 59,
          endColumn: 63,
        },
      },
      {
        type: 'period',
        value: '.',
        location: {
          startColumn: 63,
          endColumn: 64,
        },
      },
    ];

    expect(result).toStrictEqual(expected);
  });

  it('parse parameter number', () => {
    const message =
      'Parameter #1 $foo of method Test\\ObjectTypehint::doBar() expects Test\\Foo, object given.';
    const result = parse(message);

    const expected = [
      {
        type: 'common_word',
        value: 'Parameter',
        location: {
          startColumn: 0,
          endColumn: 9,
        },
      },
      {
        type: 'parameter_number',
        value: '#1',
        location: {
          startColumn: 10,
          endColumn: 12,
        },
      },
      {
        type: 'variable_name',
        value: '$foo',
        location: {
          startColumn: 13,
          endColumn: 17,
        },
      },
      {
        type: 'common_word',
        value: 'of',
        location: {
          startColumn: 18,
          endColumn: 20,
        },
      },
      {
        type: 'common_word',
        value: 'method',
        location: {
          startColumn: 21,
          endColumn: 27,
        },
      },
      {
        type: 'method_name',
        value: 'Test\\ObjectTypehint::doBar()',
        location: {
          startColumn: 28,
          endColumn: 56,
        },
      },
      {
        type: 'common_word',
        value: 'expects',
        location: {
          startColumn: 57,
          endColumn: 64,
        },
      },
      {
        type: 'namespaced_name',
        value: 'Test\\Foo',
        location: {
          startColumn: 65,
          endColumn: 73,
        },
      },
      {
        type: 'comma',
        value: ',',
        location: {
          startColumn: 73,
          endColumn: 74,
        },
      },
      {
        type: 'common_word',
        value: 'object',
        location: {
          startColumn: 75,
          endColumn: 81,
        },
      },
      {
        type: 'common_word',
        value: 'given',
        location: {
          startColumn: 82,
          endColumn: 87,
        },
      },
      {
        type: 'period',
        value: '.',
        location: {
          startColumn: 87,
          endColumn: 88,
        },
      },
    ];

    expect(result).toStrictEqual(expected);
  });

  it('parse number', () => {
    const message =
      'Method Test\\Foo::foo() invoked with 1 parameter, 0 required.';
    const result = parse(message);

    const expected = [
      {
        type: 'common_word',
        value: 'Method',
        location: {
          startColumn: 0,
          endColumn: 6,
        },
      },
      {
        type: 'method_name',
        value: 'Test\\Foo::foo()',
        location: {
          startColumn: 7,
          endColumn: 22,
        },
      },
      {
        type: 'common_word',
        value: 'invoked',
        location: {
          startColumn: 23,
          endColumn: 30,
        },
      },
      {
        type: 'common_word',
        value: 'with',
        location: {
          startColumn: 31,
          endColumn: 35,
        },
      },
      {
        type: 'number',
        value: '1',
        location: {
          startColumn: 36,
          endColumn: 37,
        },
      },
      {
        type: 'common_word',
        value: 'parameter',
        location: {
          startColumn: 38,
          endColumn: 47,
        },
      },
      {
        type: 'comma',
        value: ',',
        location: {
          startColumn: 47,
          endColumn: 48,
        },
      },
      {
        type: 'number',
        value: '0',
        location: {
          startColumn: 49,
          endColumn: 50,
        },
      },
      {
        type: 'common_word',
        value: 'required',
        location: {
          startColumn: 51,
          endColumn: 59,
        },
      },
      {
        type: 'period',
        value: '.',
        location: {
          startColumn: 59,
          endColumn: 60,
        },
      },
    ];

    expect(result).toStrictEqual(expected);
  });

  it('parse decimal number', () => {
    const message =
      'Attribute class Deprecated can be used with traits only on PHP 8.5 and later.';
    const result = parse(message);

    const expected = [
      {
        type: 'common_word',
        value: 'Attribute',
        location: {
          startColumn: 0,
          endColumn: 9,
        },
      },
      {
        type: 'common_word',
        value: 'class',
        location: {
          startColumn: 10,
          endColumn: 15,
        },
      },
      {
        type: 'common_word',
        value: 'Deprecated',
        location: {
          startColumn: 16,
          endColumn: 26,
        },
      },
      {
        type: 'common_word',
        value: 'can',
        location: {
          startColumn: 27,
          endColumn: 30,
        },
      },
      {
        type: 'common_word',
        value: 'be',
        location: {
          startColumn: 31,
          endColumn: 33,
        },
      },
      {
        type: 'common_word',
        value: 'used',
        location: {
          startColumn: 34,
          endColumn: 38,
        },
      },
      {
        type: 'common_word',
        value: 'with',
        location: {
          startColumn: 39,
          endColumn: 43,
        },
      },
      {
        type: 'common_word',
        value: 'traits',
        location: {
          startColumn: 44,
          endColumn: 50,
        },
      },
      {
        type: 'common_word',
        value: 'only',
        location: {
          startColumn: 51,
          endColumn: 55,
        },
      },
      {
        type: 'common_word',
        value: 'on',
        location: {
          startColumn: 56,
          endColumn: 58,
        },
      },
      {
        type: 'common_word',
        value: 'PHP',
        location: {
          startColumn: 59,
          endColumn: 62,
        },
      },
      {
        type: 'number',
        value: '8.5',
        location: {
          startColumn: 63,
          endColumn: 66,
        },
      },
      {
        type: 'common_word',
        value: 'and',
        location: {
          startColumn: 67,
          endColumn: 70,
        },
      },
      {
        type: 'common_word',
        value: 'later',
        location: {
          startColumn: 71,
          endColumn: 76,
        },
      },
      {
        type: 'period',
        value: '.',
        location: {
          startColumn: 76,
          endColumn: 77,
        },
      },
    ];

    expect(result).toStrictEqual(expected);
  });

  it('parse parentheses with type annotation', () => {
    const message =
      'Parameter #1 (stdClass) of echo cannot be converted to string.';
    const result = parse(message);

    const expected = [
      {
        type: 'common_word',
        value: 'Parameter',
        location: {
          startColumn: 0,
          endColumn: 9,
        },
      },
      {
        type: 'parameter_number',
        value: '#1',
        location: {
          startColumn: 10,
          endColumn: 12,
        },
      },
      {
        type: 'lparen',
        value: '(',
        location: {
          startColumn: 13,
          endColumn: 14,
        },
      },
      {
        type: 'common_word',
        value: 'stdClass',
        location: {
          startColumn: 14,
          endColumn: 22,
        },
      },
      {
        type: 'rparen',
        value: ')',
        location: {
          startColumn: 22,
          endColumn: 23,
        },
      },
      {
        type: 'common_word',
        value: 'of',
        location: {
          startColumn: 24,
          endColumn: 26,
        },
      },
      {
        type: 'common_word',
        value: 'echo',
        location: {
          startColumn: 27,
          endColumn: 31,
        },
      },
      {
        type: 'common_word',
        value: 'cannot',
        location: {
          startColumn: 32,
          endColumn: 38,
        },
      },
      {
        type: 'common_word',
        value: 'be',
        location: {
          startColumn: 39,
          endColumn: 41,
        },
      },
      {
        type: 'common_word',
        value: 'converted',
        location: {
          startColumn: 42,
          endColumn: 51,
        },
      },
      {
        type: 'common_word',
        value: 'to',
        location: {
          startColumn: 52,
          endColumn: 54,
        },
      },
      {
        type: 'common_word',
        value: 'string',
        location: {
          startColumn: 55,
          endColumn: 61,
        },
      },
      {
        type: 'period',
        value: '.',
        location: {
          startColumn: 61,
          endColumn: 62,
        },
      },
    ];

    expect(result).toStrictEqual(expected);
  });

  it('parse colon', () => {
    const message =
      'Parameter Closure(): void of print cannot be converted to string.';
    const result = parse(message);

    const expected = [
      {
        type: 'common_word',
        value: 'Parameter',
        location: { startColumn: 0, endColumn: 9 },
      },
      {
        type: 'common_word',
        value: 'Closure',
        location: { startColumn: 10, endColumn: 17 },
      },
      {
        type: 'lparen',
        value: '(',
        location: { startColumn: 17, endColumn: 18 },
      },
      {
        type: 'rparen',
        value: ')',
        location: { startColumn: 18, endColumn: 19 },
      },
      {
        type: 'colon',
        value: ':',
        location: { startColumn: 19, endColumn: 20 },
      },
      {
        type: 'common_word',
        value: 'void',
        location: { startColumn: 21, endColumn: 25 },
      },
      {
        type: 'common_word',
        value: 'of',
        location: { startColumn: 26, endColumn: 28 },
      },
      {
        type: 'common_word',
        value: 'print',
        location: { startColumn: 29, endColumn: 34 },
      },
      {
        type: 'common_word',
        value: 'cannot',
        location: { startColumn: 35, endColumn: 41 },
      },
      {
        type: 'common_word',
        value: 'be',
        location: { startColumn: 42, endColumn: 44 },
      },
      {
        type: 'common_word',
        value: 'converted',
        location: { startColumn: 45, endColumn: 54 },
      },
      {
        type: 'common_word',
        value: 'to',
        location: { startColumn: 55, endColumn: 57 },
      },
      {
        type: 'common_word',
        value: 'string',
        location: { startColumn: 58, endColumn: 64 },
      },
      {
        type: 'period',
        value: '.',
        location: { startColumn: 64, endColumn: 65 },
      },
    ];

    expect(result).toStrictEqual(expected);
  });

  it('parse quoted strings in array shape', () => {
    const message = "Offset 'a' does not exist on array{b: 1}.";
    const result = parse(message);

    const expected = [
      {
        type: 'common_word',
        value: 'Offset',
        location: { startColumn: 0, endColumn: 6 },
      },
      {
        type: 'single_quoted_string',
        value: "'a'",
        location: { startColumn: 7, endColumn: 10 },
      },
      {
        type: 'common_word',
        value: 'does',
        location: { startColumn: 11, endColumn: 15 },
      },
      {
        type: 'common_word',
        value: 'not',
        location: { startColumn: 16, endColumn: 19 },
      },
      {
        type: 'common_word',
        value: 'exist',
        location: { startColumn: 20, endColumn: 25 },
      },
      {
        type: 'common_word',
        value: 'on',
        location: { startColumn: 26, endColumn: 28 },
      },
      {
        type: 'common_word',
        value: 'array',
        location: { startColumn: 29, endColumn: 34 },
      },
      {
        type: 'lbrace',
        value: '{',
        location: { startColumn: 34, endColumn: 35 },
      },
      {
        type: 'common_word',
        value: 'b',
        location: { startColumn: 35, endColumn: 36 },
      },
      {
        type: 'colon',
        value: ':',
        location: { startColumn: 36, endColumn: 37 },
      },
      {
        type: 'number',
        value: '1',
        location: { startColumn: 38, endColumn: 39 },
      },
      {
        type: 'rbrace',
        value: '}',
        location: { startColumn: 39, endColumn: 40 },
      },
      {
        type: 'period',
        value: '.',
        location: { startColumn: 40, endColumn: 41 },
      },
    ];

    expect(result).toStrictEqual(expected);
  });

  it('parse type delimiters in generic type', () => {
    const message = 'Parameter expects array<int, string>.';
    const result = parse(message);

    const expected = [
      {
        type: 'common_word',
        value: 'Parameter',
        location: { startColumn: 0, endColumn: 9 },
      },
      {
        type: 'common_word',
        value: 'expects',
        location: { startColumn: 10, endColumn: 17 },
      },
      {
        type: 'common_word',
        value: 'array',
        location: { startColumn: 18, endColumn: 23 },
      },
      {
        type: 'langle',
        value: '<',
        location: { startColumn: 23, endColumn: 24 },
      },
      {
        type: 'common_word',
        value: 'int',
        location: { startColumn: 24, endColumn: 27 },
      },
      {
        type: 'comma',
        value: ',',
        location: { startColumn: 27, endColumn: 28 },
      },
      {
        type: 'common_word',
        value: 'string',
        location: { startColumn: 29, endColumn: 35 },
      },
      {
        type: 'rangle',
        value: '>',
        location: { startColumn: 35, endColumn: 36 },
      },
      {
        type: 'period',
        value: '.',
        location: { startColumn: 36, endColumn: 37 },
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
