const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const College = require("../../models/pinkmoon_master_panel/College");
const Module = require("../../models/pinkmoon_master_panel/modules");
const AccessType = require("../../models/pinkmoon_master_panel/accessTypes");

// @desc    Get all colleges
// @route   GET /api/colleges
// @access  Public
const getColleges = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { address: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const colleges = await College.find(search)
    .populate("modules")
    .populate("credentials.accessType", "name")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await College.countDocuments(search);

  res.status(200).json({
    success: true,
    count: colleges.length,
    total,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
    },
    data: colleges,
  });
});

// @desc    Get single college
// @route   GET /api/colleges/:id
// @access  Public
const getCollege = asyncHandler(async (req, res) => {
  const college = await College.findById(req.params.id)
    .populate("modules")
    .populate("credentials.accessType", "name");

  if (!college) {
    return res.status(404).json({
      success: false,
      message: "College not found",
    });
  }

  res.status(200).json({
    success: true,
    data: college,
  });
});

// @desc    Create new college
// @route   POST /api/colleges
// @access  Private
const createCollege = asyncHandler(async (req, res) => {
  const { credentials, modules, products, ...otherData } = req.body;

  // ✅ Hash credentials & validate accessType IDs
  let hashedCredentials = [];
  if (credentials && credentials.length > 0) {
    hashedCredentials = await Promise.all(
      credentials.map(async (cred) => {
        const existingAccessType = await AccessType.findById(cred.accessType);
        if (!existingAccessType) {
          throw new Error(`Invalid accessType ID: ${cred.accessType}`);
        }

        let hashedPassword = cred.password;
        if (cred.password) {
          const salt = await bcrypt.genSalt(10);
          hashedPassword = await bcrypt.hash(cred.password, salt);
        }

        return {
          ...cred,
          password: hashedPassword,
        };
      })
    );
  }
  console.log("____modules", req.body);
  // ✅ Validate module IDs
  let validModules = [];
  if (products && products.length > 0) {
    const foundModules = await Module.find({ name: { $in: products } });
console.log("____foundModules", foundModules, foundModules.length !== products.length);
    if (foundModules.length !== products.length) {
      return res.status(400).json({
        success: false,
        message: "One or more provided module names are invalid",
      });
    }

    validModules = foundModules.map((m) => m._id);
  }

  console.log("____validModules", validModules);
  const college = await College.create({
    ...otherData,
    credentials: hashedCredentials,
    modules: validModules.map((m) => m._id),
  });
console.log("____college", college);
  const populatedCollege = await College.findById(college._id)
    .populate("modules")
    .populate("credentials.accessType", "name");

  res.status(201).json({
    success: true,
    message: "College created successfully",
    data: populatedCollege,
  });
});

// @desc    Update college
// @route   PUT /api/colleges/:id
// @access  Private
const updateCollege = asyncHandler(async (req, res) => {
  let college = await College.findById(req.params.id);

  if (!college) {
    return res.status(404).json({
      success: false,
      message: "College not found",
    });
  }

  const { credentials, modules, ...otherData } = req.body;

  // ✅ Process credentials if provided
  let hashedCredentials = college.credentials; // keep old
  if (credentials && credentials.length > 0) {
    hashedCredentials = await Promise.all(
      credentials.map(async (cred) => {
        const existingAccessType = await AccessType.findById(cred.accessType);
        if (!existingAccessType) {
          throw new Error(`Invalid accessType ID: ${cred.accessType}`);
        }

        let hashedPassword = cred.password;
        if (cred.password) {
          const salt = await bcrypt.genSalt(10);
          hashedPassword = await bcrypt.hash(cred.password, salt);
        }

        return {
          ...cred,
          password: hashedPassword,
        };
      })
    );
  }

  // ✅ Validate modules
  let validModules = college.modules;
  if (modules && modules.length > 0) {
    validModules = await Module.find({ _id: { $in: modules } });
    if (validModules.length !== modules.length) {
      return res.status(400).json({
        success: false,
        message: "One or more provided modules are invalid",
      });
    }
  }

  college = await College.findByIdAndUpdate(
    req.params.id,
    {
      ...otherData,
      credentials: hashedCredentials,
      modules: validModules.map((m) => m._id),
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("modules")
    .populate("credentials.accessType", "name");

  res.status(200).json({
    success: true,
    message: "College updated successfully",
    data: college,
  });
});

// @desc    Delete college
// @route   DELETE /api/colleges/:id
// @access  Private
const deleteCollege = asyncHandler(async (req, res) => {
  const college = await College.findById(req.params.id);

  if (!college) {
    return res.status(404).json({
      success: false,
      message: "College not found",
    });
  }

  await College.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "College deleted successfully",
    data: {},
  });
});

// @desc    Get colleges by status
// @route   GET /api/colleges/status/:status
// @access  Public
const getCollegesByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const validStatuses = ["active", "inactive", "suspended"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value",
    });
  }

  const colleges = await College.find({ status })
    .populate("modules")
    .populate("credentials.accessType", "name");

  res.status(200).json({
    success: true,
    count: colleges.length,
    data: colleges,
  });
});

module.exports = {
  getColleges,
  getCollege,
  createCollege,
  updateCollege,
  deleteCollege,
  getCollegesByStatus,
};
