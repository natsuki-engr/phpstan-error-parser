#!/usr/bin/env node

import { parse } from "./index.js";

const inputText = process.argv[2];

if (!inputText) {
  console.error('Error: Please provide text as an argument');
  console.log('\nUsage:');
  console.log('  calc-offset "your text here."');
  process.exit(1);
}

console.log(JSON.stringify(parse(inputText), null, 2));
