import { NextResponse } from "next/server"
import { getBookingsCollection, describeMongoError } from "@/lib/mongodb"
import { serialiseBooking, validateBookingInput, type BookingDoc } from "@/lib/booking-types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  try {
    const col = await getBookingsCollection()

    const filter: Record<string, unknown> = {}
    const carId = searchParams.get("carId")
    if (carId) filter.carId = carId

    const status = searchParams.get("status")
    if (status && ["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      filter.status = status
    }

    const limit = Math.min(Number(searchParams.get("limit")) || 100, 500)
    const docs = await col.find(filter).sort({ createdAt: -1 }).limit(limit).toArray()
    return NextResponse.json({ bookings: docs.map(serialiseBooking) })
  } catch (err) {
    const message = describeMongoError(err)
    console.log("[v0] /api/bookings GET DB error:", message)
    return NextResponse.json({ bookings: [], dbError: message })
  }
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const validated = validateBookingInput(body)
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 })

  try {
    const col = await getBookingsCollection()
    const now = new Date()
    const doc: BookingDoc = {
      ...validated.value,
      status: "pending",
      sentViaWhatsApp: false,
      createdAt: now,
      updatedAt: now,
    }
    const result = await col.insertOne(doc)
    return NextResponse.json({ booking: serialiseBooking({ ...doc, _id: result.insertedId }) }, { status: 201 })
  } catch (err) {
    const message = describeMongoError(err)
    console.log("[v0] /api/bookings POST DB error:", message)
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
