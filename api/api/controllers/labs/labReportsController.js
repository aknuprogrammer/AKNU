const LabBooking = require("../../models/labs/LabBooking");
const Equipment = require("../../models/labs/Equipment");
const MaintenanceIssue = require("../../models/labs/MaintenanceIssue");
const Lab = require("../../models/labs/Lab");

// @desc Get lab usage report
// @route GET /api/labs/reports/usage
exports.getLabUsageReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateQuery = {};

    // Filter by date range if provided
    if (startDate && endDate) {
      dateQuery.bookingDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Only count approved, completed and pending bookings for usage
    // We include pending because the user wants to see all 'Total Bookings'
    const bookings = await LabBooking.find({
      ...dateQuery,
      status: { $in: ["approved", "completed", "pending"] },
    })
      .populate("labId", "labName")
      .lean();

    // Get all active labs first (case-insensitive status)
    const labs = await Lab.find({ 
      status: { $regex: /^active$/i } 
    }).select("labName").lean();
    
    // Group bookings by lab
    const labStats = {};

    // Initialize labStats with all labs
    labs.forEach(lab => {
      labStats[lab._id.toString()] = {
        _id: lab._id.toString(),
        labName: lab.labName,
        totalBookings: 0,
        totalHours: 0,
        bookingsByDay: {},
        timeSlots: [],
      };
    });

    bookings.forEach((booking) => {
      // Robust lab validation
      let labId = null;
      let labName = "Unknown Lab";

      if (booking.labId && booking.labId._id) {
        labId = booking.labId._id.toString();
        labName = booking.labId.labName || "Unknown Lab";
      } else if (booking.labId) {
        // If not populated but exists as ID
        labId = booking.labId.toString();
        // Try to find labName from our pre-fetched labs list
        const labInfo = labs.find(l => l._id.toString() === labId);
        if (labInfo) {
          labName = labInfo.labName;
        }
      }

      if (!labId) return;
      
      // If for some reason the lab is not in our initialized list (e.g. inactive but has bookings)
      if (!labStats[labId]) {
        labStats[labId] = {
          _id: labId,
          labName: labName,
          totalBookings: 0,
          totalHours: 0,
          bookingsByDay: {},
          timeSlots: [],
        };
      }

      labStats[labId].totalBookings += 1;

      // Calculate hours
      const start = booking.startTime.split(":");
      const end = booking.endTime.split(":");
      const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
      const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
      const hours = (endMinutes - startMinutes) / 60;
      labStats[labId].totalHours += hours;

      // Track bookings by day of week
      const day = new Date(booking.bookingDate).toLocaleDateString("en-US", {
        weekday: "long",
      });
      labStats[labId].bookingsByDay[day] =
        (labStats[labId].bookingsByDay[day] || 0) + 1;

      // Track time slots for peak hours
      labStats[labId].timeSlots.push({
        start: booking.startTime,
        end: booking.endTime,
      });
    });

    // Process data for response
    const reportData = Object.values(labStats).map((stats) => {
      // Find most used day
      let mostUsedDay = "N/A";
      let maxBookings = 0;
      Object.entries(stats.bookingsByDay).forEach(([day, count]) => {
        if (count > maxBookings) {
          maxBookings = count;
          mostUsedDay = day;
        }
      });

      // Find peak hours (most common time slot)
      const timeSlotCounts = {};
      stats.timeSlots.forEach((slot) => {
        const key = `${slot.start} - ${slot.end}`;
        timeSlotCounts[key] = (timeSlotCounts[key] || 0) + 1;
      });

      let peakHours = "N/A";
      let maxCount = 0;
      Object.entries(timeSlotCounts).forEach(([slot, count]) => {
        if (count > maxCount) {
          maxCount = count;
          peakHours = slot;
        }
      });

      // Calculate utilization rate (assuming 8 hours per day, 5 days per week = 40 hours)
      // Based on 20 working days a month = 160 hours
      const totalAvailableHours = 160; 
      const utilizationRate = Math.min(
        100,
        Math.round((stats.totalHours / totalAvailableHours) * 100)
      );

      return {
        _id: stats._id,
        labName: stats.labName,
        totalBookings: stats.totalBookings,
        totalHours: Math.round(stats.totalHours * 100) / 100, // Round to 2 decimals
        utilizationRate: utilizationRate,
        mostUsedDay: mostUsedDay,
        peakHours: peakHours,
      };
    });

    res.json(reportData);
  } catch (error) {
    console.error("Error generating lab usage report:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get equipment report
// @route GET /api/labs/reports/equipment
exports.getEquipmentReport = async (req, res) => {
  try {
    // Get all equipment with lab info
    const equipment = await Equipment.find({
      status: "Active",
    })
      .populate("assignedLab", "labName")
      .lean();

    // Get all active labs first (case-insensitive)
    const labs = await Lab.find({ status: { $regex: /^active$/i } }).select("labName").lean();
    
    // Group equipment by lab
    const labStats = {};

    // Initialize labStats with all labs
    labs.forEach(lab => {
      labStats[lab._id.toString()] = {
        _id: lab._id.toString(),
        labName: lab.labName,
        totalEquipment: 0,
        working: 0,
        faulty: 0,
        damaged: 0,
        totalValue: 0,
      };
    });

    equipment.forEach((item) => {
      if (!item.assignedLab || !item.assignedLab._id) return;

      const labId = item.assignedLab._id.toString();
      const labName = item.assignedLab.labName || "Unknown Lab";

      if (!labStats[labId]) {
        labStats[labId] = {
          _id: labId,
          labName: labName,
          totalEquipment: 0,
          working: 0,
          faulty: 0,
          damaged: 0,
          totalValue: 0,
        };
      }

      labStats[labId].totalEquipment += 1;

      // Categorize by condition (case-insensitive)
      const condition = (item.condition || "").toLowerCase();
      if (condition === "working") {
        labStats[labId].working += 1;
      } else if (condition === "faulty") {
        labStats[labId].faulty += 1;
      } else if (
        condition === "maintenance" ||
        condition === "damaged" ||
        condition === "disposed"
      ) {
        labStats[labId].damaged += 1;
      }

      // Add to total value
      if (item.price) {
        labStats[labId].totalValue += item.price || 0;
      }
    });

    // Convert to array
    const reportData = Object.values(labStats);

    res.json(reportData);
  } catch (error) {
    console.error("Error generating equipment report:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get maintenance report
// @route GET /api/labs/reports/maintenance
exports.getMaintenanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get all active labs first (case-insensitive)
    const labs = await Lab.find({ status: { $regex: /^active$/i } }).select("labName").lean();
    
    // Group stats by lab
    const labStats = {};

    // Initialize labStats with all active labs
    labs.forEach(lab => {
      labStats[lab._id.toString()] = {
        _id: lab._id.toString(),
        labName: lab.labName,
        totalMaintenance: 0,
        completed: 0,
        inProgress: 0,
        totalCost: 0,
        maintenanceCosts: [],
      };
    });

    // Process Maintenance Issues (Primary source for everything)
    const issueDateQuery = {};
    if (startDate && endDate) {
      // For maintenance reports, we usually look at when things were resolved OR reported
      // We'll use a $or to capture either activity in the period
      issueDateQuery.$or = [
        {
          resolutionDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          }
        },
        {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          }
        }
      ];
    }

    const issues = await MaintenanceIssue.find(issueDateQuery)
      .populate("labId", "labName")
      .lean();

    issues.forEach((issue) => {
      if (!issue.labId || !issue.labId._id) return;

      const labId = issue.labId._id.toString();

      if (!labStats[labId]) {
        labStats[labId] = {
          _id: labId,
          labName: issue.labId.labName || "Unknown Lab",
          totalMaintenance: 0,
          completed: 0,
          inProgress: 0,
          totalCost: 0,
          maintenanceCosts: [],
        };
      }

      labStats[labId].totalMaintenance += 1;

      // Categorize by status (case-insensitive)
      const status = (issue.status || "").toLowerCase();
      if (status === "resolved" || status === "closed") {
        labStats[labId].completed += 1;
        
        // Add cost for completed items
        if (issue.actualCost) {
          labStats[labId].totalCost += issue.actualCost;
          labStats[labId].maintenanceCosts.push(issue.actualCost);
        } else if (issue.estimatedCost) {
          labStats[labId].totalCost += issue.estimatedCost;
          labStats[labId].maintenanceCosts.push(issue.estimatedCost);
        }
      } else {
        labStats[labId].inProgress += 1;
      }
    });

    // Process data for response
    const reportData = Object.values(labStats).map((stats) => {
      // Calculate average cost
      const avgCost =
        stats.maintenanceCosts.length > 0
          ? stats.totalCost / stats.maintenanceCosts.length
          : 0;

      return {
        _id: stats._id,
        labName: stats.labName,
        totalMaintenance: stats.totalMaintenance,
        completed: stats.completed,
        inProgress: stats.inProgress,
        totalCost: Math.round(stats.totalCost * 100) / 100,
        avgCost: Math.round(avgCost * 100) / 100,
      };
    });

    res.json(reportData);
  } catch (error) {
    console.error("Error generating maintenance report:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

