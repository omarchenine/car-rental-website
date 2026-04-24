#!/usr/bin/env node

const { MongoClient } = require("mongodb")

async function verifyDatabase() {
  let uri = process.env.MONGODB_URI
  
  // Handle case where env variable has key=value format
  if (uri && uri.includes("MONGODB_URI=")) {
    uri = uri.replace("MONGODB_URI=", "")
  }
  
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

    // Test ping
    const db = client.db("dealership")
    const pingResult = await db.command({ ping: 1 })
    console.log("✅ Connection successful!")
    console.log(`   Ping response: ${JSON.stringify(pingResult)}`)

    // Check collections
    console.log("\n📦 Checking collections...")
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    if (collectionNames.includes("cars")) {
      const carsCol = db.collection("cars")
      const carCount = await carsCol.countDocuments()
      console.log(`   ✅ cars collection: ${carCount} documents`)
      
      if (carCount > 0) {
        const sample = await carsCol.findOne()
        console.log(`      Sample car: ${sample?.year} ${sample?.make} ${sample?.model}`)
      }
    } else {
      console.log("   ℹ️  cars collection: not yet created")
    }

    if (collectionNames.includes("bookings")) {
      const bookingsCol = db.collection("bookings")
      const bookingCount = await bookingsCol.countDocuments()
      console.log(`   ✅ bookings collection: ${bookingCount} documents`)
    } else {
      console.log("   ℹ️  bookings collection: not yet created (will be created on first booking)")
    }

    // Check indexes on cars
    if (collectionNames.includes("cars")) {
      console.log("\n📇 Checking cars collection indexes...")
      const carsCol = db.collection("cars")
      const indexes = await carsCol.listIndexes().toArray()
      console.log(`   Found ${indexes.length} indexes:`)
      indexes.forEach((idx) => {
        const keys = Object.keys(idx.key).join(", ")
        console.log(`      - ${keys}`)
      })
    }

    // Check indexes on bookings
    if (collectionNames.includes("bookings")) {
      console.log("\n📇 Checking bookings collection indexes...")
      const bookingsCol = db.collection("bookings")
      const indexes = await bookingsCol.listIndexes().toArray()
      console.log(`   Found ${indexes.length} indexes:`)
      indexes.forEach((idx) => {
        const keys = Object.keys(idx.key).join(", ")
        console.log(`      - ${keys}`)
      })
    }

    console.log("\n✨ Database verification complete!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Database verification failed!")
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

verifyDatabase()
