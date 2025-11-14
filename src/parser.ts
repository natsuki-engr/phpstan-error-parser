import { createToken, CstParser, Lexer } from "chevrotain";

const tokens = {
  FUNCTION_NAME: createToken({ name: "FunctionName", pattern: /(?<!(A|a)nonymous function )(?<=(F|f)unction )[a-zA-Z0-9_]+(\\[a-zA-Z0-9_]+)*/, line_breaks: false }),
  METHOD_NAME: createToken({ name: "MethodName", pattern: /(?<!(T|t)he (M|m)ethod )(?<=(M|m)ethod )([a-zA-Z0-9_]+(\\[a-zA-Z0-9_]+)*(\(\))?)/, line_breaks: false }),
  COMMON_WORD: createToken({ name: "CommonWord", pattern: /[a-zA-Z]+/, line_breaks: false }),
  DOC_TAG: createToken({ name: "DocTag", pattern: /@\w+(-\w)*/, line_breaks: false }),
  SPACE: createToken({ name: "space", pattern: /\s+/, group: Lexer.SKIPPED, line_breaks: false }),
  PERIOD: createToken({ name: "period", pattern: ".", line_breaks: false }),
  COMMA: createToken({ name: "comma", pattern: ",", line_breaks: false }),
  VARIABLE: createToken({ name: "Variable", pattern: /\$[a-z][a-zA-Z0-9_]*/, line_breaks: false }),
};

export const lexer = new Lexer(Object.values(tokens), {positionTracking: "onlyOffset"});

export class Parser extends CstParser {
  constructor() {
    super(tokens, { recoveryEnabled: true });
    this.performSelfAnalysis();
  }

  public sentence = this.RULE("sentence", () => {
    this.AT_LEAST_ONE(() => {
      this.OR([
        { ALT: () => this.CONSUME(tokens.FUNCTION_NAME) },
        { ALT: () => this.CONSUME(tokens.METHOD_NAME) },
        { ALT: () => this.CONSUME(tokens.COMMON_WORD) },
        { ALT: () => this.CONSUME(tokens.DOC_TAG) },
        { ALT: () => this.CONSUME(tokens.VARIABLE) },
        { ALT: () => this.CONSUME(tokens.COMMA) },
      ]);
    });
    this.CONSUME(tokens.PERIOD);
  });

  public errorMessage = this.RULE("errorMessage", () => {
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.sentence);
    });
  });
}
