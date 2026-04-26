# receipt-ocr-js

[![npm version](https://img.shields.io/npm/v/receipt-ocr-js)](https://www.npmjs.com/package/receipt-ocr-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

A **browser-native** npm package for extracting structured data from receipt images using LLMs.  
No server required — all processing happens directly in the browser (or Node.js ≥ 18).

> This package is the JavaScript/TypeScript counterpart of the Python [`receipt-ocr`](https://pypi.org/project/receipt-ocr/) library and the FastAPI server found in [`app/`](../app/). The Python server is no longer needed; you can call the LLM APIs directly from your React (or any JS) app.

---

## Features

- 🌐 **Fully browser-native** — uses the `openai` SDK's built-in `fetch`-based transport
- 🖼️ **Automatic image resizing** — downscales large images via the Canvas API before encoding
- 📦 **Dual ESM + CJS build** — works with Vite, Next.js, Create React App, plain Node.js, etc.
- 🔧 **TypeScript-first** — full type definitions included
- 🔑 **Provider agnostic** — works with OpenAI, Gemini, Groq, and any OpenAI-compatible API

---

## Installation

```bash
npm install receipt-ocr-js
# or
yarn add receipt-ocr-js
# or
pnpm add receipt-ocr-js
```

---

## Quick Start

### React example

```tsx
import { ReceiptProcessor } from "receipt-ocr-js";

// Instantiate once (e.g. at the module level or inside a React context)
const processor = new ReceiptProcessor({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Vite / CRA / Next.js public env var
});

function ReceiptUploader() {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await processor.processReceipt(file);
    console.log(result);
    // {
    //   merchant_name: "Saathimart.com",
    //   total_amount: 185,
    //   line_items: [ ... ],
    //   ...
    // }
  };

  return <input type="file" accept="image/*" onChange={handleChange} />;
}
```

---

## Configuration

### `new ReceiptProcessor(config)`

| Option    | Type     | Required | Description                                                                                 |
|-----------|----------|----------|---------------------------------------------------------------------------------------------|
| `apiKey`  | `string` | ✅        | Your API key. Passed directly to the LLM provider.                                         |
| `baseUrl` | `string` | ❌        | Base URL for OpenAI-compatible providers (Gemini, Groq, etc.). Defaults to OpenAI's API.   |

#### OpenAI (default)

```ts
const processor = new ReceiptProcessor({
  apiKey: "sk-...",
});
```

#### Gemini (Google)

```ts
const processor = new ReceiptProcessor({
  apiKey: "your-gemini-api-key",
  baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
});
```

#### Groq

```ts
const processor = new ReceiptProcessor({
  apiKey: "your-groq-api-key",
  baseUrl: "https://api.groq.com/openai/v1",
});
```

---

## API Reference

### `processor.processReceipt(image, jsonSchema?, options?)`

Extracts structured data from a receipt image.

| Parameter    | Type                             | Default            | Description                                         |
|--------------|----------------------------------|--------------------|-----------------------------------------------------|
| `image`      | `File \| Blob \| string`         | —                  | Receipt image. Pass a `File` from `<input>`, a `Blob`, a data-URL, or a regular URL. |
| `jsonSchema` | `JsonSchema`                     | `DEFAULT_SCHEMA`   | Output shape. Any plain object or full JSON Schema. |
| `options`    | `ProcessReceiptOptions`          | `{}`               | Model and response format overrides.                |

**`ProcessReceiptOptions`**

| Option               | Type                                           | Default         |
|----------------------|------------------------------------------------|-----------------|
| `model`              | `string`                                       | `"gpt-4.1"`     |
| `responseFormatType` | `"json_object" \| "json_schema" \| "text"`     | `"json_object"` |

**Returns** `Promise<Record<string, unknown>>` — the parsed receipt data.

---

### Default output schema

When no custom schema is provided the following fields are extracted:

```json
{
  "merchant_name": "string",
  "merchant_address": "string",
  "transaction_date": "string",
  "transaction_time": "string",
  "total_amount": "number",
  "line_items": [
    {
      "item_name": "string",
      "item_quantity": "number",
      "item_price": "number"
    }
  ]
}
```

---

### Custom schema example

```ts
const result = await processor.processReceipt(file, {
  merchant: "string",
  total: "number",
  tax: "number",
});
```

---

## Security note

Because this package runs **in the browser**, your API key will be included in the JavaScript bundle. To reduce exposure:

- Use environment variables at **build time** (e.g. `VITE_OPENAI_API_KEY`, `NEXT_PUBLIC_OPENAI_API_KEY`).
- Restrict the API key's permissions on the provider dashboard (specific model, spend limit, IP allowlist).
- Consider using a lightweight backend proxy that forwards requests and keeps the key server-side if your threat model requires it.

---

## Development

```bash
# Install dependencies
npm install

# Type-check
npm run lint

# Build (ESM + CJS + type declarations)
npm run build

# Run tests
npm test
```

---

## License

MIT — see the root [`LICENSE`](../LICENSE) file.
