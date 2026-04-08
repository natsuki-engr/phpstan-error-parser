import { format, type Word } from './format.js';
import { lexer, Parser } from './parser.js';

const parser = new Parser();

export function parse(errorMessage: string): Word[] {
  const lexingResult = lexer.tokenize(errorMessage);
  parser.input = lexingResult.tokens;
  const cst = parser.errorMessage();

  return format(cst);
}
