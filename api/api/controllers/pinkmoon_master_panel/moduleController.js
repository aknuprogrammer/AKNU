// controllers/moduleController.js
const Module = require("../../models/pinkmoon_master_panel/modules");
const AccessType = require("../../models/pinkmoon_master_panel/accessTypes");

// @desc    Get all modules
// @route   GET /api/modules
// @access  Public
const getAllModules = async (req, res) => {
  try {
    const { accessType, search } = req.query;

    const filter = {};
    if (accessType) filter.accessType = accessType;
    if (search) filter.name = { $regex: search, $options: "i" };

    const modules = await Module.find(filter)
      .populate("accessType", "name") // ✅ show access type name
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get module by ID
// @route   GET /api/modules/:id
// @access  Public
const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate(
      "accessType",
      "name"
    );
    if (!module) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    res.status(200).json({ success: true, data: module });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid module ID" });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Create new module
// @route   POST /api/modules
// @access  Public
const createModule = async (req, res) => {
  try {
    const { name, accessType, price } = req.body;

    if (!name || !accessType || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, accessType, and price are required",
      });
    }

    if (typeof price !== "number" || price < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Price must be a positive number" });
    }
    console.log("____accessType", req.body);
    // ✅ validate AccessType exists
    const existingAccessType = await AccessType.findOne({ name: accessType });
    if (!existingAccessType) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid accessType name" });
    }

    console.log("____existingAccessType", existingAccessType);
    const existingModule = await Module.findOne({ name });
    if (existingModule) {
      return res.status(400).json({
        success: false,
        message: "Module with this name already exists",
      });
    }
    console.log("__1__existingAccessType", existingAccessType);

    const newModule = new Module({
      name,
      accessType: existingAccessType._id,
      price,
    });
    const savedModule = await newModule.save();

    res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: savedModule,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      console.log("____error", error);
      const errors = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ success: false, message: "Validation error", errors });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Public
const updateModule = async (req, res) => {
  try {
    const { name, accessType, price } = req.body;

    // ✅ validate price
    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      });
    }
console.log("____accessType", req.body);
    const updateData = {};

    // ✅ handle name
    if (name !== undefined) updateData.name = name;

    // ✅ handle accessType by name
    if (accessType !== undefined) {
      const existingAccessType = await AccessType.findOne({ name: accessType.name });
      if (!existingAccessType) {
        return res.status(400).json({
          success: false,
          message: "Invalid accessType name",
        });
      }
      updateData.accessType = existingAccessType._id;
    }

    // ✅ handle price
    if (price !== undefined) updateData.price = price;

    // ✅ check duplicate name
    if (name) {
      const existingModule = await Module.findOne({
        name,
        _id: { $ne: req.params.id },
      });
      if (existingModule) {
        return res.status(400).json({
          success: false,
          message: "Module with this name already exists",
        });
      }
    }

    // ✅ update and populate
    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    ).populate("accessType", "name");

    if (!updatedModule) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: updatedModule,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid module ID" });
    }
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ success: false, message: "Validation error", errors });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Public
const deleteModule = async (req, res) => {
  try {
    const deletedModule = await Module.findByIdAndDelete(req.params.id);
    if (!deletedModule) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    res.status(200).json({
      success: true,
      message: "Module deleted successfully",
      data: deletedModule,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid module ID" });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get modules statistics
// @route   GET /api/modules/stats/summary
// @access  Public
const getModuleStats = async (req, res) => {
  try {
    const totalModules = await Module.countDocuments();
    const totalValue = await Module.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const modulesByAccessType = await Module.aggregate([
      {
        $group: {
          _id: "$accessType",
          count: { $sum: 1 },
          totalValue: { $sum: "$price" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalModules,
        totalValue: totalValue[0]?.total || 0,
        byAccessType: modulesByAccessType,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
// @desc Search modules by name
const searchModules = async (req, res) => {
  try {
    const { name } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const modules = await Module.find({ name: { $regex: name, $options: "i" } })
      .populate("accessType", "name")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Module.countDocuments({
      name: { $regex: name, $options: "i" },
    });

    res.status(200).json({
      success: true,
      count: total,
      data: modules,
      pagination: {
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getModulesByAccessType = async (req, res) => {
  try {
    const { accessType } = req.params; // can be ObjectId or name
    const { page = 1, limit = 10 } = req.query;

    let filter = {};

    if (mongoose.Types.ObjectId.isValid(accessType)) {
      // Treat it as ObjectId
      filter = { accessType };
    } else {
      // Treat it as accessType name
      const accessTypeDoc = await AccessType.findOne({ name: accessType });
      if (!accessTypeDoc) {
        return res
          .status(404)
          .json({ success: false, message: "AccessType not found" });
      }
      filter = { accessType: accessTypeDoc._id };
    }

    const modules = await Module.find(filter)
      .populate("accessType", "name")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Module.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: total,
      data: modules,
      pagination: {
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  getModuleStats,
  searchModules,
  getModulesByAccessType,
};
