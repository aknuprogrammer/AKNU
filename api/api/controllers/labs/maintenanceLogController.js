const MaintenanceLog = require("../../models/labs/MaintenanceLog");
const MaintenanceIssue = require("../../models/labs/MaintenanceIssue");

// @desc Get all maintenance logs
// @route GET /api/labs/maintenance-logs
exports.getMaintenanceLogs = async (req, res) => {
  try {
    const { labId, equipmentId, status, maintenanceType, startDate, endDate } = req.query;
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
    if (maintenanceType) {
      query.maintenanceType = maintenanceType;
    }
    if (startDate && endDate) {
      query.maintenanceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const logs = await MaintenanceLog.find(query)
      .populate("labId", "labName building location")
      .populate("equipmentId", "equipmentName assetId serialNumber")
      .populate("issueId", "issueTitle status")
      .sort({ maintenanceDate: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get maintenance log by ID
// @route GET /api/labs/maintenance-logs/:id
exports.getMaintenanceLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await MaintenanceLog.findById(id)
      .populate("labId", "labName building location")
      .populate("equipmentId", "equipmentName assetId serialNumber")
      .populate("issueId", "issueTitle status");

    if (!log) {
      return res.status(404).json({ message: "Maintenance log not found" });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create maintenance log
// @route POST /api/labs/maintenance-logs
exports.createMaintenanceLog = async (req, res) => {
  try {
    const log = new MaintenanceLog({
      ...req.body,
      maintenanceDate: req.body.maintenanceDate ? new Date(req.body.maintenanceDate) : new Date(),
      nextMaintenanceDate: req.body.nextMaintenanceDate ? new Date(req.body.nextMaintenanceDate) : undefined,
      status: req.body.status || "Completed",
    });

    await log.save();
    await log.populate("labId", "labName building location");
    await log.populate("equipmentId", "equipmentName assetId serialNumber");
    await log.populate("issueId", "issueTitle status");

    res.status(201).json(log);
  } catch (error) {
    console.error("Error creating maintenance log:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update maintenance log
// @route PUT /api/labs/maintenance-logs/:id
exports.updateMaintenanceLog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.maintenanceDate) {
      updateData.maintenanceDate = new Date(updateData.maintenanceDate);
    }
    if (updateData.nextMaintenanceDate) {
      updateData.nextMaintenanceDate = new Date(updateData.nextMaintenanceDate);
    }

    const log = await MaintenanceLog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("labId", "labName building location")
      .populate("equipmentId", "equipmentName assetId serialNumber")
      .populate("issueId", "issueTitle status");

    if (!log) {
      return res.status(404).json({ message: "Maintenance log not found" });
    }

    res.json(log);
  } catch (error) {
    console.error("Error updating maintenance log:", error);
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Resolve issue from maintenance log
// @route PUT /api/labs/maintenance-logs/:id/resolve-issue
exports.resolveIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await MaintenanceLog.findById(id).populate("issueId");

    if (!log) {
      return res.status(404).json({ message: "Maintenance log not found" });
    }

    // If log has an associated issue, update it
    if (log.issueId) {
      const issue = await MaintenanceIssue.findByIdAndUpdate(
        log.issueId._id,
        {
          status: "resolved",
          resolvedAt: new Date(),
          resolutionNotes: req.body.resolutionNotes || log.actionsTaken || log.description,
          actualCost: log.cost || undefined,
        },
        { new: true, runValidators: true }
      )
        .populate("labId", "labName building location")
        .populate("equipmentId", "equipmentName assetId serialNumber");

      if (!issue) {
        return res.status(404).json({ message: "Associated issue not found" });
      }

      return res.json({
        message: "Issue resolved successfully",
        log: await log.populate("labId", "labName building location")
          .populate("equipmentId", "equipmentName assetId serialNumber")
          .populate("issueId", "issueTitle status"),
        issue: issue,
      });
    } else {
      // Try to find issue by labId and equipmentId
      const query = { labId: log.labId };
      if (log.equipmentId) {
        query.equipmentId = log.equipmentId;
      }
      query.status = { $in: ["open", "in_progress"] };

      const issue = await MaintenanceIssue.findOne(query);

      if (issue) {
        // Update the issue and link it to the log
        const updatedIssue = await MaintenanceIssue.findByIdAndUpdate(
          issue._id,
          {
            status: "resolved",
            resolvedAt: new Date(),
            resolutionNotes: req.body.resolutionNotes || log.actionsTaken || log.description,
            actualCost: log.cost || undefined,
          },
          { new: true, runValidators: true }
        )
          .populate("labId", "labName building location")
          .populate("equipmentId", "equipmentName assetId serialNumber");

        // Link the log to the issue
        log.issueId = issue._id;
        await log.save();

        return res.json({
          message: "Issue resolved successfully",
          log: await log.populate("labId", "labName building location")
            .populate("equipmentId", "equipmentName assetId serialNumber")
            .populate("issueId", "issueTitle status"),
          issue: updatedIssue,
        });
      } else {
        return res.json({
          message: "No associated issue found to resolve",
          log: await log.populate("labId", "labName building location")
            .populate("equipmentId", "equipmentName assetId serialNumber")
            .populate("issueId", "issueTitle status"),
        });
      }
    }
  } catch (error) {
    console.error("Error resolving issue:", error);
    res.status(400).json({ message: "Failed to resolve issue", error: error.message });
  }
};

// @desc Reject/Close issue from maintenance log
// @route PUT /api/labs/maintenance-logs/:id/reject-issue
exports.rejectIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await MaintenanceLog.findById(id).populate("issueId");

    if (!log) {
      return res.status(404).json({ message: "Maintenance log not found" });
    }

    // If log has an associated issue, update it
    if (log.issueId) {
      const issue = await MaintenanceIssue.findByIdAndUpdate(
        log.issueId._id,
        {
          status: "closed",
          resolvedAt: new Date(),
          resolutionNotes: req.body.rejectionNotes || log.notes || "Issue rejected/closed",
        },
        { new: true, runValidators: true }
      )
        .populate("labId", "labName building location")
        .populate("equipmentId", "equipmentName assetId serialNumber");

      if (!issue) {
        return res.status(404).json({ message: "Associated issue not found" });
      }

      return res.json({
        message: "Issue rejected/closed successfully",
        log: await log.populate("labId", "labName building location")
          .populate("equipmentId", "equipmentName assetId serialNumber")
          .populate("issueId", "issueTitle status"),
        issue: issue,
      });
    } else {
      // Try to find issue by labId and equipmentId
      const query = { labId: log.labId };
      if (log.equipmentId) {
        query.equipmentId = log.equipmentId;
      }
      query.status = { $in: ["open", "in_progress"] };

      const issue = await MaintenanceIssue.findOne(query);

      if (issue) {
        // Update the issue and link it to the log
        const updatedIssue = await MaintenanceIssue.findByIdAndUpdate(
          issue._id,
          {
            status: "closed",
            resolvedAt: new Date(),
            resolutionNotes: req.body.rejectionNotes || log.notes || "Issue rejected/closed",
          },
          { new: true, runValidators: true }
        )
          .populate("labId", "labName building location")
          .populate("equipmentId", "equipmentName assetId serialNumber");

        // Link the log to the issue
        log.issueId = issue._id;
        await log.save();

        return res.json({
          message: "Issue rejected/closed successfully",
          log: await log.populate("labId", "labName building location")
            .populate("equipmentId", "equipmentName assetId serialNumber")
            .populate("issueId", "issueTitle status"),
          issue: updatedIssue,
        });
      } else {
        return res.json({
          message: "No associated issue found to reject",
          log: await log.populate("labId", "labName building location")
            .populate("equipmentId", "equipmentName assetId serialNumber")
            .populate("issueId", "issueTitle status"),
        });
      }
    }
  } catch (error) {
    console.error("Error rejecting issue:", error);
    res.status(400).json({ message: "Failed to reject issue", error: error.message });
  }
};

// @desc Delete maintenance log
// @route DELETE /api/labs/maintenance-logs/:id
exports.deleteMaintenanceLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await MaintenanceLog.findByIdAndDelete(id);

    if (!log) {
      return res.status(404).json({ message: "Maintenance log not found" });
    }

    res.json({ message: "Maintenance log deleted successfully", data: log });
  } catch (error) {
    console.error("Error deleting maintenance log:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
