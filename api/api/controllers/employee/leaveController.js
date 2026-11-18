const Leave = require("../../models/employee/leaveSchema");

// Create new leave request
const createLeave = async (req, res) => {
  try {
    const {
      employeeName,
      employeeId,
      startDate,
      endDate,
      reason,
      leaveType,
      leaveDuration,
      status,
      active,
    } = req.body;
    console.log("req.body", req.body);
    // Validate required fields
    if (
      !employeeName ||
      !employeeId ||
      !startDate ||
      !endDate ||
      !reason ||
      !leaveType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "employeeName, employeeId, startDate, endDate, reason, and leaveType are required",
      });
    }

    // Validate and normalize leaveType
    let normalizedLeaveType = String(leaveType).trim().toLowerCase();

    // Extract first word if it contains space (e.g., "casual leave" -> "casual")
    if (normalizedLeaveType.includes(" ")) {
      normalizedLeaveType = normalizedLeaveType.split(" ")[0];
    }

    // Valid enum values
    const validLeaveTypes = [
      "sick",
      "casual",
      "earned",
      "maternity",
      "paternity",
      "compensatory",
      "sabbatical",
      "unpaid",
      "other",
    ];

    if (!validLeaveTypes.includes(normalizedLeaveType)) {
      return res.status(400).json({
        success: false,
        message: `leaveType must be one of: ${validLeaveTypes.join(", ")}`,
      });
    }

    // Validate and normalize leaveDuration if provided
    let normalizedLeaveDuration = undefined;
    if (
      leaveDuration !== undefined &&
      leaveDuration !== null &&
      leaveDuration !== ""
    ) {
      let trimmedDuration = String(leaveDuration).trim().toLowerCase();

      // Handle variations like "half day", "full day", "halfday", etc.
      if (trimmedDuration.includes("half")) {
        trimmedDuration = "half";
      } else if (
        trimmedDuration.includes("full") ||
        trimmedDuration === "fullday"
      ) {
        trimmedDuration = "fullday";
      }

      if (!["half", "fullday"].includes(trimmedDuration)) {
        return res.status(400).json({
          success: false,
          message: "leaveDuration must be either 'half' or 'fullday'",
        });
      }
      normalizedLeaveDuration = trimmedDuration;
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be before or equal to endDate",
      });
    }

    const leaveData = {
      employeeName,
      employeeId,
      startDate: start,
      endDate: end,
      reason,
      leaveType: normalizedLeaveType,
      status: status || "pending",
      active: active !== undefined ? active : true,
    };

    // Only include leaveDuration if it has a valid value
    if (normalizedLeaveDuration) {
      leaveData.leaveDuration = normalizedLeaveDuration;
    }

    const leave = new Leave(leaveData);

    const savedLeave = await leave.save();

    return res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      data: savedLeave,
    });
  } catch (error) {
    console.error("Error creating leave:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all leave requests
const getLeaves = async (req, res) => {
  try {
    const {
      employeeId,
      status,
      leaveType,
      startDate,
      endDate,
      active,
      page,
      limit,
      all,
    } = req.query;

    const query = {};

    // Filter by employeeId
    if (employeeId) {
      query.employeeId = employeeId;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by leaveType
    if (leaveType) {
      query.leaveType = leaveType;
    }

    // Filter by active status (only if explicitly provided)
    if (active !== undefined) {
      query.active = active === "true" || active === true;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.$or = [];
      if (startDate && endDate) {
        // Find leaves that overlap with the given date range
        query.$or.push({
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        });
      } else if (startDate) {
        query.endDate = { $gte: new Date(startDate) };
      } else if (endDate) {
        query.startDate = { $lte: new Date(endDate) };
      }
    }

    // If page or limit is provided, use pagination; otherwise return all data
    const usePagination =
      page !== undefined || limit !== undefined || all === "false";

    if (usePagination && all !== "true") {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      const [leaves, total] = await Promise.all([
        Leave.find(query)
          .sort({ startDate: -1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Leave.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        data: leaves,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    }

    // Return all records without pagination (default behavior)
    const leaves = await Leave.find(query)
      .sort({ startDate: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: leaves,
      count: leaves.length,
      total: leaves.length,
    });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get single leave by ID
const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    console.error("Error fetching leave:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get leaves by employeeId
const getLeavesByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, status, leaveType, active } = req.query;

    const query = { employeeId };

    if (status) {
      query.status = status;
    }

    if (leaveType) {
      query.leaveType = leaveType;
    }

    // Filter by active status (only if explicitly provided)
    if (active !== undefined) {
      query.active = active === "true" || active === true;
    }

    if (startDate || endDate) {
      query.$or = [];
      if (startDate && endDate) {
        query.$or.push({
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        });
      } else if (startDate) {
        query.endDate = { $gte: new Date(startDate) };
      } else if (endDate) {
        query.startDate = { $lte: new Date(endDate) };
      }
    }

    const leaves = await Leave.find(query)
      .sort({ startDate: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: leaves,
      count: leaves.length,
    });
  } catch (error) {
    console.error("Error fetching leaves by employee:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update leave request
const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    // Validate date range if both dates are being updated
    if (updateData.startDate && updateData.endDate) {
      if (updateData.startDate > updateData.endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate must be before or equal to endDate",
        });
      }
    }

    // Normalize leaveType if provided
    if (updateData.leaveType) {
      let normalizedLeaveType = String(updateData.leaveType)
        .trim()
        .toLowerCase();

      // Extract first word if it contains space (e.g., "casual leave" -> "casual")
      if (normalizedLeaveType.includes(" ")) {
        normalizedLeaveType = normalizedLeaveType.split(" ")[0];
      }

      const validLeaveTypes = [
        "sick",
        "casual",
        "earned",
        "maternity",
        "paternity",
        "compensatory",
        "sabbatical",
        "unpaid",
        "other",
      ];

      if (!validLeaveTypes.includes(normalizedLeaveType)) {
        return res.status(400).json({
          success: false,
          message: `leaveType must be one of: ${validLeaveTypes.join(", ")}`,
        });
      }

      updateData.leaveType = normalizedLeaveType;
    }

    // Normalize leaveDuration if provided
    if (
      updateData.leaveDuration !== undefined &&
      updateData.leaveDuration !== null &&
      updateData.leaveDuration !== ""
    ) {
      let trimmedDuration = String(updateData.leaveDuration)
        .trim()
        .toLowerCase();

      // Handle variations like "half day", "full day", "halfday", etc.
      if (trimmedDuration.includes("half")) {
        trimmedDuration = "half";
      } else if (
        trimmedDuration.includes("full") ||
        trimmedDuration === "fullday"
      ) {
        trimmedDuration = "fullday";
      }

      if (!["half", "fullday"].includes(trimmedDuration)) {
        return res.status(400).json({
          success: false,
          message: "leaveDuration must be either 'half' or 'fullday'",
        });
      }

      updateData.leaveDuration = trimmedDuration;
    } else if (
      updateData.leaveDuration === "" ||
      updateData.leaveDuration === null
    ) {
      // Remove leaveDuration if empty string or null is sent
      delete updateData.leaveDuration;
    }

    const leave = await Leave.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Leave request updated successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Error updating leave:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete leave request
const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findByIdAndDelete(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Leave request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting leave:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update leave status
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["pending", "approved", "rejected", "cancelled"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid status is required (pending, approved, rejected, cancelled)",
      });
    }

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Leave status updated successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Error updating leave status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createLeave,
  getLeaves,
  getLeaveById,
  getLeavesByEmployeeId,
  updateLeave,
  deleteLeave,
  updateLeaveStatus,
};
