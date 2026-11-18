const mongoose = require("mongoose");

const courseAcademicYearMappingSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course_data",
            required: [true, "Course ID is required"],
            index: true,
        },
        academicYearId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AcademicYear",
            required: [true, "Academic Year ID is required"],
            index: true,
        },
        status: {
            type: String,
            required: true,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, "Notes cannot exceed 500 characters"],
            default: "",
        },
    },
    {
        timestamps: true,
        collection: "course_academic_year_mappings",
    }
);

// Compound Unique Index
courseAcademicYearMappingSchema.index(
    { courseId: 1, academicYearId: 1 },
    { unique: true, name: "unique_course_academic_year" }
);

// Virtuals
courseAcademicYearMappingSchema.virtual("course", {
    ref: "Course_data",
    localField: "courseId",
    foreignField: "_id",
    justOne: true,
});

courseAcademicYearMappingSchema.virtual("academicYear", {
    ref: "AcademicYear",
    localField: "academicYearId",
    foreignField: "_id",
    justOne: true,
});

courseAcademicYearMappingSchema.set("toJSON", { virtuals: true });
courseAcademicYearMappingSchema.set("toObject", { virtuals: true });

// Force remove old model definition
if (mongoose.models.CourseAcademicYearMapping) {
    delete mongoose.models.CourseAcademicYearMapping;
}

const CourseAcademicYearMapping = mongoose.model(
    "CourseAcademicYearMapping",
    courseAcademicYearMappingSchema
);

module.exports = CourseAcademicYearMapping;
