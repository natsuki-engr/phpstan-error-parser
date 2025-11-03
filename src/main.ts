import { createToken, CstParser, Lexer } from "chevrotain";

const tokens = {
  COMMON_WORD: createToken({ name: "CommonWord", pattern: /[a-zA-Z]+/ }),
  SPACE: createToken({ name: "space", pattern: /\s+/ }),
  COMMA: createToken({ name: "comma", pattern: "." }),
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
    this.MANY_SEP({
      SEP: tokens.SPACE,
      DEF: () => {
        this.SUBRULE(this.word);
      },
    });
  });

  public errorMessage = this.RULE("errorMessage", () => {
    this.MANY_SEP({
      SEP: tokens.COMMA,
      DEF: () => {
        this.SUBRULE(this.sentence);
      },
    });
  });
}
