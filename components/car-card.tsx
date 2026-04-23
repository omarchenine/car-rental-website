import Link from "next/link"
import Image from "next/image"
import { Fuel, Gauge, Settings2, Calendar } from "lucide-react"
import type { Car } from "@/lib/car-types"
import { formatMileage, formatPrice, capitalize } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CarCardProps {
  car: Car
  priority?: boolean
}

export function CarCard({ car, priority }: CarCardProps) {
  const cover = car.media.find((m) => m.type === "image")?.url
  const sold = car.status === "sold"
  const reserved = car.status === "reserved"

  return (
    <Link
      href={`/inventory/${car.id}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {cover ? (
          <Image
            src={cover}
            alt={`${car.year} ${car.make} ${car.model}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-105",
              sold && "opacity-75",
            )}
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {car.featured && !sold && (
            <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">Featured</Badge>
          )}
          {sold && <Badge className="bg-destructive text-destructive-foreground">Sold</Badge>}
          {reserved && <Badge className="bg-primary text-primary-foreground">Reserved</Badge>}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-semibold leading-tight text-foreground">
              {car.make} {car.model}
            </h3>
            <p className="text-xs text-muted-foreground">{car.location}</p>
          </div>
          <p className="shrink-0 font-serif text-lg font-semibold text-foreground">
            {formatPrice(car.price)}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <dt className="sr-only">Year</dt>
            <dd>{car.year}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <dt className="sr-only">Mileage</dt>
            <dd>{formatMileage(car.mileage)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <dt className="sr-only">Fuel</dt>
            <dd>{capitalize(car.fuel)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <dt className="sr-only">Transmission</dt>
            <dd>{capitalize(car.transmission)}</dd>
          </div>
        </dl>
      </div>
    </Link>
  )
}
