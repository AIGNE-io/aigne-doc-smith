import { describe, expect, test } from "bun:test";
import prefs from "../../../agents/prefs/prefs.mjs";

describe("prefs", () => {
  test("should return help message when no action specified", async () => {
    const result = await prefs({}, {});

    expect(result).toBeDefined();
    expect(result.message).toBe("Please specify an action: --list, --remove, or --toggle.");
  });
});
