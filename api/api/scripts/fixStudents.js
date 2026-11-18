require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../models/admission/FromStudents");
const InternalExamSetup = require("../models/examination/InternalExamSetup");
// Load Course model (Course_data) - try different paths
try {
  require("../models/examination/selector/Course_data");
} catch (e) {
  try {
    require("../models/admission/selector/Course");
  } catch (e2) {
    // Model will be loaded when needed
  }
}
// Load Stream model
require("../models/examination/selector/Stream");
// Load Semester model
require("../models/examination/selector/Semester");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

async function fixStudents() {
  try {
    console.log("\n🔍 Fixing Students to Match Internal Exam Setups...\n");

    // Get the Internal Exam Setup for "Bachelor of science | Data Science"
    const targetSetup = await InternalExamSetup.findOne({
      status: "Active"
    })
      .populate("courseId", "code name")
      .populate("streamId", "code name")
      .populate("semesterId", "description")
      .lean();

    if (!targetSetup) {
      console.log("❌ No Internal Exam Setup found");
      process.exit(1);
    }

    const targetCourseId = targetSetup.courseId?._id || targetSetup.courseId;
    const targetStreamId = targetSetup.streamId?._id || targetSetup.streamId;
    const targetSemesterId = targetSetup.semesterId?._id || targetSetup.semesterId;

    console.log(`Target Setup: ${targetSetup.courseId?.name} | ${targetSetup.streamId?.name}`);
    console.log(`  Course ID: ${targetCourseId}`);
    console.log(`  Stream ID: ${targetStreamId}`);
    console.log(`  Semester ID: ${targetSemesterId}\n`);

    // Get all students and update them one by one
    const students = await Student.find({});
    console.log(`Found ${students.length} students to update\n`);

    let updatedCount = 0;
    for (const student of students) {
      student.course = targetCourseId;
      student.stream = targetStreamId;
      student.semester = targetSemesterId;
      student.status = "Admitted";
      await student.save();
      updatedCount++;
      if (updatedCount % 10 === 0) {
        console.log(`Updated ${updatedCount} students...`);
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} students\n`);

    // Verify
    const matchingStudents = await Student.countDocuments({
      course: targetCourseId,
      stream: targetStreamId,
      semester: targetSemesterId,
      status: "Admitted"
    });

    console.log(`✅ Students matching the setup: ${matchingStudents}`);

    if (matchingStudents > 0) {
      const sample = await Student.find({
        course: targetCourseId,
        stream: targetStreamId,
        semester: targetSemesterId,
        status: "Admitted"
      })
        .populate("course", "name")
        .populate("stream", "name")
        .limit(5)
        .select("firstName lastName registrationNumber")
        .lean();

      console.log("\nSample matching students:");
      sample.forEach((s, idx) => {
        console.log(`  ${idx + 1}. ${s.firstName} ${s.lastName} (${s.registrationNumber})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixStudents();
