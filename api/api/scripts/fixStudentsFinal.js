require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../models/admission/FromStudents");
const InternalExamSetup = require("../models/examination/InternalExamSetup");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB)
  .then(async () => {
    console.log("✅ MongoDB connected successfully!");
    await fixStudents();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

async function fixStudents() {
  try {
    console.log("\n🔍 Fixing Students to Match Internal Exam Setups...\n");

    // Get target setup - get the first one
    const targetSetup = await InternalExamSetup.findOne({ status: "Active" });
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

    // Use updateMany with proper ObjectIds
    const result = await Student.updateMany(
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

    // Verify with a fresh query
    const matchingStudents = await Student.find({
      course: targetCourseId,
      stream: targetStreamId,
      semester: targetSemesterId,
      status: "Admitted"
    })
      .limit(5)
      .select("firstName lastName registrationNumber");

    console.log(`✅ Found ${matchingStudents.length} matching students (showing first 5):`);
    matchingStudents.forEach((s, idx) => {
      console.log(`  ${idx + 1}. ${s.firstName} ${s.lastName} (${s.registrationNumber || 'N/A'})`);
    });

    const totalCount = await Student.countDocuments({
      course: targetCourseId,
      stream: targetStreamId,
      semester: targetSemesterId,
      status: "Admitted"
    });

    console.log(`\n✅ Total matching students: ${totalCount}`);
    console.log(`\n🎉 Students are now ready for the demo!`);
    console.log(`   Go to: Examination → Internal Exam Setup → Student Marks Entry`);
    console.log(`   Select the setup and click "Load Students"`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

