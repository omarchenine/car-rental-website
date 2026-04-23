"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS } from "@/lib/car-types"
import { capitalize } from "@/lib/format"

interface Props {
  makes: string[]
}

export function InventoryFilters({ makes }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const [q, setQ] = useState(params.get("q") ?? "")
  const [make, setMake] = useState(params.get("make") ?? "all")
  const [bodyType, setBodyType] = useState(params.get("bodyType") ?? "all")
  const [fuel, setFuel] = useState(params.get("fuel") ?? "all")
  const [transmission, setTransmission] = useState(params.get("transmission") ?? "all")
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "")
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "")
  const [minYear, setMinYear] = useState(params.get("minYear") ?? "")
  const [maxYear, setMaxYear] = useState(params.get("maxYear") ?? "")
  const [sort, setSort] = useState(params.get("sort") ?? "newest")

  function apply(e?: React.FormEvent) {
    e?.preventDefault()
    const usp = new URLSearchParams()
    if (q) usp.set("q", q)
    if (make !== "all") usp.set("make", make)
    if (bodyType !== "all") usp.set("bodyType", bodyType)
    if (fuel !== "all") usp.set("fuel", fuel)
    if (transmission !== "all") usp.set("transmission", transmission)
    if (minPrice) usp.set("minPrice", minPrice)
    if (maxPrice) usp.set("maxPrice", maxPrice)
    if (minYear) usp.set("minYear", minYear)
    if (maxYear) usp.set("maxYear", maxYear)
    if (sort !== "newest") usp.set("sort", sort)
    startTransition(() => {
      router.push(`/inventory${usp.toString() ? `?${usp.toString()}` : ""}`)
    })
  }

  function reset() {
    setQ("")
    setMake("all")
    setBodyType("all")
    setFuel("all")
    setTransmission("all")
    setMinPrice("")
    setMaxPrice("")
    setMinYear("")
    setMaxYear("")
    setSort("newest")
    startTransition(() => router.push("/inventory"))
  }

  return (
    <form onSubmit={apply} className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="q" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Search
          </Label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Make, model, colour…"
              className="pl-9"
            />
          </div>
        </div>

        <FilterSelect
          label="Make"
          value={make}
          onChange={setMake}
          options={[{ value: "all", label: "All makes" }, ...makes.map((m) => ({ value: m, label: m }))]}
        />
        <FilterSelect
          label="Body"
          value={bodyType}
          onChange={setBodyType}
          options={[
            { value: "all", label: "All bodies" },
            ...BODY_TYPES.map((b) => ({ value: b, label: capitalize(b) })),
          ]}
        />
        <FilterSelect
          label="Fuel"
          value={fuel}
          onChange={setFuel}
          options={[
            { value: "all", label: "All fuels" },
            ...FUEL_TYPES.map((f) => ({ value: f, label: capitalize(f) })),
          ]}
        />
        <FilterSelect
          label="Transmission"
          value={transmission}
          onChange={setTransmission}
          options={[
            { value: "all", label: "All transmissions" },
            ...TRANSMISSIONS.map((t) => ({ value: t, label: capitalize(t) })),
          ]}
        />

        <div>
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Price (€)
          </Label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Year
          </Label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={1900}
              placeholder="From"
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
            />
            <Input
              type="number"
              min={1900}
              placeholder="To"
              value={maxYear}
              onChange={(e) => setMaxYear(e.target.value)}
            />
          </div>
        </div>

        <FilterSelect
          label="Sort by"
          value={sort}
          onChange={setSort}
          options={[
            { value: "newest", label: "Newest arrivals" },
            { value: "price-asc", label: "Price: low to high" },
            { value: "price-desc", label: "Price: high to low" },
            { value: "year-desc", label: "Year: newest first" },
            { value: "mileage-asc", label: "Mileage: lowest first" },
          ]}
        />

        <div className="flex gap-2 pt-1">
          <Button type="submit" className="flex-1" disabled={pending}>
            Apply filters
          </Button>
          <Button type="button" variant="outline" onClick={reset} aria-label="Reset filters">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
