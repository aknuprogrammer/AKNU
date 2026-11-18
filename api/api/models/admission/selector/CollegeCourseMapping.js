const mongoose = require("mongoose");

const CollegeCourseMappingSchema = new mongoose.Schema(
  {
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course_data",
        required: true,
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CollegeCourseMapping", CollegeCourseMappingSchema);
