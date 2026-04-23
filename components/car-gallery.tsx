"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import type { CarMedia } from "@/lib/car-types"
import { cn } from "@/lib/utils"

interface Props {
  media: CarMedia[]
  alt: string
}

export function CarGallery({ media, alt }: Props) {
  const [active, setActive] = useState(0)

  if (media.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-dashed border-border bg-secondary text-sm text-muted-foreground">
        No media available
      </div>
    )
  }

  const current = media[active]
  const canPrev = active > 0
  const canNext = active < media.length - 1

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
        {current.type === "image" ? (
          <Image
            src={current.url}
            alt={alt}
            fill
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover"
          />
        ) : (
          <video
            key={current.url}
            src={current.url}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full bg-black object-contain"
          />
        )}

        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => canPrev && setActive(active - 1)}
              disabled={!canPrev}
              aria-label="Previous media"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md backdrop-blur transition hover:bg-background disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => canNext && setActive(active + 1)}
              disabled={!canNext}
              aria-label="Next media"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md backdrop-blur transition hover:bg-background disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-2.5 py-0.5 text-xs font-medium text-foreground backdrop-blur">
              {active + 1} / {media.length}
            </div>
          </>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((m, i) => (
            <button
              key={m.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show media ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 bg-secondary transition",
                i === active ? "border-accent" : "border-transparent hover:border-border",
              )}
            >
              {m.type === "image" ? (
                <Image src={m.url} alt="" fill sizes="96px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                  <Play className="h-5 w-5" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
