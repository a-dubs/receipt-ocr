import OpenAI from "openai";
import type { ChatCompletion } from "openai/resources/chat/completions.js";

import { DEFAULT_MODEL } from "./constants.js";
import { SYSTEM_PROMPT, USER_PROMPT } from "./prompts.js";
import { encodeImageToBase64 } from "./utils.js";
import type {
  ImageInput,
  JsonSchema,
  OpenAIProviderConfig,
  ResponseFormatType,
} from "./types.js";

/**
 * Wraps the OpenAI (or compatible) chat-completions API.
 *
 * The underlying `openai` SDK ships with full browser support — it uses
 * `fetch` internally and does **not** require Node.js built-ins.
 *
 * ⚠️  Because the request is made directly from the browser, the `apiKey`
 * is visible in the client bundle. Use environment variables at build time
 * (e.g. `import.meta.env.VITE_OPENAI_API_KEY` in Vite) and consider
 * restricting the key to only the models/endpoints you need on the provider
 * dashboard.
 */
export class OpenAIProvider {
  private readonly client: OpenAI;

  constructor({ apiKey, baseUrl }: OpenAIProviderConfig) {
    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
      // Required by the openai SDK when running in a browser context.
      dangerouslyAllowBrowser: true,
    });
  }

  /**
   * Send the image + schema to the LLM and return the raw API response.
   *
   * @param image              - Receipt image (File, Blob, URL, or data-URL).
   * @param jsonSchema         - Desired output structure.
   * @param model              - Model name. Defaults to `"gpt-4.1"`.
   * @param responseFormatType - How the model should format its reply.
   */
  async getResponse(
    image: ImageInput,
    jsonSchema: JsonSchema,
    model: string = DEFAULT_MODEL,
    responseFormatType: ResponseFormatType = "json_object"
  ): Promise<ChatCompletion> {
    const imgBase64 = await encodeImageToBase64(image);

    const systemPrompt = SYSTEM_PROMPT.replace(
      "{jsonSchemaContent}",
      JSON.stringify(jsonSchema, null, 2)
    );

    const responseFormat = buildResponseFormat(responseFormatType, jsonSchema);

    const response = await this.client.chat.completions.create({
      model,
      // @ts-expect-error – the SDK type for response_format uses a union that
      // doesn't include all variants; casting is safe here.
      response_format: responseFormat,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: USER_PROMPT },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${imgBase64}` },
            },
          ],
        },
      ],
    });

    return response;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildResponseFormat(
  type: ResponseFormatType,
  jsonSchema: JsonSchema
): Record<string, unknown> {
  switch (type) {
    case "json_schema":
      return {
        type: "json_schema",
        json_schema: {
          name: "receipt_data",
          schema: jsonSchema,
          strict: true,
        },
      };
    case "text":
      return { type: "text" };
    case "json_object":
    default:
      return { type: "json_object" };
  }
}
