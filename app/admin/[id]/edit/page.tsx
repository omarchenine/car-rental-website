import { notFound } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { CarForm } from "@/components/admin/car-form"
import { getCar } from "@/lib/cars-server"

export const metadata = { title: "Edit listing" }
export const dynamic = "force-dynamic"

export default async function AdminEditCarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const car = await getCar(id)
  if (!car) notFound()

  return (
    <AdminShell>
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-semibold">
          Edit {car.year} {car.make} {car.model}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Update details and media.</p>
      </header>
      <CarForm mode="edit" car={car} />
    </AdminShell>
  )
}
