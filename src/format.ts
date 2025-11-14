import type { CstNode, CstElement, IToken } from "chevrotain";

export type Word = {
  type:
    | "function_name"
    | "method_name"
    | "variable_name"
    | "doc_tag"
    | "common_word"
    | "period";
  value: string;
  location: {
    startColumn: number;
    endColumn: number;
  };
};

export function format(errorMessageCst: CstNode): Word[] {
  const sentenceNode = errorMessageCst?.children?.sentence?.at(0);
  if (sentenceNode == undefined || isIToken(sentenceNode)) return [];

  let words: Word[] = [];
  const commonWords = sentenceNode?.children?.CommonWord;
  const functionNames = sentenceNode?.children?.FunctionName;
  const docTags = sentenceNode?.children?.DocTag;
  const nodeLists = [
    { tokenType: "function_name", nodes: functionNames },
    { tokenType: "common_word", nodes: commonWords },
    { tokenType: "doc_tag", nodes: docTags },
    { tokenType: "period", nodes: sentenceNode?.children?.period },
  ] as const;

  nodeLists.forEach(({ tokenType, nodes }) => {
    for (const word of nodes ?? []) {
      if (word == undefined || !isIToken(word)) return [];

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
  return "image" in element;
}
