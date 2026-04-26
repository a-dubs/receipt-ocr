import { parseReceiptResponse } from "../src/parsers";

describe("parseReceiptResponse", () => {
  it("parses a plain JSON string", () => {
    const input = JSON.stringify({ merchant_name: "Test Store", total_amount: 42 });
    expect(parseReceiptResponse(input)).toEqual({ merchant_name: "Test Store", total_amount: 42 });
  });

  it("strips a ```json ... ``` code block", () => {
    const input = "```json\n{\"merchant_name\": \"Shop\"}\n```";
    expect(parseReceiptResponse(input)).toEqual({ merchant_name: "Shop" });
  });

  it("strips a plain ``` ... ``` code block", () => {
    const input = "```\n{\"total_amount\": 9.99}\n```";
    expect(parseReceiptResponse(input)).toEqual({ total_amount: 9.99 });
  });

  it("returns an error object for invalid JSON", () => {
    const result = parseReceiptResponse("not json at all");
    expect(result).toHaveProperty("error");
  });
});
