const LabBooking = require("../../models/labs/LabBooking");
const InternalExamSetup = require("../../models/examination/InternalExamSetup");

// @desc Get all lab bookings
// @route GET /api/labs/lab-bookings
exports.getLabBookings = async (req, res) => {
  try {
    const { labId, facultyId, status, bookingDate, startDate, endDate } = req.query;
    let query = {};

    if (labId) {
      query.labId = labId;
    }
    if (facultyId) {
      query.facultyId = facultyId;
    }
    if (status) {
      query.status = status;
    }
    if (bookingDate) {
      query.bookingDate = new Date(bookingDate);
    }
    if (startDate && endDate) {
      query.bookingDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bookings = await LabBooking.find(query)
      .populate({
        path: "internalExamSetupId",
        populate: [
          { path: "courseId", select: "code name" },
          { path: "streamId", select: "code name" },
          { path: "semesterId", select: "numberOfSemesters description" },
          { path: "subjectId", select: "code name" },
        ],
      })
      .populate("labId", "labName building location capacity")
      .sort({ bookingDate: -1, startTime: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get lab booking by ID
// @route GET /api/labs/lab-bookings/:id
exports.getLabBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await LabBooking.findById(id)
      .populate({
        path: "internalExamSetupId",
        populate: [
          { path: "courseId", select: "code name" },
          { path: "streamId", select: "code name" },
          { path: "semesterId", select: "numberOfSemesters description" },
          { path: "subjectId", select: "code name" },
        ],
      })
      .populate("labId", "labName building location capacity");

    if (!booking) {
      return res.status(404).json({ message: "Lab booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create lab booking
// @route POST /api/labs/lab-bookings
exports.createLabBooking = async (req, res) => {
  try {
    const { internalExamSetupId, bookingDate, startTime, endTime } = req.body;

    // Fetch the internal exam setup to get the labId (subjectId)
    const internalExamSetup = await InternalExamSetup.findById(internalExamSetupId);
    if (!internalExamSetup) {
      return res.status(400).json({ message: "Invalid Internal Exam Setup ID" });
    }
    const labId = internalExamSetup.subjectId; // Using subjectId as labId

    // Check for booking conflicts
    const conflictingBooking = await LabBooking.findOne({
      labId, // Use the derived labId
      bookingDate: new Date(bookingDate),
      status: { $in: ["pending", "approved"] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (conflictingBooking) {
      return res.status(400).json({
        message: "Booking conflict: Another booking exists for this lab at the same time",
      });
    }

    // Prepare booking data
    const bookingData = {
      ...req.body,
      labId, // Store the derived labId
      bookingDate: new Date(bookingDate),
      status: "pending",
    };
    
    // Only include internalExamSetupId if provided (when selecting lab directly, it may be null)
    if (!internalExamSetupId) {
      delete bookingData.internalExamSetupId;
    }

    const booking = new LabBooking(bookingData);

    await booking.save();

    await booking.populate({
      path: "internalExamSetupId",
      populate: [
        { path: "courseId", select: "code name" },
        { path: "streamId", select: "code name" },
        { path: "semesterId", select: "numberOfSemesters description" },
        { path: "subjectId", select: "code name" },
      ],
    });
    await booking.populate("labId", "labName building location capacity");

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating lab booking:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update lab booking
// @route PUT /api/labs/lab-bookings/:id
exports.updateLabBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.bookingDate) {
      updateData.bookingDate = new Date(updateData.bookingDate);
    }

    // If internalExamSetupId is being updated, derive labId from it
    if (updateData.internalExamSetupId) {
      const internalExamSetup = await InternalExamSetup.findById(updateData.internalExamSetupId);
      if (!internalExamSetup) {
        return res.status(400).json({ message: "Invalid Internal Exam Setup ID" });
      }
      updateData.labId = internalExamSetup.subjectId; // Using subjectId as labId
    }

    // If approving/rejecting, set approvedAt and approvedBy
    if (updateData.status === "approved" || updateData.status === "rejected") {
      updateData.approvedAt = new Date();
      if (req.body.approvedBy) {
        updateData.approvedBy = req.body.approvedBy;
      }
    }

    const booking = await LabBooking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res.status(404).json({ message: "Lab booking not found" });
    }

    await booking.populate({
      path: "internalExamSetupId",
      populate: [
        { path: "courseId", select: "code name" },
        { path: "streamId", select: "code name" },
        { path: "semesterId", select: "numberOfSemesters description" },
        { path: "subjectId", select: "code name" },
      ],
    });
    await booking.populate("labId", "labName building location capacity");

    res.json(booking);
  } catch (error) {
    console.error("Error updating lab booking:", error);
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete lab booking
// @route DELETE /api/labs/lab-bookings/:id
exports.deleteLabBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await LabBooking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ message: "Lab booking not found" });
    }

    res.json({ message: "Lab booking deleted successfully", data: booking });
  } catch (error) {
    console.error("Error deleting lab booking:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
