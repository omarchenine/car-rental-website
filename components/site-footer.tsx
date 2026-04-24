import Link from "next/link"
import { Car, Mail, Phone, MapPin, Lock } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Car className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-serif text-xl font-semibold">DCMotors</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/70">
            A premium car dealership. Every vehicle in our inventory is hand-selected,
            inspected, and prepared for its next journey.
          </p>
        </div>

        <div>
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-primary-foreground">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
            <li>
              <Link href="/inventory" className="hover:text-accent">
                Inventory
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-accent">
                About us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-accent">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-primary-foreground">
            Get in touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/70">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
              <span>Lisbon, Portugal</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
              <a href="tel:+351931312841" className="hover:text-accent">
                +351 931 312 841
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
              <a href="mailto:DCMotors@gmail.com" className="hover:text-accent">
                DCMotors@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} DCMotors. All rights reserved.</p>
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 rounded-md bg-primary-foreground/10 px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
          >
            <Lock className="h-3 w-3" />
            Staff Portal
          </Link>
        </div>
      </div>
    </footer>
  )
}
