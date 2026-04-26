/** A single line item extracted from a receipt. */
export interface LineItem {
  item_name: string;
  item_quantity: number;
  item_price: number;
  item_total?: number;
  [key: string]: unknown;
}

/** Default structured output shape for a receipt. */
export interface ReceiptData {
  merchant_name: string;
  merchant_address: string;
  transaction_date: string;
  transaction_time: string;
  total_amount: number;
  line_items: LineItem[];
  [key: string]: unknown;
}

/**
 * A JSON schema description passed to the LLM to control output structure.
 * Can be any plain object — either the simple `{ field: "type" }` style or
 * a full JSON Schema object.
 */
export type JsonSchema = Record<string, unknown>;

/** Supported OpenAI response_format types. */
export type ResponseFormatType = "json_object" | "json_schema" | "text";

/** Options for {@link ReceiptProcessor.processReceipt}. */
export interface ProcessReceiptOptions {
  /** LLM model name, e.g. `"gpt-4o"` or `"gemini-2.5-pro"`. Defaults to `"gpt-4.1"`. */
  model?: string;
  /**
   * Controls the response_format sent to the API.
   * - `"json_object"` (default) — standard JSON object
   * - `"json_schema"` — structured outputs (OpenAI structured outputs spec)
   * - `"text"` — plain text
   */
  responseFormatType?: ResponseFormatType;
}

/** Configuration for {@link OpenAIProvider}. */
export interface OpenAIProviderConfig {
  /** Your API key. Required — there is no server to keep it secret. */
  apiKey: string;
  /**
   * Optional base URL for OpenAI-compatible providers (Gemini, Groq, etc.).
   * Defaults to the official OpenAI endpoint.
   */
  baseUrl?: string;
}

/** An image accepted by the processor — File, Blob, URL string, or data-URL. */
export type ImageInput = File | Blob | string;
