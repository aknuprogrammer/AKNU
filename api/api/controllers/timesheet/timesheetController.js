const Timesheet = require("../../models/timesheet/timesheetSchema");

// Create new timesheet entry
const createTimesheet = async (req, res) => {
  try {
    const {
      employeeName,
      employeeId,
      date,
      inTime,
      outTime,
      breakMinutes,
      status,
      subject,
      chapter,
      task,
      hours,
      active,
    } = req.body;
    // console.log("req.body", req.body);
    // Validate required fields
    if (!employeeName || !employeeId || !date || !inTime) {
      return res.status(400).json({
        success: false,
        message: "employeeName, employeeId, date, and inTime are required",
      });
    }

    const timesheet = new Timesheet({
      employeeName,
      employeeId,
      date: new Date(date),
      inTime,
      outTime,
      breakMinutes: breakMinutes || 0,
      status: status || "pending",
      subject,
      chapter,
      task,
      hours: hours || 0,
    });

    const savedTimesheet = await timesheet.save();

    return res.status(201).json({
      success: true,
      message: "Timesheet created successfully",
      data: savedTimesheet,
    });
  } catch (error) {
    console.error("Error creating timesheet:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all timesheets
const getTimesheets = async (req, res) => {
  try {
    const {
      employeeId,
      date,
      status,
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

    // Filter by active status (only if explicitly provided)
    if (active !== undefined) {
      query.active = active === "true" || active === true;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Filter by specific date
    if (date && !startDate && !endDate) {
      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // If page or limit is provided, use pagination; otherwise return all data
    const usePagination =
      page !== undefined || limit !== undefined || all === "false";

    if (usePagination && all !== "true") {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      const [timesheets, total] = await Promise.all([
        Timesheet.find(query)
          .sort({ date: -1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Timesheet.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        data: timesheets,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    }

    // Return all records without pagination (default behavior)
    const timesheets = await Timesheet.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: timesheets,
      count: timesheets.length,
      total: timesheets.length,
    });
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get single timesheet by ID
const getTimesheetById = async (req, res) => {
  try {
    const { id } = req.params;

    const timesheet = await Timesheet.findById(id);

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: timesheet,
    });
  } catch (error) {
    console.error("Error fetching timesheet:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get timesheets by employeeId
const getTimesheetsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, status, active } = req.query;

    const query = { employeeId };

    if (status) {
      query.status = status;
    }

    // Filter by active status (only if explicitly provided)
    if (active !== undefined) {
      query.active = active === "true" || active === true;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const timesheets = await Timesheet.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: timesheets,
      count: timesheets.length,
    });
  } catch (error) {
    console.error("Error fetching timesheets by employee:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update timesheet
const updateTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ["pending", "approved", "rejected", "submitted", "completed", "in_progress"];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }
    }

    // Convert date string to Date object if provided
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const timesheet = await Timesheet.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Timesheet updated successfully",
      data: timesheet,
    });
  } catch (error) {
    console.error("Error updating timesheet:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete timesheet
const deleteTimesheet = async (req, res) => {
  try {
    const { id } = req.params;

    const timesheet = await Timesheet.findByIdAndDelete(id);

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Timesheet deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timesheet:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update timesheet status
const updateTimesheetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["pending", "approved", "rejected", "submitted", "completed", "in_progress"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid status is required (pending, approved, rejected, submitted, completed, in_progress)",
      });
    }

    const timesheet = await Timesheet.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Timesheet status updated successfully",
      data: timesheet,
    });
  } catch (error) {
    console.error("Error updating timesheet status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createTimesheet,
  getTimesheets,
  getTimesheetById,
  getTimesheetsByEmployeeId,
  updateTimesheet,
  deleteTimesheet,
  updateTimesheetStatus,
};
