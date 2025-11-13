import { lexer, Parser } from "./parser.js";
import { format, Word } from "./format.js";

export function parse(errorMessage: string): Word[] {
  const parser = new Parser();
  const lexingResult = lexer.tokenize(errorMessage);
  parser.input = lexingResult.tokens;
  const cst = parser.errorMessage();

  return format(cst);
}
