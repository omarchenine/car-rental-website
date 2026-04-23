import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  ArrowLeft,
  Calendar,
  Fuel,
  Gauge,
  Palette,
  Settings2,
  MapPin,
  Zap,
  CircleCheck,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CarGallery } from "@/components/car-gallery"
import { CarCard } from "@/components/car-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getCar, listCars } from "@/lib/cars-server"
import { capitalize, formatMileage, formatPrice, formatNumber } from "@/lib/format"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const car = await getCar(id)
  if (!car) return { title: "Car not found" }
  return {
    title: `${car.year} ${car.make} ${car.model}`,
    description: car.description.slice(0, 160),
  }
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const car = await getCar(id)
  if (!car) notFound()

  const related = await listCars({
    status: "available",
    bodyType: car.bodyType,
    limit: 4,
    excludeId: car.id,
  })

  const sold = car.status === "sold"

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to inventory
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <CarGallery media={car.media} alt={`${car.year} ${car.make} ${car.model}`} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {car.featured && !sold && (
                <Badge className="bg-accent text-accent-foreground">Featured</Badge>
              )}
              {sold && <Badge className="bg-destructive text-destructive-foreground">Sold</Badge>}
              {car.status === "reserved" && (
                <Badge className="bg-primary text-primary-foreground">Reserved</Badge>
              )}
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {capitalize(car.bodyType)}
              </span>
            </div>

            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              {car.make} {car.model}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {car.location}
            </p>

            <p className="mt-6 font-serif text-4xl font-semibold">{formatPrice(car.price)}</p>

            <Separator className="my-6" />

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <SpecRow icon={<Calendar className="h-4 w-4" />} label="Year" value={String(car.year)} />
              <SpecRow
                icon={<Gauge className="h-4 w-4" />}
                label="Mileage"
                value={formatMileage(car.mileage)}
              />
              <SpecRow
                icon={<Fuel className="h-4 w-4" />}
                label="Fuel"
                value={capitalize(car.fuel)}
              />
              <SpecRow
                icon={<Settings2 className="h-4 w-4" />}
                label="Transmission"
                value={capitalize(car.transmission)}
              />
              <SpecRow
                icon={<Zap className="h-4 w-4" />}
                label="Power"
                value={`${formatNumber(car.power)} hp`}
              />
              {car.engineSize !== undefined && (
                <SpecRow
                  icon={<Settings2 className="h-4 w-4" />}
                  label="Engine"
                  value={`${car.engineSize.toFixed(1)} L`}
                />
              )}
              <SpecRow
                icon={<Palette className="h-4 w-4" />}
                label="Colour"
                value={capitalize(car.color)}
              />
              {car.vin && (
                <SpecRow
                  icon={<CircleCheck className="h-4 w-4" />}
                  label="VIN"
                  value={car.vin}
                />
              )}
            </dl>

            <Separator className="my-6" />

            <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
              <p className="font-serif text-lg font-semibold">Interested in this car?</p>
              <p className="text-sm text-muted-foreground">
                Reach out — we&apos;ll arrange an inspection, test drive, or delivery quote.
              </p>
              <div className="mt-2 flex flex-col gap-2">
                <Button asChild className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white" disabled={sold}>
                  <a
                    href={`https://wa.me/351931312841?text=${encodeURIComponent(
                      `Hi, I'm interested in booking the ${car.year} ${car.make} ${car.model}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Book via WhatsApp
                  </a>
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button asChild className="flex-1" disabled={sold}>
                    <a href="tel:+493012345678">
                      <Phone className="mr-2 h-4 w-4" />
                      Call us
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <a
                      href={`mailto:hello@monacomotors.eu?subject=${encodeURIComponent(
                        `Inquiry: ${car.year} ${car.make} ${car.model}`,
                      )}`}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email us
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="mt-14 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Description</h2>
            <div className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/90">
              {car.description}
            </div>
          </div>

          {car.features.length > 0 && (
            <div>
              <h2 className="font-serif text-2xl font-semibold">Equipment & features</h2>
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {car.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-serif text-2xl font-semibold">You may also like</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((c) => (
                <CarCard key={c.id} car={c} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}

function SpecRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        <span className="text-accent">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}
