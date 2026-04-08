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
  // Handle typeExpression - collapse into a single 'type' word
  if (node.name === 'typeExpression') {
    const span = getTokenSpan(node);
    if (span) {
      words.push({
        type: 'type',
        value: span.text,
        location: { startColumn: span.start, endColumn: span.end },
      });
    }
    return;
  }

  // Handle wordOrType - if it has type syntax children, treat as 'type';
  // otherwise just a 'common_word'
  if (node.name === 'wordOrType') {
    const childKeys = Object.keys(node.children);
    const hasTypeSyntax = childKeys.some(
      (k) =>
        k === 'langle' ||
        k === 'lbrace' ||
        k === 'lparen' ||
        k === 'lbracket' ||
        k === 'pipe' ||
        k === 'ampersand' ||
        k === 'typeExpression' ||
        k === 'typeList' ||
        k === 'shapeMembers',
    );
    if (hasTypeSyntax) {
      const span = getTokenSpan(node);
      if (span) {
        words.push({
          type: 'type',
          value: span.text,
          location: { startColumn: span.start, endColumn: span.end },
        });
      }
    } else {
      // Plain CommonWord
      const wordTokens = node.children.CommonWord;
      if (wordTokens) {
        for (const token of wordTokens) {
          if (isIToken(token)) {
            words.push({
              type: 'common_word',
              value: token.image,
              location: {
                startColumn: token.startOffset,
                endColumn: token.startOffset + token.image.length,
              },
            });
          }
        }
      }
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

interface TokenSpan {
  start: number;
  end: number;
  text: string;
}

/**
 * Traverse a CST node to find the min start offset, max end offset,
 * and reconstruct text by collecting tokens in offset order.
 */
function getTokenSpan(node: CstNode): TokenSpan | null {
  const tokens: IToken[] = [];
  flattenTokens(node, tokens);
  if (tokens.length === 0) return null;

  tokens.sort((a, b) => a.startOffset - b.startOffset);

  const first = tokens[0];
  const lastToken = tokens[tokens.length - 1];
  if (!first || !lastToken) return null;

  const start = first.startOffset;
  const end = lastToken.startOffset + lastToken.image.length;

  let text = first.image;
  for (let i = 1; i < tokens.length; i++) {
    const current = tokens[i];
    const prev = tokens[i - 1];
    if (!current || !prev) continue;
    const gap = current.startOffset - (prev.startOffset + prev.image.length);
    if (gap > 0) text += ' '.repeat(gap);
    text += current.image;
  }

  return { start, end, text };
}

function flattenTokens(node: CstNode, out: IToken[]): void {
  for (const key of Object.keys(node.children)) {
    const elements = node.children[key];
    if (!elements) continue;
    for (const element of elements) {
      if (isIToken(element)) {
        out.push(element);
      } else {
        flattenTokens(element, out);
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
