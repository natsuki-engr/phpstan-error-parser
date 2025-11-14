import { createSyntaxDiagramsCode } from 'chevrotain';
import { Hono } from 'hono';
import { Parser } from '../src/parser.js';

const app = new Hono();

app.get('/', (c) => {
  const parser = new Parser();
  const grammar = parser.getSerializedGastProductions();
  const html = createSyntaxDiagramsCode(grammar);

  return c.html(html);
});

export default app;
