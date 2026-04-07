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
    pattern: /(?<!(T|t)he (M|m)ethod )(?<=(M|m)ethod )(\w+(\\[\w]+)*::\w+\(\))/,
    line_breaks: false,
  }),
  METHOD_NAME: createToken({
    name: 'MethodName',
    pattern: /(?<!(T|t)he (M|m)ethod )(?<=(M|m)ethod )([\w]+(\\[\w]+)*(\(\))?)/,
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

  public sentence = this.RULE('sentence', () => {
    this.AT_LEAST_ONE(() => {
      this.OR([
        { ALT: () => this.CONSUME(tokens.SINGLE_QUOTED_STRING) },
        { ALT: () => this.CONSUME(tokens.DOUBLE_QUOTED_STRING) },
        { ALT: () => this.CONSUME(tokens.FUNCTION_NAME) },
        { ALT: () => this.CONSUME(tokens.STATIC_METHOD_NAME) },
        { ALT: () => this.CONSUME(tokens.METHOD_NAME) },
        { ALT: () => this.CONSUME(tokens.COMMON_WORD) },
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
