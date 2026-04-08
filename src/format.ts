import type { CstElement, CstNode, IToken } from 'chevrotain';

export type Word = {
  type:
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
