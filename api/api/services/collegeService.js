const College = require('../models/certificationFee/collegeModel');
// const ApiError = require('../utils/certificationFee/apiError');

const createCollege = async (collegeData) => {
  return await College.create(collegeData);
};

const getAllColleges = async () => {
  return await College.find();
};

const getCollegeById = async (id) => {
  const college = await College.findById(id);
//   if (!college) {
//     throw new ApiError(404, 'College not found');
//   }
  return college;
};

const updateCollege = async (id, updateData) => {
  const college = await College.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
  if (!college) {
    // throw new ApiError(404, 'College not found');
  }
  return college;
};

const deleteCollege = async (id) => {
  const college = await College.findByIdAndDelete(id);
  if (!college) {
    // throw new ApiError(404, 'College not found');
  }
  return college;
};

module.exports = {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollege,
  deleteCollege
};