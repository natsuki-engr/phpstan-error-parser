import { describe, expect, it } from "vitest";
import { lexer, Parser } from "../src/parser.ts";

describe("sample test", () => {
  it("parse common sentence", () => {
    const parser = new Parser();
    const message = "There is no error.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cst).matchSnapshot();
  });

  it("parse function not found error", async () => {
    const parser = new Parser();
    const message = "Function format not found.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cst).matchSnapshot();
  });
  
  it("parse function error target", async () => {
    const parser = new Parser();
    const message = "Function format not found.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();

    expect(cst).matchSnapshot();
  })
  
  it("parse function with namespace error target", async () => {
    const parser = new Parser();
    const message = "Function abc\\format not found.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();
    
    expect(cst).matchSnapshot();
  });
  
  it("parse method error target", async () => {
    const parser = new Parser();
    const message = "Anonymous function has invalid return type TestClosureFunctionTypehintsPhp71\NonexistentClass.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();
    
    expect(cst).matchSnapshot();
  });
  
  it("parse method with namespace error target", async () => {
    const parser = new Parser();
    const message = "Parameter $a of anonymous function has unresolvable native type.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();
    
    expect(cst).matchSnapshot();
  })

  it("parse doc tag", async () => {
    const parser = new Parser();
    const message = "PHPDoc tag @mixin contains unresolvable type.";
    const lexingResult = lexer.tokenize(message);
    parser.input = lexingResult.tokens;
    const cst = parser.errorMessage();
    
    expect(cst).matchSnapshot();
  });
});
