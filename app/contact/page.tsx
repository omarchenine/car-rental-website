import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Mail, MapPin, Phone, Clock } from "lucide-react"

export const metadata = { title: "Contact" }

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Get in touch</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">
          {"We'd love to hear from you."}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {"Questions about a listing, a trade-in, or a specific search request? Reach out — a real person will get back to you, usually within a few hours."}
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <ContactItem
            icon={<Phone className="h-5 w-5" />}
            title="Phone"
            lines={[{ text: "+49 30 1234 5678", href: "tel:+493012345678" }]}
          />
          <ContactItem
            icon={<Mail className="h-5 w-5" />}
            title="Email"
            lines={[{ text: "hello@dcmotors.eu", href: "mailto:hello@dcmotors.eu" }]}
          />
          <ContactItem
            icon={<MapPin className="h-5 w-5" />}
            title="Showroom"
            lines={[{ text: "Hauptstraße 42, 10178 Berlin, Germany" }]}
          />
          <ContactItem
            icon={<Clock className="h-5 w-5" />}
            title="Opening hours"
            lines={[
              { text: "Mon – Fri: 09:00 – 19:00" },
              { text: "Saturday: 10:00 – 17:00" },
              { text: "Sunday: by appointment" },
            ]}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function ContactItem({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode
  title: string
  lines: { text: string; href?: string }[]
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        {icon}
      </span>
      <div>
        <h2 className="font-serif text-lg font-semibold">{title}</h2>
        <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
          {lines.map((l, i) =>
            l.href ? (
              <a key={i} href={l.href} className="block hover:text-foreground">
                {l.text}
              </a>
            ) : (
              <p key={i}>{l.text}</p>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
