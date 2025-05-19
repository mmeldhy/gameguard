"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface FileUploadProps {
  onFileSelected: (file: File, url: string) => void
  accept?: string
  className?: string
}

export function FileUpload({ onFileSelected, accept = ".glb,.gltf", className = "" }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    // Check if file is a valid 3D model
    if (!file.name.endsWith(".glb") && !file.name.endsWith(".gltf")) {
      alert("Please upload a .glb or .gltf file")
      return
    }

    const url = URL.createObjectURL(file)
    onFileSelected(file, url)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/20"
      } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-muted p-3">
          <Upload className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Drag and drop your 3D model here</p>
          <p className="text-xs text-muted-foreground">Supports .glb and .gltf files</p>
        </div>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          Select File
        </Button>
        <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
      </div>
    </div>
  )
}
