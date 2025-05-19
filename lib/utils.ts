import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts text to binary representation
 * @param text The text to convert
 * @returns Binary string (e.g., "01001000")
 */
export function textToBinary(text: string): string {
  let binary = ""
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    const bin = charCode.toString(2).padStart(8, "0")
    binary += bin
  }
  return binary
}

/**
 * Converts binary string to text
 * @param binary Binary string (e.g., "01001000")
 * @returns The decoded text
 */
export function binaryToText(binary: string): string {
  let text = ""
  // Process in chunks of 8 bits (1 byte)
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8)
    if (byte.length === 8) {
      const charCode = Number.parseInt(byte, 2)
      text += String.fromCharCode(charCode)
    }
  }
  return text
}

/**
 * Downloads a Blob as a file
 * @param blob The Blob to download
 * @param filename The name of the file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
