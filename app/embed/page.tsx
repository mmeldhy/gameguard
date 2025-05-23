"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield, ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/file-upload"
import { ModelViewer } from "@/components/model-viewer"
import { Spinner } from "@/components/ui/spinner"
import { embedQIM } from "@/lib/steganography/qim"
import { downloadBlob } from "@/lib/utils"
import type { GLTF } from "three-stdlib"
import CryptoJS from "crypto-js" 

async function sha256(message: string): Promise<string> {
  return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
}

export default function EmbedPage() {
  const [file, setFile] = useState<File | null>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [watermark, setWatermark] = useState("")
  const [method, setMethod] = useState("qim")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedModelUrl, setProcessedModelUrl] = useState<string | null>(null)
  const [gltfModel, setGltfModel] = useState<GLTF | null>(null)
  const [processedModel, setProcessedModel] = useState<GLTF | null>(null)

  // Load the GLTFLoader and GLTFExporter when needed
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
    setProcessedModelUrl(null)
    setProcessedModel(null)
  }

  const handleEmbedWatermark = async () => {
    if (!gltfModel || !watermark) return

    setIsProcessing(true)

    try {
      // Generate hash of the watermark
      const watermarkHash = await sha256(watermark)

      const dataToEmbed = `${watermark}::HASH::${watermarkHash}`

      // Apply the selected steganography method
      let modifiedModel: GLTF

      switch (method) {
        case "qim":
          modifiedModel = embedQIM(gltfModel, dataToEmbed)
          break
        case "delta":
          modifiedModel = embedDeltaAdditive(gltfModel, dataToEmbed)
          break
        case "hybrid":
          modifiedModel = embedHybrid(gltfModel, dataToEmbed)
          break
        default:
          modifiedModel = embedQIM(gltfModel, dataToEmbed)
      }

      setProcessedModel(modifiedModel)

      // Export the modified model
      const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter")
      const exporter = new GLTFExporter()

      exporter.parse(
        modifiedModel.scene,
        (result) => {
          const output =
            result instanceof ArrayBuffer
              ? new Blob([result], { type: "application/octet-stream" })
              : new Blob([JSON.stringify(result)], { type: "application/json" })

          const url = URL.createObjectURL(output)
          setProcessedModelUrl(url)
          setIsProcessing(false)
        },
        (error) => {
          console.error("An error occurred during export:", error)
          setIsProcessing(false)
        },
        { binary: file?.name.endsWith(".glb") },
      )
    } catch (error) {
      console.error("Failed to embed watermark:", error)
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedModelUrl || !file) return

    // Create a fetch request to get the blob
    fetch(processedModelUrl)
      .then((response) => response.blob())
      .then((blob) => {
        // Generate a filename with "watermarked" prefix
        const originalName = file.name
        const extension = originalName.split(".").pop()
        const baseName = originalName.substring(0, originalName.lastIndexOf("."))
        const newFilename = `${baseName}_watermarked.${extension}`

        // Download the blob
        downloadBlob(blob, newFilename)
      })
      .catch((error) => {
        console.error("Failed to download model:", error)
      })
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
            <Link href="/embed" className="text-sm font-medium text-primary">
              Embed
            </Link>
            <Link href="/extract" className="text-sm font-medium">
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
            <h1 className="text-2xl font-bold">Embed Watermark</h1>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <FileUpload onFileSelected={handleFileSelected} />

              {modelUrl && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="watermark">Watermark Text</Label>
                    <Input
                      id="watermark"
                      placeholder="Enter your watermark text"
                      value={watermark}
                      onChange={(e) => setWatermark(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="method">Steganography Method</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger id="method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qim">Quantization Index Modulation (QIM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleEmbedWatermark} disabled={!watermark || isProcessing} className="w-full">
                    {isProcessing ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Processing...
                      </>
                    ) : (
                      "Embed Watermark"
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Tabs defaultValue="original">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="original">Original Model</TabsTrigger>
                  <TabsTrigger value="watermarked" disabled={!processedModelUrl}>
                    Watermarked Model
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="original" className="mt-4">
                  <ModelViewer modelUrl={modelUrl} className="h-[400px]" />
                </TabsContent>
                <TabsContent value="watermarked" className="mt-4">
                  <ModelViewer modelUrl={processedModelUrl} className="h-[400px]" />
                </TabsContent>
              </Tabs>

              {processedModelUrl && (
                <Button onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Watermarked Model
                </Button>
              )}
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