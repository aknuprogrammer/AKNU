require("dotenv").config();
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

async function fixStudentsDirect() {
  try {
    // Wait for connection
    await mongoose.connection.once('open', () => {});
    
    const db = mongoose.connection.db;
    // Try different collection names
    let studentsCollection;
    try {
      studentsCollection = db.collection("students");
    } catch (e) {
      studentsCollection = db.collection("Students");
    }
    
    const setupsCollection = db.collection("internal_exam_setups");

    // Get target setup
    const targetSetup = await setupsCollection.findOne({ status: "Active" });
    if (!targetSetup) {
      console.log("❌ No setup found");
      process.exit(1);
    }

    const targetCourseId = targetSetup.courseId;
    const targetStreamId = targetSetup.streamId;
    const targetSemesterId = targetSetup.semesterId;

    console.log(`Target IDs:`);
    console.log(`  Course: ${targetCourseId}`);
    console.log(`  Stream: ${targetStreamId}`);
    console.log(`  Semester: ${targetSemesterId}\n`);

    // Update all students directly
    const result = await studentsCollection.updateMany(
      {},
      {
        $set: {
          course: targetCourseId,
          stream: targetStreamId,
          semester: targetSemesterId,
          status: "Admitted"
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} students`);
    console.log(`   Matched: ${result.matchedCount} students\n`);

    // Verify
    const matchingCount = await studentsCollection.countDocuments({
      course: targetCourseId,
      stream: targetStreamId,
      semester: targetSemesterId,
      status: "Admitted"
    });

    console.log(`✅ Students matching: ${matchingCount}`);

    if (matchingCount > 0) {
      const sample = await studentsCollection.find({
        course: targetCourseId,
        stream: targetStreamId,
        semester: targetSemesterId,
        status: "Admitted"
      })
        .limit(5)
        .toArray();

      console.log("\nSample students:");
      sample.forEach((s, idx) => {
        console.log(`  ${idx + 1}. ${s.firstName} ${s.lastName} (${s.registrationNumber || 'N/A'})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixStudentsDirect();

