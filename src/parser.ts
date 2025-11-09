import { createToken, CstParser, Lexer } from "chevrotain";

const tokens = {
  FUNCTION_NAME: createToken({ name: "FunctionName", pattern: /(?<!(A|a)nonymous function )(?<=(F|f)unction )[a-zA-Z0-9_]+(\\[a-zA-Z0-9_]+)*/ }),
  METHOD_NAME: createToken({ name: "MethodName", pattern: /(?<=(M|m)ethod )[a-zA-Z0-9_]+(\\[a-zA-Z0-9_]+)*/ }),
  COMMON_WORD: createToken({ name: "CommonWord", pattern: /[a-zA-Z]+/ }),
  SPACE: createToken({ name: "space", pattern: /\s+/, group: Lexer.SKIPPED }),
  PERIOD: createToken({ name: "period", pattern: "." }),
  DOC_TAG: createToken({ name: "DocTag", pattern: /@[\w](-\w)*/ }),
  TYPE_NAME: createToken({ name: "TypeName", pattern: /[A-Z][a-zA-Z0-9_]*/ }),
  METHOD: createToken({ name: "MethodName", pattern: /[a-zA-Z0-9_]*\(\)/ }),
  VARIABLE: createToken({ name: "Variable", pattern: /\$[a-z][a-zA-Z0-9_]*/ }),
};

export const lexer = new Lexer(Object.values(tokens));

export class Parser extends CstParser {
  constructor() {
    super(tokens, { recoveryEnabled: true });
    this.performSelfAnalysis();
  }

  public word = this.RULE("word", () => {
    this.OR([
      { ALT: () => this.CONSUME(tokens.COMMON_WORD) },
      { ALT: () => this.CONSUME(tokens.DOC_TAG) },
      { ALT: () => this.CONSUME(tokens.TYPE_NAME) },
      { ALT: () => this.CONSUME(tokens.METHOD) },
      { ALT: () => this.CONSUME(tokens.VARIABLE) },
    ]);
  });

  public sentence = this.RULE("sentence", () => {
    this.AT_LEAST_ONE(() => {
        this.OR([
          { ALT: () => this.CONSUME(tokens.FUNCTION_NAME) },
          { ALT: () => this.CONSUME(tokens.METHOD_NAME) },
          { ALT: () => this.SUBRULE(this.word) },
        ])
      });
    this.CONSUME(tokens.PERIOD)
  });

  public errorMessage = this.RULE("errorMessage", () => {
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.sentence);
    });
  });
}
