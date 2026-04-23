import { AdminShell } from "@/components/admin/admin-shell"
import { AdminListings } from "@/components/admin/admin-listings"
import { DbStatusBanner } from "@/components/admin/db-status-banner"
import { listCars } from "@/lib/cars-server"

export const metadata = { title: "Listings" }
export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const cars = await listCars({ status: "all", limit: 200 })
  return (
    <AdminShell>
      <DbStatusBanner />
      <AdminListings initialCars={cars} />
    </AdminShell>
  )
}
