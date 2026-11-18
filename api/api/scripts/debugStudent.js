require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../models/admission/FromStudents");
const InternalExamSetup = require("../models/examination/InternalExamSetup");

mongoose
  .connect(process.env.MONGO_DB)
  .then(async () => {
    console.log("✅ Connected\n");
    
    const setup = await InternalExamSetup.findOne({ status: "Active" }).lean();
    console.log("Setup IDs:");
    console.log("  Course:", setup.courseId);
    console.log("  Stream:", setup.streamId);
    console.log("  Semester:", setup.semesterId);
    console.log("  Types:", typeof setup.courseId, typeof setup.streamId, typeof setup.semesterId);
    
    const student = await Student.findOne({}).lean();
    console.log("\nStudent fields:");
    console.log("  Course:", student.course, typeof student.course);
    console.log("  Stream:", student.stream, typeof student.stream);
    console.log("  Semester:", student.semester, typeof student.semester);
    console.log("  Status:", student.status);
    
    // Check if they match
    const courseMatch = String(setup.courseId) === String(student.course);
    const streamMatch = String(setup.streamId) === String(student.stream);
    const semesterMatch = String(setup.semesterId) === String(student.semester);
    
    console.log("\nMatches:");
    console.log("  Course:", courseMatch);
    console.log("  Stream:", streamMatch);
    console.log("  Semester:", semesterMatch);
    
    // Try query
    const query = {
      course: setup.courseId,
      stream: setup.streamId,
      semester: setup.semesterId,
      status: "Admitted"
    };
    console.log("\nQuery:", JSON.stringify(query, null, 2));
    
    const count = await Student.countDocuments(query);
    console.log("Count:", count);
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

