const SeatingArrangement = require("../../models/examination/SeatingArrangement");
const ExaminationCenter = require("../../models/examination/selector/ExaminationCenter");

// @desc Get all seating arrangements
// @route GET /api/examination/seating-arrangements
// @access Private
exports.getAllSeatingArrangements = async (req, res) => {
  try {
    const {
      centerId,
      registrationNumber,
      roomNumber,
      status,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (centerId) {
      query.centerId = centerId;
    }

    if (registrationNumber) {
      query.registrationNumber = { $regex: registrationNumber, $options: "i" };
    }

    if (roomNumber) {
      query.roomNumber = { $regex: roomNumber, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { studentName: { $regex: search, $options: "i" } },
        { scriptCode: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const seatingArrangements = await SeatingArrangement.find(query)
      .populate("centerId", "code name address capacity rooms")
      .populate("courseId", "name code")
      .populate("collegeId", "name code")
      .populate("generatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await SeatingArrangement.countDocuments(query);

    res.json({
      success: true,
      data: seatingArrangements,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error fetching seating arrangements:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seating arrangements",
      error: error.message,
    });
  }
};

// @desc Get seating arrangements by center
// @route GET /api/examination/seating-arrangements/center/:centerId
// @access Private
exports.getSeatingArrangementsByCenter = async (req, res) => {
  try {
    const { centerId } = req.params;
    const { status, roomNumber } = req.query;

    const query = { centerId };

    if (status) {
      query.status = status;
    }

    if (roomNumber) {
      query.roomNumber = { $regex: roomNumber, $options: "i" };
    }

    const seatingArrangements = await SeatingArrangement.find(query)
      .populate("centerId", "code name address capacity rooms")
      .populate("courseId", "name code")
      .populate("collegeId", "name code")
      .sort({ roomNumber: 1, seatNumber: 1 });

    res.json({
      success: true,
      data: seatingArrangements,
      count: seatingArrangements.length,
    });
  } catch (error) {
    console.error("Error fetching seating arrangements by center:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seating arrangements by center",
      error: error.message,
    });
  }
};

// @desc Get seating arrangement by ID
// @route GET /api/examination/seating-arrangements/:id
// @access Private
exports.getSeatingArrangementById = async (req, res) => {
  try {
    const seatingArrangement = await SeatingArrangement.findById(
      req.params.id
    )
      .populate("centerId", "code name address capacity rooms")
      .populate("courseId", "name code")
      .populate("collegeId", "name code")
      .populate("generatedBy", "name email");

    if (!seatingArrangement) {
      return res.status(404).json({
        success: false,
        message: "Seating arrangement not found",
      });
    }

    res.json({
      success: true,
      data: seatingArrangement,
    });
  } catch (error) {
    console.error("Error fetching seating arrangement:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seating arrangement",
      error: error.message,
    });
  }
};

// @desc Create seating arrangements (bulk)
// @route POST /api/examination/seating-arrangements
// @access Private
exports.createSeatingArrangements = async (req, res) => {
  try {
    const { arrangements, centerId } = req.body;

    if (!arrangements || !Array.isArray(arrangements) || arrangements.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Arrangements array is required and must not be empty",
      });
    }

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: "Center ID is required",
      });
    }

    // Verify center exists
    const center = await ExaminationCenter.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: "Examination center not found",
      });
    }

    // Prepare arrangements with center details
    const seatingArrangements = arrangements.map((arrangement, index) => {
      const fullName =
        [arrangement.firstName, arrangement.middleName, arrangement.lastName]
          .filter(Boolean)
          .join(" ") || arrangement.name || arrangement.studentName || "";

      const registrationNumber =
        arrangement.registrationNumber ||
        arrangement.rollNumber ||
        arrangement.registration_number ||
        "";
      
      const rollNumber =
        arrangement.rollNumber ||
        arrangement.registrationNumber ||
        arrangement.registration_number ||
        "";
      
      const roomNumber = arrangement.roomNumber || "";
      const seatNumber = arrangement.seatNumber || 0;
      
      // Ensure scriptCode is present and valid (required field)
      let scriptCode = arrangement.scriptCode || "";
      if (!scriptCode || scriptCode.trim() === "") {
        // Generate script code if missing
        const regNo = (registrationNumber || `REG${String(index + 1).padStart(8, "0")}`).replace(/[^A-Z0-9]/gi, "");
        const room = roomNumber.replace(/[^A-Z0-9]/gi, "") || `R${Math.floor(index / 30) + 1}`;
        const seat = seatNumber || (index % 30) + 1;
        scriptCode = `SCRIPT-${center.code || "CEN"}-${regNo}-R${room}-S${seat}`.toUpperCase();
      } else {
        scriptCode = scriptCode.toUpperCase().trim();
      }

      // Validate required fields
      if (!registrationNumber || registrationNumber.trim() === "") {
        throw new Error(`Missing registrationNumber for arrangement ${index + 1}`);
      }
      if (!fullName || fullName.trim() === "") {
        throw new Error(`Missing studentName for arrangement ${index + 1}`);
      }
      if (!roomNumber || roomNumber.trim() === "") {
        throw new Error(`Missing roomNumber for arrangement ${index + 1}`);
      }
      if (!seatNumber || seatNumber <= 0) {
        throw new Error(`Invalid seatNumber for arrangement ${index + 1}: ${seatNumber}`);
      }
      if (!scriptCode || scriptCode.trim() === "") {
        throw new Error(`Missing scriptCode for arrangement ${index + 1}`);
      }

      return {
        centerId,
        centerName: center.name,
        centerCode: center.code,
        registrationNumber: registrationNumber.trim(),
        rollNumber: rollNumber.trim() || registrationNumber.trim(),
        studentName: fullName.trim(),
        firstName: arrangement.firstName || "",
        middleName: arrangement.middleName || "",
        lastName: arrangement.lastName || "",
        course: arrangement.course || "",
        courseId: arrangement.courseId || null,
        semester: arrangement.semester || "",
        email: arrangement.email || "",
        phone: arrangement.phone || "",
        roomNumber: roomNumber.trim(),
        seatNumber: seatNumber,
        scriptCode: scriptCode,
        collegeId: arrangement.collegeId || arrangement.campus?._id || null,
        collegeName:
          arrangement.collegeName ||
          (typeof arrangement.campus === "object"
            ? arrangement.campus?.name
            : "") ||
          "",
        collegeCode:
          arrangement.collegeCode ||
          (typeof arrangement.campus === "object"
            ? arrangement.campus?.code
            : "") ||
          "",
        paymentStatus:
          arrangement.paymentStatus ||
          arrangement.payment_status ||
          "PENDING",
        transactionId: arrangement.transactionId || arrangement.transaction_id || "",
        qrCodeData: arrangement.qrCodeData || "",
        qrCodeImage: arrangement.qrCodeImage || "",
        status: arrangement.status || "Active",
        generatedBy: req.user?.id || null,
        generatedAt: new Date(),
        notes: arrangement.notes || "",
      };
    });

    // Check for duplicate script codes
    const scriptCodes = seatingArrangements
      .map((a) => a.scriptCode)
      .filter(Boolean);
    const duplicateScriptCodes = scriptCodes.filter(
      (code, index) => scriptCodes.indexOf(code) !== index
    );
    if (duplicateScriptCodes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Duplicate script codes found: ${duplicateScriptCodes.join(", ")}`,
      });
    }

    // Check for existing script codes in database
    const existingScriptCodes = await SeatingArrangement.find({
      scriptCode: { $in: scriptCodes },
    }).select("scriptCode");
    if (existingScriptCodes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Script codes already exist: ${existingScriptCodes
          .map((s) => s.scriptCode)
          .join(", ")}`,
      });
    }

    // Check for duplicate room/seat combinations in the same center (within the new data)
    const roomSeatCombos = seatingArrangements.map(
      (a) => `${a.roomNumber}-${a.seatNumber}`
    );
    const duplicateCombos = roomSeatCombos.filter(
      (combo, index) => roomSeatCombos.indexOf(combo) !== index
    );
    if (duplicateCombos.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Duplicate room/seat combinations found in new data: ${duplicateCombos.join(", ")}`,
      });
    }

    // Check for existing arrangements with same room/seat combinations in database
    const existingRoomSeatCombos = await SeatingArrangement.find({
      centerId,
      $or: seatingArrangements.map((a) => ({
        roomNumber: a.roomNumber,
        seatNumber: a.seatNumber,
      })),
    }).select("roomNumber seatNumber");

    if (existingRoomSeatCombos.length > 0) {
      // Delete existing arrangements for this center to avoid conflicts
      await SeatingArrangement.deleteMany({ centerId });
    }

    // Insert all arrangements
    const createdArrangements = await SeatingArrangement.insertMany(
      seatingArrangements,
      { ordered: false }
    );

    // Populate references
    await SeatingArrangement.populate(createdArrangements, [
      { path: "centerId", select: "code name address capacity rooms" },
      { path: "courseId", select: "name code" },
      { path: "collegeId", select: "name code" },
      { path: "generatedBy", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdArrangements.length} seating arrangements`,
      data: createdArrangements,
      count: createdArrangements.length,
    });
  } catch (error) {
    console.error("Error creating seating arrangements:", error);
    console.error("Error stack:", error.stack);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(400).json({
        success: false,
        message: `Duplicate ${field}. A seating arrangement with this ${field} already exists.`,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating seating arrangements",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc Update seating arrangement
// @route PUT /api/examination/seating-arrangements/:id
// @access Private
exports.updateSeatingArrangement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If updating room or seat, ensure no duplicate exists
    if (updateData.roomNumber || updateData.seatNumber) {
      const existing = await SeatingArrangement.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Seating arrangement not found",
        });
      }

      const roomNumber = updateData.roomNumber || existing.roomNumber;
      const seatNumber = updateData.seatNumber || existing.seatNumber;
      const centerId = existing.centerId;

      const duplicate = await SeatingArrangement.findOne({
        _id: { $ne: id },
        centerId,
        roomNumber,
        seatNumber,
        status: "Active",
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "A seating arrangement with this room and seat already exists",
        });
      }
    }

    const updatedArrangement = await SeatingArrangement.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("centerId", "code name address capacity rooms")
      .populate("courseId", "name code")
      .populate("collegeId", "name code")
      .populate("generatedBy", "name email");

    if (!updatedArrangement) {
      return res.status(404).json({
        success: false,
        message: "Seating arrangement not found",
      });
    }

    res.json({
      success: true,
      message: "Seating arrangement updated successfully",
      data: updatedArrangement,
    });
  } catch (error) {
    console.error("Error updating seating arrangement:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry. This seating arrangement already exists.",
        error: error.message,
      });
    }
    res.status(400).json({
      success: false,
      message: "Error updating seating arrangement",
      error: error.message,
    });
  }
};

