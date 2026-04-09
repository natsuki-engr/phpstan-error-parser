import { CstParser, createToken, Lexer } from 'chevrotain';

const tokens = {
  SINGLE_QUOTED_STRING: createToken({
    name: 'SingleQuotedString',
    pattern: /'[^']*'/,
    line_breaks: false,
  }),
  DOUBLE_QUOTED_STRING: createToken({
    name: 'DoubleQuotedString',
    pattern: /"[^"]*"/,
    line_breaks: false,
  }),
  FUNCTION_NAME: createToken({
    name: 'FunctionName',
    pattern: /(?<!(A|a)nonymous function )(?<=(F|f)unction )[\w]+(\\[\w]+)*/,
  }),
  STATIC_METHOD_NAME: createToken({
    name: 'StaticMethodName',
    pattern: /[a-zA-Z]\w*(\\[a-zA-Z]\w*)*::\w+\(\)/,
    line_breaks: false,
  }),
  STATIC_PROPERTY: createToken({
    name: 'StaticProperty',
    pattern: /[a-zA-Z]\w*(\\[a-zA-Z]\w*)*::\$\w+/,
    line_breaks: false,
  }),
  STATIC_CONSTANT: createToken({
    name: 'StaticConstant',
    pattern: /[a-zA-Z]\w*(\\[a-zA-Z]\w*)*::[A-Z]\w*/,
    line_breaks: false,
  }),
  METHOD_NAME: createToken({
    name: 'MethodName',
    pattern: /(?<!(T|t)he (M|m)ethod )(?<=(M|m)ethod )([\w]+(\\[\w]+)*(\(\))?)/,
    line_breaks: false,
  }),
  NAMESPACED_NAME: createToken({
    name: 'NamespacedName',
    pattern: /[a-zA-Z]\w*(\\[a-zA-Z]\w*)+/,
    line_breaks: false,
  }),
  COMMON_WORD: createToken({
    name: 'CommonWord',
    pattern: /[a-zA-Z]+/,
    line_breaks: false,
  }),
  DOC_TAG: createToken({
    name: 'DocTag',
    pattern: /@\w+(-\w)*/,
    line_breaks: false,
  }),
  SPACE: createToken({
    name: 'space',
    pattern: /\s+/,
    group: Lexer.SKIPPED,
    line_breaks: false,
  }),
  ELLIPSIS: createToken({
    name: 'ellipsis',
    pattern: '...',
    line_breaks: false,
  }),
  PERIOD: createToken({ name: 'period', pattern: '.', line_breaks: false }),
  COMMA: createToken({ name: 'comma', pattern: ',', line_breaks: false }),
  LPAREN: createToken({ name: 'lparen', pattern: '(', line_breaks: false }),
  RPAREN: createToken({ name: 'rparen', pattern: ')', line_breaks: false }),
  COLON: createToken({
    name: 'colon',
    pattern: /(?<!:):(?!:)/,
    line_breaks: false,
  }),
  LANGLE: createToken({ name: 'langle', pattern: '<', line_breaks: false }),
  RANGLE: createToken({ name: 'rangle', pattern: '>', line_breaks: false }),
  LBRACE: createToken({ name: 'lbrace', pattern: '{', line_breaks: false }),
  RBRACE: createToken({ name: 'rbrace', pattern: '}', line_breaks: false }),
  LBRACKET: createToken({ name: 'lbracket', pattern: '[', line_breaks: false }),
  RBRACKET: createToken({ name: 'rbracket', pattern: ']', line_breaks: false }),
  PIPE: createToken({ name: 'pipe', pattern: '|', line_breaks: false }),
  AMPERSAND: createToken({
    name: 'ampersand',
    pattern: '&',
    line_breaks: false,
  }),
  QUESTION: createToken({ name: 'question', pattern: '?', line_breaks: false }),
  VARIABLE: createToken({
    name: 'Variable',
    pattern: /\$[a-z][\w]*/,
    line_breaks: false,
  }),
  PARAMETER_NUMBER: createToken({
    name: 'ParameterNumber',
    pattern: /#\d+/,
    line_breaks: false,
  }),
  NUMBER: createToken({
    name: 'Number',
    pattern: /-?\d+(\.\d+)?/,
    line_breaks: false,
  }),
};

