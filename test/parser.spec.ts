import { describe, expect, it } from "vitest";
import { lexer, Parser } from "../src/parser.ts";
import { cstHas } from "./helpers.ts";

describe("sample test", () => {
  it("parse common sentence", () => {
    const parser = new Parser();
    const message = "There is no error.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "CommonWord:There")).toBe(true);
    expect(cstHas(cst, "CommonWord:is")).toBe(true);
    expect(cstHas(cst, "CommonWord:no")).toBe(true);
    expect(cstHas(cst, "CommonWord:error")).toBe(true);
    expect(cstHas(cst, "period:.")).toBe(true);
  });

  it("parse function not found error", async () => {
    const parser = new Parser();
    const message = "Function format not found.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "FunctionName:format")).toBe(true);
  });

  it("parse function with namespace error target", async () => {
    const parser = new Parser();
    const message = "Function abc\\format not found.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "FunctionName:abc\\format")).toBe(true);
  });

  it("parse method with namespace error target", async () => {
    const parser = new Parser();
    const message =
      "Parameter $a of anonymous function has unresolvable native type.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "Variable:$a")).toBe(true);

    expect(cstHas(cst, "FunctionName:has")).toBe(false);
  });

  it("parse doc tag", async () => {
    const parser = new Parser();
    const message = "PHPDoc tag @mixin contains unresolvable type.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "DocTag:@mixin")).toBe(true);
  });

  it("parse method name", async () => {
    const parser = new Parser();
    const message = "Method assert() not found.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "MethodName:assert()")).toBe(true);
  });

  it("parse method name without parentheses", async () => {
    const parser = new Parser();
    const message = "Method assert not found.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "MethodName:assert")).toBe(true);
  });

  it("not parse as method name with 'the' prefix", async () => {
    const parser = new Parser();
    const message = "The method might change in a minor PHPStan version.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "CommonWord:The")).toBe(true);
    expect(cstHas(cst, "CommonWord:method")).toBe(true);
    expect(cstHas(cst, "CommonWord:might")).toBe(true);

    expect(cstHas(cst, "MethodName:might")).toBe(false);
  });

  it("parse comma", async () => {
    const parser = new Parser();
    const message = "A is B, C is D.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "comma:,")).toBe(true);
  });
});
