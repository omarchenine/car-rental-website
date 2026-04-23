import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CarCard } from "@/components/car-card"
import { InventoryFilters } from "@/components/inventory-filters"
import { getCarsCollection, describeMongoError } from "@/lib/mongodb"
import { serialiseCar, type CarStatus, type Car } from "@/lib/car-types"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function pick(sp: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const v = sp[key]
  if (Array.isArray(v)) return v[0]
  return v
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function loadInventory(
  sp: Record<string, string | string[] | undefined>,
): Promise<{ cars: Car[]; makes: string[]; error: string | null }> {
  try {
    const col = await getCarsCollection()

    const filter: Record<string, unknown> = {}
    const statusParam = pick(sp, "status")
    if (statusParam && ["available", "reserved", "sold"].includes(statusParam)) {
      filter.status = statusParam as CarStatus
    } else {
      filter.status = { $in: ["available", "reserved"] as CarStatus[] }
    }

    const make = pick(sp, "make")
    if (make) filter.make = { $regex: `^${escapeRegex(make)}$`, $options: "i" }

    const bodyType = pick(sp, "bodyType")
    if (bodyType) filter.bodyType = bodyType
    const fuel = pick(sp, "fuel")
    if (fuel) filter.fuel = fuel
    const transmission = pick(sp, "transmission")
    if (transmission) filter.transmission = transmission

    const minPrice = Number(pick(sp, "minPrice"))
    const maxPrice = Number(pick(sp, "maxPrice"))
    if (Number.isFinite(minPrice) && minPrice > 0) {
      filter.price = { ...(filter.price as object), $gte: minPrice }
    }
    if (Number.isFinite(maxPrice) && maxPrice > 0) {
      filter.price = { ...(filter.price as object), $lte: maxPrice }
    }
    const minYear = Number(pick(sp, "minYear"))
    const maxYear = Number(pick(sp, "maxYear"))
    if (Number.isFinite(minYear) && minYear > 0) {
      filter.year = { ...(filter.year as object), $gte: minYear }
    }
    if (Number.isFinite(maxYear) && maxYear > 0) {
      filter.year = { ...(filter.year as object), $lte: maxYear }
    }

    const q = pick(sp, "q")
    if (q) {
      const rx = { $regex: escapeRegex(q), $options: "i" }
      filter.$or = [{ make: rx }, { model: rx }, { description: rx }, { color: rx }, { location: rx }]
    }

    const sort = pick(sp, "sort") || "newest"
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

    const [docs, makes] = await Promise.all([
      col.find(filter).sort(sortSpec).limit(120).toArray(),
      col.distinct("make"),
    ])
    return { cars: docs.map(serialiseCar), makes: makes.sort(), error: null }
  } catch (err) {
    const msg = describeMongoError(err)
    console.log("[v0] InventoryPage falling back to empty state:", msg)
    return { cars: [], makes: [], error: msg }
  }
}

export default async function InventoryPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const { cars, makes } = await loadInventory(sp)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-3 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Inventory</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Available cars</h1>
            <p className="mt-2 text-muted-foreground">
              {cars.length} {cars.length === 1 ? "vehicle" : "vehicles"} matching your criteria.
            </p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <InventoryFilters makes={makes} />
          </aside>

          <section>
            {cars.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
                <p className="font-serif text-xl">No cars match those filters.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try broadening your search or reset the filters.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {cars.map((car, i) => (
                  <CarCard key={car.id} car={car} priority={i < 3} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
