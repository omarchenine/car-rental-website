# System Architecture - WhatsApp Booking Integration

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER SIDE                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │          Car Detail Page (/inventory/[id])                   │   │
│  │  • Car gallery, specs, price, description                    │   │
│  │  • Features list                                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │        Booking Form Component (booking-form.tsx)             │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │ Input Fields:                                          │  │   │
│  │  │ • Customer Name (required)                             │  │   │
│  │  │ • Customer Email (required)                            │  │   │
│  │  │ • Customer Phone (required)                            │  │   │
│  │  │ • Booking Type (inquiry/test-drive/etc)               │  │   │
│  │  │ • Message (optional)                                   │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │                       ↓                                        │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │ Validation (validateBookingInput)                      │  │   │
│  │  │ • Check all required fields present                    │  │   │
│  │  │ • Validate email format                                │  │   │
│  │  │ • Check field lengths                                  │  │   │
│  │  │ • Validate booking type enum                           │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ↓                                        │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/bookings
                              │ (application/json)
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND/API LAYER                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │        POST Endpoint: /api/bookings/route.ts                │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │ 1. Parse JSON body                                     │  │   │
│  │  │ 2. Validate using validateBookingInput()               │  │   │
│  │  │ 3. Handle validation errors with 400 response          │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │                       ↓                                        │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │ 4. Create BookingDoc object                            │  │   │
│  │  │    {                                                   │  │   │
│  │  │      carId, carDetails, customerName, etc.             │  │   │
│  │  │      status: "pending"                                 │  │   │
│  │  │      sentViaWhatsApp: false                            │  │   │
│  │  │      createdAt: new Date()                             │  │   │
│  │  │    }                                                   │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │                       ↓                                        │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │ 5. Insert into MongoDB                                 │  │   │
│  │  │    col.insertOne(doc)                                  │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │                       ↓                                        │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │ 6. Return serialized booking (201 Created)             │  │   │
│  │  │    {                                                   │  │   │
│  │  │      "booking": { id, carId, customerName, ... }       │  │   │
│  │  │    }                                                   │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ↓                                        │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Success Response (201)
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    CLIENT-SIDE HANDLING                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 1. Show success toast notification                          │   │
│  │ 2. Reset form fields                                        │   │
│  │ 3. Build WhatsApp message with customer details            │   │
│  │    Message format:                                          │   │
│  │    "Hello! I'm interested in booking a [car details]       │   │
│  │     Booking Type: [type]                                   │   │
│  │     Name: [name]                                           │   │
│  │     Email: [email]                                         │   │
│  │     Phone: [phone]                                         │   │
│  │     Message: [custom message]"                             │   │
│  │ 4. Open WhatsApp URL with pre-filled message               │   │
│  │    https://wa.me/351931312841?text=[encoded message]       │   │
│  │ 5. User's WhatsApp app opens with draft                    │   │
│  │ 6. Customer sends message to business                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE LAYER                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Database: "dealership"                                      │   │
│  │                                                              │   │
│  │ Collection: "bookings"                                       │   │
│  │ ┌────────────────────────────────────────────────────────┐  │   │
│  │ │ Documents stored with indexes:                         │  │   │
│  │ │ • _id (Primary, auto-generated)                        │  │   │
│  │ │ • carId (for filtering by car)                         │  │   │
│  │ │ • customerEmail (for finding customer bookings)        │  │   │
│  │ │ • status (for filtering by booking status)             │  │   │
│  │ │ • createdAt (for sorting by date)                      │  │   │
│  │ │                                                         │  │   │
│  │ │ Data Structure:                                         │  │   │
│  │ │ {                                                       │  │   │
│  │ │   _id: ObjectId,                                        │  │   │
│  │ │   carId: "63a4f...",                                    │  │   │
│  │ │   carDetails: {                                         │  │   │
│  │ │     make: "BMW", model: "X5", year: 2023, ...          │  │   │
│  │ │   },                                                    │  │   │
│  │ │   customerName: "John Doe",                             │  │   │
│  │ │   customerEmail: "john@example.com",                    │  │   │
│  │ │   customerPhone: "+351 912 345 678",                    │  │   │
│  │ │   bookingType: "test-drive",                            │  │   │
│  │ │   message: "Very interested...",                        │  │   │
│  │ │   status: "pending",                                    │  │   │
│  │ │   sentViaWhatsApp: false,                               │  │   │
│  │ │   createdAt: ISODate("2024-04-23T..."),                 │  │   │
│  │ │   updatedAt: ISODate("2024-04-23T...")                  │  │   │
│  │ │ }                                                       │  │   │
│  │ └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              ↑
                 Fetched by admin dashboard
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                      ADMIN INTERFACE                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │        Bookings Dashboard (/admin/bookings)                  │   │
│  │                                                              │   │
│  │  GET /api/bookings → Fetch all bookings                     │   │
│  │                                                              │   │
│  │  Displays:                                                   │   │
│  │  ├─ Customer Info (name, email, phone)                      │   │
│  │  ├─ Car Info (year, make, model, price)                     │   │
│  │  ├─ Booking Details (type, status, date)                    │   │
│  │  ├─ Customer Message (expandable)                           │   │
│  │  └─ Actions (click to email, call)                          │   │
│  │                                                              │   │
│  │  Features:                                                   │   │
│  │  ✓ Sorted by newest first                                   │   │
│  │  ✓ Status badges (pending, confirmed, etc)                 │   │
│  │  ✓ Click-to-contact links                                   │   │
│  │  ✓ Message preview with expandable details                  │   │
│  │  ✓ Card-based responsive layout                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
app/inventory/[id]/page.tsx
  ├─ SiteHeader
  ├─ CarGallery
  ├─ BookingForm (NEW) ← Main booking component
  │  ├─ Input fields
  │  ├─ Select dropdown
  │  ├─ Textarea
  │  └─ Submit button
  ├─ CarCard[] (related cars)
  └─ SiteFooter
