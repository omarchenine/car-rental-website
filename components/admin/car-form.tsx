"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MediaUploader } from "./media-uploader"
import {
  BODY_TYPES,
  CAR_STATUSES,
  FUEL_TYPES,
  TRANSMISSIONS,
  type Car,
  type CarInput,
} from "@/lib/car-types"
import { capitalize } from "@/lib/format"

interface Props {
  mode: "create" | "edit"
  car?: Car
}

function emptyState(): CarInput {
  return {
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuel: "petrol",
    transmission: "automatic",
    bodyType: "sedan",
    power: 0,
    engineSize: undefined,
    color: "",
    vin: "",
    location: "Lisbon, Portugal",
    description: "",
    features: [],
    media: [],
    status: "available",
    featured: false,
  }
}

export function CarForm({ mode, car }: Props) {
  const router = useRouter()
  const [state, setState] = useState<CarInput>(() =>
    car
      ? {
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price,
          mileage: car.mileage,
          fuel: car.fuel,
          transmission: car.transmission,
          bodyType: car.bodyType,
          power: car.power,
          engineSize: car.engineSize,
          color: car.color,
          vin: car.vin ?? "",
          location: car.location,
          description: car.description,
          features: car.features,
          media: car.media,
          status: car.status,
          featured: car.featured,
        }
      : emptyState(),
  )
  const [featuresText, setFeaturesText] = useState(state.features.join("\n"))
  const [saving, setSaving] = useState(false)

  function update<K extends keyof CarInput>(key: K, value: CarInput[K]) {
    setState((s) => ({ ...s, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload: CarInput = {
      ...state,
      features: featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    }
    try {
      const res = await fetch(mode === "create" ? "/api/cars" : `/api/cars/${car!.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Save failed.")
        return
      }
      toast.success(mode === "create" ? "Listing created." : "Listing updated.")
      router.push("/admin")
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      {/* Main details */}
      <div className="space-y-6 lg:col-span-2">
        <Card title="Vehicle">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Make">
              <Input
                value={state.make}
                onChange={(e) => update("make", e.target.value)}
                required
                placeholder="BMW"
              />
            </Field>
            <Field label="Model">
              <Input
                value={state.model}
                onChange={(e) => update("model", e.target.value)}
                required
                placeholder="M3 Competition"
              />
            </Field>
            <Field label="Year">
              <Input
                type="number"
                min={1900}
                max={new Date().getFullYear() + 1}
                value={state.year}
                onChange={(e) => update("year", Number(e.target.value))}
                required
              />
            </Field>
            <Field label="Price (€)">
              <Input
                type="number"
                min={0}
                step={100}
                value={state.price}
                onChange={(e) => update("price", Number(e.target.value))}
                required
              />
            </Field>
            <Field label="Mileage (km)">
              <Input
                type="number"
                min={0}
                value={state.mileage}
                onChange={(e) => update("mileage", Number(e.target.value))}
                required
              />
            </Field>
            <Field label="Colour">
              <Input
                value={state.color}
                onChange={(e) => update("color", e.target.value)}
                required
                placeholder="Alpine White"
              />
            </Field>
            <Field label="Body type">
              <Select value={state.bodyType} onValueChange={(v) => update("bodyType", v as CarInput["bodyType"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BODY_TYPES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {capitalize(b)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Fuel">
              <Select value={state.fuel} onValueChange={(v) => update("fuel", v as CarInput["fuel"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {capitalize(f)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Transmission">
              <Select
                value={state.transmission}
                onValueChange={(v) => update("transmission", v as CarInput["transmission"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSMISSIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {capitalize(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Power (hp)">
              <Input
                type="number"
                min={0}
                value={state.power}
                onChange={(e) => update("power", Number(e.target.value))}
                required
              />
            </Field>
            <Field label="Engine size (L, optional)">
              <Input
                type="number"
                step={0.1}
                min={0}
                max={12}
                value={state.engineSize ?? ""}
                onChange={(e) =>
                  update("engineSize", e.target.value === "" ? undefined : Number(e.target.value))
                }
              />
            </Field>
            <Field label="VIN (optional)">
              <Input
                value={state.vin ?? ""}
                onChange={(e) => update("vin", e.target.value)}
                placeholder="17 characters"
                maxLength={17}
              />
            </Field>
            <Field label="Location" className="sm:col-span-2">
              <Input
                value={state.location}
                onChange={(e) => update("location", e.target.value)}
                required
                placeholder="Berlin, Germany"
              />
            </Field>
          </div>
        </Card>

        <Card title="Description">
          <Textarea
            value={state.description}
            onChange={(e) => update("description", e.target.value)}
            required
            rows={8}
            placeholder="Full service history, single owner, non-smoker…"
          />
        </Card>

        <Card title="Equipment & features">
          <p className="mb-2 text-xs text-muted-foreground">One feature per line.</p>
          <Textarea
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            rows={8}
            placeholder={"Harman Kardon sound system\nHeated seats\nPanoramic roof"}
          />
        </Card>

        <Card title="Media">
          <MediaUploader value={state.media} onChange={(m) => update("media", m)} />
        </Card>
      </div>

      {/* Sidebar: status, featured, actions */}
      <aside className="space-y-6">
        <Card title="Publishing">
          <Field label="Status">
            <Select value={state.status} onValueChange={(v) => update("status", v as CarInput["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAR_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {capitalize(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="mt-4 flex items-center justify-between gap-4 rounded-md border border-border p-3">
            <div>
              <Label className="text-sm font-medium">Featured on home page</Label>
              <p className="text-xs text-muted-foreground">
                Highlight this car on the landing page.
              </p>
            </div>
            <Switch
              checked={state.featured}
              onCheckedChange={(v) => update("featured", Boolean(v))}
              aria-label="Featured"
            />
          </div>
        </Card>

        <div className="sticky top-6 flex flex-col gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving…
              </>
            ) : mode === "create" ? (
              "Create listing"
            ) : (
              "Save changes"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
            Cancel
          </Button>
        </div>
      </aside>
    </form>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-background p-5 shadow-sm">
      <h2 className="mb-4 font-serif text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}
