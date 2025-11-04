import { createSyntaxDiagramsCode } from "chevrotain";
import { Parser } from "../src/main.js";
import { Hono } from "hono";
import { serve } from "@hono/node-server";

const parser = new Parser()
const grammar = parser.getSerializedGastProductions()
const html = createSyntaxDiagramsCode(grammar)

const app = new Hono()

app.get("/", (c) => {
  return c.html(html)
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
