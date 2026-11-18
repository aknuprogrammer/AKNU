const PaySlip = require("../../models/employee/paySlipSchema");

// Create new pay slip
const createPaySlip = async (req, res) => {
  try {
    const {
      employeeName,
      employeeId,
      payPeriod,
      paidDays,
      lossOfPayDays,
      payDate,
      notes,
      earnings,
      deductions,
      grossEarnings,
      totalDeductions,
      netPayable,
      active,
    } = req.body;

    // Validate required fields
    if (
      !employeeName ||
      !employeeId ||
      !payPeriod ||
      paidDays === undefined ||
      !payDate ||
      grossEarnings === undefined ||
      totalDeductions === undefined ||
      netPayable === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "employeeName, employeeId, payPeriod, paidDays, payDate, grossEarnings, totalDeductions, and netPayable are required",
      });
    }

    // Parse earnings and deductions if they are JSON strings
    let parsedEarnings = earnings;
    let parsedDeductions = deductions;

    if (typeof earnings === "string") {
      try {
        parsedEarnings = JSON.parse(earnings);
      } catch (e) {
        parsedEarnings = earnings;
      }
    }

    if (typeof deductions === "string") {
      try {
        parsedDeductions = JSON.parse(deductions);
      } catch (e) {
        parsedDeductions = deductions;
      }
    }

    // Handle file upload if present
    const paySlipData = {
      employeeName,
      employeeId,
      payPeriod,
      paidDays: Number(paidDays),
      lossOfPayDays: lossOfPayDays ? Number(lossOfPayDays) : 0,
      payDate: new Date(payDate),
      notes: notes || "",
      earnings: parsedEarnings,
      deductions: parsedDeductions,
      grossEarnings: Number(grossEarnings),
      totalDeductions: Number(totalDeductions),
      netPayable: Number(netPayable),
      active: active !== undefined ? active : true,
      approvalStatus: "PENDING", // New payslips require admin approval
    };

    // Handle file upload
    if (req.file) {
      paySlipData.paySlipFile = req.file.buffer;
      paySlipData.paySlipFileContentType = req.file.mimetype;
      paySlipData.paySlipFileName = req.file.originalname;
    }

    const paySlip = new PaySlip(paySlipData);
    const savedPaySlip = await paySlip.save();

    // Remove file buffer from response to reduce payload size
    const responseData = savedPaySlip.toObject();
    if (responseData.paySlipFile) {
      responseData.paySlipFile = "File uploaded";
    }

    return res.status(201).json({
      success: true,
      message: "Pay slip created successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error creating pay slip:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all pay slips
const getPaySlips = async (req, res) => {
  try {
    const {
      employeeId,
      payPeriod,
      startDate,
      endDate,
      active,
      approvalStatus,
      page,
      limit,
      all,
    } = req.query;

    const query = {};

    // Check if user is admin/super_admin
    const isAdmin = req.user && (req.user.role === "admin" || req.user.role === "super_admin");

    // Employees can only see APPROVED payslips, admins can see all
    if (!isAdmin) {
      query.approvalStatus = "APPROVED";
    } else if (approvalStatus) {
      // Admins can filter by approval status if provided
      query.approvalStatus = approvalStatus;
    }

    if (employeeId) query.employeeId = employeeId;
    if (payPeriod) query.payPeriod = payPeriod;
    if (active !== undefined)
      query.active = active === "true" || active === true;

    if (startDate || endDate) {
      query.payDate = {};
      if (startDate) query.payDate.$gte = new Date(startDate);
      if (endDate) query.payDate.$lte = new Date(endDate);
    }

    const usePagination = page !== undefined || limit !== undefined || all === "false";

    if (usePagination && all !== "true") {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      const [paySlips, total] = await Promise.all([
        PaySlip.find(query)
          .select("-paySlipFile") // Exclude file buffer from list
          .sort({ payDate: -1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        PaySlip.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        data: paySlips,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    }

    const paySlips = await PaySlip.find(query)
      .select("-paySlipFile") // Exclude file buffer from list
      .sort({ payDate: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: paySlips,
      count: paySlips.length,
      total: paySlips.length,
    });
  } catch (error) {
    console.error("Error fetching pay slips:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get pay slip by ID
const getPaySlipById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeFile } = req.query; // Optional: include file buffer

    const paySlip = await PaySlip.findById(id);

    if (!paySlip) {
      return res.status(404).json({
        success: false,
        message: "Pay slip not found",
      });
    }

    // Check if user is admin/super_admin
    const isAdmin = req.user && (req.user.role === "admin" || req.user.role === "super_admin");

    // Employees can only view APPROVED payslips
    if (!isAdmin && paySlip.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Access denied. This pay slip is not yet approved.",
      });
    }

    const responseData = paySlip.toObject();

    // Only include file buffer if explicitly requested
    if (includeFile !== "true" && responseData.paySlipFile) {
      responseData.paySlipFile = "File available";
    }

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching pay slip:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get pay slips by employee ID
const getPaySlipsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, payPeriod, active, approvalStatus } = req.query;

    const query = { employeeId };

    // Check if user is admin/super_admin
    const isAdmin = req.user && (req.user.role === "admin" || req.user.role === "super_admin");

    // Employees can only see APPROVED payslips, admins can see all
    if (!isAdmin) {
      query.approvalStatus = "APPROVED";
    } else if (approvalStatus) {
      // Admins can filter by approval status if provided
      query.approvalStatus = approvalStatus;
    }

    if (payPeriod) query.payPeriod = payPeriod;
    if (active !== undefined)
      query.active = active === "true" || active === true;

    if (startDate || endDate) {
      query.payDate = {};
      if (startDate) query.payDate.$gte = new Date(startDate);
      if (endDate) query.payDate.$lte = new Date(endDate);
    }

    const paySlips = await PaySlip.find(query)
      .select("-paySlipFile") // Exclude file buffer from list
      .sort({ payDate: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: paySlips,
      count: paySlips.length,
    });
  } catch (error) {
    console.error("Error fetching pay slips:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update pay slip
const updatePaySlip = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects if provided
    if (updateData.payDate) {
      updateData.payDate = new Date(updateData.payDate);
    }

    // Parse earnings and deductions if they are JSON strings
    if (updateData.earnings && typeof updateData.earnings === "string") {
      try {
        updateData.earnings = JSON.parse(updateData.earnings);
      } catch (e) {
        // Keep as is if parsing fails
      }
    }

    if (updateData.deductions && typeof updateData.deductions === "string") {
      try {
        updateData.deductions = JSON.parse(updateData.deductions);
      } catch (e) {
        // Keep as is if parsing fails
      }
    }

    // Convert numeric fields
    if (updateData.paidDays !== undefined)
      updateData.paidDays = Number(updateData.paidDays);
    if (updateData.lossOfPayDays !== undefined)
      updateData.lossOfPayDays = Number(updateData.lossOfPayDays);
    if (updateData.grossEarnings !== undefined)
      updateData.grossEarnings = Number(updateData.grossEarnings);
    if (updateData.totalDeductions !== undefined)
      updateData.totalDeductions = Number(updateData.totalDeductions);
    if (updateData.netPayable !== undefined)
      updateData.netPayable = Number(updateData.netPayable);

    // Handle file upload if present
    if (req.file) {
      updateData.paySlipFile = req.file.buffer;
      updateData.paySlipFileContentType = req.file.mimetype;
      updateData.paySlipFileName = req.file.originalname;
    }

    const paySlip = await PaySlip.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!paySlip) {
      return res.status(404).json({
        success: false,
        message: "Pay slip not found",
      });
    }

    const responseData = paySlip.toObject();
    if (responseData.paySlipFile) {
      responseData.paySlipFile = "File uploaded";
    }

    return res.status(200).json({
      success: true,
      message: "Pay slip updated successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error updating pay slip:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete pay slip
const deletePaySlip = async (req, res) => {
  try {
    const { id } = req.params;

    const paySlip = await PaySlip.findByIdAndDelete(id);

    if (!paySlip) {
      return res.status(404).json({
        success: false,
        message: "Pay slip not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pay slip deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pay slip:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get pay slip file
const getPaySlipFile = async (req, res) => {
  try {
    const { id } = req.params;

    const paySlip = await PaySlip.findById(id).select(
      "paySlipFile paySlipFileContentType paySlipFileName approvalStatus"
    );

    if (!paySlip || !paySlip.paySlipFile) {
      return res.status(404).json({
        success: false,
        message: "Pay slip file not found",
      });
    }

    // Check if user is admin or if payslip is approved (employees can only view approved payslips)
    const isAdmin = req.user && (req.user.role === "admin" || req.user.role === "super_admin");
    if (!isAdmin && paySlip.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Access denied. This pay slip is not yet approved.",
      });
    }

    res.setHeader("Content-Type", paySlip.paySlipFileContentType || "application/pdf");
    if (paySlip.paySlipFileName) {
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${paySlip.paySlipFileName}"`
      );
    }

    return res.send(paySlip.paySlipFile);
  } catch (error) {
    console.error("Error fetching pay slip file:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Approve pay slip (Admin only)
const approvePaySlip = async (req, res) => {
  try {
    const { id } = req.params;
    const adminName = req.user?.name || req.user?.username || req.user?._id?.toString() || "Admin";

    const paySlip = await PaySlip.findByIdAndUpdate(
      id,
      {
        approvalStatus: "APPROVED",
        approvedBy: adminName,
        approvedAt: new Date(),
        rejectionReason: undefined, // Clear rejection reason if any
      },
      { new: true, runValidators: true }
    );

    if (!paySlip) {
      return res.status(404).json({
        success: false,
        message: "Pay slip not found",
      });
    }

    const responseData = paySlip.toObject();
    if (responseData.paySlipFile) {
      responseData.paySlipFile = "File available";
    }

    return res.status(200).json({
      success: true,
      message: "Pay slip approved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error approving pay slip:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Reject pay slip (Admin only)
const rejectPaySlip = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminName = req.user?.name || req.user?.username || req.user?._id?.toString() || "Admin";

    const paySlip = await PaySlip.findByIdAndUpdate(
      id,
      {
        approvalStatus: "REJECTED",
        approvedBy: adminName,
        approvedAt: new Date(),
        rejectionReason: rejectionReason || "",
      },
      { new: true, runValidators: true }
    );

    if (!paySlip) {
      return res.status(404).json({
        success: false,
        message: "Pay slip not found",
      });
    }

    const responseData = paySlip.toObject();
    if (responseData.paySlipFile) {
      responseData.paySlipFile = "File available";
    }

    return res.status(200).json({
      success: true,
      message: "Pay slip rejected successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error rejecting pay slip:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createPaySlip,
  getPaySlips,
  getPaySlipById,
  getPaySlipsByEmployeeId,
  updatePaySlip,
  deletePaySlip,
  getPaySlipFile,
  approvePaySlip,
  rejectPaySlip,
};

