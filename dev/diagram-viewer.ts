import { createSyntaxDiagramsCode } from "chevrotain";
import { Parser } from "../src/main.js";
import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/", (c) => {
  const parser = new Parser();
  const grammar = parser.getSerializedGastProductions();
  const html = createSyntaxDiagramsCode(grammar);

  return c.html(html);
});

export default app;
