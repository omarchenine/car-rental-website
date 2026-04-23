import { NextResponse } from "next/server"
import { getCarsCollection, describeMongoError } from "@/lib/mongodb"
import { serialiseCar, validateCarInput, type CarDoc, type CarStatus } from "@/lib/car-types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  try {
    const col = await getCarsCollection()

    const filter: Record<string, unknown> = {}
    const status = searchParams.get("status")
    if (status && ["available", "reserved", "sold"].includes(status)) {
      filter.status = status as CarStatus
    }
    const make = searchParams.get("make")
    if (make) filter.make = { $regex: `^${escapeRegex(make)}$`, $options: "i" }

    const bodyType = searchParams.get("bodyType")
    if (bodyType) filter.bodyType = bodyType

    const fuel = searchParams.get("fuel")
    if (fuel) filter.fuel = fuel

    const transmission = searchParams.get("transmission")
    if (transmission) filter.transmission = transmission

    const minPrice = Number(searchParams.get("minPrice"))
    const maxPrice = Number(searchParams.get("maxPrice"))
    if (Number.isFinite(minPrice) && minPrice > 0) {
      filter.price = { ...(filter.price as object), $gte: minPrice }
    }
    if (Number.isFinite(maxPrice) && maxPrice > 0) {
      filter.price = { ...(filter.price as object), $lte: maxPrice }
    }

    const minYear = Number(searchParams.get("minYear"))
    const maxYear = Number(searchParams.get("maxYear"))
    if (Number.isFinite(minYear) && minYear > 0) {
      filter.year = { ...(filter.year as object), $gte: minYear }
    }
    if (Number.isFinite(maxYear) && maxYear > 0) {
      filter.year = { ...(filter.year as object), $lte: maxYear }
    }

    const featured = searchParams.get("featured")
    if (featured === "true") filter.featured = true

    const q = searchParams.get("q")
    if (q) {
      const rx = { $regex: escapeRegex(q), $options: "i" }
      filter.$or = [{ make: rx }, { model: rx }, { description: rx }, { color: rx }, { location: rx }]
    }

    const limit = Math.min(Number(searchParams.get("limit")) || 60, 200)
    const sort = searchParams.get("sort") || "newest"
    const sortSpec: Record<string, 1 | -1> =
      sort === "price-asc"
        ? { price: 1 }
        : sort === "price-desc"
          ? { price: -1 }
          : sort === "year-desc"
            ? { year: -1 }
            : sort === "mileage-asc"
              ? { mileage: 1 }
              : { featured: -1, createdAt: -1 }

    const docs = await col.find(filter).sort(sortSpec).limit(limit).toArray()
    return NextResponse.json({ cars: docs.map(serialiseCar) })
  } catch (err) {
    const message = describeMongoError(err)
    console.log("[v0] /api/cars GET DB error:", message)
    // Keep the UI responsive — return an empty list plus a soft error flag.
    return NextResponse.json({ cars: [], dbError: message })
  }
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const validated = validateCarInput(body)
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 })

  try {
    const col = await getCarsCollection()
    const now = new Date()
    const doc: CarDoc = {
      ...validated.value,
      createdAt: now,
      updatedAt: now,
    }
    const result = await col.insertOne(doc)
    return NextResponse.json({ car: serialiseCar({ ...doc, _id: result.insertedId }) }, { status: 201 })
  } catch (err) {
    const message = describeMongoError(err)
    console.log("[v0] /api/cars POST DB error:", message)
    return NextResponse.json({ error: message }, { status: 503 })
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
