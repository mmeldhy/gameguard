"use client"

import { useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stage } from "@react-three/drei"
import type { GLTF } from "three-stdlib"
import { Spinner } from "@/components/ui/spinner"

type ModelViewerProps = {
  modelUrl: string | null
  className?: string
}

export function ModelViewer({ modelUrl, className = "h-[400px]" }: ModelViewerProps) {
  const [loading, setLoading] = useState(false)

  if (!modelUrl) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted/30 rounded-lg border`}>
        <p className="text-muted-foreground">Upload a 3D model to preview</p>
      </div>
    )
  }

  return (
    <div className={`${className} relative rounded-lg border overflow-hidden`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Spinner />
        </div>
      )}
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
        <color attach="background" args={["#f5f5f5"]} />
        <Stage environment="city" intensity={0.5}>
          <Model url={modelUrl} onLoading={setLoading} />
        </Stage>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}

function Model({ url, onLoading }: { url: string; onLoading: (loading: boolean) => void }) {
  const [model, setModel] = useState<GLTF>()

  useEffect(() => {
    onLoading(true)

    import("three/examples/jsm/loaders/GLTFLoader").then(({ GLTFLoader }) => {
      const loader = new GLTFLoader()

      loader.load(
        url,
        (gltf) => {
          setModel(gltf)
          onLoading(false)
        },
        undefined,
        (error) => {
          console.error("An error occurred loading the model:", error)
          onLoading(false)
        },
      )
    })

    return () => {
      setModel(undefined)
    }
  }, [url, onLoading])

  if (!model) return null

  return <primitive object={model.scene} />
}
