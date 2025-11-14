#!/usr/bin/env node

const inputText = process.argv[2];

if (!inputText) {
  console.error('Error: Please provide text as an argument');
  console.log('\nUsage:');
  console.log('  calc-offset "your text here"');
  process.exit(1);
}

const parts = inputText.split(' ');

let topLine = ' ';
let middleLine = ' ';
let bottomLine = ' ';
let offset = 0;
for (const word of parts) {
  topLine += `|${offset}`;
  middleLine += `${word} `;
  bottomLine += `${' '.repeat(word.length - 1)}|${offset + word.length}`;
  offset += word.length + 1;

  const lineOffset = Math.max(
    topLine.length,
    middleLine.length,
    bottomLine.length,
  );
  topLine = topLine.padEnd(lineOffset, ' ');
  middleLine = middleLine.padEnd(lineOffset, ' ');
  bottomLine = bottomLine.padEnd(lineOffset, ' ');
}

console.log(topLine);
console.log(middleLine);
console.log(bottomLine);
