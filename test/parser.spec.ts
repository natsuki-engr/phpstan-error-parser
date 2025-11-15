import { describe, expect, test } from 'vitest';
import { lexer, Parser } from '../src/parser.ts';
import { cstHas } from './helpers.ts';

type DataSet = {
  name: string;
  m: string;
  assertions: Array<[string, boolean]>;
};

describe('sample test', () => {
  const dataSet = [
    {
      name: 'parse common sentence',
      m: 'There is no error.',
      assertions: [
        ['CommonWord:There', true],
        ['CommonWord:is', true],
        ['CommonWord:no', true],
        ['CommonWord:error', true],
        ['period:.', true],
      ],
    },
    {
      name: 'parse function not found error',
      m: 'Function format not found.',
      assertions: [['FunctionName:format', true]],
    },
    {
      name: 'parse function with namespace error target',
      m: 'Function abc\\format not found.',
      assertions: [['FunctionName:abc\\format', true]],
    },
    {
      name: 'parse method with namespace error target',
      m: 'Parameter $a of anonymous function has unresolvable native type.',
      assertions: [
        ['Variable:$a', true],
        ['FunctionName:has', false],
      ],
    },
    {
      name: 'parse doc tag',
      m: 'PHPDoc tag @mixin contains unresolvable type.',
      assertions: [['DocTag:@mixin', true]],
    },
    {
      name: 'parse method name',
      m: 'Method assert() not found.',
      assertions: [['MethodName:assert()', true]],
    },
    {
      name: 'parse method name without parentheses',
      m: 'Method assert not found.',
      assertions: [['MethodName:assert', true]],
    },
    {
      name: "not parse as method name with 'the' prefix",
      m: 'The method might change in a minor PHPStan version.',
      assertions: [
        ['CommonWord:The', true],
        ['CommonWord:method', true],
        ['CommonWord:might', true],
        ['MethodName:might', false],
      ],
    },
    {
      name: 'parse comma',
      m: 'A is B, C is D.',
      assertions: [['comma:,', true]],
    },
    {
      name: 'parse static method name',
      m: 'private method CallPrivateMethodThroughStatic\\Foo::doBar().',
      assertions: [
        ['StaticMethodName:CallPrivateMethodThroughStatic\\Foo::doBar()', true],
        ['CommonWord:doBar', false],
      ],
    },
  ] satisfies DataSet[];

  test.each(dataSet)('$name', ({ m, assertions }) => {
    const parser = new Parser();
    const lexingResult = lexer.tokenize(m);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    assertions.forEach(([q, result]) => {
      expect(cstHas(cst, q)).toBe(result);
    });
  });
});
