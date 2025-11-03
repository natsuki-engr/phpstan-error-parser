import { describe, expect, it } from "vitest";
import { lexer, Parser } from "../src/main.ts";

describe("sample test", () => {
  it("parse common sentence", () => {
    const parser = new Parser();
    const message = "There is no error.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cst).matchSnapshot();
  });
});
