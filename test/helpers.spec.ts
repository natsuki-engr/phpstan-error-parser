import { describe, expect, it } from "vitest";
import { lexer, Parser } from "../src/parser.ts";
import { cstHas } from "./helpers.ts";

describe("cstHas function", () => {
  const parser = new Parser();

  it("should find token", () => {
    const message = "Function format not found.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "CommonWord:Function")).toBe(true);
    expect(cstHas(cst, "FunctionName:format")).toBe(true);
    expect(cstHas(cst, "CommonWord:not")).toBe(true);
    expect(cstHas(cst, "CommonWord:found")).toBe(true);
    expect(cstHas(cst, "period:.")).toBe(true);

    expect(cstHas(cst, "MethodName:format")).toBe(false);
  });

  it("should work with method names", () => {
    const message = "Method assert() not found.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "MethodName:assert()")).toBe(true);

    expect(cstHas(cst, "FunctionName:format")).toBe(false);
  });

  it("should work with variables", () => {
    const message =
      "Parameter $a of anonymous function has unresolvable native type.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "Variable:$a")).toBe(true);

    expect(cstHas(cst, "Variable:$b")).toBe(false);
  });

  it("should work with doc tags", () => {
    const message = "PHPDoc tag @mixin contains unresolvable type.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "DocTag:@mixin")).toBe(true);

    expect(cstHas(cst, "DocTag:@return")).toBe(false);
  });

  it("should work with function names containing namespace", () => {
    const message = "Function abc\\format not found.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "FunctionName:abc\\format")).toBe(true);

    expect(cstHas(cst, "FunctionName:format")).toBe(false);
  });

  it("should work with comma", () => {
    const message = "A is B, C is D.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "comma:,")).toBe(true);
  });

  it("should return false for empty or invalid queries", () => {
    const message = "Function format not found.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cstHas(cst, "")).toBe(false);
    expect(cstHas(cst, ":")).toBe(false);
    expect(cstHas(cst, "NonExistentType:none")).toBe(false);
  });
});
