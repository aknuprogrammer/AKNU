const EmployeeResignation = require("../../models/employee/EmployeeResignation");

// Create new employee resignation
const createEmployeeResignation = async (req, res) => {
  try {
    const resignationData = { ...req.body };

    // Handle file uploads (req.files is an array when using upload.any())
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Filter only attachment files
      const attachments = [];
      req.files.forEach((file) => {
        if (file.fieldname === "attachments" || file.fieldname.startsWith("attachment")) {
          attachments.push({
            file: file.buffer,
            fileName: file.originalname,
            contentType: file.mimetype,
            uploadedAt: new Date(),
          });
        }
      });

      if (attachments.length > 0) {
        resignationData.attachments = attachments;
      }
    }

    const employeeResignation = new EmployeeResignation(resignationData);
    await employeeResignation.save();

    // Exclude binary data from response
    const responseData = employeeResignation.toObject();
    if (responseData.attachments) {
      responseData.attachments = responseData.attachments.map((att) => ({
        fileName: att.fileName,
        contentType: att.contentType,
        uploadedAt: att.uploadedAt,
        _id: att._id,
      }));
    }

    res.status(201).json({
      success: true,
      message: "Resignation submitted successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error creating employee resignation:", error);
    res.status(500).json({
      success: false,
      error: "Error submitting resignation",
      details: error.message,
    });
  }
};

// Get all employee resignations
const getEmployeeResignations = async (req, res) => {
  try {
    const {
      status,
      department,
      employeeId,
      email,
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by employeeId
    if (employeeId) {
      query.employeeId = employeeId;
    }

    // Filter by email
    if (email) {
      query.email = email.toLowerCase();
    }

    // Search functionality
    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
        { reasonDetails: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [records, total] = await Promise.all([
      EmployeeResignation.find(query)
        .select("-attachments.file") // Exclude binary data
        .populate("reviewedBy", "email fullName")
        .populate("approvedBy", "email fullName")
        .populate("createdBy", "email fullName")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      EmployeeResignation.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching employee resignations:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching resignations",
      details: error.message,
    });
  }
};

// Get single employee resignation by ID
const getEmployeeResignationById = async (req, res) => {
  try {
    const { id } = req.params;

    const resignation = await EmployeeResignation.findById(id)
      .select("-attachments.file") // Exclude binary data
      .populate("reviewedBy", "email fullName")
      .populate("approvedBy", "email fullName")
      .populate("createdBy", "email fullName")
      .lean();

    if (!resignation) {
      return res.status(404).json({
        success: false,
        error: "Resignation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: resignation,
    });
  } catch (error) {
    console.error("Error fetching employee resignation:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching resignation",
      details: error.message,
    });
  }
};

// Update employee resignation
const updateEmployeeResignation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle file uploads for additional attachments
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const existingResignation = await EmployeeResignation.findById(id);
      if (!existingResignation) {
        return res.status(404).json({
          success: false,
          error: "Resignation not found",
        });
      }

      const newAttachments = existingResignation.attachments || [];
      req.files.forEach((file) => {
        if (file.fieldname === "attachments" || file.fieldname.startsWith("attachment")) {
          newAttachments.push({
            file: file.buffer,
            fileName: file.originalname,
            contentType: file.mimetype,
            uploadedAt: new Date(),
          });
        }
      });

      updateData.attachments = newAttachments;
    }

    // If status is being updated to reviewed, set reviewedAt
    if (updateData.status === "under_review" || updateData.status === "reviewed") {
      if (!updateData.reviewedAt) {
        updateData.reviewedAt = new Date();
      }
    }

    // Get existing resignation to check employeeId before update
    const existingResignation = await EmployeeResignation.findById(id);
    if (!existingResignation) {
      return res.status(404).json({
        success: false,
        error: "Resignation not found",
      });
    }

    // If status is being updated to approved, set approvedAt and mark employee as resigned
    if (updateData.status === "approved") {
      if (!updateData.approvedAt) {
        updateData.approvedAt = new Date();
      }
      
      // Mark employee as resigned in EmployeeRegistration
      try {
        const EmployeeRegistration = require("../../models/employee/EmployeeRegistration");
        const employeeId = updateData.employeeId || existingResignation.employeeId;
        const employee = await EmployeeRegistration.findOne({ 
          employeeId: employeeId
        });
        
        if (employee) {
          employee.status = "resigned";
          await employee.save();
        }
      } catch (error) {
        console.error("Error updating employee status:", error);
        // Don't fail the resignation update if employee status update fails
      }
    }

    const resignation = await EmployeeResignation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .select("-attachments.file")
      .populate("reviewedBy", "email fullName")
      .populate("approvedBy", "email fullName")
      .populate("updatedBy", "email fullName");

    res.status(200).json({
      success: true,
      message: "Resignation updated successfully",
      data: resignation,
    });
  } catch (error) {
    console.error("Error updating employee resignation:", error);
    res.status(500).json({
      success: false,
      error: "Error updating resignation",
      details: error.message,
    });
  }
};

// Delete employee resignation
const deleteEmployeeResignation = async (req, res) => {
  try {
    const { id } = req.params;

    const resignation = await EmployeeResignation.findByIdAndDelete(id);

    if (!resignation) {
      return res.status(404).json({
        success: false,
        error: "Resignation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Resignation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee resignation:", error);
    res.status(500).json({
      success: false,
      error: "Error deleting resignation",
      details: error.message,
    });
  }
};

// Get attachment file
const getAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params;

    const resignation = await EmployeeResignation.findById(id);

    if (!resignation) {
      return res.status(404).json({
        success: false,
        error: "Resignation not found",
      });
    }

    const attachment = resignation.attachments.find(
      (att) => att._id.toString() === attachmentId
    );

    if (!attachment || !attachment.file) {
      return res.status(404).json({
        success: false,
        error: "Attachment not found",
      });
    }

    res.set("Content-Type", attachment.contentType || "application/octet-stream");
    res.set(
      "Content-Disposition",
      `inline; filename="${attachment.fileName || "attachment"}"`
    );
    res.send(Buffer.from(attachment.file));
  } catch (error) {
    console.error("Error fetching attachment:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching attachment",
      details: error.message,
    });
  }
};

module.exports = {
  createEmployeeResignation,
  getEmployeeResignations,
  getEmployeeResignationById,
  updateEmployeeResignation,
  deleteEmployeeResignation,
  getAttachment,
};

