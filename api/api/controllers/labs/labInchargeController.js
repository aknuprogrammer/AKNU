const LabIncharge = require("../../models/labs/LabIncharge");

// @desc Get all lab incharges
// @route GET /api/labs/lab-incharges
exports.getLabIncharges = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ];
    }

    const labIncharges = await LabIncharge.find(query).sort({ createdAt: -1 });
    res.json(labIncharges);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get lab incharge by ID
// @route GET /api/labs/lab-incharges/:id
exports.getLabInchargeById = async (req, res) => {
  try {
    const { id } = req.params;
    const labIncharge = await LabIncharge.findById(id);
    
    if (!labIncharge) {
      return res.status(404).json({ message: "Lab incharge not found" });
    }
    
    res.json(labIncharge);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create a lab incharge
// @route POST /api/labs/lab-incharges
exports.createLabIncharge = async (req, res) => {
  try {
    const { employeeId, name, email, phone, department, designation, status } = req.body;

    // Check if email already exists
    const existingIncharge = await LabIncharge.findOne({ email: email.toLowerCase() });
    if (existingIncharge) {
      return res.status(400).json({ message: "Lab incharge with this email already exists" });
    }

    // Check if employeeId already exists (if provided)
    if (employeeId) {
      const existingEmployeeId = await LabIncharge.findOne({ employeeId: employeeId.trim() });
      if (existingEmployeeId) {
        return res.status(400).json({ message: "Lab incharge with this employee ID already exists" });
      }
    }

    const labIncharge = new LabIncharge({
      employeeId: employeeId?.trim() || undefined,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      department: department?.trim() || undefined,
      designation: designation?.trim() || undefined,
      status: status || "Active",
    });

    await labIncharge.save();
    res.status(201).json(labIncharge);
  } catch (error) {
    console.error("Error creating lab incharge:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation Error", error: error.message });
    }
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update a lab incharge
// @route PUT /api/labs/lab-incharges/:id
exports.updateLabIncharge = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, name, email, phone, department, designation, status } = req.body;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingIncharge = await LabIncharge.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingIncharge) {
        return res.status(400).json({ message: "Lab incharge with this email already exists" });
      }
    }

    // Check if employeeId is being changed and if it already exists
    if (employeeId) {
      const existingEmployeeId = await LabIncharge.findOne({ 
        employeeId: employeeId.trim(),
        _id: { $ne: id }
      });
      if (existingEmployeeId) {
        return res.status(400).json({ message: "Lab incharge with this employee ID already exists" });
      }
    }

    const updateData = {};
    if (employeeId !== undefined) updateData.employeeId = employeeId?.trim() || undefined;
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (department !== undefined) updateData.department = department?.trim() || undefined;
    if (designation !== undefined) updateData.designation = designation?.trim() || undefined;
    if (status !== undefined) updateData.status = status;

    const labIncharge = await LabIncharge.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!labIncharge) {
      return res.status(404).json({ message: "Lab incharge not found" });
    }

    res.json(labIncharge);
  } catch (error) {
    console.error("Error updating lab incharge:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation Error", error: error.message });
    }
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete a lab incharge
// @route DELETE /api/labs/lab-incharges/:id
exports.deleteLabIncharge = async (req, res) => {
  try {
    const { id } = req.params;
    const labIncharge = await LabIncharge.findByIdAndDelete(id);

    if (!labIncharge) {
      return res.status(404).json({ message: "Lab incharge not found" });
    }

    res.json({ message: "Lab incharge deleted successfully", data: labIncharge });
  } catch (error) {
    console.error("Error deleting lab incharge:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

