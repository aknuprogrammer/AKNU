const mongoose = require("mongoose");
const PerformanceCycle = require("../models/performance/PerformanceCycle");
const PerformanceReview = require("../models/performance/PerformanceReview");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

async function reset() {
  try {
    console.log("Connecting to:", process.env.MONGO_DB);
    await mongoose.connect(process.env.MONGO_DB);
    
    console.log("Deleting existing cycles and reviews...");
    await PerformanceCycle.deleteMany({});
    await PerformanceReview.deleteMany({});

    console.log("Creating new active cycle for 2025...");
    const cycle = new PerformanceCycle({
      name: "Annual Performance Review 2025",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      description: "Annual performance review cycle for all employees.",
      status: "Active",
    });

    await cycle.save();
    console.log("Successfully created active cycle:", cycle.name);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

reset();
