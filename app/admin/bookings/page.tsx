import { Metadata } from "next"
import { MessageSquare, Mail, Phone, Calendar } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { getBookingsCollection, describeMongoError } from "@/lib/mongodb"
import { serialiseBooking } from "@/lib/booking-types"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"

export const metadata: Metadata = {
  title: "Bookings - Admin",
}

export default async function BookingsPage() {
  let bookings = []
  let error: string | null = null

  try {
    const col = await getBookingsCollection()
    const docs = await col.find({}).sort({ createdAt: -1 }).limit(100).toArray()
    bookings = docs.map(serialiseBooking)
  } catch (err) {
    error = describeMongoError(err)
  }

  return (
    <AdminShell title="Bookings">
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No bookings yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Car Info */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Car
                  </p>
                  <p className="mt-1 font-serif font-semibold">
                    {booking.carDetails.year} {booking.carDetails.make} {booking.carDetails.model}
                  </p>
                  <p className="text-sm text-muted-foreground">{formatPrice(booking.carDetails.price)}</p>
                </div>

                {/* Customer Info */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Customer
                  </p>
                  <p className="mt-1 font-semibold">{booking.customerName}</p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <a href={`mailto:${booking.customerEmail}`} className="flex items-center gap-1 hover:text-foreground">
                      <Mail className="h-3 w-3" />
                      {booking.customerEmail}
                    </a>
                    <a href={`tel:${booking.customerPhone}`} className="flex items-center gap-1 hover:text-foreground">
                      <Phone className="h-3 w-3" />
                      {booking.customerPhone}
                    </a>
                  </div>
                </div>

                {/* Booking Type & Status */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Details
                  </p>
                  <div className="mt-1 space-y-2">
                    <Badge variant="outline" className="capitalize">
                      {booking.bookingType.replace("-", " ")}
                    </Badge>
                    <Badge
                      className={
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : booking.status === "confirmed"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : booking.status === "completed"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>

                {/* Message & Date */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Added
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                  {booking.message && (
                    <details className="mt-3 cursor-pointer">
                      <summary className="text-xs font-medium text-muted-foreground hover:text-foreground">
                        View message
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap rounded bg-secondary p-2 text-xs text-secondary-foreground">
                        {booking.message}
                      </p>
                    </details>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
