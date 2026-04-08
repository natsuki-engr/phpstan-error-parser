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
    {
      name: 'parse parameter number',
      m: 'Parameter #1 $bar of method Test\\ClassWithNullableProperty::doBar() is passed by reference, so it expects variables only.',
      assertions: [
        ['ParameterNumber:#1', true],
        ['Variable:$bar', true],
      ],
    },
    {
      name: 'parse number',
      m: 'Method Test\\Foo::foo() invoked with 1 parameter, 0 required.',
      assertions: [
        ['Number:1', true],
        ['Number:0', true],
      ],
    },
    {
      name: 'parse negative number',
      m: 'Parameter #1 $min (0) of function random_int expects lower number than parameter #2 $max (-1).',
      assertions: [
        ['Number:0', true],
        ['Number:-1', true],
      ],
    },
    {
      name: 'parse decimal number',
      m: 'Attribute class Deprecated can be used with traits only on PHP 8.5 and later.',
      assertions: [['Number:8.5', true]],
    },
    {
      name: 'parse parentheses',
      m: 'Parameter #1 (stdClass) of echo cannot be converted to string.',
      assertions: [
        ['lparen:(', true],
        ['rparen:)', true],
        ['CommonWord:stdClass', true],
      ],
    },
    {
      name: 'parentheses with type annotation are not structured - content is flat tokens',
      m: 'Parameter #1 $min (0) of function random_int expects lower number than parameter #2 $max (-1).',
      assertions: [
        ['lparen:(', true],
        ['rparen:)', true],
        ['Variable:$min', true],
        ['Number:0', true],
        ['Number:-1', true],
        // type annotation inside parentheses is not grouped as a single structured node
        ['ParameterNumber:#1', true],
      ],
    },
    {
      name: 'parentheses with complex type are not deeply parsed',
      m: 'Parameter #1 (Closure(): void) of echo cannot be converted to string.',
      assertions: [
        ['lparen:(', true],
        ['rparen:)', true],
        // Closure(): void is split into flat tokens, not parsed as a callable type
        ['CommonWord:Closure', true],
        ['colon::', true],
        ['CommonWord:void', true],
      ],
    },
    {
      name: 'parse colon in array shape',
      m: 'Offset does not exist on array{key: string}.',
      assertions: [
        ['colon::', true],
        ['CommonWord:key', true],
        ['CommonWord:string', true],
      ],
    },
    {
      name: 'colon does not match double colon in static method',
      m: 'Call to static method PHPStan\\Tests\\AssertionClass::assertInt() with int will always evaluate to true.',
      assertions: [
        ['StaticMethodName:PHPStan\\Tests\\AssertionClass::assertInt()', true],
        // :: is consumed by StaticMethodName, not as two colons
        ['colon::', false],
      ],
    },
    {
      name: 'parse single quoted string',
      m: "Array has 2 duplicate keys with value 'bar' ($key, 'bar').",
      assertions: [
        ["SingleQuotedString:'bar'", true],
        // 'bar' is captured as a single token, not split into CommonWord
        ['CommonWord:bar', false],
      ],
    },
    {
      name: 'parse double quoted string',
      m: 'Result of || is always the same as the left operand, because the right operand "+" is always truthy.',
      assertions: [['DoubleQuotedString:"+"', true]],
    },
    {
      name: 'parse generic type delimiters',
      m: 'Method should return array<int, string>.',
      assertions: [
        ['langle:<', true],
        ['rangle:>', true],
      ],
    },
    {
      name: 'parse array shape delimiters',
      m: 'Offset does not exist on array{key: string}.',
      assertions: [
        ['lbrace:{', true],
        ['rbrace:}', true],
      ],
    },
    {
      name: 'parse array type brackets',
      m: 'Parameter expects int[], string given.',
      assertions: [
        ['lbracket:[', true],
        ['rbracket:]', true],
      ],
    },
    {
      name: 'parse union and intersection type operators',
      m: 'Parameter expects int|string|null.',
      assertions: [['pipe:|', true]],
    },
    {
      name: 'parse intersection type',
      m: 'Call to method on ArrayAccess&Foo.',
      assertions: [['ampersand:&', true]],
    },
    {
      name: 'parse question mark for nullable',
      m: 'Offset exists on array{foo?: string}.',
      assertions: [['question:?', true]],
    },
    {
      name: 'parse ellipsis in variadic parameter',
      m: 'Parameter #1 ...$arg1 of function max expects non-empty-array, array{} given.',
      assertions: [['ellipsis:...', true]],
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
