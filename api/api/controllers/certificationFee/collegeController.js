const collegeService = require("../../services/collegeService");
const ApiResponse = require("../../utils/certificationFee/apiResponse");
const asyncHandler = require("../../utils/certificationFee/asyncHandler");

const createCollege = asyncHandler(async (req, res) => {
  console.log("______req.body", req.body);
  const college = await collegeService.createCollege(req.body);
  res.status(201).json(new ApiResponse(201, college));
});

const getAllColleges = asyncHandler(async (req, res) => {
  const colleges = await collegeService.getAllColleges();
  res.status(200).json(new ApiResponse(200, colleges));
});

const getCollegeById = asyncHandler(async (req, res) => {
  const college = await collegeService.getCollegeById(req.params.id);
  res.status(200).json(new ApiResponse(200, college));
});

const updateCollege = asyncHandler(async (req, res) => {
  const college = await collegeService.updateCollege(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, college));
});

const deleteCollege = asyncHandler(async (req, res) => {
  const deleted = await collegeService.deleteCollege(req.params.id);

  if (!deleted) {
    return res
      .status(404)
      .json({ success: false, message: "College not found" });
  }

  res
    .status(200)
    .json({ success: true, message: "College deleted successfully" });
});

module.exports = {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
};
