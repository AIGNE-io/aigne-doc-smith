import { describe, expect, test } from "bun:test";
import { InvalidBlockletError } from "../../utils/blocklet.mjs";

describe("blocklet", () => {
  test("should export InvalidBlockletError class", () => {
    expect(typeof InvalidBlockletError).toBe("function");
    expect(InvalidBlockletError.prototype).toBeInstanceOf(Error.prototype.constructor);
  });
});
