import { DEFAULT_MODEL, DEFAULT_SCHEMA } from "../src/constants";

describe("DEFAULT_SCHEMA and DEFAULT_MODEL constants", () => {
  it("exports the expected default model", () => {
    expect(DEFAULT_MODEL).toBe("gpt-4.1");
  });

  it("exports a default schema with required keys", () => {
    expect(DEFAULT_SCHEMA).toHaveProperty("merchant_name");
    expect(DEFAULT_SCHEMA).toHaveProperty("total_amount");
    expect(DEFAULT_SCHEMA).toHaveProperty("line_items");
  });
});
