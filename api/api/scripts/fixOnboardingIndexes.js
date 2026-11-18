/**
 * Script to fix MongoDB indexes for employee_onboarding collection
 * Run this once to clean up old indexes and ensure proper sparse indexes
 * 
 * Usage: node api/scripts/fixOnboardingIndexes.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_DB);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("employee_onboarding");

    // Get all indexes
    const indexes = await collection.indexes();
    console.log("\nCurrent indexes:", indexes.map(idx => idx.name));

    // Drop old 'email_1' index if it exists
    try {
      await collection.dropIndex("email_1");
      console.log("✅ Dropped old 'email_1' index");
    } catch (err) {
      if (err.code === 27) {
        console.log("ℹ️  'email_1' index doesn't exist (this is fine)");
      } else {
        console.log("⚠️  Error dropping 'email_1' index:", err.message);
      }
    }

    // Drop existing 'gmail_1' index to recreate it as sparse
    try {
      await collection.dropIndex("gmail_1");
      console.log("✅ Dropped existing 'gmail_1' index");
    } catch (err) {
      if (err.code === 27) {
        console.log("ℹ️  'gmail_1' index doesn't exist yet");
      } else {
        console.log("⚠️  Error dropping 'gmail_1' index:", err.message);
      }
    }

    // Drop existing 'aadharNumber_1' index to recreate it as sparse
    try {
      await collection.dropIndex("aadharNumber_1");
      console.log("✅ Dropped existing 'aadharNumber_1' index");
    } catch (err) {
      if (err.code === 27) {
        console.log("ℹ️  'aadharNumber_1' index doesn't exist yet");
      } else {
        console.log("⚠️  Error dropping 'aadharNumber_1' index:", err.message);
      }
    }

    // Recreate indexes as sparse (this will be done automatically by Mongoose on next model sync)
    // But we can also create them manually here
    await collection.createIndex({ gmail: 1 }, { unique: true, sparse: true, name: "gmail_1" });
    console.log("✅ Created sparse unique index on 'gmail'");

    await collection.createIndex({ aadharNumber: 1 }, { unique: true, sparse: true, name: "aadharNumber_1" });
    console.log("✅ Created sparse unique index on 'aadharNumber'");

    // Verify indexes
    const newIndexes = await collection.indexes();
    console.log("\n✅ Updated indexes:", newIndexes.map(idx => `${idx.name} (${JSON.stringify(idx.key)})`));

    console.log("\n✅ Index fix completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing indexes:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

fixIndexes();

