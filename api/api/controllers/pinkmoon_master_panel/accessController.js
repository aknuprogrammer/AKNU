// controllers/accessTypeController.js

const AccessType = require("../../models/pinkmoon_master_panel/accessTypes");

// @desc    Get all access types
// @route   GET /api/access-types
// @access  Public
const getAllAccessTypes = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };

    const accessTypes = await AccessType.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: accessTypes.length,
      data: accessTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get access type by ID
// @route   GET /api/access-types/:id
// @access  Public
const getAccessTypeById = async (req, res) => {
  try {
    const accessType = await AccessType.findById(req.params.id);
    
    if (!accessType) {
      return res.status(404).json({
        success: false,
        message: 'Access type not found'
      });
    }

    res.status(200).json({
      success: true,
      data: accessType
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid access type ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new access type
// @route   POST /api/access-types
// @access  Public
const createAccessType = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions must be an array'
      });
    }

    // Check if access type with same name already exists
    const existingAccessType = await AccessType.findOne({ name });
    if (existingAccessType) {
      return res.status(400).json({
        success: false,
        message: 'Access type with this name already exists'
      });
    }

    const newAccessType = new AccessType({
      name,
      description,
      permissions
    });

    const savedAccessType = await newAccessType.save();

    res.status(201).json({
      success: true,
      message: 'Access type created successfully',
      data: savedAccessType
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update access type
// @route   PUT /api/access-types/:id
// @access  Public
const updateAccessType = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Validation
    if (permissions !== undefined && !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions must be an array'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissions !== undefined) updateData.permissions = permissions;

    // Check if name already exists (excluding current access type)
    if (name) {
      const existingAccessType = await AccessType.findOne({ 
        name, 
        _id: { $ne: req.params.id } 
      });
      if (existingAccessType) {
        return res.status(400).json({
          success: false,
          message: 'Access type with this name already exists'
        });
      }
    }

    const updatedAccessType = await AccessType.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    if (!updatedAccessType) {
      return res.status(404).json({
        success: false,
        message: 'Access type not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Access type updated successfully',
      data: updatedAccessType
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid access type ID'
      });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete access type
// @route   DELETE /api/access-types/:id
// @access  Public
const deleteAccessType = async (req, res) => {
  try {
    const deletedAccessType = await AccessType.findByIdAndDelete(req.params.id);

    if (!deletedAccessType) {
      return res.status(404).json({
        success: false,
        message: 'Access type not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Access type deleted successfully',
      data: deletedAccessType
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid access type ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search access types by name
// @route   GET /api/access-types/search/:name
// @access  Public
const searchAccessTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const accessTypes = await AccessType.paginate(
      { name: { $regex: req.params.name, $options: 'i' } },
      {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      }
    );

    res.status(200).json({
      success: true,
      count: accessTypes.totalDocs,
      data: accessTypes.docs,
      pagination: {
        page: accessTypes.page,
        totalPages: accessTypes.totalPages,
        totalItems: accessTypes.totalDocs,
        hasNext: accessTypes.hasNextPage,
        hasPrev: accessTypes.hasPrevPage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get access types by permission
// @route   GET /api/access-types/permission/:permission
// @access  Public
const getAccessTypesByPermission = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { permission } = req.params;

    const accessTypes = await AccessType.paginate(
      { permissions: permission },
      {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      }
    );

    res.status(200).json({
      success: true,
      count: accessTypes.totalDocs,
      data: accessTypes.docs,
      pagination: {
        page: accessTypes.page,
        totalPages: accessTypes.totalPages,
        totalItems: accessTypes.totalDocs,
        hasNext: accessTypes.hasNextPage,
        hasPrev: accessTypes.hasPrevPage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get access types statistics
// @route   GET /api/access-types/stats/summary
// @access  Public
const getAccessTypeStats = async (req, res) => {
  try {
    const totalAccessTypes = await AccessType.countDocuments();
    
    // Count access types by number of permissions
    const accessTypesByPermissionCount = await AccessType.aggregate([
      {
        $project: {
          permissionCount: { $size: "$permissions" }
        }
      },
      {
        $group: {
          _id: "$permissionCount",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get most common permissions
    const mostCommonPermissions = await AccessType.aggregate([
      { $unwind: "$permissions" },
      {
        $group: {
          _id: "$permissions",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAccessTypes,
        byPermissionCount: accessTypesByPermissionCount,
        mostCommonPermissions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllAccessTypes,
  getAccessTypeById,
  createAccessType,
  updateAccessType,
  deleteAccessType,
  searchAccessTypes,
  getAccessTypesByPermission,
  getAccessTypeStats
};