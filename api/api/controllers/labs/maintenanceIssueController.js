const MaintenanceIssue = require("../../models/labs/MaintenanceIssue");

// @desc Get all maintenance issues
// @route GET /api/labs/maintenance-issues
exports.getMaintenanceIssues = async (req, res) => {
  try {
    const { labId, equipmentId, status, priority, reportedById } = req.query;
    let query = {};

    if (labId) {
      query.labId = labId;
    }
    if (equipmentId) {
      query.equipmentId = equipmentId;
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (reportedById) {
      query.reportedById = reportedById;
    }

    const issues = await MaintenanceIssue.find(query)
      .populate("labId", "labName building location")
      .populate("equipmentId", "equipmentName assetId serialNumber")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get maintenance issue by ID
// @route GET /api/labs/maintenance-issues/:id
exports.getMaintenanceIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await MaintenanceIssue.findById(id)
      .populate("labId", "labName building location")
      .populate("equipmentId", "equipmentName assetId serialNumber");

    if (!issue) {
      return res.status(404).json({ message: "Maintenance issue not found" });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create maintenance issue
// @route POST /api/labs/maintenance-issues
exports.createMaintenanceIssue = async (req, res) => {
  try {
    const issue = new MaintenanceIssue({
      ...req.body,
      status: req.body.status || "open",
    });

    await issue.save();
    await issue.populate("labId", "labName building location");
    await issue.populate("equipmentId", "equipmentName assetId serialNumber");

    res.status(201).json(issue);
  } catch (error) {
    console.error("Error creating maintenance issue:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update maintenance issue
// @route PUT /api/labs/maintenance-issues/:id
exports.updateMaintenanceIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If resolving, set resolvedAt
    if (updateData.status === "resolved" || updateData.status === "closed") {
      updateData.resolvedAt = new Date();
    }

    const issue = await MaintenanceIssue.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("labId", "labName building location")
      .populate("equipmentId", "equipmentName assetId serialNumber");

    if (!issue) {
      return res.status(404).json({ message: "Maintenance issue not found" });
    }

    res.json(issue);
  } catch (error) {
    console.error("Error updating maintenance issue:", error);
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete maintenance issue
// @route DELETE /api/labs/maintenance-issues/:id
exports.deleteMaintenanceIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await MaintenanceIssue.findByIdAndDelete(id);

    if (!issue) {
      return res.status(404).json({ message: "Maintenance issue not found" });
    }

    res.json({ message: "Maintenance issue deleted successfully", data: issue });
  } catch (error) {
    console.error("Error deleting maintenance issue:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
