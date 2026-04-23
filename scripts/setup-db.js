#!/usr/bin/env node

const { MongoClient } = require("mongodb")

async function setupDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("❌ MONGODB_URI environment variable is not set!")
    console.error("   Add it in Project Settings → Environment Variables")
    process.exit(1)
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8_000,
  })

  try {
    console.log("🔄 Connecting to MongoDB...")
    await client.connect()

    const db = client.db("dealership")

    // Test connection
    const pingResult = await db.command({ ping: 1 })
    console.log("✅ Connected to MongoDB")

    console.log("\n📦 Setting up collections and indexes...")

    // Setup cars collection
    console.log("\n   Setting up 'cars' collection...")
    const carsCol = db.collection("cars")
    await Promise.all([
      carsCol.createIndex({ createdAt: -1 }),
      carsCol.createIndex({ status: 1 }),
      carsCol.createIndex({ make: 1, model: 1 }),
      carsCol.createIndex({ featured: -1, createdAt: -1 }),
    ])
    const carsCount = await carsCol.countDocuments()
    console.log(`      ✅ Indexes created (${carsCount} documents found)`)

    // Setup bookings collection
    console.log("\n   Setting up 'bookings' collection...")
    const bookingsCol = db.collection("bookings")
    await Promise.all([
      bookingsCol.createIndex({ createdAt: -1 }),
      bookingsCol.createIndex({ carId: 1 }),
      bookingsCol.createIndex({ customerEmail: 1 }),
      bookingsCol.createIndex({ status: 1 }),
    ])
    const bookingsCount = await bookingsCol.countDocuments()
    console.log(`      ✅ Indexes created (${bookingsCount} documents found)`)

    console.log("\n✨ Database setup complete!")
    console.log("\nYou can now:")
    console.log("  • Add cars in the Admin panel (/admin)")
    console.log("  • View bookings in /admin/bookings")
    console.log("  • Test the WhatsApp booking on any car detail page")

    process.exit(0)
  } catch (error) {
    console.error("❌ Database setup failed!")
    if (error instanceof Error) {
      if (/bad auth|authentication failed/i.test(error.message)) {
        console.error(
          "   Authentication failed. Check MongoDB credentials in MONGODB_URI.\n" +
          "   Make sure to replace <password> placeholder and that the DB user has access."
        )
      } else if (/ENOTFOUND|getaddrinfo|ECONN/i.test(error.message)) {
        console.error(
          "   Could not reach MongoDB cluster. Check the host in MONGODB_URI and\n" +
          "   make sure your IP is allowed in the cluster's Network Access list."
        )
      } else {
        console.error(`   Error: ${error.message}`)
      }
    } else {
      console.error(`   Error: ${String(error)}`)
    }
    process.exit(1)
  } finally {
    await client.close()
  }
}

setupDatabase()
