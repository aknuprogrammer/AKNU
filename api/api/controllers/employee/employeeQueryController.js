const EmployeeQuery = require("../../models/employee/EmployeeQuery");

// Create new employee query
const createEmployeeQuery = async (req, res) => {
  try {
    const queryData = { ...req.body };

    // Handle file uploads (req.files is an array when using upload.any())
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Filter only attachment files (you can name the field "attachments" in frontend)
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
        queryData.attachments = attachments;
      }
    }

    const employeeQuery = new EmployeeQuery(queryData);
    await employeeQuery.save();

    // Exclude binary data from response
    const responseData = employeeQuery.toObject();
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
      message: "Query submitted successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error creating employee query:", error);
    res.status(500).json({
      success: false,
      error: "Error submitting query",
      details: error.message,
    });
  }
};

// Get all employee queries
const getEmployeeQueries = async (req, res) => {
  try {
    const {
      status,
      priority,
      department,
      employeeId,
      email,
      queryType,
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

    // Filter by priority
    if (priority) {
      query.priority = priority;
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

    // Filter by queryType
    if (queryType) {
      query.queryType = queryType;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [records, total] = await Promise.all([
      EmployeeQuery.find(query)
        .select("-attachments.file") // Exclude binary data
        .populate("resolvedBy", "email fullName")
        .populate("createdBy", "email fullName")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      EmployeeQuery.countDocuments(query),
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
    console.error("Error fetching employee queries:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching queries",
      details: error.message,
    });
  }
};

// Get single employee query by ID
const getEmployeeQueryById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = await EmployeeQuery.findById(id)
      .select("-attachments.file") // Exclude binary data
      .populate("resolvedBy", "email fullName")
      .populate("createdBy", "email fullName")
      .lean();

    if (!query) {
      return res.status(404).json({
        success: false,
        error: "Query not found",
      });
    }

    res.status(200).json({
      success: true,
      data: query,
    });
  } catch (error) {
    console.error("Error fetching employee query:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching query",
      details: error.message,
    });
  }
};

// Update employee query
const updateEmployeeQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle file uploads for additional attachments
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const existingQuery = await EmployeeQuery.findById(id);
      if (!existingQuery) {
        return res.status(404).json({
          success: false,
          error: "Query not found",
        });
      }

      const newAttachments = existingQuery.attachments || [];
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

    // If status is being updated to resolved/closed, set resolvedAt
    if (updateData.status === "resolved" || updateData.status === "closed") {
      if (!updateData.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
    }

    const query = await EmployeeQuery.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .select("-attachments.file")
      .populate("resolvedBy", "email fullName")
      .populate("updatedBy", "email fullName");

    if (!query) {
      return res.status(404).json({
        success: false,
        error: "Query not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Query updated successfully",
      data: query,
    });
  } catch (error) {
    console.error("Error updating employee query:", error);
    res.status(500).json({
      success: false,
      error: "Error updating query",
      details: error.message,
    });
  }
};

// Delete employee query
const deleteEmployeeQuery = async (req, res) => {
  try {
    const { id } = req.params;

    const query = await EmployeeQuery.findByIdAndDelete(id);

    if (!query) {
      return res.status(404).json({
        success: false,
        error: "Query not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Query deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee query:", error);
    res.status(500).json({
      success: false,
      error: "Error deleting query",
      details: error.message,
    });
  }
};

// Get attachment file
const getAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params;

    const query = await EmployeeQuery.findById(id);

    if (!query) {
      return res.status(404).json({
        success: false,
        error: "Query not found",
      });
    }

    const attachment = query.attachments.find(
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
  createEmployeeQuery,
  getEmployeeQueries,
  getEmployeeQueryById,
  updateEmployeeQuery,
  deleteEmployeeQuery,
  getAttachment,
};

