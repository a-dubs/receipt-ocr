/**
 * Parses the raw text returned by the LLM into a plain object.
 * Handles responses that are optionally wrapped in a markdown code block.
 */
export function parseReceiptResponse(response: string): Record<string, unknown> {
  let text = response.trim();

  if (text.startsWith("```json")) {
    text = text.slice(7);
    const end = text.lastIndexOf("```");
    if (end !== -1) text = text.slice(0, end);
  } else if (text.startsWith("```")) {
    text = text.slice(3);
    const end = text.lastIndexOf("```");
    if (end !== -1) text = text.slice(0, end);
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: "The LLM's response was not valid JSON." };
  }
}
