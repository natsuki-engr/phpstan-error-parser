import { describe, expect, it } from "vitest";
import { parse } from "../src/index";

describe("test formatted results", () => {
  it("parse function not found error", async () => {
    const message = "Function format not found.";
    const result = parse(message);

		const expected = [
      {
        type: "common_word",
        value: "Function",
				location: {
					startColumn: 0,
					endColumn: 8,
				}
      },
      {
        type: "function_name",
        value: "format",
				location: {
					startColumn: 9,
					endColumn: 15,
				}
      },
      {
        type: "common_word",
        value: "not",
				location: {
					startColumn: 16,
					endColumn: 19,
				}
      },
      {
        type: "common_word",
        value: "found",
				location: {
					startColumn: 20,
					endColumn: 25,
				}
      },
			{
				type: "period",
				value: ".",
				location: {
					startColumn: 25,
					endColumn: 26,
				}
			}
    ]
    expect(result).toStrictEqual(expected);
  });
});
