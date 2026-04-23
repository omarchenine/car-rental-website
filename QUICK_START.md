# WhatsApp Booking - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Add MongoDB URI
```
Project Settings → Vars → Add Variable
Key:   MONGODB_URI
Value: mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
```
*Need MongoDB? Get free tier at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)*

### Step 2: Restart Dev Server
```bash
# Press Ctrl+C to stop current server
# Run:
npm run dev
```

### Step 3: Verify Connection
```bash
node --env-file-if-exists=/vercel/share/.env.project scripts/verify-db.js
```
✅ Should show: "Connection successful!"

### Step 4: Test It
1. Go to `/admin` → Add a test car
2. Click on car detail page
3. Fill "Book via WhatsApp" form
4. Submit → WhatsApp opens!
5. Check `/admin/bookings` → See your booking

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **QUICK_START.md** | This file - get started in 5 mins |
| **BOOKING_SETUP.md** | Complete setup guide with troubleshooting |
| **WHATSAPP_BOOKING.md** | Feature overview and how it works |
| **IMPLEMENTATION_CHECKLIST.md** | Full testing checklist |
| **SYSTEM_ARCHITECTURE.md** | Technical architecture diagrams |
| **IMPLEMENTATION_SUMMARY.txt** | Complete project summary |

## 🎯 Key Features

✅ **Customer Booking Form** - On every car detail page
✅ **WhatsApp Integration** - Opens automatically with pre-filled message
✅ **Admin Dashboard** - View all bookings at `/admin/bookings`
✅ **Database Storage** - All bookings saved to MongoDB
✅ **Full Validation** - Both client and server-side

## 📱 WhatsApp Number

All bookings go to: **+351 931 312 841**

Want to change it? Edit `components/booking-form.tsx` line 14:
```typescript
const WHATSAPP_NUMBER = "+351931312841" // Change this
```

## 🔧 Common Commands

```bash
# Verify database connection
node --env-file-if-exists=/vercel/share/.env.project scripts/verify-db.js

# Start dev server
npm run dev

# Build for production
npm run build

# Test API endpoint
curl http://localhost:3000/api/bookings
```

## 🚀 What Happens When Customer Books

1. Customer fills form on car detail page
2. Clicks "Book via WhatsApp"
3. Data saved to MongoDB
4. WhatsApp opens with message like:
   ```
   Hello! I'm interested in booking a 2023 BMW X5.
   
   Booking Type: test drive
   Name: John Doe
   Email: john@example.com
   Phone: +351 912 345 678
   
   Message: Very interested!
   ```
5. Customer sends message to your WhatsApp
6. Booking appears in admin dashboard

## 📊 Admin Dashboard

Access at: `/admin/bookings`

Shows:
- ✅ Customer name, email, phone
- ✅ Car year, make, model, price  
- ✅ Booking type (inquiry, test-drive, etc)
- ✅ Customer message
- ✅ Date added
- ✅ Status (pending, confirmed, etc)
- ✅ Click-to-email and click-to-call buttons

## 🛠️ Troubleshooting

**"MONGODB_URI not set"**
→ Add environment variable in project settings

**"Connection refused"**
→ Check MongoDB credentials and IP whitelist

**"WhatsApp not opening"**
→ Allow pop-ups in browser settings

**"Bookings not saving"**
→ Check browser console (F12) for errors

## 📈 File Structure

```
project/
├── lib/
│   ├── booking-types.ts          ← Booking interfaces & validation
│   └── mongodb.ts                ← Database setup (modified)
├── app/
│   ├── api/
│   │   └── bookings/route.ts     ← API endpoints
│   ├── inventory/[id]/page.tsx   ← Car details (modified)
│   └── admin/
│       └── bookings/page.tsx     ← Admin dashboard
├── components/
│   └── booking-form.tsx          ← Booking form
├── scripts/
│   ├── verify-db.js              ← Test database
│   └── setup-db.js               ← Initialize database
└── docs/
    ├── BOOKING_SETUP.md
    ├── WHATSAPP_BOOKING.md
    ├── IMPLEMENTATION_CHECKLIST.md
    ├── SYSTEM_ARCHITECTURE.md
    └── IMPLEMENTATION_SUMMARY.txt
```

## ✨ What You Get

| Component | Location | Purpose |
|-----------|----------|---------|
| Form UI | Car detail pages | Customers book cars |
| Admin Dashboard | `/admin/bookings` | View all bookings |
| API | `/api/bookings` | Save/retrieve bookings |
| Database | MongoDB | Store booking data |
| Validation | Client & Server | Ensure data quality |

## 🔐 Security

✅ Server-side validation
✅ No credentials in code  
✅ TypeScript for type safety
✅ Parameterized queries
✅ Environment variable config

## 🎓 Learn More

- **Setting up MongoDB**: See BOOKING_SETUP.md → "Configure MongoDB URI"
- **API details**: See BOOKING_SETUP.md → "API Reference"
- **Database schema**: See WHATSAPP_BOOKING.md → "Database Schema"
- **Architecture**: See SYSTEM_ARCHITECTURE.md

## 🚀 Next Steps

1. ✅ Add MONGODB_URI environment variable
2. ✅ Restart dev server
3. ✅ Run `scripts/verify-db.js` to test connection
4. ✅ Add test car in admin
5. ✅ Test booking form
6. ✅ Check `/admin/bookings` for saved booking
7. ✅ Deploy to production!

## 💡 Tips

- WhatsApp number in booking form: Update `components/booking-form.tsx`
- Admin dashboard: Already integrated at `/admin/bookings`
- Database: Auto-creates indexes on first use
- Validation: Client-side UX + server-side security

## 📞 Need Help?

1. Check **BOOKING_SETUP.md** for troubleshooting
2. Run verification script: `scripts/verify-db.js`
3. Check browser console: `F12 → Console`
4. Check server logs: Look at terminal output

---

**You're all set!** 🎉

Your car rental website now has a complete WhatsApp booking system. 
Just add your MongoDB URI and you're ready to accept bookings!

For detailed information, see the other documentation files.
