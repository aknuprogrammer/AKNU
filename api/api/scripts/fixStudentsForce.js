require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../models/admission/FromStudents");
const InternalExamSetup = require("../models/examination/InternalExamSetup");

mongoose
  .connect(process.env.MONGO_DB)
  .then(async () => {
    console.log("✅ Connected\n");
    
    const setup = await InternalExamSetup.findOne({ status: "Active" });
    const targetCourseId = setup.courseId;
    const targetStreamId = setup.streamId;
    const targetSemesterId = setup.semesterId;
    
    console.log("Target IDs:");
    console.log("  Course:", targetCourseId);
    console.log("  Stream:", targetStreamId);
    console.log("  Semester:", targetSemesterId);
    
    // Get all students and update them individually
    const students = await Student.find({});
    console.log(`\nFound ${students.length} students to update\n`);
    
    let updated = 0;
    for (const student of students) {
      // Force set the fields
      student.set('course', targetCourseId);
      student.set('stream', targetStreamId);
      student.set('semester', targetSemesterId);
      student.set('status', 'Admitted');
      
      await student.save({ validateBeforeSave: false });
      updated++;
      
      if (updated % 10 === 0) {
        console.log(`Updated ${updated} students...`);
      }
    }
    
    console.log(`\n✅ Updated ${updated} students\n`);
    
    // Verify
    const count = await Student.countDocuments({
      course: targetCourseId,
      stream: targetStreamId,
      semester: targetSemesterId,
      status: "Admitted"
    });
    
    console.log(`✅ Matching students: ${count}`);
    
    if (count > 0) {
      const sample = await Student.find({
        course: targetCourseId,
        stream: targetStreamId,
        semester: targetSemesterId,
        status: "Admitted"
      })
        .limit(5)
        .select("firstName lastName registrationNumber");
      
      console.log("\nSample students:");
      sample.forEach((s, idx) => {
        console.log(`  ${idx + 1}. ${s.firstName} ${s.lastName}`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

