const FieldTracker = require("../models/fieldTracker");
const bcrypt = require("bcryptjs");

// ✅ Create Field Tracker
const createFieldTracker = async (req, res) => {
  try {
    const {
      employeeName,
      employeeId,
      password,
      email,
      phoneNumber,
      status,
      date,
      pin,
    } = req.body;

    // Validate required fields
    if (
      !employeeName ||
      !employeeId ||
      !password ||
      !email ||
      !phoneNumber ||
      !pin
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Check if employeeId already exists
    const existingEmployee = await FieldTracker.findOne({
      $or: [{ employeeId }, { email }, { phoneNumber }],
    });

    if (existingEmployee) {
      return res.status(409).json({
        message: "Employee ID or Email or Phone Number already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Hash pin
    const hashedPin = await bcrypt.hash(pin, salt);

    // Create new field tracker
    const newFieldTracker = await FieldTracker.create({
      employeeName,
      employeeId,
      password: hashedPassword,
      email,
      phoneNumber,
      status: status || "pending",
      date: date ? new Date(date) : new Date(),
      pin: hashedPin,
    });

    // Remove sensitive data from response
    const responseData = newFieldTracker.toObject();
    // delete responseData.password;
    // delete responseData.pin;

    return res.status(201).json({
      message: "Field tracker created successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error creating field tracker:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Get All Field Trackers
const getFieldTrackers = async (req, res) => {
  try {
    const fieldTrackers = await FieldTracker.find().select("-password -pin");
    return res.status(200).json({
      message: "Field trackers retrieved successfully",
      data: fieldTrackers,
    });
  } catch (error) {
    console.error("Error fetching field trackers:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Get Single Field Tracker by ID
const getFieldTrackerById = async (req, res) => {
  try {
    const { id } = req.params;

    const fieldTracker = await FieldTracker.findById(id).select(
      "-password -pin"
    );

    if (!fieldTracker) {
      return res.status(404).json({
        message: "Field tracker not found",
      });
    }

    return res.status(200).json({
      message: "Field tracker retrieved successfully",
      data: fieldTracker,
    });
  } catch (error) {
    console.error("Error fetching field tracker:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Update Field Tracker
const updateFieldTracker = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employeeName,
      employeeId,
      password,
      email,
      phoneNumber,
      status,
      date,
      pin,
    } = req.body;

    // Find the field tracker
    const fieldTracker = await FieldTracker.findById(id);

    if (!fieldTracker) {
      return res.status(404).json({
        message: "Field tracker not found",
      });
    }

    // Prepare update data
    const updateData = {};

    if (employeeName) updateData.employeeName = employeeName;
    if (employeeId) {
      // Check if employeeId is being changed and if it already exists
      if (employeeId !== fieldTracker.employeeId) {
        const existing = await FieldTracker.findOne({ employeeId });
        if (existing) {
          return res.status(409).json({
            message: "Employee ID already exists",
          });
        }
      }
      updateData.employeeId = employeeId;
    }
    if (email) {
      // Check if email is being changed and if it already exists
      if (email !== fieldTracker.email) {
        const existing = await FieldTracker.findOne({ email });
        if (existing) {
          return res.status(409).json({
            message: "Email already exists",
          });
        }
      }
      updateData.email = email;
    }
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (status) updateData.status = status;
    if (date) updateData.date = new Date(date);

    // Handle password update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Handle pin update
    if (pin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPin = await bcrypt.hash(pin, salt);
      updateData.pin = hashedPin;
    }

    // Update the field tracker
    const updatedFieldTracker = await FieldTracker.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -pin");

    return res.status(200).json({
      message: "Field tracker updated successfully",
      data: updatedFieldTracker,
    });
  } catch (error) {
    console.error("Error updating field tracker:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const verifyFieldTracker = async (req, res) => {
  try {
    const { phoneNumber, pin } = req.body;

    // Validate required fields
    if (!phoneNumber || !pin) {
      return res.status(400).json({
        message: "Phone number and PIN are required",
      });
    }

    // Find field tracker by phone number
    const fieldTracker = await FieldTracker.findOne({ phoneNumber });

    if (!fieldTracker) {
      return res.status(404).json({
        message: "Field tracker not found with this phone number",
      });
    }

    // Verify PIN
    const isPinValid = await bcrypt.compare(pin, fieldTracker.pin);

    if (!isPinValid) {
      return res.status(401).json({
        message: "Invalid PIN",
      });
    }

    // Check if user is active
    if (fieldTracker.status !== "active") {
      return res.status(403).json({
        message: "Account is not active. Please contact administrator.",
        status: fieldTracker.status,
      });
    }

    // Success response - user is verified and active
    return res.status(200).json({
      message: "Verification successful",
      data: {
        employeeId: fieldTracker.employeeId,
        employeeName: fieldTracker.employeeName,
        email: fieldTracker.email,
        phoneNumber: fieldTracker.phoneNumber,
        status: fieldTracker.status,
      },
    });
  } catch (error) {
    console.error("Error verifying field tracker:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  createFieldTracker,
  getFieldTrackers,
  getFieldTrackerById,
  updateFieldTracker,
  verifyFieldTracker,
};
