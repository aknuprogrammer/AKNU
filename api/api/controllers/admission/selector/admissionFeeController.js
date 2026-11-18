const AdmissionFee = require("../../../models/admission/selector/AdmissionFee");
const College = require("../../../models/admission/selector/College");
const Course = require("../../../models/admission/selector/Course");

// @desc   Get all fees with course details
// @route  GET /api/admission-fees
exports.getFees = async (req, res) => {
  try {
    const fees = await AdmissionFee.find()
      .populate("courseId", "name code duration") // fetch course details
      .populate("campusId", "name code location") // ✅ fetch campus details (adjust fields)
      .lean();

    // Map to include course & campus info for frontend convenience
    const feesWithDetails = fees.map((fee) => ({
      ...fee,
      courseName: fee.courseId ? fee.courseId.name : "",
      courseCode: fee.courseId ? fee.courseId.code : "",
      courseDuration: fee.courseId ? fee.courseId.duration : "",
      campusName: fee.campusId ? fee.campusId.name : "",
      campusCode: fee.campusId ? fee.campusId.code : "",
      campusLocation: fee.campusId ? fee.campusId.location : "",
    }));

    res.json(feesWithDetails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get single fee
// @route  GET /api/admission-fees/:id
// exports.getFeeById = async (req, res) => {
//   try {
//     const fee = await AdmissionFee.findById(req.params.id);
//     if (!fee) return res.status(404).json({ message: "Fee not found" });
//     res.json(fee);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.getFeeById = async (req, res) => {
  try {
    console.log("_________req", req.params);
    const fee = await AdmissionFee.findOne({ courseId: req.params.id })
      .populate("courseId", "name code duration")
      .populate("campusId", "name");

    if (!fee)
      return res.status(404).json({ message: "Fee not found for this course" });
    console.log("___fee", fee);
    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/admission-fees/course/:courseId/campus/:campusId
exports.getFeeByCourseAndCampus = async (req, res) => {
  try {
    const { courseId, campusId } = req.params;
    console.log("__admission_fees", courseId, campusId);
    const fee = await AdmissionFee.findOne({ courseId, campusId })
      .populate("courseId", "name code duration")
      .populate("campusId", "name");
    console.log("________fee", fee);
    if (!fee) {
      return res
        .status(404)
        .json({ message: "Fee not found for this course & campus" });
    }

    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Create new fee
// @route  POST /api/admission-fees
exports.createFee = async (req, res) => {
  try {
    const { courseId, campusId, mode, years } = req.body;

    // 🔍 fetch course name from Course collection
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 🔍 fetch campus name from College collection
    const campus = await College.findById(campusId);
    if (!campus) {
      return res.status(404).json({ message: "Campus not found" });
    }

    const newFee = new AdmissionFee({
      courseId,
      courseName: course.name, // ✅ add name from course
      campusId,
      campusName: campus.name, // ✅ add name from campus
      mode,
      years,
    });

    const savedFee = await newFee.save();
    res.status(201).json(savedFee);
  } catch (err) {
    console.log("______err", err);
    res.status(400).json({ message: err.message });
  }
};

// @desc   Update fee
// @route  PUT /api/admission-fees/:id
exports.updateFee = async (req, res) => {
  try {
    const updatedFee = await AdmissionFee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedFee) return res.status(404).json({ message: "Fee not found" });
    res.json(updatedFee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc   Delete fee
// @route  DELETE /api/admission-fees/:id
exports.deleteFee = async (req, res) => {
  try {
    const fee = await AdmissionFee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee not found" });
    res.json({ message: "Fee deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