export const lexer = new Lexer(Object.values(tokens), {
  positionTracking: 'onlyOffset',
});

export class Parser extends CstParser {
  constructor() {
    super(tokens, { recoveryEnabled: true });
    this.performSelfAnalysis();
  }

  // typeExpression: intersectionType (| intersectionType)*
  public typeExpression = this.RULE('typeExpression', () => {
    this.SUBRULE(this.intersectionType);
    this.MANY(() => {
      this.CONSUME(tokens.PIPE);
      this.SUBRULE2(this.intersectionType);
    });
  });

  // intersectionType: postfixType (& postfixType)*
  public intersectionType = this.RULE('intersectionType', () => {
    this.SUBRULE(this.postfixType);
    this.MANY(() => {
      this.CONSUME(tokens.AMPERSAND);
      this.SUBRULE2(this.postfixType);
    });
  });

  // postfixType: primaryType ([])*
  public postfixType = this.RULE('postfixType', () => {
    this.SUBRULE(this.primaryType);
    this.MANY(() => {
      this.CONSUME(tokens.LBRACKET);
      this.CONSUME(tokens.RBRACKET);
    });
  });

  // primaryType: base type forms
  public primaryType = this.RULE('primaryType', () => {
    this.OR([
      // Parenthesized type
      {
        ALT: () => {
          this.CONSUME(tokens.LPAREN);
          this.SUBRULE(this.typeExpression);
          this.CONSUME(tokens.RPAREN);
        },
      },
      // Named type with optional generics, shapes, or callable signature
      {
        ALT: () => {
          this.OPTION(() => {
            this.CONSUME(tokens.QUESTION);
          });
          this.CONSUME(tokens.COMMON_WORD);
          this.OPTION2(() => {
            this.OR2([
              // Generic: name<typeList>
              {
                ALT: () => {
                  this.CONSUME(tokens.LANGLE);
                  this.SUBRULE(this.typeList);
                  this.CONSUME(tokens.RANGLE);
                },
              },
              // Shape: name{ shapeMembers? }
              {
                ALT: () => {
                  this.CONSUME(tokens.LBRACE);
                  this.OPTION3(() => {
                    this.SUBRULE(this.shapeMembers);
                  });
                  this.CONSUME(tokens.RBRACE);
                },
              },
              // Callable: name(typeList?): returnType
              {
                ALT: () => {
                  this.CONSUME2(tokens.LPAREN);
                  this.OPTION4(() => {
                    this.SUBRULE2(this.typeList);
                  });
                  this.CONSUME2(tokens.RPAREN);
                  this.CONSUME(tokens.COLON);
                  this.SUBRULE3(this.typeExpression);
                },
              },
            ]);
          });
        },
      },
      // String literal type
      { ALT: () => this.CONSUME(tokens.SINGLE_QUOTED_STRING) },
      // Number literal type
      { ALT: () => this.CONSUME(tokens.NUMBER) },
    ]);
  });

  // typeList: typeExpression (, typeExpression)*
  public typeList = this.RULE('typeList', () => {
    this.SUBRULE(this.typeExpression);
    this.MANY(() => {
      this.CONSUME(tokens.COMMA);
      this.SUBRULE2(this.typeExpression);
    });
  });

  // shapeMembers: (shapeMember | ...) (, (shapeMember | ...))*
  public shapeMembers = this.RULE('shapeMembers', () => {
    this.OR([
      { ALT: () => this.CONSUME(tokens.ELLIPSIS) },
      { ALT: () => this.SUBRULE(this.shapeMember) },
    ]);
    this.MANY(() => {
      this.CONSUME(tokens.COMMA);
      this.OR2([
        { ALT: () => this.CONSUME2(tokens.ELLIPSIS) },
        { ALT: () => this.SUBRULE2(this.shapeMember) },
      ]);
    });
  });

  // shapeMember: typeExpression (??: typeExpression)?
  public shapeMember = this.RULE('shapeMember', () => {
    this.SUBRULE(this.typeExpression);
    this.OPTION(() => {
      this.OPTION2(() => {
        this.CONSUME(tokens.QUESTION);
      });
      this.CONSUME(tokens.COLON);
      this.SUBRULE2(this.typeExpression);
    });
  });

