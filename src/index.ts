import { lexer, Parser } from "./parser.js";
import { format, Word } from "./format.js";

export function parse(errorMessage: string): Word[] {
  const parser = new Parser();
  const message = "Function format not found.";
  const lexingResult = lexer.tokenize(message);
  parser.input = lexingResult.tokens;
  const cst = parser.errorMessage();

  return format(cst);
}
