const mongoose = require("mongoose");
const PerformanceCycle = require("../models/performance/PerformanceCycle");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

async function seed() {
  await mongoose.connect(process.env.MONGO_DB);
  
  const existing = await PerformanceCycle.findOne({ status: "Active" });
  if (existing) {
    console.log("Active cycle already exists:", existing.name);
    process.exit(0);
  }

  const cycle = new PerformanceCycle({
    name: "Annual Performance Review 2024",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    description: "Annual performance review cycle for all employees.",
    status: "Active",
  });

  await cycle.save();
  console.log("Created active cycle:", cycle.name);
  process.exit(0);
}

seed().catch(console.error);
