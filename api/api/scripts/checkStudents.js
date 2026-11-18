require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../models/admission/FromStudents");
const InternalExamSetup = require("../models/examination/InternalExamSetup");
const CourseStreamMapping = require("../models/examination/selector/CourseStreamMapping");
// Load Course model for populate
require("../models/admission/selector/Course");
// Load Stream model for populate
require("../models/examination/selector/Stream");
// Load Semester model for populate
require("../models/examination/selector/Semester");
// Load Subject model for populate
require("../models/examination/selector/Subject");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

async function checkStudents() {
  try {
    console.log("\n🔍 Checking Students and Internal Exam Setups...\n");

    // Get all Internal Exam Setups
    const setups = await InternalExamSetup.find({ status: "Active" })
      .populate("courseId", "code name")
      .populate("streamId", "code name")
      .populate("semesterId", "description numberOfSemesters")
      .populate("subjectId", "code name")
      .lean();

    console.log(`📋 Found ${setups.length} Internal Exam Setup(s):\n`);

    for (const setup of setups) {
      const courseId = setup.courseId?._id || setup.courseId;
      const streamId = setup.streamId?._id || setup.streamId;
      const semesterId = setup.semesterId?._id || setup.semesterId;

      console.log(`Setup: ${setup.courseId?.name || "N/A"} | ${setup.streamId?.name || "N/A"} | ${setup.subjectId?.code || "N/A"} - ${setup.subjectId?.name || "N/A"} | ${setup.examType}`);
      console.log(`  Course ID: ${courseId}`);
      console.log(`  Stream ID: ${streamId}`);
      console.log(`  Semester ID: ${semesterId}`);
      console.log(`  Semester Number: ${setup.semesterNumber || "N/A"}`);

      // Check for matching students
      const query = {
        course: courseId,
        stream: streamId,
        semester: semesterId,
        status: "Admitted",
      };

      const matchingStudents = await Student.find(query)
        .select("firstName lastName registrationNumber course stream semester status")
        .limit(5)
        .lean();

      console.log(`  ✅ Matching Students: ${matchingStudents.length}`);
      
      if (matchingStudents.length > 0) {
        matchingStudents.forEach((student, idx) => {
          console.log(`    ${idx + 1}. ${student.firstName} ${student.lastName} (${student.registrationNumber})`);
        });
      } else {
        console.log(`    ⚠️  No students found! Checking what students exist...`);
        
        // Check students with same course
        const courseStudents = await Student.countDocuments({ course: courseId, status: "Admitted" });
        console.log(`    - Students with same Course: ${courseStudents}`);
        
        // Check students with same stream
        const streamStudents = await Student.countDocuments({ stream: streamId, status: "Admitted" });
        console.log(`    - Students with same Stream: ${streamStudents}`);
        
        // Check students with same semester
        const semesterStudents = await Student.countDocuments({ semester: semesterId, status: "Admitted" });
        console.log(`    - Students with same Semester: ${semesterStudents}`);
      }

      console.log("");
    }

    // Also check CourseStreamMappings
    console.log("\n📋 Checking CourseStreamMappings:\n");
    const mappings = await CourseStreamMapping.find({ status: "Active" })
      .populate("courseId", "code name")
      .populate("streamId", "code name")
      .populate("semesterId", "description")
      .select("courseId streamId semesterId semesterNumber")
      .lean();

    for (const mapping of mappings) {
      const courseId = mapping.courseId?._id || mapping.courseId;
      const streamId = mapping.streamId?._id || mapping.streamId;
      const semesterId = mapping.semesterId?._id || mapping.semesterId;

      const studentsFromMapping = await Student.countDocuments({
        course: courseId,
        stream: streamId,
        semester: semesterId,
        status: "Admitted",
      });

      console.log(`${mapping.courseId?.name} | ${mapping.streamId?.name} | Semester ${mapping.semesterNumber}: ${studentsFromMapping} students`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkStudents();

