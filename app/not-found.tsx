import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">404</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to home</Link>
        </Button>
      </main>
      <SiteFooter />
    </>
  )
}
