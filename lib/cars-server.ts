import { ObjectId } from "mongodb"
import { getCarsCollection, describeMongoError } from "./mongodb"
import { serialiseCar, type Car, type CarStatus } from "./car-types"

export interface ListCarsOptions {
  status?: CarStatus | "all"
  featured?: boolean
  limit?: number
  excludeId?: string
  bodyType?: string
}

function logDbError(where: string, err: unknown) {
  console.log(`[v0] ${where} falling back to empty result:`, describeMongoError(err))
}

export async function listCars(opts: ListCarsOptions = {}): Promise<Car[]> {
  try {
    const col = await getCarsCollection()
    const filter: Record<string, unknown> = {}
    if (opts.status && opts.status !== "all") filter.status = opts.status
    if (opts.featured) filter.featured = true
    if (opts.bodyType) filter.bodyType = opts.bodyType
    if (opts.excludeId && ObjectId.isValid(opts.excludeId)) {
      filter._id = { $ne: new ObjectId(opts.excludeId) }
    }
    const docs = await col
      .find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .limit(opts.limit ?? 60)
      .toArray()
    return docs.map(serialiseCar)
  } catch (err) {
    logDbError("listCars", err)
    return []
  }
}

export async function getCar(id: string): Promise<Car | null> {
  if (!ObjectId.isValid(id)) return null
  try {
    const col = await getCarsCollection()
    const doc = await col.findOne({ _id: new ObjectId(id) })
    return doc ? serialiseCar(doc) : null
  } catch (err) {
    logDbError("getCar", err)
    return null
  }
}

export async function getInventoryStats(): Promise<{
  total: number
  available: number
  sold: number
  makes: string[]
}> {
  try {
    const col = await getCarsCollection()
    const [total, available, sold, makes] = await Promise.all([
      col.countDocuments({}),
      col.countDocuments({ status: "available" }),
      col.countDocuments({ status: "sold" }),
      col.distinct("make"),
    ])
    return { total, available, sold, makes: makes.sort() }
  } catch (err) {
    logDbError("getInventoryStats", err)
    return { total: 0, available: 0, sold: 0, makes: [] }
  }
}

export async function listMakes(): Promise<string[]> {
  try {
    const col = await getCarsCollection()
    const makes = await col.distinct("make")
    return makes.sort()
  } catch (err) {
    logDbError("listMakes", err)
    return []
  }
}
