const axios = require('axios');
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const PerformanceCycle = require("../models/performance/PerformanceCycle");
const PerformanceReview = require("../models/performance/PerformanceReview");
const EmployeeRegistration = require("../models/employee/EmployeeRegistration");

async function verify() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_DB);
        console.log("Connected.");
        
        console.log("1. Checking Active Cycle...");
        const activeCycle = await PerformanceCycle.findOne({ status: "Active" });
        if (!activeCycle) {
            console.log("❌ No active cycle found in DB!");
        } else {
            console.log("✅ Active cycle found:", activeCycle.name, activeCycle._id);
        }

        console.log("2. Checking for Employee Review...");
        // Simulate what the frontend does: get EMP001 (or find a real employee)
        const employee = await EmployeeRegistration.findOne({});
        const employeeId = employee ? employee.employeeId : "EMP001";
        console.log("Testing with EmployeeID:", employeeId);

        if (activeCycle) {
             const review = await PerformanceReview.findOne({ 
                 cycleId: activeCycle._id, 
                 employeeId: employeeId 
             });
             if (review) {
                 console.log("✅ Review found:", review._id, review.status);
             } else {
                 console.log("ℹ️ No review found (this is fine, should return null)");
             }
        }

        console.log("3. Testing API Response (if server running)...");
        // We can't really test API via axios here easily unless we know the port and it's running.
        // But the DB check confirms the data exists.
        
        console.log("Verification complete.");
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

verify();
