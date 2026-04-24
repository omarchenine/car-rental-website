import type { ObjectId } from "mongodb"

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled"
export type BookingType = "inquiry" | "test-drive" | "inspection" | "delivery-quote"

export interface BookingDoc {
  _id?: ObjectId
  carId: string
  carDetails: {
    make: string
    model: string
    year: number
    price: number
  }
  customerName: string
  customerEmail: string
  customerPhone: string
  bookingType: BookingType
  message: string
  status: BookingStatus
  sentViaWhatsApp: boolean
  whatsAppNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface Booking extends Omit<BookingDoc, "_id" | "createdAt" | "updatedAt"> {
  id: string
  createdAt: string
  updatedAt: string
}

export function serialiseBooking(doc: BookingDoc): Booking {
  const { _id, createdAt, updatedAt, ...rest } = doc
  return {
    ...rest,
    id: _id ? _id.toString() : "",
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  }
}

export interface BookingInput {
  carId: string
  carDetails: {
    make: string
    model: string
    year: number
    price: number
  }
  customerName: string
  customerEmail: string
  customerPhone: string
  bookingType: BookingType
  message: string
}

export function validateBookingInput(input: unknown): { ok: true; value: BookingInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid payload" }
  const i = input as Record<string, unknown>

  const requireStr = (k: string, max = 500) => {
    const v = i[k]
    if (typeof v !== "string" || v.trim().length === 0) return `Field "${k}" is required.`
    if (v.length > max) return `Field "${k}" too long.`
    return null
  }

  const errors = [
    requireStr("carId", 100),
    requireStr("customerName", 100),
    requireStr("customerEmail", 255),
    requireStr("customerPhone", 20),
    requireStr("bookingType", 50),
    requireStr("message", 1000),
  ].filter(Boolean) as string[]

  if (errors.length) return { ok: false, error: errors[0]! }

  const validBookingTypes: BookingType[] = ["inquiry", "test-drive", "inspection", "delivery-quote"]
  if (!validBookingTypes.includes(i.bookingType as BookingType)) {
    return { ok: false, error: "Invalid booking type." }
  }

  const carDetails = i.carDetails
  if (!carDetails || typeof carDetails !== "object") {
    return { ok: false, error: "Car details are required." }
  }
  const cd = carDetails as Record<string, unknown>
  if (typeof cd.make !== "string" || typeof cd.model !== "string" || typeof cd.year !== "number" || typeof cd.price !== "number") {
    return { ok: false, error: "Invalid car details." }
  }

  return {
    ok: true,
    value: {
      carId: String(i.carId).trim(),
      customerName: String(i.customerName).trim(),
      customerEmail: String(i.customerEmail).trim(),
      customerPhone: String(i.customerPhone).trim(),
      bookingType: i.bookingType as BookingType,
      message: String(i.message).trim(),
      carDetails: {
        make: String(cd.make).trim(),
        model: String(cd.model).trim(),
        year: Number(cd.year),
        price: Number(cd.price),
      },
    },
  }
}
