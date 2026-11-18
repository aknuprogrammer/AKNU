require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../models/admission/FromStudents");
const InternalExamSetup = require("../models/examination/InternalExamSetup");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

async function verifyStudents() {
  try {
    const targetSetup = await InternalExamSetup.findOne({ status: "Active" }).lean();
    const targetCourseId = String(targetSetup.courseId);
    const targetStreamId = String(targetSetup.streamId);
    const targetSemesterId = String(targetSetup.semesterId);

    console.log(`Target IDs:`);
    console.log(`  Course: ${targetCourseId}`);
    console.log(`  Stream: ${targetStreamId}`);
    console.log(`  Semester: ${targetSemesterId}\n`);

    // Get a few students and check their actual values
    const students = await Student.find({ status: "Admitted" }).limit(5);
    
    console.log(`Checking students:`);
    for (const student of students) {
      const courseStr = student.course ? String(student.course) : "undefined";
      const streamStr = student.stream ? String(student.stream) : "undefined";
      const semesterStr = student.semester ? String(student.semester) : "undefined";
      
      console.log(`\n${student.firstName} ${student.lastName}:`);
      console.log(`  Course: ${courseStr} ${courseStr === targetCourseId ? '✅' : '❌'}`);
      console.log(`  Stream: ${streamStr} ${streamStr === targetStreamId ? '✅' : '❌'}`);
      console.log(`  Semester: ${semesterStr} ${semesterStr === targetSemesterId ? '✅' : '❌'}`);
    }

    // Try query with ObjectId
    const count1 = await Student.countDocuments({
      course: new mongoose.Types.ObjectId(targetCourseId),
      stream: new mongoose.Types.ObjectId(targetStreamId),
      semester: new mongoose.Types.ObjectId(targetSemesterId),
      status: "Admitted"
    });

    // Try query with string
    const count2 = await Student.countDocuments({
      course: targetCourseId,
      stream: targetStreamId,
      semester: targetSemesterId,
      status: "Admitted"
    });

    console.log(`\nQuery with ObjectId: ${count1} students`);
    console.log(`Query with String: ${count2} students`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

verifyStudents();

