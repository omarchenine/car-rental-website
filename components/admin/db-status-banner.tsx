import { AlertTriangle } from "lucide-react"
import { getDbStatus } from "@/lib/mongodb"

export async function DbStatusBanner() {
  const status = await getDbStatus()
  if (status.ok) return null

  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold text-destructive">Database connection problem</p>
        <p className="text-foreground/80">{status.error}</p>
        <p className="text-foreground/60">
          Fix the value in Project Settings → Environment Variables, then reload this page.
          Listings, uploads, and stats will be unavailable until the database is reachable.
        </p>
      </div>
    </div>
  )
}
