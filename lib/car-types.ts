import type { ObjectId } from "mongodb"

export type CarStatus = "available" | "reserved" | "sold"
export type FuelType = "petrol" | "diesel" | "hybrid" | "electric" | "lpg"
export type Transmission = "manual" | "automatic" | "semi-automatic"
export type BodyType =
  | "sedan"
  | "suv"
  | "hatchback"
  | "coupe"
  | "convertible"
  | "wagon"
  | "van"
  | "pickup"

export interface CarMedia {
  url: string
  type: "image" | "video"
  /** Original filename, useful when displaying/deleting. */
  name?: string
}

/** Document stored in MongoDB. */
export interface CarDoc {
  _id?: ObjectId
  make: string
  model: string
  year: number
  price: number // in euros
  mileage: number // in km
  fuel: FuelType
  transmission: Transmission
  bodyType: BodyType
  power: number // horsepower
  engineSize?: number // in liters
  color: string
  vin?: string
  location: string // e.g. "Berlin, Germany"
  description: string
  features: string[]
  media: CarMedia[]
  status: CarStatus
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

/** Serialised version safe to pass to client components. */
export interface Car extends Omit<CarDoc, "_id" | "createdAt" | "updatedAt"> {
  id: string
  createdAt: string
  updatedAt: string
}

export function serialiseCar(doc: CarDoc): Car {
  const { _id, createdAt, updatedAt, ...rest } = doc
  return {
    ...rest,
    id: _id ? _id.toString() : "",
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  }
}

export const FUEL_TYPES: FuelType[] = ["petrol", "diesel", "hybrid", "electric", "lpg"]
export const TRANSMISSIONS: Transmission[] = ["manual", "automatic", "semi-automatic"]
export const BODY_TYPES: BodyType[] = [
  "sedan",
  "suv",
  "hatchback",
  "coupe",
  "convertible",
  "wagon",
  "van",
  "pickup",
]
export const CAR_STATUSES: CarStatus[] = ["available", "reserved", "sold"]

export interface CarInput {
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuel: FuelType
  transmission: Transmission
  bodyType: BodyType
  power: number
  engineSize?: number
  color: string
  vin?: string
  location: string
  description: string
  features: string[]
  media: CarMedia[]
  status: CarStatus
  featured: boolean
}

export function validateCarInput(input: unknown): { ok: true; value: CarInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid payload" }
  const i = input as Record<string, unknown>

  const requireStr = (k: string, max = 200) => {
    const v = i[k]
    if (typeof v !== "string" || v.trim().length === 0) return `Field "${k}" is required.`
    if (v.length > max) return `Field "${k}" too long.`
    return null
  }
  const requireNum = (k: string, min = 0, max = 10_000_000) => {
    const v = Number(i[k])
    if (!Number.isFinite(v) || v < min || v > max) return `Field "${k}" must be a number between ${min} and ${max}.`
    return null
  }

  const errors = [
    requireStr("make", 80),
    requireStr("model", 120),
    requireNum("year", 1900, new Date().getFullYear() + 1),
    requireNum("price", 0, 10_000_000),
    requireNum("mileage", 0, 2_000_000),
    requireNum("power", 0, 3000),
    requireStr("color", 60),
    requireStr("location", 160),
    requireStr("description", 10_000),
  ].filter(Boolean) as string[]

  if (errors.length) return { ok: false, error: errors[0]! }

  if (!FUEL_TYPES.includes(i.fuel as FuelType)) return { ok: false, error: "Invalid fuel type." }
  if (!TRANSMISSIONS.includes(i.transmission as Transmission))
    return { ok: false, error: "Invalid transmission." }
  if (!BODY_TYPES.includes(i.bodyType as BodyType)) return { ok: false, error: "Invalid body type." }
  if (!CAR_STATUSES.includes(i.status as CarStatus)) return { ok: false, error: "Invalid status." }

  const features = Array.isArray(i.features) ? (i.features as unknown[]).filter((f) => typeof f === "string") : []
  const media = Array.isArray(i.media)
    ? (i.media as unknown[]).filter((m): m is CarMedia => {
        if (!m || typeof m !== "object") return false
        const mm = m as Record<string, unknown>
        return (
          typeof mm.url === "string" &&
          (mm.type === "image" || mm.type === "video") &&
          (mm.url.startsWith("http") || mm.url.startsWith("/"))
        )
      })
    : []

  const engineSize = i.engineSize === undefined || i.engineSize === "" ? undefined : Number(i.engineSize)
  if (engineSize !== undefined && (!Number.isFinite(engineSize) || engineSize < 0 || engineSize > 12)) {
    return { ok: false, error: "Invalid engine size." }
  }

  return {
    ok: true,
    value: {
      make: String(i.make).trim(),
      model: String(i.model).trim(),
      year: Number(i.year),
      price: Number(i.price),
      mileage: Number(i.mileage),
      fuel: i.fuel as FuelType,
      transmission: i.transmission as Transmission,
      bodyType: i.bodyType as BodyType,
      power: Number(i.power),
      engineSize,
      color: String(i.color).trim(),
      vin: typeof i.vin === "string" ? i.vin.trim() : undefined,
      location: String(i.location).trim(),
      description: String(i.description).trim(),
      features: features as string[],
      media,
      status: i.status as CarStatus,
      featured: Boolean(i.featured),
    },
  }
}
