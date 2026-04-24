"use client"

import { useState } from "react"
import { MessageCircle, Phone, Mail, Loader2 } from "lucide-react"
import type { Car } from "@/lib/car-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const WHATSAPP_NUMBER = "+351931312841" // Your WhatsApp number

interface BookingFormProps {
  car: Car
}

export function BookingForm({ car }: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerLocation: "",
    bookingType: "inquiry" as const,
    message: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, bookingType: value as any }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Save booking to database
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car.id,
          carDetails: {
            make: car.make,
            model: car.model,
            year: car.year,
            price: car.price,
          },
          ...formData,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to save booking")
        return
      }

      // Redirect to WhatsApp with pre-filled message
      const whatsappMessage = encodeURIComponent(
        `Hello! I'm interested in booking a ${car.year} ${car.make} ${car.model}.\n\n` +
        `Booking Type: ${formData.bookingType.replace("-", " ")}\n` +
        `Name: ${formData.customerName}\n` +
        `Email: ${formData.customerEmail}\n` +
        `Phone: ${formData.customerPhone}\n` +
        `Location: ${formData.customerLocation}\n\n` +
        `Message: ${formData.message}`
      )

      window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`, "_blank")

      toast.success("Booking saved! Opening WhatsApp...")
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerLocation: "",
        bookingType: "inquiry",
        message: "",
      })
    } catch (error) {
      console.error("[v0] Booking error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-5">
      <p className="font-serif text-lg font-semibold">Book via WhatsApp</p>
      <p className="text-sm text-muted-foreground">
        Fill out the form and we&apos;ll contact you immediately via WhatsApp to discuss this car.
      </p>

      <div>
        <label htmlFor="customerName" className="block text-sm font-medium mb-1">
          Full Name *
        </label>
        <Input
          id="customerName"
          name="customerName"
          type="text"
          placeholder="Your full name"
          value={formData.customerName}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">
            Email *
          </label>
          <Input
            id="customerEmail"
            name="customerEmail"
            type="email"
            placeholder="your@email.com"
            value={formData.customerEmail}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">
            Phone *
          </label>
          <Input
            id="customerPhone"
            name="customerPhone"
            type="tel"
            placeholder="+351 912 345 678"
            value={formData.customerPhone}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="customerLocation" className="block text-sm font-medium mb-1">
          Location / City *
        </label>
        <Input
          id="customerLocation"
          name="customerLocation"
          type="text"
          placeholder="e.g., Lisbon, Porto, or your city"
          value={formData.customerLocation}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="bookingType" className="block text-sm font-medium mb-1">
          What are you interested in? *
        </label>
        <Select value={formData.bookingType} onValueChange={handleSelectChange} disabled={isLoading}>
          <SelectTrigger id="bookingType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inquiry">General Inquiry</SelectItem>
            <SelectItem value="test-drive">Test Drive</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
            <SelectItem value="delivery-quote">Delivery Quote</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          Additional Message
        </label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us more about your interest or any specific questions..."
          value={formData.message}
          onChange={handleInputChange}
          rows={4}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Booking...
          </>
        ) : (
          <>
            <MessageCircle className="mr-2 h-4 w-4" />
            Book via WhatsApp
          </>
        )}
      </Button>

      <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          WhatsApp: <span className="font-medium">+351 931 312 841</span>
        </p>
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Alternative: Use the email button below
        </p>
      </div>
    </form>
  )
}
