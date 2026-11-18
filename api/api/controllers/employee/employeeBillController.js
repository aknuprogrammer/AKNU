const EmployeeBill = require("../../models/employee/EmployeeBill");

// Create new employee bill
const createEmployeeBill = async (req, res) => {
  try {
    const billData = { ...req.body };

    // Convert billAmount to number if it's a string
    if (billData.billAmount) {
      billData.billAmount = parseFloat(billData.billAmount);
      if (isNaN(billData.billAmount) || billData.billAmount < 0) {
        return res.status(400).json({
          success: false,
          error: "Bill amount must be a valid positive number",
        });
      }
    }

    // Convert billDate to Date if it's a string
    if (billData.billDate) {
      billData.billDate = new Date(billData.billDate);
      if (isNaN(billData.billDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: "Bill date must be a valid date",
        });
      }
    }

    // Handle file uploads (req.files is an array when using upload.any())
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Filter only bill document files
      const billDocuments = [];
      req.files.forEach((file) => {
        if (
          file.fieldname === "billDocuments" ||
          file.fieldname === "billReceipt" ||
          file.fieldname.startsWith("billDocument")
        ) {
          billDocuments.push({
            file: file.buffer,
            fileName: file.originalname,
            contentType: file.mimetype,
            uploadedAt: new Date(),
          });
        }
      });

      if (billDocuments.length > 0) {
        billData.billDocuments = billDocuments;
      }
    }

    const employeeBill = new EmployeeBill(billData);
    await employeeBill.save();

    // Exclude binary data from response
    const responseData = employeeBill.toObject();
    if (responseData.billDocuments) {
      responseData.billDocuments = responseData.billDocuments.map((doc) => ({
        fileName: doc.fileName,
        contentType: doc.contentType,
        uploadedAt: doc.uploadedAt,
        _id: doc._id,
      }));
    }

    res.status(201).json({
      success: true,
      message: "Bill submitted successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error creating employee bill:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit bill",
      details: error.message,
    });
  }
};

// Get all employee bills with pagination, search, and filters
const getEmployeeBills = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      department,
      billType,
      employeeId,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Department filter
    if (department) {
      query.department = department;
    }

    // Bill Type filter
    if (billType) {
      query.billType = billType;
    }

    // Employee ID filter
    if (employeeId) {
      query.employeeId = employeeId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.billDate = {};
      if (startDate) {
        query.billDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.billDate.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bills, total] = await Promise.all([
      EmployeeBill.find(query)
        .populate("reviewedBy", "name email")
        .populate("paidBy", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      EmployeeBill.countDocuments(query),
    ]);

    // Exclude binary data from response
    const billsWithoutBinary = bills.map((bill) => {
      const billObj = { ...bill };
      if (billObj.billDocuments) {
        billObj.billDocuments = billObj.billDocuments.map((doc) => ({
          fileName: doc.fileName,
          contentType: doc.contentType,
          uploadedAt: doc.uploadedAt,
          _id: doc._id,
        }));
      }
      return billObj;
    });

    res.status(200).json({
      success: true,
      data: billsWithoutBinary,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching employee bills:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch bills",
      details: error.message,
    });
  }
};

// Get single employee bill by ID
const getEmployeeBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await EmployeeBill.findById(id)
      .populate("reviewedBy", "name email")
      .populate("paidBy", "name email")
      .populate("createdBy", "name email")
      .lean();

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: "Bill not found",
      });
    }

    // Exclude binary data from response
    const billObj = { ...bill };
    if (billObj.billDocuments) {
      billObj.billDocuments = billObj.billDocuments.map((doc) => ({
        fileName: doc.fileName,
        contentType: doc.contentType,
        uploadedAt: doc.uploadedAt,
        _id: doc._id,
      }));
    }

    res.status(200).json({
      success: true,
      data: billObj,
    });
  } catch (error) {
    console.error("Error fetching employee bill:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch bill",
      details: error.message,
    });
  }
};

// Update employee bill
const updateEmployeeBill = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert billAmount to number if it's a string
    if (updateData.billAmount !== undefined) {
      updateData.billAmount = parseFloat(updateData.billAmount);
      if (isNaN(updateData.billAmount) || updateData.billAmount < 0) {
        return res.status(400).json({
          success: false,
          error: "Bill amount must be a valid positive number",
        });
      }
    }

    // Convert billDate to Date if it's a string
    if (updateData.billDate) {
      updateData.billDate = new Date(updateData.billDate);
      if (isNaN(updateData.billDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: "Bill date must be a valid date",
        });
      }
    }

    // Handle file uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const billDocuments = [];
      req.files.forEach((file) => {
        if (
          file.fieldname === "billDocuments" ||
          file.fieldname === "billReceipt" ||
          file.fieldname.startsWith("billDocument")
        ) {
          billDocuments.push({
            file: file.buffer,
            fileName: file.originalname,
            contentType: file.mimetype,
            uploadedAt: new Date(),
          });
        }
      });

      if (billDocuments.length > 0) {
        // If updating documents, append to existing ones or replace
        const existingBill = await EmployeeBill.findById(id);
        if (existingBill && existingBill.billDocuments) {
          updateData.billDocuments = [...existingBill.billDocuments, ...billDocuments];
        } else {
          updateData.billDocuments = billDocuments;
        }
      }
    }

    // If status is being updated to approved/rejected, set reviewedAt
    if (updateData.status === "approved" || updateData.status === "rejected") {
      updateData.reviewedAt = new Date();
    }

    // If status is being updated to paid, set paidAt
    if (updateData.status === "paid") {
      updateData.paidAt = new Date();
    }

    const bill = await EmployeeBill.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("reviewedBy", "name email")
      .populate("paidBy", "name email")
      .populate("createdBy", "name email")
      .lean();

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: "Bill not found",
      });
    }

    // Exclude binary data from response
    const billObj = { ...bill };
    if (billObj.billDocuments) {
      billObj.billDocuments = billObj.billDocuments.map((doc) => ({
        fileName: doc.fileName,
        contentType: doc.contentType,
        uploadedAt: doc.uploadedAt,
        _id: doc._id,
      }));
    }

    res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      data: billObj,
    });
  } catch (error) {
    console.error("Error updating employee bill:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update bill",
      details: error.message,
    });
  }
};

// Delete employee bill
const deleteEmployeeBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await EmployeeBill.findByIdAndDelete(id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: "Bill not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bill deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee bill:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete bill",
      details: error.message,
    });
  }
};

// Get bill document
const getBillDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;

    const bill = await EmployeeBill.findById(id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: "Bill not found",
      });
    }

    const document = bill.billDocuments?.id(documentId);

    if (!document || !document.file) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Set appropriate headers
    res.set("Content-Type", document.contentType || "application/octet-stream");
    res.set(
      "Content-Disposition",
      `inline; filename="${document.fileName || "document"}"`
    );

    // Send the binary buffer
    res.send(Buffer.from(document.file));
  } catch (error) {
    console.error("Error fetching bill document:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch document",
      details: error.message,
    });
  }
};

module.exports = {
  createEmployeeBill,
  getEmployeeBills,
  getEmployeeBillById,
  updateEmployeeBill,
  deleteEmployeeBill,
  getBillDocument,
};

