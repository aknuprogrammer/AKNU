const mongoose = require("mongoose");
const PerformanceCycle = require("../models/performance/PerformanceCycle");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

async function check() {
  try {
    const dbUri = process.env.MONGO_DB;
    console.log("Connecting to:", dbUri);
    await mongoose.connect(dbUri);
    
    const count = await PerformanceCycle.countDocuments();
    console.log("Total Cycles:", count);

    const cycles = await PerformanceCycle.find({});
    console.log("All Cycles:", JSON.stringify(cycles, null, 2));

    const active = await PerformanceCycle.findOne({ status: "Active" });
    console.log("Active Query Result:", active);

    fs.writeFileSync("cycles_dump.json", JSON.stringify({ count, cycles, active }, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

check();
