# phpstan-error-parser

A JavaScript/TypeScript parser that converts PHPStan error messages into a structured format for easier programmatic processing and analysis.

## Overview

This is a JavaScript/TypeScript library that parses PHPStan error messages and extracts key components like function names, method names, variables, and doc tags into a structured data format. It uses [Chevrotain](https://chevrotain.io/) for lexical analysis and parsing.

## Features

- Parse PHPStan error messages into structured tokens
- Extract and identify:
  - Function names (including namespaced functions)
  - Method names (both static and instance methods)
  - Variable names
  - Parameter numbers (`#1`, `#2`, ...)
  - Numeric values (integers, negatives, decimals)
  - PHPDoc tags
  - Common words
- Get location information (start/end columns) for each token
- Built with TypeScript for type safety

## Tasks

- [x] comma
- [x] variable name (`$a`, `$foo`)
- [x] error including parameter number (`#1`, `#2`, ...)
- [x] number as a word (`-123`, `8.5`)
- [ ] `->` ("Using nullsafe method call on non-nullable type Exception. Use -> instead.")
- [ ] number as a type (`array{1, 3}`)
- [ ] static keyword (`static::`)
- [ ] types
  - [ ] array types (`int[]`, `string[][]`)
  - [ ] array shapes (`array{key: value, ...}`, `array{0}`, `array{}`)
  - [ ] generic types (`Path\SomeClass<int, string>`, `array<int, string>`)
  - [ ] Union type
  - [ ] Intersection type

- [] more...

## Installation

```bash
npm install phpstan-error-parser
```

## Usage

```typescript
import { parse } from 'phpstan-error-parser';

const errorMessage = "Function format not found.";
const words = parse(errorMessage);

console.log(words);
// Output:
// [
//   { type: 'common_word', value: 'Function', location: { startColumn: 0, endColumn: 8 } },
//   { type: 'function_name', value: 'format', location: { startColumn: 9, endColumn: 15 } },
//   { type: 'common_word', value: 'not', location: { startColumn: 16, endColumn: 19 } },
//   { type: 'common_word', value: 'found', location: { startColumn: 20, endColumn: 25 } },
//   { type: 'period', value: '.', location: { startColumn: 25, endColumn: 26 } }
// ]
```

## API

### `parse(errorMessage: string): Word[]`

Parses a PHPStan error message and returns an array of structured word tokens.

**Parameters:**
- `errorMessage`: The PHPStan error message string to parse

**Returns:**
- An array of `Word` objects

### `Word` Type

```typescript
type Word = {
  type: "function_name" | "method_name" | "variable_name" | "parameter_number" | "number" | "doc_tag" | "common_word" | "comma" | "period";
  value: string;
  location: {
    startColumn: number;
    endColumn: number;
  };
};
```

## Supported Patterns

The parser can identify:

- **Function names**: `Function format`, `Function abc\format` (with namespaces)
- **Method names**: `Method formatString()`, `method getData`
- **Variables**: `$variable`, `$user_name`
- **Parameter numbers**: `#1`, `#2`, `#3`
- **Numbers**: `1`, `-123`, `8.5`
- **Doc tags**: `@param`, `@return`, `@var`
- **Common words**: Regular words in the error message
- **Punctuation**: Commas and periods

## Development

### Setup

```bash
git clone <repository-url>
cd phpstan-error-parser
npm install
```

### Running Tests

```bash
npm test
```

### Development Server

View the parser diagram visualization like [Chevrotain Playground](https://chevrotain.io/playground/):

```bash
npm run diagram
```

### Offset Calculator CLI

A development tool to calculate word offsets for testing purposes:

```bash
# Link the package globally (run once)
npm link
```

```bash
# Use the CLI from anywhere
calc-offset "Function format not found."

|0       |9      |16  |20
Function format  not  found.
       |8     |15  |19     |26
```

```bash
# Unlink when done
npm unlink -g phpstan-error-parser
```

### Updating PHPStan Error Snapshots

Snapshot tests parse real PHPStan error messages and track the results, so you can see exactly what changes when new tokens are added.

**Via GitHub Actions (recommended):**

1. Go to the **Actions** tab → **Collect PHPStan Errors**
2. Click **Run workflow**, select the target branch, and enter PHPStan branches
3. The workflow collects error messages, updates snapshots, and commits the results

**From a Pull Request:**

1. Add the `collect-errors` label to the PR
2. The workflow runs automatically, collecting errors and committing to the PR branch
3. Defaults to PHPStan branch `2.2.x`

**Locally with Docker:**

```bash
# Collect error messages from phpstan-src
cd collector && ./run.sh 2.2.x

# Update snapshots
npx vitest run --update
```

## Project Structure

```
├── src/
│   ├── parser.ts    # Lexer and parser definitions
│   ├── format.ts    # CST to structured format converter
│   └── index.ts     # Main export
├── test/
│   ├── parser.spec.ts
│   ├── format.spec.ts
│   ├── snapshot.spec.ts # Snapshot tests for PHPStan error messages
│   └── fixtures/        # Collected error messages (auto-generated)
├── collector/           # PHPStan error message collector (Docker + uopz)
└── package.json
```

## Examples

### Parsing a Method Error

```typescript
const errorMessage = "Method formatString() not found in class MyClass.";
const words = parse(errorMessage);
// Extracts 'formatString()' as a method_name token
```

### Parsing with Variables

```typescript
const errorMessage = "Variable $userName is not defined.";
const words = parse(errorMessage);
// Extracts '$userName' as a variable_name token
```

### Parsing with Doc Tags

```typescript
const errorMessage = "Invalid @param tag in docblock.";
const words = parse(errorMessage);
// Extracts '@param' as a doc_tag token
```

## License

MIT

## Credit

- Inspired by [pretty-ts-error](https://github.com/yoavbls/pretty-ts-errors)

## Keywords

- PHPStan
- parser
- static analysis
- error parsing
