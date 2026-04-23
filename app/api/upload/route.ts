import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export const runtime = "nodejs"

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: "Invalid form data." }, { status: 400 })

  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 })
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Unsupported file type. Allowed: JPEG, PNG, WebP, AVIF, MP4, WebM, MOV." },
      { status: 400 },
    )
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "Image exceeds 10 MB limit." }, { status: 400 })
  }
  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return NextResponse.json({ error: "Video exceeds 100 MB limit." }, { status: 400 })
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const pathname = `cars/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`

  // If Vercel Blob is configured, use it
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(pathname, file, {
        access: "public",
        addRandomSuffix: false,
        contentType: file.type,
      })

      return NextResponse.json({
        url: blob.url,
        type: isImage ? "image" : "video",
        name: file.name,
        size: file.size,
      })
    } catch (error: any) {
      return NextResponse.json({ error: `Vercel Blob upload failed: ${error.message}` }, { status: 500 })
    }
  }

  // Fallback: Local Uploads (for local development)
  try {
    const { writeFile, mkdir } = await import("fs/promises")
    const { join } = await import("path")
    const { existsSync } = await import("fs")
    
    const uploadDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    const fileName = `${Date.now()}-${safeName}`
    const filePath = join(uploadDir, fileName)
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    return NextResponse.json({
      url: `/uploads/${fileName}`,
      type: isImage ? "image" : "video",
      name: file.name,
      size: file.size,
    })
  } catch (error: any) {
    return NextResponse.json({ error: `Local upload failed: ${error.message}` }, { status: 500 })
  }
}
