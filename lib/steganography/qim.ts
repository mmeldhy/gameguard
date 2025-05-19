import * as THREE from "three"
import type { GLTF } from "three-stdlib"
import { textToBinary, binaryToText } from "../utils"

// Quantization step size
const STEP_SIZE = 0.001

/**
 * Embeds a watermark into a 3D model using Quantization Index Modulation
 * @param gltf The GLTF model to embed the watermark into
 * @param watermark The text watermark to embed
 * @returns The modified GLTF model
 */
export function embedQIM(gltf: GLTF, watermark: string): GLTF {
  // Convert watermark text to binary
  const binaryWatermark = textToBinary(watermark)

  // Create a deep clone of the model to avoid modifying the original
  const clonedScene = gltf.scene.clone()

  // Track the current bit position in the watermark
  let bitPosition = 0

  // Process each mesh in the scene
  clonedScene.traverse((object) => {
    if (object instanceof THREE.Mesh && object.geometry) {
      const geometry = object.geometry

      // Get position attribute
      const positionAttribute = geometry.getAttribute("position")

      // Skip if no position attribute
      if (!positionAttribute) return

      // Get position array
      const positions = positionAttribute.array

      // Embed watermark bits into vertex positions
      for (let i = 0; i < positions.length; i += 3) {
        // Only modify if we still have watermark bits to embed
        if (bitPosition < binaryWatermark.length) {
          // Get current bit to embed (0 or 1)
          const bit = Number.parseInt(binaryWatermark[bitPosition])

          // Apply QIM to x coordinate
          const x = positions[i]
          const quantizedX = Math.round(x / STEP_SIZE)

          // If bit is 0, make quantizedX even; if bit is 1, make quantizedX odd
          if (bit === 0 && quantizedX % 2 !== 0) {
            positions[i] = (quantizedX - 1) * STEP_SIZE
          } else if (bit === 1 && quantizedX % 2 === 0) {
            positions[i] = (quantizedX + 1) * STEP_SIZE
          } else {
            positions[i] = quantizedX * STEP_SIZE
          }

          bitPosition++
        } else {
          break
        }
      }

      // Update the geometry
      positionAttribute.needsUpdate = true
      geometry.computeBoundingSphere()
    }
  })

  // Create a new GLTF object with the modified scene
  const modifiedGLTF: GLTF = {
    ...gltf,
    scene: clonedScene,
  }

  return modifiedGLTF
}

/**
 * Extracts a watermark from a 3D model using Quantization Index Modulation
 * @param gltf The GLTF model to extract the watermark from
 * @param watermarkLength The expected length of the watermark in characters
 * @returns The extracted watermark text
 */
export function extractQIM(gltf: GLTF, watermarkLength = 20): string {
  // Calculate the number of bits needed based on watermark length
  // Each character is 8 bits in UTF-8
  const bitsNeeded = watermarkLength * 8

  // Array to store extracted bits
  const extractedBits: string[] = []

  // Process each mesh in the scene
  gltf.scene.traverse((object) => {
    if (extractedBits.length >= bitsNeeded) return

    if (object instanceof THREE.Mesh && object.geometry) {
      const geometry = object.geometry

      // Get position attribute
      const positionAttribute = geometry.getAttribute("position")

      // Skip if no position attribute
      if (!positionAttribute) return

      // Get position array
      const positions = positionAttribute.array

      // Extract watermark bits from vertex positions
      for (let i = 0; i < positions.length; i += 3) {
        if (extractedBits.length >= bitsNeeded) break

        // Get x coordinate
        const x = positions[i]

        // Quantize the coordinate
        const quantizedX = Math.round(x / STEP_SIZE)

        // Extract bit: even = 0, odd = 1
        const bit = quantizedX % 2 === 0 ? "0" : "1"
        extractedBits.push(bit)
      }
    }
  })

  // Convert binary to text
  const extractedText = binaryToText(extractedBits.join(""))

  return extractedText
}
