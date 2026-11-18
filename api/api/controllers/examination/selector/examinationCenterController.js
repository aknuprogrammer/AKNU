// @desc Get all examination centers

const ExaminationCenter = require("../../../models/examination/selector/ExaminationCenter");

// @route GET /api/examination/examination-centers
exports.getExaminationCenters = async (req, res) => {
  try {
    const examinationCenters = await ExaminationCenter.find()
      .populate("collegeId", "code name location")
      .sort({ createdAt: -1 });
    res.json(examinationCenters);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create an examination center
// @route POST /api/examination/examination-centers
exports.createExaminationCenter = async (req, res) => {
  try {
    const {
      code,
      name,
      collegeId,
      address,
      capacity,
      rooms,
      contactPerson,
      contactNumber,
      email,
      status,
    } = req.body;

    const examinationCenter = new ExaminationCenter({
      code,
      name,
      collegeId,
      address,
      capacity,
      rooms,
      contactPerson,
      contactNumber,
      email,
      status,
    });

    await examinationCenter.save();

    // Populate collegeId before sending response
    await examinationCenter.populate("collegeId", "code name location");

    res.status(201).json(examinationCenter);
  } catch (error) {
    console.error("Error creating examination center:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update an examination center
// @route PUT /api/examination/examination-centers/:id
exports.updateExaminationCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExaminationCenter = await ExaminationCenter.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    ).populate("collegeId", "code name location");
    if (!updatedExaminationCenter)
      return res
        .status(404)
        .json({ message: "Examination center not found" });
    res.json(updatedExaminationCenter);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete an examination center
// @route DELETE /api/examination/examination-centers/:id
exports.deleteExaminationCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExaminationCenter =
      await ExaminationCenter.findByIdAndDelete(id);
    if (!deletedExaminationCenter)
      return res
        .status(404)
        .json({ message: "Examination center not found" });
    res.json({ message: "Examination center deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single examination center by ID
// @route GET /api/examination/examination-centers/:id
exports.getExaminationCenterById = async (req, res) => {
  try {
    const { id } = req.params;
    const examinationCenter = await ExaminationCenter.findById(id).populate(
      "collegeId",
      "code name location"
    );
    if (!examinationCenter)
      return res
        .status(404)
        .json({ message: "Examination center not found" });
    res.json(examinationCenter);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get examination centers by collegeId
// @route GET /api/examination/examination-centers/college/:collegeId
exports.getExaminationCentersByCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const examinationCenters = await ExaminationCenter.find({ collegeId })
      .populate("collegeId", "code name location")
      .sort({ name: 1 });
    res.json(examinationCenters);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

