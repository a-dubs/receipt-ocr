import { parseReceiptResponse } from "./parsers.js";
import { OpenAIProvider } from "./provider.js";
import { DEFAULT_MODEL, DEFAULT_SCHEMA } from "./constants.js";
import type {
  ImageInput,
  JsonSchema,
  OpenAIProviderConfig,
  ProcessReceiptOptions,
} from "./types.js";

/**
 * High-level receipt processor — mirrors the Python `ReceiptProcessor` class
 * but runs entirely in the browser (or any JavaScript environment).
 *
 * @example
 * ```ts
 * import { ReceiptProcessor } from "receipt-ocr-js";
 *
 * const processor = new ReceiptProcessor({ apiKey: "sk-..." });
 *
 * const fileInput = document.querySelector<HTMLInputElement>("#receipt")!;
 * const file = fileInput.files![0];
 *
 * const result = await processor.processReceipt(file);
 * console.log(result.merchant_name, result.total_amount);
 * ```
 */
export class ReceiptProcessor {
  private readonly provider: OpenAIProvider;

  /**
   * @param config - OpenAI provider configuration (API key required).
   */
  constructor(config: OpenAIProviderConfig) {
    this.provider = new OpenAIProvider(config);
  }

  /**
   * Process a receipt image and return structured JSON data.
   *
   * @param image      - The receipt image. Accepts a `File`, `Blob`,
   *                     data-URL string, or a regular URL string.
   * @param jsonSchema - Optional schema describing the desired output shape.
   *                     Defaults to the standard receipt schema.
   * @param options    - Optional model / response format overrides.
   * @returns          Parsed receipt data as a plain object.
   */
  async processReceipt(
    image: ImageInput,
    jsonSchema: JsonSchema = DEFAULT_SCHEMA,
    options: ProcessReceiptOptions = {}
  ): Promise<Record<string, unknown>> {
    const model = options.model ?? DEFAULT_MODEL;
    const responseFormatType = options.responseFormatType ?? "json_object";

    const response = await this.provider.getResponse(
      image,
      jsonSchema,
      model,
      responseFormatType
    );

    const content = response.choices[0]?.message?.content ?? "";
    return parseReceiptResponse(content);
  }
}
