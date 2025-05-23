// app/extract/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield, ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { ModelViewer } from "@/components/model-viewer"
import { Spinner } from "@/components/ui/spinner"
import { extractQIM } from "@/lib/steganography/qim"
import type { GLTF } from "three-stdlib"
import CryptoJS from "crypto-js" 

async function sha256(message: string): Promise<string> {
  const textEncoder = new TextEncoder();
  const data = textEncoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hexHash;
}

export default function ExtractPage() {
  const [file, setFile] = useState<File | null>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [method, setMethod] = useState("qim")
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedWatermark, setExtractedWatermark] = useState<string | null>(null)
  const [gltfModel, setGltfModel] = useState<GLTF | null>(null)
  const [watermarkLength, setWatermarkLength] = useState("20")


  // Load the GLTFLoader when needed
  useEffect(() => {
    if (!modelUrl) return

    const loadModel = async () => {
      try {
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader")
        const loader = new GLTFLoader()

        loader.load(
          modelUrl,
          (gltf) => {
            setGltfModel(gltf)
          },
          undefined,
          (error) => {
            console.error("An error occurred loading the model:", error)
          },
        )
      } catch (error) {
        console.error("Failed to load model:", error)
      }
    }

    loadModel()
  }, [modelUrl])

  const handleFileSelected = (file: File, url: string) => {
    setFile(file)
    setModelUrl(url)
    setExtractedWatermark(null)
  }

  const handleExtractWatermark = async () => {
    if (!gltfModel) return

    setIsProcessing(true)

    try {
 
      const originalWatermarkLength = Number.parseInt(watermarkLength);
      const expectedTotalLength = originalWatermarkLength + 8 + 64; // watermark + '::HASH::' + hash

      // Apply the selected steganography method
      let extractedRawData: string
      
      switch (method) {
        case "qim":
          extractedRawData = extractQIM(gltfModel, expectedTotalLength)
          break
        case "delta":
          extractedRawData = extractDeltaAdditive(gltfModel, expectedTotalLength)
          break
        case "hybrid":
          extractedRawData = extractHybrid(gltfModel, expectedTotalLength)
          break
        default:
          extractedRawData = extractQIM(gltfModel, expectedTotalLength)
      }

      // Split the extracted data into watermark and hash
      const parts = extractedRawData.split('::HASH::');
      let extractedWatermarkText = '';
      let embeddedHash = '';

      if (parts.length === 2) {
        extractedWatermarkText = parts[0];
        embeddedHash = parts[1];
      } else {
        // If splitting fails, assume the entire extracted data is the watermark (no hash embedded or corrupted delimiter)
        extractedWatermarkText = extractedRawData;
      }
      
      // Calculate the current hash of the extracted watermark
      const currentWatermarkHash = await sha256(extractedWatermarkText);

      // Verify integrity
      if (embeddedHash && currentWatermarkHash === embeddedHash) {
        setExtractedWatermark(`Watermark: "${extractedWatermarkText}"\nIntegrity: VERIFIED`);
      } else if (embeddedHash && currentWatermarkHash !== embeddedHash) {
        setExtractedWatermark(`Watermark: "${extractedWatermarkText}"\nIntegrity: FAILED (Watermark may have been tampered with or corrupted)`);
      } else {
        setExtractedWatermark(`Watermark: "${extractedWatermarkText}"\nIntegrity: UNKNOWN (No hash embedded or extraction issue)`);
      }

      setIsProcessing(false)
    } catch (error) {
      console.error("Failed to extract watermark:", error)
      setExtractedWatermark("Error extracting watermark.")
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Shield className="h-6 w-6" />
            <span>GameGuard</span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/embed" className="text-sm font-medium">
              Embed
            </Link>
            <Link href="/extract" className="text-sm font-medium text-primary">
              Extract
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="flex items-center gap-2 mb-8">
            <Button variant="outline" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Extract Watermark</h1>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <FileUpload onFileSelected={handleFileSelected} />

              {modelUrl && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="method">Extraction Method</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger id="method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qim">Quantization Index Modulation (QIM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/*
                  <div className="space-y-2">
                    <Label htmlFor="length">Expected Watermark Length (characters)</Label>
                    <Input
                      id="length"
                      type="number"
                      min="1"
                      max="100"
                      value={watermarkLength}
                      onChange={(e) => setWatermarkLength(e.target.value)}
                    />
                  </div>
                  */}

                  <Button onClick={handleExtractWatermark} disabled={isProcessing} className="w-full">
                    {isProcessing ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Extract Watermark
                      </>
                    )}
                  </Button>
                </div>
              )}

              {extractedWatermark && (
                <Card>
                  <CardHeader>
                    <CardTitle>Extracted Watermark</CardTitle>
                    <CardDescription>The following watermark was extracted from the model</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted rounded-md font-mono break-all" style={{ whiteSpace: 'pre-wrap' }}>{extractedWatermark}</div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <ModelViewer modelUrl={modelUrl} className="h-[500px]" />
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} GameGuard. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}