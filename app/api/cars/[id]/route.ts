import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getCarsCollection, describeMongoError } from "@/lib/mongodb"
import { serialiseCar, validateCarInput, CAR_STATUSES, type CarStatus } from "@/lib/car-types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function parseId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) return null
  return new ObjectId(id)
}

function dbErrorResponse(err: unknown, where: string) {
  const message = describeMongoError(err)
  console.log(`[v0] ${where} DB error:`, message)
  return NextResponse.json({ error: message }, { status: 503 })
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const oid = parseId(id)
  if (!oid) return NextResponse.json({ error: "Invalid id." }, { status: 400 })

  try {
    const col = await getCarsCollection()
    const doc = await col.findOne({ _id: oid })
    if (!doc) return NextResponse.json({ error: "Not found." }, { status: 404 })
    return NextResponse.json({ car: serialiseCar(doc) })
  } catch (err) {
    return dbErrorResponse(err, "GET /api/cars/[id]")
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const oid = parseId(id)
  if (!oid) return NextResponse.json({ error: "Invalid id." }, { status: 400 })

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
    const result = await col.findOneAndUpdate(
      { _id: oid },
      { $set: { ...validated.value, updatedAt: now } },
      { returnDocument: "after" },
    )
    if (!result) return NextResponse.json({ error: "Not found." }, { status: 404 })
    return NextResponse.json({ car: serialiseCar(result) })
  } catch (err) {
    return dbErrorResponse(err, "PUT /api/cars/[id]")
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const oid = parseId(id)
  if (!oid) return NextResponse.json({ error: "Invalid id." }, { status: 400 })

  let body: { status?: string; featured?: boolean }
  try {
    body = (await req.json()) as { status?: string; featured?: boolean }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const update: Record<string, unknown> = { updatedAt: new Date() }
  if (body.status !== undefined) {
    if (!CAR_STATUSES.includes(body.status as CarStatus)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 })
    }
    update.status = body.status
  }
  if (body.featured !== undefined) {
    update.featured = Boolean(body.featured)
  }

  try {
    const col = await getCarsCollection()
    const result = await col.findOneAndUpdate({ _id: oid }, { $set: update }, { returnDocument: "after" })
    if (!result) return NextResponse.json({ error: "Not found." }, { status: 404 })
    return NextResponse.json({ car: serialiseCar(result) })
  } catch (err) {
    return dbErrorResponse(err, "PATCH /api/cars/[id]")
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const oid = parseId(id)
  if (!oid) return NextResponse.json({ error: "Invalid id." }, { status: 400 })

  try {
    const col = await getCarsCollection()
    const result = await col.deleteOne({ _id: oid })
    if (result.deletedCount === 0) return NextResponse.json({ error: "Not found." }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return dbErrorResponse(err, "DELETE /api/cars/[id]")
  }
}
