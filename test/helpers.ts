import type { CstElement, CstNode, IToken } from 'chevrotain';

export function cstHas(cst: CstElement, query: string): boolean {
  if (!query.includes(':')) return false;

  const parts = query.split(':', 2);
  const tokenType = parts[0];
  const value = parts[1];

  return searchInCst(cst, tokenType, value);
}

function searchInCst(
  element: CstElement,
  tokenType: string,
  value: string,
): boolean {
  if (isIToken(element)) {
    const typeMatches = element.tokenType?.name === tokenType;
    const valueMatches = element.image === value;
    return typeMatches && valueMatches;
  } else {
    const node = element as CstNode;

    if (node.children) {
      for (const childArray of Object.values(node.children)) {
        for (const child of childArray) {
          if (searchInCst(child, tokenType, value)) {
            return true;
          }
        }
      }
    }

    return false;
  }
}

function isIToken(element: CstElement): element is IToken {
  return 'image' in element;
}