// @desc Delete seating arrangement
// @route DELETE /api/examination/seating-arrangements/:id
// @access Private
exports.deleteSeatingArrangement = async (req, res) => {
  try {
    const seatingArrangement = await SeatingArrangement.findByIdAndDelete(
      req.params.id
    );

    if (!seatingArrangement) {
      return res.status(404).json({
        success: false,
        message: "Seating arrangement not found",
      });
    }

    res.json({
      success: true,
      message: "Seating arrangement deleted successfully",
      data: seatingArrangement,
    });
  } catch (error) {
    console.error("Error deleting seating arrangement:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting seating arrangement",
      error: error.message,
    });
  }
};

// @desc Delete all seating arrangements for a center
// @route DELETE /api/examination/seating-arrangements/center/:centerId
// @access Private
exports.deleteSeatingArrangementsByCenter = async (req, res) => {
  try {
    const { centerId } = req.params;

    const result = await SeatingArrangement.deleteMany({ centerId });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} seating arrangements`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting seating arrangements by center:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting seating arrangements",
      error: error.message,
    });
  }
};

// @desc Get seating statistics for a center
// @route GET /api/examination/seating-arrangements/center/:centerId/stats
// @access Private
exports.getSeatingStatsByCenter = async (req, res) => {
  try {
    const { centerId } = req.params;

    const stats = await SeatingArrangement.aggregate([
      { $match: { centerId: centerId, status: "Active" } },
      {
        $group: {
          _id: "$roomNumber",
          totalSeats: { $sum: 1 },
          students: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          roomNumber: "$_id",
          totalSeats: 1,
          students: 1,
        },
      },
    ]);

    const totalStudents = await SeatingArrangement.countDocuments({
      centerId,
      status: "Active",
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        rooms: stats,
        totalRooms: stats.length,
      },
    });
  } catch (error) {
    console.error("Error fetching seating stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seating statistics",
      error: error.message,
    });
  }
};