  /**
   * wordOrType: consumes a CommonWord, then checks if type syntax follows.
   * If so, wraps it as a typeExpression. Otherwise, stays as CommonWord.
   * This avoids GATE overhead on every token.
   */
  public wordOrType = this.RULE('wordOrType', () => {
    const word = this.CONSUME(tokens.COMMON_WORD);
    this.OPTION(() => {
      this.OR([
        {
          ALT: () => {
            this.CONSUME(tokens.LANGLE);
            this.SUBRULE(this.typeList);
            this.CONSUME(tokens.RANGLE);
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.LBRACE);
            this.OPTION2(() => {
              this.SUBRULE(this.shapeMembers);
            });
            this.CONSUME(tokens.RBRACE);
          },
        },
        {
          // Callable: name(typeList?): returnType
          // Only match if ( immediately follows the word (no space)
          GATE: () => {
            const next = this.LA(1);
            return next.startOffset === word.startOffset + word.image.length;
          },
          ALT: () => {
            this.CONSUME(tokens.LPAREN);
            this.OPTION3(() => {
              this.SUBRULE2(this.typeList);
            });
            this.CONSUME(tokens.RPAREN);
            this.CONSUME(tokens.COLON);
            this.SUBRULE(this.typeExpression);
          },
        },
        { ALT: () => this.CONSUME(tokens.LBRACKET) },
        {
          ALT: () => {
            this.CONSUME(tokens.PIPE);
            this.SUBRULE3(this.typeExpression);
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.AMPERSAND);
            this.SUBRULE4(this.typeExpression);
          },
        },
      ]);
    });
  });

  public sentence = this.RULE('sentence', () => {
    this.AT_LEAST_ONE(() => {
      this.OR([
        { ALT: () => this.CONSUME(tokens.SINGLE_QUOTED_STRING) },
        { ALT: () => this.CONSUME(tokens.DOUBLE_QUOTED_STRING) },
        { ALT: () => this.CONSUME(tokens.FUNCTION_NAME) },
        { ALT: () => this.CONSUME(tokens.STATIC_METHOD_NAME) },
        { ALT: () => this.CONSUME(tokens.STATIC_PROPERTY) },
        { ALT: () => this.CONSUME(tokens.STATIC_CONSTANT) },
        { ALT: () => this.CONSUME(tokens.METHOD_NAME) },
        { ALT: () => this.CONSUME(tokens.NAMESPACED_NAME) },
        { ALT: () => this.SUBRULE(this.wordOrType) },
        { ALT: () => this.CONSUME(tokens.DOC_TAG) },
        { ALT: () => this.CONSUME(tokens.VARIABLE) },
        { ALT: () => this.CONSUME(tokens.PARAMETER_NUMBER) },
        { ALT: () => this.CONSUME(tokens.NUMBER) },
        { ALT: () => this.CONSUME(tokens.COMMA) },
        { ALT: () => this.CONSUME(tokens.LPAREN) },
        { ALT: () => this.CONSUME(tokens.RPAREN) },
        { ALT: () => this.CONSUME(tokens.COLON) },
        { ALT: () => this.CONSUME(tokens.LANGLE) },
        { ALT: () => this.CONSUME(tokens.RANGLE) },
        { ALT: () => this.CONSUME(tokens.LBRACE) },
        { ALT: () => this.CONSUME(tokens.RBRACE) },
        { ALT: () => this.CONSUME(tokens.LBRACKET) },
        { ALT: () => this.CONSUME(tokens.RBRACKET) },
        { ALT: () => this.CONSUME(tokens.PIPE) },
        { ALT: () => this.CONSUME(tokens.AMPERSAND) },
        { ALT: () => this.CONSUME(tokens.QUESTION) },
        { ALT: () => this.CONSUME(tokens.ELLIPSIS) },
      ]);
    });
    this.CONSUME(tokens.PERIOD);
  });

  public errorMessage = this.RULE('errorMessage', () => {
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.sentence);
    });
  });
}
