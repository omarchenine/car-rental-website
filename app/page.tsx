import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShieldCheck, Sparkles, Wrench } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CarCard } from "@/components/car-card"
import { Button } from "@/components/ui/button"
import { listCars, getInventoryStats } from "@/lib/cars-server"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [featured, stats] = await Promise.all([
    listCars({ featured: true, status: "available", limit: 6 }),
    getInventoryStats(),
  ])

  const showcase = featured.length > 0 ? featured : await listCars({ status: "available", limit: 6 })

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/hero-car.jpg"
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-primary/20" />
          </div>

          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
            <div className="max-w-2xl text-primary-foreground">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                Curated European automotive
              </p>
              <h1 className="font-serif text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
                {"Drive the car you've been dreaming of."}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
                Monaco Motors brings you a hand-picked collection of premium European vehicles.
                Every car is inspected, certified, and ready for its next owner.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/inventory">
                    Browse inventory
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/contact">Get in touch</Link>
                </Button>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-primary-foreground/20 pt-6">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-primary-foreground/60">In stock</dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold">{stats.available}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-primary-foreground/60">Cars delivered</dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold">{stats.sold}+</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-primary-foreground/60">Brands</dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold">{stats.makes.length}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <FeatureItem
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Certified & inspected"
              description="Every vehicle passes a 120-point mechanical and cosmetic inspection before listing."
            />
            <FeatureItem
              icon={<Sparkles className="h-5 w-5" />}
              title="Hand-picked selection"
              description="We source only the finest examples — low-mileage, documented history, no surprises."
            />
            <FeatureItem
              icon={<Wrench className="h-5 w-5" />}
              title="Full aftercare"
              description={"Warranty, servicing, and European-wide delivery. We're with you after the sale."}
            />
          </div>
        </section>

        {/* Featured inventory */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Featured</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
                {"This week's highlights"}
              </h2>
            </div>
            <Link
              href="/inventory"
              className="hidden items-center gap-1 text-sm font-medium text-foreground hover:text-accent sm:inline-flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {showcase.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-16 text-center">
              <p className="text-muted-foreground">
                Inventory is being prepared. Check back soon or{" "}
                <Link href="/contact" className="font-medium text-foreground underline">
                  contact us
                </Link>{" "}
                directly.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((car, i) => (
                <CarCard key={car.id} car={car} priority={i < 3} />
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-secondary">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/about-showroom.jpg"
                alt="Monaco Motors showroom"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Looking for something specific?</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
                {"We'll source the car for you."}
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {"Tell us what you're looking for — a specific make, trim, colour or spec — and our team will scour the European market to find the right match within your budget."}
              </p>
              <Button asChild size="lg" className="mt-6">
                <Link href="/contact">Start a search request</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        {icon}
      </span>
      <div>
        <h3 className="font-serif text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
