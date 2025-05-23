import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Code, FileDigit } from "lucide-react"

export default function Home() {
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
            <Link href="/extract" className="text-sm font-medium">
              Extract
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  GameGuard 3D Steganography
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Protect your 3D game assets with invisible watermarks using advanced steganography algorithms.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/embed">
                    Embed Watermark <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/extract">
                    Extract Watermark <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl flex flex-col items-center text-center space-y-4">
              <div className="inline-block rounded-lg bg-muted p-2">
                <Code className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Quantization Index Modulation (QIM)</h2>
              <p className="text-muted-foreground md:text-lg">
                QIM embeds watermarks by quantizing vertex coordinates to specific values. This method offers robust
                watermarking that can withstand various transformations while maintaining model integrity.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How GameGuard Works</h2>
              <p className="text-muted-foreground md:text-lg">
                GameGuard uses advanced steganography techniques to embed invisible watermarks in your 3D models. The
                watermarks are embedded in the vertex coordinates, making them resistant to most transformations while
                preserving the visual quality of your models.
              </p>
              <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3 lg:gap-12 pt-8">
                <div className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </div>
                  <h3 className="text-xl font-bold">Upload Model</h3>
                  <p className="text-muted-foreground">Upload your .glb or .gltf 3D model file to the platform.</p>
                </div>
                <div className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    2
                  </div>
                  <h3 className="text-xl font-bold">Add Watermark</h3>
                  <p className="text-muted-foreground">Enter your text watermark and choose an embedding algorithm.</p>
                </div>
                <div className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </div>
                  <h3 className="text-xl font-bold">Download Protected Model</h3>
                  <p className="text-muted-foreground">
                    Download your watermarked model, ready for use in game engines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
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
