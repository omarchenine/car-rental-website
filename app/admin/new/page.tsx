import { AdminShell } from "@/components/admin/admin-shell"
import { CarForm } from "@/components/admin/car-form"

export const metadata = { title: "Add car" }

export default function AdminNewCarPage() {
  return (
    <AdminShell>
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-semibold">Add a new car</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details, upload media, and publish when ready.
        </p>
      </header>
      <CarForm mode="create" />
    </AdminShell>
  )
}
