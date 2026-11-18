const CourseAcademicYearMapping = require("../../../models/examination/selector/CourseAcademicYearMapping");

// @desc Get all course academic year mappings
// @route GET /api/examination/course-academic-year-mappings
exports.getAllMappings = async (req, res) => {
    try {
        const { courseId, academicYearId, status } = req.query;
        const query = {};
        if (courseId) query.courseId = courseId;
        if (academicYearId) query.academicYearId = academicYearId;
        if (status) query.status = status;

        const mappings = await CourseAcademicYearMapping.find(query)
            .populate("courseId", "name code")
            .populate("academicYearId", "code startDate endDate")
            .sort({ createdAt: -1 });

        res.json(mappings);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc Create a new mapping
// @route POST /api/examination/course-academic-year-mappings
exports.createMapping = async (req, res) => {
    try {
        const { courseId, academicYearId, status, notes } = req.body;

        // Check if mapping already exists
        const existing = await CourseAcademicYearMapping.findOne({ courseId, academicYearId });
        if (existing) {
            return res.status(400).json({ message: "Mapping already exists for this course and academic year" });
        }

        const mapping = new CourseAcademicYearMapping({
            courseId,
            academicYearId,
            status,
            notes,
        });

        await mapping.save();

        const populatedMapping = await CourseAcademicYearMapping.findById(mapping._id)
            .populate("courseId", "name code")
            .populate("academicYearId", "code startDate endDate");

        res.status(201).json(populatedMapping);
    } catch (error) {
        res.status(400).json({ message: "Invalid Data", error: error.message });
    }
};

// @desc Update a mapping
// @route PUT /api/examination/course-academic-year-mappings/:id
exports.updateMapping = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await CourseAcademicYearMapping.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        )
            .populate("courseId", "name code")
            .populate("academicYearId", "code startDate endDate");

        if (!updated) return res.status(404).json({ message: "Mapping not found" });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: "Update failed", error: error.message });
    }
};

// @desc Delete a mapping
// @route DELETE /api/examination/course-academic-year-mappings/:id
exports.deleteMapping = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await CourseAcademicYearMapping.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Mapping not found" });
        res.json({ message: "Mapping deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};
