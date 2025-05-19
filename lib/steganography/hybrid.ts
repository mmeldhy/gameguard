import type { GLTF } from "three-stdlib"
import { embedQIM, extractQIM } from "./qim"
import { embedDeltaAdditive, extractDeltaAdditive } from "./delta"

/**
 * Embeds a watermark into a 3D model using both QIM and Delta Additive methods
 * @param gltf The GLTF model to embed the watermark into
 * @param watermark The text watermark to embed
 * @returns The modified GLTF model
 */
export function embedHybrid(gltf: GLTF, watermark: string): GLTF {
  // First apply QIM
  const qimResult = embedQIM(gltf, watermark)

  // Then apply Delta Additive to the result
  const hybridResult = embedDeltaAdditive(qimResult, watermark)

  return hybridResult
}

/**
 * Extracts a watermark from a 3D model using both QIM and Delta Additive methods
 * @param gltf The GLTF model to extract the watermark from
 * @param watermarkLength The expected length of the watermark in characters
 * @returns The extracted watermark text
 */
export function extractHybrid(gltf: GLTF, watermarkLength = 20): string {
  // Try QIM extraction first
  const qimResult = extractQIM(gltf, watermarkLength)

  // If QIM result seems valid, return it
  if (isValidText(qimResult)) {
    return qimResult
  }

  // Otherwise, try Delta Additive
  const deltaResult = extractDeltaAdditive(gltf, watermarkLength)

  // Return the Delta result regardless of validity
  return deltaResult
}

/**
 * Checks if the extracted text appears to be valid
 * @param text The text to check
 * @returns True if the text appears valid, false otherwise
 */
function isValidText(text: string): boolean {
  // Check if the text contains mostly printable ASCII characters
  const printableChars = text.replace(/[^\x20-\x7E]/g, "")
  return printableChars.length / text.length > 0.7
}
