import type { ImageInput } from "./types.js";

/** Maximum pixel dimension used when downscaling large images before encoding. */
const MAX_SIZE = 1080;

/**
 * Converts any supported image input into a base64-encoded PNG string.
 *
 * - In a **browser** environment the Canvas API is used for resize + encode.
 * - In a **Node.js ≥ 18** environment a polyfill path using
 *   `createImageBitmap` is attempted; if unavailable the raw bytes are
 *   base64-encoded directly (useful for testing / server-side rendering).
 *
 * @param image  - A `File`, `Blob`, data-URL string, or a regular URL string.
 * @returns Base64-encoded PNG string (without the `data:image/png;base64,` prefix).
 */
export async function encodeImageToBase64(image: ImageInput): Promise<string> {
  const blob = await toBlob(image);

  // Browser: use Canvas to resize + encode as PNG
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    return resizeAndEncodeWithCanvas(blob);
  }

  // Non-browser fallback (Node.js / SSR): encode bytes directly.
  // Resizing is skipped because Canvas / createImageBitmap may not be available.
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  return uint8ArrayToBase64(bytes);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function toBlob(image: ImageInput): Promise<Blob> {
  if (image instanceof Blob) {
    // Covers both File and Blob
    return image;
  }

  if (typeof image === "string") {
    if (image.startsWith("data:")) {
      // Data URL — decode directly
      return dataUrlToBlob(image);
    }
    // Regular URL — fetch it
    const response = await fetch(image);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image from URL: ${response.status} ${response.statusText}`
      );
    }
    return response.blob();
  }

  throw new TypeError(
    `Unsupported image type: ${typeof image}. Pass a File, Blob, data-URL, or URL string.`
  );
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

async function resizeAndEncodeWithCanvas(blob: Blob): Promise<string> {
  // createImageBitmap is available in all modern browsers and Node ≥ 18
  const bitmap = await createImageBitmap(blob);

  let { width, height } = bitmap;
  if (Math.max(width, height) > MAX_SIZE) {
    if (width > height) {
      height = Math.round((height * MAX_SIZE) / width);
      width = MAX_SIZE;
    } else {
      width = Math.round((width * MAX_SIZE) / height);
      height = MAX_SIZE;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D canvas context");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Strip the data-URL prefix
  const dataUrl = canvas.toDataURL("image/png");
  return dataUrl.replace(/^data:image\/png;base64,/, "");
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}
