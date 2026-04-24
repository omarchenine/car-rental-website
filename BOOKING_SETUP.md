# WhatsApp Booking Setup Guide

This guide will help you set up the WhatsApp booking functionality for your car rental website.

## ✨ New Features Added

1. **WhatsApp Booking Form** - Customers can book cars directly via WhatsApp
   - Form saves booking data to MongoDB
   - Automatically opens WhatsApp conversation
   - Pre-fills booking details

2. **Bookings Admin Page** - View and manage all bookings
   - Located at `/admin/bookings`
   - Shows customer info, car details, and booking status
   - Track all booking inquiries

3. **Database Integration** - Full MongoDB support
   - Verified database connection
   - Proper data validation and error handling
   - Indexes for fast queries

## 🚀 Quick Start

### 1. Configure MongoDB URI

You need to add your MongoDB connection string to the project environment variables.

**Steps:**
1. Go to your v0 project settings (top right corner)
2. Click on "Vars" tab
3. Add a new environment variable:
   - **Key:** `MONGODB_URI`
   - **Value:** Your MongoDB connection string (e.g., `mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority`)

**Need a MongoDB cluster?**
- Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- Create a cluster and copy the connection string
- Make sure to:
  - Replace `<password>` with your actual password
  - Add your IP to Network Access list

### 2. Verify Database Connection

After setting the MONGODB_URI, run the verification script:

```bash
node --env-file-if-exists=/vercel/share/.env.project scripts/verify-db.js
```

This will:
- ✅ Test connection to MongoDB
- ✅ Check existing collections
- ✅ Verify indexes are set up correctly

### 3. Set Up Collections

Run the setup script to initialize collections and indexes:

```bash
node --env-file-if-exists=/vercel/share/.env.project scripts/setup-db.js
```

## 📝 How It Works

### Customer Side (Public)
1. Customer views a car on the detail page
2. Clicks "Book via WhatsApp"
3. Fills out the booking form with:
   - Name
   - Email
   - Phone number
   - Booking type (inquiry, test-drive, inspection, delivery-quote)
   - Additional message
4. Submits the form
5. Booking is saved to MongoDB
6. WhatsApp opens with pre-filled message
7. Customer sends the message to: **+351 931 312 841**

### Admin Side (Private)
1. Admin logs in to `/admin`
2. Navigates to "Bookings" tab
3. Views all customer bookings with:
   - Customer contact info
   - Car details and price
   - Booking type and status
   - Timestamp
   - Customer message
4. Can click to email or call customer
5. Can mark bookings as confirmed/completed/cancelled (feature ready for expansion)

## 🔧 Configuration

### WhatsApp Number
The WhatsApp number is currently set to: **+351 931 312 841**

To change it, edit `/components/booking-form.tsx`:
```typescript
const WHATSAPP_NUMBER = "+351931312841" // Change this
```

### Database Schema

**Cars Collection** (`cars`)
- Stores car inventory
- Indexes on: createdAt, status, make/model, featured

**Bookings Collection** (`bookings`)
```typescript
{
  _id: ObjectId
  carId: string              // Link to car
  carDetails: {
    make: string
    model: string
    year: number
    price: number
  }
  customerName: string
  customerEmail: string
  customerPhone: string
  bookingType: "inquiry" | "test-drive" | "inspection" | "delivery-quote"
  message: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  sentViaWhatsApp: boolean
  createdAt: Date
  updatedAt: Date
}
```

## 📊 Monitoring

### View Recent Bookings
```bash
# Check database status
node --env-file-if-exists=/vercel/share/.env.project scripts/verify-db.js
```

### Booking Endpoints

**GET /api/bookings** - List bookings
```bash
curl "http://localhost:3000/api/bookings?status=pending&limit=50"
```

**POST /api/bookings** - Create new booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "carId": "car-id-here",
    "carDetails": { "make": "BMW", "model": "X5", "year": 2023, "price": 45000 },
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+351 912 345 678",
    "bookingType": "test-drive",
    "message": "Interested in this car"
  }'
```

## 🛠️ Troubleshooting

### "MONGODB_URI environment variable is not set"
- Make sure you added the env variable in project settings
- Verify the key is exactly `MONGODB_URI`
- Save and restart the dev server

### "MongoDB rejected the credentials"
- Check your connection string
- Make sure to replace `<password>` with actual password
- Verify the DB user has access to the `dealership` database

### "Could not reach MongoDB cluster"
- Check the host in your connection string
- Add your IP address to MongoDB Network Access list
- Make sure your internet connection is stable

### "Bookings not saving"
- Check the admin bookings page to see if form is working
- Open browser dev tools (F12) and check for errors
- Verify MongoDB connection with the verify script

### "WhatsApp not opening"
- Check browser security settings
- Some browsers block pop-ups - whitelist the site
- Make sure the WhatsApp number is in correct format

## 📚 API Reference

### Create Booking

**POST** `/api/bookings`

**Request:**
```json
{
  "carId": "string",
  "carDetails": {
    "make": "string",
    "model": "string",
    "year": "number",
    "price": "number"
  },
  "customerName": "string",
  "customerEmail": "string",
  "customerPhone": "string",
  "bookingType": "inquiry|test-drive|inspection|delivery-quote",
  "message": "string"
}
```

**Response (201):**
```json
{
  "booking": {
    "id": "string",
    "carId": "string",
    "carDetails": {...},
    "customerName": "string",
    "customerEmail": "string",
    "customerPhone": "string",
    "bookingType": "string",
    "message": "string",
    "status": "pending",
    "sentViaWhatsApp": false,
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  }
}
```

### Get Bookings

**GET** `/api/bookings?carId=xxx&status=pending&limit=50`

**Response:**
```json
{
  "bookings": [...]
}
```

## 🔐 Security Notes

- Bookings are stored securely in MongoDB
- Email addresses are validated
- Phone numbers are stored as-is (validate on your end)
- Consider implementing authentication for admin bookings page
- Add CORS if calling from external domains

## 🎯 Next Steps

1. ✅ Configure MONGODB_URI in environment variables
2. ✅ Test connection with verify script
3. ✅ Add a test car in admin panel
4. ✅ Visit the car detail page and test booking form
5. ✅ Check `/admin/bookings` to see saved booking

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Run the verify database script
3. Check browser console for errors (F12)
4. Review server logs in the terminal

---

**Booking System Ready!** 🎉

Your customers can now book cars via WhatsApp. The `+351 931 312 841` number will receive all booking requests with customer details.
