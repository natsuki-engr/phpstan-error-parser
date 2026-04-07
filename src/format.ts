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

  let words: Word[] = [];
  const commonWords = sentenceNode?.children?.CommonWord;
  const functionNames = sentenceNode?.children?.FunctionName;
  const methodNames = [
    ...(sentenceNode?.children?.MethodName ?? []),
    ...(sentenceNode?.children?.StaticMethodName ?? []),
  ];
  const docTags = sentenceNode?.children?.DocTag;
  const variables = sentenceNode?.children?.Variable;
  const parameterNumbers = sentenceNode?.children?.ParameterNumber;
  const numbers = sentenceNode?.children?.Number;
  const comma = sentenceNode?.children?.comma;
  const singleQuotedStrings = sentenceNode?.children?.SingleQuotedString;
  const doubleQuotedStrings = sentenceNode?.children?.DoubleQuotedString;
  const nodeLists = [
    { tokenType: 'single_quoted_string', nodes: singleQuotedStrings },
    { tokenType: 'double_quoted_string', nodes: doubleQuotedStrings },
    { tokenType: 'function_name', nodes: functionNames },
    { tokenType: 'method_name', nodes: methodNames },
    { tokenType: 'variable_name', nodes: variables },
    { tokenType: 'parameter_number', nodes: parameterNumbers },
    { tokenType: 'number', nodes: numbers },
    { tokenType: 'common_word', nodes: commonWords },
    { tokenType: 'doc_tag', nodes: docTags },
    { tokenType: 'comma', nodes: comma },
    { tokenType: 'lparen', nodes: sentenceNode?.children?.lparen },
    { tokenType: 'rparen', nodes: sentenceNode?.children?.rparen },
    { tokenType: 'colon', nodes: sentenceNode?.children?.colon },
    { tokenType: 'period', nodes: sentenceNode?.children?.period },
  ] as const;

  nodeLists.forEach(({ tokenType, nodes }) => {
    for (const word of nodes ?? []) {
      if (word === undefined || !isIToken(word)) continue;

      const startColumn = word.startOffset;
      const endColumn = startColumn + word.image.length;
      words.push({
        type: tokenType,
        value: word.image,
        location: {
          startColumn: startColumn,
          endColumn: endColumn,
        },
      });
    }
  });

  words = words.sort((a, b) => {
    return a.location.startColumn - b.location.startColumn;
  });

  return words;
}

function isIToken(element: CstElement): element is IToken {
  return 'image' in element;
}
