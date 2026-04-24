import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ShieldCheck, Sparkles, Wrench, Globe2 } from "lucide-react"

export const metadata = { title: "About" }

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Our story</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">
          A family dealership, built on trust.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          DCMotors was founded with a simple idea: buying a premium car should be
          transparent, personal and enjoyable. We hand-pick every vehicle, inspect it
          end-to-end, and stand behind it long after the keys change hands.
        </p>

        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src="/about-showroom.jpg"
            alt="DCMotors showroom"
            fill
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover"
            priority
          />
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-2">
          <Value
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Inspected to the last bolt"
            body="Every car undergoes a thorough mechanical, electronic, and cosmetic inspection. We only sell what we'd drive ourselves."
          />
          <Value
            icon={<Sparkles className="h-5 w-5" />}
            title="Curated, not cluttered"
            body="We'd rather offer 30 excellent cars than 300 average ones. Quality and transparency over quantity — always."
          />
          <Value
            icon={<Wrench className="h-5 w-5" />}
            title="Real aftercare"
            body="Service, warranty extensions, and an honest phone call when you need advice. We play the long game."
          />
          <Value
            icon={<Globe2 className="h-5 w-5" />}
            title="Portugal delivery"
            body="Based in Lisbon, we deliver across Portugal with full paperwork, transport, and registration support."
          />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function Value({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        {icon}
      </span>
      <div>
        <h2 className="font-serif text-xl font-semibold">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}
