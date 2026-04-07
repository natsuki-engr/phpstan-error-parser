import type { CstElement, CstNode, IToken } from 'chevrotain';

export type Word = {
  type:
    | 'type'
    | 'single_quoted_string'
    | 'double_quoted_string'
    | 'function_name'
    | 'method_name'
    | 'variable_name'
    | 'doc_tag'
    | 'parameter_number'
    | 'number'
    | 'common_word'
    | 'comma'
    | 'lparen'
    | 'rparen'
    | 'colon'
    | 'langle'
    | 'rangle'
    | 'lbrace'
    | 'rbrace'
    | 'lbracket'
    | 'rbracket'
    | 'pipe'
    | 'ampersand'
    | 'static_property'
    | 'static_constant'
    | 'namespaced_name'
    | 'question'
    | 'ellipsis'
    | 'period';
  value: string;
  location: {
    startColumn: number;
    endColumn: number;
  };
};

export function format(errorMessageCst: CstNode): Word[] {
  const sentenceNode = errorMessageCst?.children?.sentence?.at(0);
  if (sentenceNode === undefined || isIToken(sentenceNode)) return [];

  const words: Word[] = [];
  collectWords(sentenceNode, words);

  words.sort((a, b) => a.location.startColumn - b.location.startColumn);
  return words;
}

function collectWords(node: CstNode, words: Word[]): void {
  // Handle typeExpression nodes - collect all tokens into a single 'type' word
  if (node.name === 'typeExpression') {
    const allTokens = collectAllTokens(node);
    const first = allTokens[0];
    const last = allTokens[allTokens.length - 1];
    if (first && last) {
      words.push({
        type: 'type',
        value: reconstructText(allTokens),
        location: {
          startColumn: first.startOffset,
          endColumn: last.startOffset + last.image.length,
        },
      });
    }
    return;
  }

  const children = node.children;
  for (const key of Object.keys(children)) {
    const elements = children[key];
    if (!elements) continue;
    for (const element of elements) {
      if (isIToken(element)) {
        const tokenType = getTokenType(element.tokenType?.name ?? key);
        if (tokenType) {
          words.push({
            type: tokenType,
            value: element.image,
            location: {
              startColumn: element.startOffset,
              endColumn: element.startOffset + element.image.length,
            },
          });
        }
      } else {
        collectWords(element, words);
      }
    }
  }
}

function collectAllTokens(node: CstNode): IToken[] {
  const tokens: IToken[] = [];
  const children = node.children;
  for (const key of Object.keys(children)) {
    const elements = children[key];
    if (!elements) continue;
    for (const element of elements) {
      if (isIToken(element)) {
        tokens.push(element);
      } else {
        tokens.push(...collectAllTokens(element));
      }
    }
  }
  tokens.sort((a, b) => a.startOffset - b.startOffset);
  return tokens;
}

function reconstructText(tokens: IToken[]): string {
  const first = tokens[0];
  if (!first) return '';
  let result = first.image;
  for (let i = 1; i < tokens.length; i++) {
    const current = tokens[i];
    const prev = tokens[i - 1];
    if (!current || !prev) continue;
    const gap = current.startOffset - (prev.startOffset + prev.image.length);
    if (gap > 0) {
      result += ' '.repeat(gap);
    }
    result += current.image;
  }
  return result;
}

const tokenTypeMap: Record<string, Word['type']> = {
  SingleQuotedString: 'single_quoted_string',
  DoubleQuotedString: 'double_quoted_string',
  FunctionName: 'function_name',
  MethodName: 'method_name',
  StaticMethodName: 'method_name',
  Variable: 'variable_name',
  DocTag: 'doc_tag',
  ParameterNumber: 'parameter_number',
  Number: 'number',
  CommonWord: 'common_word',
  comma: 'comma',
  lparen: 'lparen',
  rparen: 'rparen',
  colon: 'colon',
  langle: 'langle',
  rangle: 'rangle',
  lbrace: 'lbrace',
  rbrace: 'rbrace',
  lbracket: 'lbracket',
  rbracket: 'rbracket',
  pipe: 'pipe',
  ampersand: 'ampersand',
  StaticProperty: 'static_property',
  StaticConstant: 'static_constant',
  NamespacedName: 'namespaced_name',
  question: 'question',
  ellipsis: 'ellipsis',
  period: 'period',
};

function getTokenType(name: string): Word['type'] | null {
  return tokenTypeMap[name] ?? null;
}

function isIToken(element: CstElement): element is IToken {
  return 'image' in element;
}
