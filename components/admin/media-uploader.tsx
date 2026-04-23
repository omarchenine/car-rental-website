"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Upload, X, GripVertical, Play } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { CarMedia } from "@/lib/car-types"
import { cn } from "@/lib/utils"

interface Props {
  value: CarMedia[]
  onChange: (media: CarMedia[]) => void
}

export function MediaUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    const uploaded: CarMedia[] = []
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error(data?.error ?? `Upload failed for ${file.name}`)
          continue
        }
        uploaded.push({
          url: data.url,
          type: data.type,
          name: data.name,
        })
      }
      if (uploaded.length > 0) {
        onChange([...value, ...uploaded])
        toast.success(`Uploaded ${uploaded.length} file${uploaded.length > 1 ? "s" : ""}.`)
      }
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  function onDragStart(i: number) {
    setDragIndex(i)
  }
  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) return
    const next = [...value]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(i, 0, moved)
    setDragIndex(i)
    onChange(next)
  }
  function onDragEnd() {
    setDragIndex(null)
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/50 p-8 text-center transition",
          uploading && "opacity-60",
        )}
      >
        <Upload className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">Drop images or videos here</p>
        <p className="text-xs text-muted-foreground">
          JPEG/PNG/WebP up to 10 MB · MP4/WebM up to 100 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-1"
        >
          {uploading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" /> Uploading…
            </>
          ) : (
            "Choose files"
          )}
        </Button>
      </div>

      {value.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            Drag to reorder. The first image is used as the cover.
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {value.map((m, i) => (
              <li
                key={m.url}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={(e) => onDragOver(e, i)}
                onDragEnd={onDragEnd}
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-secondary",
                  dragIndex === i && "opacity-50",
                )}
              >
                {m.type === "image" ? (
                  <Image src={m.url} alt="" fill sizes="160px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                    <Play className="h-6 w-6" />
                  </div>
                )}
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
                    Cover
                  </span>
                )}
                <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => remove(i)}
                    className="flex h-7 w-7 items-center justify-center rounded bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-1.5 left-1.5 flex h-7 w-7 cursor-grab items-center justify-center rounded bg-background/90 text-foreground opacity-0 transition group-hover:opacity-100">
                  <GripVertical className="h-3.5 w-3.5" />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
