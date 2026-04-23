"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Pencil, Trash2, Star, StarOff, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import type { Car, CarStatus } from "@/lib/car-types"
import { CAR_STATUSES } from "@/lib/car-types"
import { capitalize, formatMileage, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const KEY = "/api/cars?limit=200"

export function AdminListings({ initialCars }: { initialCars: Car[] }) {
  const { data } = useSWR<{ cars: Car[] }>(KEY, fetcher, {
    fallbackData: { cars: initialCars },
    revalidateOnFocus: false,
  })
  const cars = data?.cars ?? []

  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | CarStatus>("all")

  const filtered = cars.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    if (!q) return true
    const s = q.toLowerCase()
    return (
      c.make.toLowerCase().includes(s) ||
      c.model.toLowerCase().includes(s) ||
      c.color.toLowerCase().includes(s) ||
      c.location.toLowerCase().includes(s)
    )
  })

  async function patchCar(id: string, patch: Partial<{ status: CarStatus; featured: boolean }>) {
    const optimistic = cars.map((c) => (c.id === id ? { ...c, ...patch } : c))
    mutate(KEY, { cars: optimistic }, { revalidate: false })
    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Update failed")
      toast.success("Listing updated.")
      mutate(KEY)
    } catch (err) {
      toast.error((err as Error).message)
      mutate(KEY)
    }
  }

  async function deleteCar(id: string) {
    const optimistic = cars.filter((c) => c.id !== id)
    mutate(KEY, { cars: optimistic }, { revalidate: false })
    try {
      const res = await fetch(`/api/cars/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Delete failed")
      toast.success("Listing deleted.")
      mutate(KEY)
    } catch (err) {
      toast.error((err as Error).message)
      mutate(KEY)
    }
  }

  const stats = {
    total: cars.length,
    available: cars.filter((c) => c.status === "available").length,
    reserved: cars.filter((c) => c.status === "reserved").length,
    sold: cars.filter((c) => c.status === "sold").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.total} total · {stats.available} available · {stats.reserved} reserved ·{" "}
            {stats.sold} sold
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add car
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search listings…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | CarStatus)}>
          <SelectTrigger className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {CAR_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {capitalize(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Empty className="bg-card">
          <EmptyHeader>
            <EmptyTitle>No listings yet</EmptyTitle>
            <EmptyDescription>
              {cars.length === 0
                ? "Add your first car to get started."
                : "No listings match the current filters."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/admin/new">
                <Plus className="mr-1.5 h-4 w-4" /> Add car
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Image</TableHead>
                <TableHead>Car</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden lg:table-cell">Mileage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-0">Featured</TableHead>
                <TableHead className="w-0 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((car) => {
                const cover = car.media.find((m) => m.type === "image")?.url
                return (
                  <TableRow key={car.id}>
                    <TableCell>
                      <div className="relative h-12 w-16 overflow-hidden rounded bg-secondary">
                        {cover && (
                          <Image src={cover} alt="" fill sizes="64px" className="object-cover" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {car.year} {car.make} {car.model}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {capitalize(car.color)} · {capitalize(car.bodyType)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-medium">
                      {formatPrice(car.price)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatMileage(car.mileage)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={car.status}
                        onValueChange={(v) => patchCar(car.id, { status: v as CarStatus })}
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue>
                            <Badge
                              variant="outline"
                              className={cn(
                                "border-0",
                                car.status === "available" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                                car.status === "reserved" && "bg-primary/10 text-primary",
                                car.status === "sold" && "bg-destructive/15 text-destructive",
                              )}
                            >
                              {capitalize(car.status)}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {CAR_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {capitalize(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => patchCar(car.id, { featured: !car.featured })}
                        aria-label={car.featured ? "Unfeature" : "Feature"}
                        aria-pressed={car.featured}
                      >
                        {car.featured ? (
                          <Star className="h-4 w-4 fill-accent text-accent" />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild size="icon" variant="ghost" aria-label="Edit">
                          <Link href={`/admin/${car.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" aria-label="Delete">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove the {car.year} {car.make} {car.model}
                                {" "}from your inventory. Uploaded media is not deleted automatically.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCar(car.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
