/**
 * Mock deepfake detection for images only.
 *
 * Replace this with a real model inference path when you have one.
 * Suggested approaches:
 *  - Run an ONNX model in-browser via `onnxruntime-web` (preprocess: resize 224x224, normalize, RGB).
 *  - Or call an external Python (Flask/FastAPI) endpoint hosting your .h5/.pt/.pkl model
 *    from a server function in `src/lib/*.functions.ts`.
 *
 * The mock returns a deterministic-ish result based on the file name + size so
 * the same file always returns the same verdict during testing.
 */
export type DetectionVerdict = {
  result: "real" | "fake";
  confidence: number; // 50.0–99.9
};

export async function mockDetect(file: File): Promise<DetectionVerdict> {
  // Simulate latency for images
  const latency = 500 + Math.random() * 500;
  await new Promise((r) => setTimeout(r, latency));

  // Pseudo-random result. ~55% fake to make the demo interesting.
  const r = Math.random();
  const result: "real" | "fake" = r < 0.55 ? "fake" : "real";
  const confidence = +(50 + Math.random() * 49.9).toFixed(1);
  return { result, confidence };
}

export function isSupported(file: File): boolean {
  return /^(image\/(jpeg|png|webp))$/.test(file.type);
}
