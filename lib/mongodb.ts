import { MongoClient, type Db, type Collection } from "mongodb"
import type { CarDoc } from "./car-types"
import type { BookingDoc } from "./booking-types"
import type { AdminUser } from "./admin-types"

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 8_000,
  connectTimeoutMS: 8_000,
}

// Reuse the client across hot reloads in dev and across invocations in prod.
// We cache the PROMISE, and reset it if it rejects so a later retry can reconnect
// after the operator fixes credentials/network (no dev-server restart required).
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function createClientPromise(): Promise<MongoClient> {
  let uri = process.env.MONGODB_URI
  if (!uri) {
    return Promise.reject(
      new Error(
        "MONGODB_URI environment variable is not set. Add it in Project Settings → Environment Variables.",
      ),
    )
  }
  
  // Handle case where env variable has key=value format
  if (uri.includes("MONGODB_URI=")) {
    uri = uri.replace("MONGODB_URI=", "")
  }
  
  const p = new MongoClient(uri, options).connect()
  // If this attempt fails, clear the cache so the next call can try again.
  p.catch(() => {
    if (global._mongoClientPromise === p) global._mongoClientPromise = undefined
  })
  return p
}

function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise()
  }
  return global._mongoClientPromise
}

/** Returns a helpful message for known Mongo failure modes. */
export function describeMongoError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  if (/bad auth|authentication failed/i.test(raw)) {
    return "MongoDB rejected the credentials. Check the username and password inside MONGODB_URI (make sure any '<password>' placeholder is replaced and the DB user has access)."
  }
  if (/ENOTFOUND|getaddrinfo|ECONN/i.test(raw)) {
    return "Could not reach the MongoDB cluster. Verify the host in MONGODB_URI and that your IP is allowed in the cluster's Network Access list."
  }
  if (/MONGODB_URI environment variable/i.test(raw)) {
    return raw
  }
  return `MongoDB error: ${raw}`
}

export async function getDb(): Promise<Db> {
  try {
    const client = await getClientPromise()
    return client.db("dealership")
  } catch (err) {
    const friendly = describeMongoError(err)
    console.log("[v0] MongoDB connection failed:", friendly)
    throw new Error(friendly)
  }
}

export async function getCarsCollection(): Promise<Collection<CarDoc>> {
  const db = await getDb()
  const col = db.collection<CarDoc>("cars")
  // Fire-and-forget: never let index creation races or perms block reads.
  void Promise.all([
    col.createIndex({ createdAt: -1 }),
    col.createIndex({ status: 1 }),
    col.createIndex({ make: 1, model: 1 }),
    col.createIndex({ featured: -1, createdAt: -1 }),
  ]).catch(() => {})
  return col
}

export async function getBookingsCollection(): Promise<Collection<BookingDoc>> {
  const db = await getDb()
  const col = db.collection<BookingDoc>("bookings")
  // Fire-and-forget: never let index creation races or perms block reads.
  void Promise.all([
    col.createIndex({ createdAt: -1 }),
    col.createIndex({ carId: 1 }),
    col.createIndex({ customerEmail: 1 }),
    col.createIndex({ status: 1 }),
  ]).catch(() => {})
  return col
}

export async function getAdminUsersCollection(): Promise<Collection<AdminUser>> {
  const db = await getDb()
  const col = db.collection<AdminUser>("adminUsers")
  // Fire-and-forget: never let index creation races or perms block reads.
  void Promise.all([
    col.createIndex({ email: 1 }, { unique: true }),
    col.createIndex({ verificationToken: 1 }),
    col.createIndex({ resetToken: 1 }),
    col.createIndex({ createdAt: -1 }),
  ]).catch(() => {})
  return col
}

/** Lightweight health check for admin UI — never throws. */
export async function getDbStatus(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const client = await getClientPromise()
    await client.db("dealership").command({ ping: 1 })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: describeMongoError(err) }
  }
}