```

## API Endpoints

### GET /api/bookings
```
Query Parameters:
  ?carId=XXX        - Filter by car ID
  ?status=pending   - Filter by status
  ?limit=50         - Limit results (max 500)

Response:
{
  "bookings": [
    {
      "id": "...",
      "carId": "...",
      "carDetails": {...},
      "customerName": "...",
      "customerEmail": "...",
      "customerPhone": "...",
      "bookingType": "...",
      "message": "...",
      "status": "...",
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601"
    }
  ]
}
```

### POST /api/bookings
```
Request:
{
  "carId": "string",
  "carDetails": {
    "make": "string",
    "model": "string",
    "year": number,
    "price": number
  },
  "customerName": "string",
  "customerEmail": "string",
  "customerPhone": "string",
  "bookingType": "inquiry|test-drive|inspection|delivery-quote",
  "message": "string"
}

Response (201):
{
  "booking": {
    "id": "...",
    ...
  }
}

Error (400/503):
{
  "error": "Error message"
}
```

## Data Validation Flow

```
Client Input
    ↓
validateBookingInput() [lib/booking-types.ts]
    ↓
    ├─ Check all fields present
    ├─ Check string lengths
    ├─ Validate email format
    ├─ Validate phone format
    ├─ Check booking type enum
    └─ Validate car details object
    ↓
Valid: { ok: true, value: BookingInput }
Invalid: { ok: false, error: "Error message" }
    ↓
API Response
    ├─ Valid → Save to DB → 201 Created
    └─ Invalid → 400 Bad Request
```

## Database Connection Pool

```
MongoDB Client
├─ Max Pool Size: 10
├─ Server Selection Timeout: 8 seconds
├─ Connect Timeout: 8 seconds
├─ Auto-reconnect on failure
└─ Reuse client across hot reloads
    ├─ Cache promise globally
    ├─ Reset on connection failure
    └─ Allow retry after fix
```

## Error Handling Strategy

```
Error Type          → Handler          → Response
────────────────────────────────────────────────
Invalid Input       → Validation fn.    → 400
DB Connection       → describeMongoError → 503
DB Auth Failed      → User message      → 503
Network Error       → User message      → 503
Unexpected Error    → Try-catch         → 500
```

## Security Architecture

```
Data Flow Security:
┌─────────────────────────────────────────────────┐
│ 1. Client-side validation (UX)                  │
│    • Email format check                         │
│    • Required field check                       │
│    • Character count limit                      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. Server-side validation (Security)            │
│    • Re-validate all inputs                     │
│    • Check field types and lengths              │
│    • Whitelist valid enum values                │
│    • Reject malformed requests                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. Database layer security                      │
│    • MongoDB connection via env var             │
│    • No credentials in code                     │
│    • Parameterized queries (no injection)       │
│    • Error messages don't leak info             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. Transport security                           │
│    • HTTPS only (production)                    │
│    • JSON payload with proper headers           │
│    • CORS configured if needed                  │
└─────────────────────────────────────────────────┘
```

## Type Safety

```
Interfaces Hierarchy:
├─ BookingDoc (MongoDB document)
│  ├─ _id: ObjectId (auto)
│  ├─ carId: string
│  ├─ carDetails: object
│  ├─ customerName: string
│  ├─ customerEmail: string
│  ├─ customerPhone: string
│  ├─ bookingType: enum
│  ├─ message: string
│  ├─ status: enum
│  ├─ createdAt: Date
│  └─ updatedAt: Date
│
├─ Booking (API response)
│  ├─ id: string (serialized ObjectId)
│  └─ All other fields except _id
│
├─ BookingInput (API request)
│  ├─ carId: string
│  ├─ carDetails: object
│  ├─ customerName: string
│  ├─ customerEmail: string
│  ├─ customerPhone: string
│  ├─ bookingType: enum
│  └─ message: string
│
└─ Validation function
   └─ validateBookingInput(): Result<BookingInput>
```

## Scaling Considerations

```
Current Setup:
├─ Single MongoDB collection
├─ Basic indexing (not unique)
├─ No rate limiting
└─ No caching

For High Load:
├─ Add rate limiting middleware
├─ Implement caching (Redis)
├─ Add unique constraints
├─ Enable MongoDB sharding
├─ Add webhook notifications
├─ Implement job queue for notifications
└─ Monitor with MongoDB profiler
```

---

This architecture provides a solid, maintainable foundation for the WhatsApp booking system with clear separation of concerns and proper error handling.
