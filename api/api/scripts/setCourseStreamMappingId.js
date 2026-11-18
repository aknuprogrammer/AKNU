require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../models/admission/FromStudents");
const InternalExamSetup = require("../models/examination/InternalExamSetup");
const CourseStreamMapping = require("../models/examination/selector/CourseStreamMapping");

mongoose
  .connect(process.env.MONGO_DB)
  .then(async () => {
    console.log("✅ Connected\n");
    
    // Get target setup
    const setup = await InternalExamSetup.findOne({ status: "Active" });
    const targetCourseId = setup.courseId;
    const targetStreamId = setup.streamId;
    const targetSemesterId = setup.semesterId;
    
    console.log("Target Setup:");
    console.log("  Course:", targetCourseId);
    console.log("  Stream:", targetStreamId);
    console.log("  Semester:", targetSemesterId);
    
    // Find matching CourseStreamMapping
    const mapping = await CourseStreamMapping.findOne({
      courseId: targetCourseId,
      streamId: targetStreamId,
      semesterId: targetSemesterId,
      status: "Active"
    });
    
    if (!mapping) {
      console.log("\n❌ No matching CourseStreamMapping found!");
      process.exit(1);
    }
    
    console.log("\n✅ Found matching CourseStreamMapping:");
    console.log("  Mapping ID:", mapping._id);
    
    // Update all students to have this courseStreamMappingId
    const result = await Student.updateMany(
      {},
      {
        $set: {
          courseStreamMappingId: mapping._id,
          status: "Admitted"
        }
      }
    );
    
    console.log(`\n✅ Updated ${result.modifiedCount} students`);
    console.log(`   Matched: ${result.matchedCount} students\n`);
    
    // Verify
    const count = await Student.countDocuments({
      courseStreamMappingId: mapping._id,
      status: "Admitted"
    });
    
    console.log(`✅ Students with matching courseStreamMappingId: ${count}`);
    
    if (count > 0) {
      const sample = await Student.find({
        courseStreamMappingId: mapping._id,
        status: "Admitted"
      })
        .limit(5)
        .select("firstName lastName registrationNumber");
      
      console.log("\nSample students:");
      sample.forEach((s, idx) => {
        console.log(`  ${idx + 1}. ${s.firstName} ${s.lastName}`);
      });
    }
    
    console.log("\n🎉 Students are now ready for the demo!");
    console.log("   Go to: Examination → Internal Exam Setup → Student Marks Entry");
    console.log("   Select the setup and click 'Load Students'");
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

