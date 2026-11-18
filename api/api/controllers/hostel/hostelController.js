const mongoose = require("mongoose");
const Hostel = require("../../models/hostel/Hostel");
const Warden = require("../../models/hostel/Warden");
const HostelType = require("../../models/hostel/HostelType");
const Floor = require("../../models/hostel/Floor");
const OutPass = require("../../models/hostel/OutPass");
const { HostelFee } = require("../../models/certificationFee/FormModels");
const MaintenanceRequest = require("../../models/hostel/MaintenanceRequest");
const WorkOrder = require("../../models/hostel/WorkOrder");

/**
 * @desc Get all hostels
 * @route GET /api/hostel
 * @access Private (Admin, Super Admin)
 */
exports.getAllHostels = async (req, res) => {
  try {
    const { status, hostelType, search } = req.query;
    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by hostel type
    if (hostelType) {
      query.hostelTypeId = hostelType;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { wardenName: { $regex: search, $options: "i" } },
      ];
    }

    const hostels = await Hostel.find(query)
      .populate("wardenId", "name email phone designation")
      .populate("hostelTypeId", "name code description")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: hostels,
      count: hostels.length,
    });
  } catch (error) {
    console.error("Error fetching hostels:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Get hostel by ID
 * @route GET /api/hostel/:id
 * @access Private (Admin, Super Admin)
 */
exports.getHostelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hostel = await Hostel.findById(id)
      .populate("wardenId", "name email phone designation")
      .populate("hostelTypeId", "name code description");

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    res.status(200).json({
      success: true,
      data: hostel,
    });
  } catch (error) {
    console.error("Error fetching hostel:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Create a new hostel
 * @route POST /api/hostel
 * @access Private (Super Admin)
 */
exports.createHostel = async (req, res) => {
  try {
    console.log("=== CREATE HOSTEL - RAW REQ.BODY ===");
    console.log(JSON.stringify(req.body, null, 2));

    const {
      name,
      code,
      hostelTypeId,
      capacity,
      occupied,
      address,
      wardenId,
      status,
      facilities,
      facilityCounts,
      numberOfFloors,
    } = req.body;

    console.log("=== EXTRACTED VALUES ===");
    console.log({
      name: name,
      code: code,
      hostelTypeId: hostelTypeId,
      capacity: capacity,
      occupied: occupied,
      address: address,
      wardenId: wardenId,
      status: status,
      facilities: facilities,
    });

    // Validate required fields
    if (!name || !code || !hostelTypeId || !capacity) {
      console.error("VALIDATION FAILED - Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Name, code, hostel type, and capacity are required",
      });
    }

    // Validate hostel type exists
    const hostelType = await HostelType.findById(hostelTypeId);
    if (!hostelType) {
      return res.status(400).json({
        success: false,
        message: "Hostel type not found",
      });
    }

    // Check if hostel with same code already exists
    const existingHostel = await Hostel.findOne({
      code: code.toUpperCase(),
    });

    if (existingHostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel with this code already exists",
      });
    }

    // Get warden name if wardenId is provided
    let wardenName = "";
    if (wardenId) {
      const warden = await Warden.findById(wardenId);
      if (!warden) {
        return res.status(400).json({
          success: false,
          message: "Warden not found",
        });
      }
      wardenName = warden.name;
    }

    // Handle facilityCounts - ensure it's a proper object with numeric values
    let processedFacilityCounts = {};
    if (facilityCounts && typeof facilityCounts === 'object') {
      for (const [key, value] of Object.entries(facilityCounts)) {
        if (value !== null && value !== undefined) {
          processedFacilityCounts[key] = Number(value) || 0;
        }
      }
    }

    // Create hostel - EXACT SAME PATTERN AS WORKING WARDEN AND HOSTELTYPE CONTROLLERS
    const hostel = new Hostel({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      hostelTypeId: hostelTypeId,
      capacity: Number(capacity),
      occupied: Number(occupied) || 0,
      address: (address || "").trim(),
      status: status || "active",
      facilities: Array.isArray(facilities) ? facilities : [],
      facilityCounts: Object.keys(processedFacilityCounts).length > 0 ? processedFacilityCounts : undefined,
      wardenId: wardenId || undefined,
      wardenName: wardenName,
      numberOfFloors: Number(numberOfFloors) || 1,
    });

    await hostel.save();

    // Auto-generate floors based on numberOfFloors
    const createdFloors = [];
    if (hostel.numberOfFloors && hostel.numberOfFloors > 0) {
      const floorsToCreate = [];
      for (let i = 0; i < hostel.numberOfFloors; i++) {
        floorsToCreate.push({
          hostelId: hostel._id,
          floorNumber: i,
          status: "active",
        });
      }
      if (floorsToCreate.length > 0) {
        const insertedFloors = await Floor.insertMany(floorsToCreate);
        createdFloors.push(...insertedFloors);
      }
    }

    // Handle bulkRooms if provided (create rooms after floors are created)
    const { bulkRooms, floorRoomCounts } = req.body;
    if (bulkRooms && Array.isArray(bulkRooms) && bulkRooms.length > 0 && createdFloors.length > 0) {
      const Room = require("../../models/hostel/Room");
      const roomsToCreate = [];

      // Create a map of floorNumber to floorId for quick lookup
      const floorMap = new Map();
      createdFloors.forEach(floor => {
        floorMap.set(floor.floorNumber, floor._id);
      });

      for (const roomData of bulkRooms) {
        const floorId = floorMap.get(roomData.floorNumber);
        if (!floorId) {
          console.warn(`Floor number ${roomData.floorNumber} not found for room ${roomData.roomNumber}`);
          continue;
        }

        // Handle room facilityCounts
        let roomFacilityCounts = {};
        if (roomData.facilityCounts && typeof roomData.facilityCounts === 'object') {
          roomFacilityCounts = roomData.facilityCounts;
        }

        roomsToCreate.push({
          hostelId: hostel._id,
          floorId: floorId,
          roomNumber: (roomData.roomNumber || "").trim(),
          roomType: roomData.roomType || "Double",
          capacity: Number(roomData.capacity) || 2,
          occupied: 0,
          available: Number(roomData.capacity) || 2,
          facilities: Array.isArray(roomData.facilities) ? roomData.facilities : [],
          facilityCounts: roomFacilityCounts,
          floor: roomData.floorNumber || 0,
          description: (roomData.description || "").trim(),
          status: roomData.status || "available",
        });
      }

      if (roomsToCreate.length > 0) {
        try {
          await Room.insertMany(roomsToCreate, { ordered: false });
          console.log(`Created ${roomsToCreate.length} rooms for hostel ${hostel._id}`);
        } catch (error) {
          console.error("Error creating rooms:", error);
          // Continue even if some rooms fail (duplicate room numbers, etc.)
        }
      }
    }

    // Update warden's hostelId if warden was assigned
    if (wardenId) {
      await Warden.findByIdAndUpdate(wardenId, {
        hostelId: hostel._id,
        hostelName: hostel.name,
      });
    }

    // Populate before sending response - EXACT SAME PATTERN AS WARDEN CONTROLLER
    await hostel.populate("wardenId", "name email phone designation");
    await hostel.populate("hostelTypeId", "name code description");

    res.status(201).json({
      success: true,
      message: "Hostel created successfully",
      data: hostel,
    });
  } catch (error) {
    console.error("Error creating hostel:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Hostel with this ${field} already exists`,
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: messages,
      });
    }

    res.status(400).json({
      success: false,
      message: "Invalid Data",
      error: error.message,
    });
  }
};

/**
 * @desc Update a hostel
 * @route PUT /api/hostel/:id
 * @access Private (Super Admin)
 */
exports.updateHostel = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If code is being updated, check for duplicates
    if (updateData.code) {
      const existingHostel = await Hostel.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: id },
      });

      if (existingHostel) {
        return res.status(400).json({
          success: false,
          message: "Hostel with this code already exists",
        });
      }
      updateData.code = updateData.code.toUpperCase();
    }

    // If hostelTypeId is being updated, validate it exists
    if (updateData.hostelTypeId) {
      const hostelType = await HostelType.findById(updateData.hostelTypeId);
      if (!hostelType) {
        return res.status(400).json({
          success: false,
          message: "Hostel type not found",
        });
      }
    }

    // Handle numberOfFloors update - auto-generate or remove floors
    if (updateData.numberOfFloors !== undefined) {
      const newNumberOfFloors = Number(updateData.numberOfFloors) || 1;
      const existingFloors = await Floor.find({ hostelId: id }).sort({ floorNumber: 1 });
      const currentFloorCount = existingFloors.length;

      if (newNumberOfFloors > currentFloorCount) {
        // Add new floors
        const floorsToCreate = [];
        for (let i = currentFloorCount; i < newNumberOfFloors; i++) {
          floorsToCreate.push({
            hostelId: id,
            floorNumber: i,
            status: "active",
          });
        }
        if (floorsToCreate.length > 0) {
          await Floor.insertMany(floorsToCreate);
        }
      } else if (newNumberOfFloors < currentFloorCount) {
        // Remove excess floors (only if they have no rooms/beds)
        const floorsToRemove = existingFloors.slice(newNumberOfFloors);
        for (const floor of floorsToRemove) {
          // Check if floor has rooms
          const Room = require("../../models/hostel/Room");
          const roomCount = await Room.countDocuments({ floorId: floor._id });
          if (roomCount === 0) {
            await Floor.findByIdAndDelete(floor._id);
          }
        }
      }
    }

    // Handle facilityCounts update - ensure it's a proper object with numeric values
    if (updateData.facilityCounts !== undefined) {
      if (updateData.facilityCounts && typeof updateData.facilityCounts === 'object') {
        const processedFacilityCounts = {};
        for (const [key, value] of Object.entries(updateData.facilityCounts)) {
          if (value !== null && value !== undefined) {
            processedFacilityCounts[key] = Number(value) || 0;
          }
        }
        updateData.facilityCounts = Object.keys(processedFacilityCounts).length > 0 ? processedFacilityCounts : {};
      } else {
        updateData.facilityCounts = {};
      }
    }

    // Handle bulkRooms update if provided
    const { bulkRooms, floorRoomCounts } = updateData;
    if (bulkRooms && Array.isArray(bulkRooms) && bulkRooms.length > 0) {
      const Room = require("../../models/hostel/Room");
      const existingFloors = await Floor.find({ hostelId: id }).sort({ floorNumber: 1 });

      // Create a map of floorNumber to floorId for quick lookup
      const floorMap = new Map();
      existingFloors.forEach(floor => {
        floorMap.set(floor.floorNumber, floor._id);
      });

      // Process each room in bulkRooms
      for (const roomData of bulkRooms) {
        const floorId = floorMap.get(roomData.floorNumber);
        if (!floorId) {
          console.warn(`Floor number ${roomData.floorNumber} not found for room ${roomData.roomNumber}`);
          continue;
        }

        // Handle room facilityCounts
        let roomFacilityCounts = {};
        if (roomData.facilityCounts && typeof roomData.facilityCounts === 'object') {
          roomFacilityCounts = roomData.facilityCounts;
        }

        // Check if room already exists (by roomNumber and floorId)
        const existingRoom = await Room.findOne({
          hostelId: id,
          floorId: floorId,
          roomNumber: roomData.roomNumber?.trim(),
        });

        if (existingRoom) {
          // Update existing room
          existingRoom.roomType = roomData.roomType || existingRoom.roomType;
          existingRoom.capacity = Number(roomData.capacity) || existingRoom.capacity;
          existingRoom.facilities = Array.isArray(roomData.facilities) ? roomData.facilities : existingRoom.facilities;
          existingRoom.facilityCounts = roomFacilityCounts;
          existingRoom.description = (roomData.description || "").trim();
          existingRoom.status = roomData.status || existingRoom.status;
          existingRoom.floor = roomData.floorNumber || existingRoom.floor;
          await existingRoom.save();
        } else {
          // Create new room
          try {
            await Room.create({
              hostelId: id,
              floorId: floorId,
              roomNumber: (roomData.roomNumber || "").trim(),
              roomType: roomData.roomType || "Double",
              capacity: Number(roomData.capacity) || 2,
              occupied: 0,
              available: Number(roomData.capacity) || 2,
              facilities: Array.isArray(roomData.facilities) ? roomData.facilities : [],
              facilityCounts: roomFacilityCounts,
              floor: roomData.floorNumber || 0,
              description: (roomData.description || "").trim(),
              status: roomData.status || "available",
            });
          } catch (error) {
            console.error(`Error creating room ${roomData.roomNumber}:`, error);
            // Continue with other rooms even if one fails
          }
        }
      }

      // Remove bulkRooms and floorRoomCounts from updateData as they're handled separately
      delete updateData.bulkRooms;
      delete updateData.floorRoomCounts;
    }

    // If wardenId is being updated, fetch warden details
    if (updateData.wardenId !== undefined) {
      if (updateData.wardenId) {
        const warden = await Warden.findById(updateData.wardenId);
        if (warden) {
          updateData.wardenName = warden.name;
          // Update warden's hostelId
          await Warden.findByIdAndUpdate(updateData.wardenId, {
            hostelId: id,
            hostelName: updateData.name || (await Hostel.findById(id))?.name,
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Warden not found",
          });
        }
      } else {
        // If wardenId is being removed, clear wardenName
        updateData.wardenName = "";
        // Remove hostelId from the previous warden if exists
        const oldHostel = await Hostel.findById(id);
        if (oldHostel?.wardenId) {
          await Warden.findByIdAndUpdate(oldHostel.wardenId, {
            $unset: { hostelId: "", hostelName: "" },
          });
        }
      }
    }

    const hostel = await Hostel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("wardenId", "name email phone designation")
      .populate("hostelTypeId", "name code description");

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hostel updated successfully",
      data: hostel,
    });
  } catch (error) {
    console.error("Error updating hostel:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Hostel with this ${field} already exists`,
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: messages,
      });
    }

    res.status(400).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

/**
 * @desc Delete a hostel
 * @route DELETE /api/hostel/:id
 * @access Private (Super Admin)
 */
exports.deleteHostel = async (req, res) => {
  try {
    const { id } = req.params;
    const hostel = await Hostel.findByIdAndDelete(id);

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    // Remove hostelId from warden if assigned
    if (hostel.wardenId) {
      await Warden.findByIdAndUpdate(hostel.wardenId, {
        $unset: { hostelId: "", hostelName: "" },
      });
    }

    res.status(200).json({
      success: true,
      message: "Hostel deleted successfully",
      data: hostel,
    });
  } catch (error) {
    console.error("Error deleting hostel:", error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};


/**
 * @desc Apply for Outpass
 * @route POST /api/hostel/outpass/apply
 * @access Private (Student)
 */
exports.applyOutpass = async (req, res) => {
  try {
    const { outDate, outTime, expectedReturnTime, purpose, registrationNumber } = req.body;
    const userEmail = req.user.email;

    // Use provided registrationNumber or fallback to email logic
    let searchCriteria = [];
    if (registrationNumber) {
      searchCriteria.push({ registrationNumber: registrationNumber });
    }
    // Always include email fallback/check
    searchCriteria.push({ registrationNumber: userEmail });
    searchCriteria.push({ registrationNumber: userEmail.split("@")[0] });

    // 1. Find the student's active hostel allocation
    const alloc = await HostelFee.findOne({
      $or: searchCriteria,
      status: "active"
    });

    if (!alloc) {
      return res.status(404).json({
        success: false,
        message: "No active hostel allocation found. Please check your Registration Number."
      });
    }

    // 2. Create OutPass
    const outpass = new OutPass({
      applicationId: alloc._id,
      hostelId: alloc.hostelId,
      outDate,
      outTime,
      expectedReturnTime,
      purpose,
      status: "pending",
      generatedBy: req.user._id
    });

    await outpass.save();

    res.status(201).json({
      success: true,
      message: "Outpass application submitted successfully",
      data: outpass
    });

  } catch (error) {
    console.error("Error applying for outpass:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

/**
 * @desc Get Student's Outpass History
 * @route GET /api/hostel/student/outpass
 * @access Private (Student)
 */
exports.getStudentOutpasses = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email || "";

    // Default query: Only requests generated by this user
    let query = { generatedBy: userId };

    // Try to find allocations (requests made by others for this user)
    // Wrapped in try/catch to ensure main specific-user query always runs
    try {
      if (userEmail) {
        const allocs = await HostelFee.find({
          $or: [
            { registrationNumber: userEmail },
            { registrationNumber: userEmail.split("@")[0] }
          ]
        }).select("_id");

        if (allocs.length > 0) {
          const allocIds = allocs.map(a => a._id);
          // Expand query to include either generatedBy user OR linked allocation
          query = {
            $or: [
              { generatedBy: userId },
              { applicationId: { $in: allocIds } }
            ]
          };
        }
      }
    } catch (allocError) {
      console.error("Error resolving allocations:", allocError);
      // Continue with default generatedBy query
    }

    const outpasses = await OutPass.find(query)
      .populate('hostelId', 'name')
      .populate('applicationId', 'registrationNumber studentName')
      .populate('actionBy', 'email name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: outpasses
    });

  } catch (error) {
    console.error("Error fetching outpasses:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

/**
 * @desc Get All Outpasses (Admin)
 * @route GET /api/hostel/outpass
 * @access Private (Admin)
 */
exports.getAllOutpasses = async (req, res) => {
  try {
    const { hostelId, status } = req.query;
    let query = {};

    if (hostelId) query.hostelId = hostelId;
    if (status) query.status = status;

    const outpasses = await OutPass.find(query)
      .populate({
        path: "applicationId",
        select: "studentName registrationNumber employeeName employeeId course roomNumber"
      })
      .populate('actionBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: outpasses
    });

  } catch (error) {
    console.error("Error fetching all outpasses:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

/**
 * @desc Update Outpass Status
 * @route PUT /api/hostel/outpass/:id/status
 * @access Private (Admin)
 */
exports.updateOutpassStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, actualReturnTime } = req.body;

    const updateData = {
      status,
      actionBy: req.user._id,
      actionDate: new Date()
    };

    if (remarks !== undefined) updateData.remarks = remarks;
    if (actualReturnTime !== undefined) updateData.actualReturnTime = actualReturnTime;

    const outpass = await OutPass.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('actionBy', 'email name role');

    if (!outpass) {
      return res.status(404).json({
        success: false,
        message: "Outpass request not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Outpass ${status} successfully`,
      data: outpass
    });

  } catch (error) {
    console.error("Error updating outpass status:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};


/**
 * @desc Create Maintenance Request
 * @route POST /api/hostel/maintenance/apply
 * @access Private (Student)
 */
exports.createMaintenanceRequest = async (req, res) => {
  try {
    const {
      category,
      description,
      priority,
      registrationNumber,
      studentEmail,
      hostelName,
      floorNumber,
      roomNumber
    } = req.body;
    const studentId = req.user._id;

    let applicationId = null;
    let finalHostelName = hostelName;
    let finalRoomNumber = roomNumber;

    // If registration number provided, try to find student allocation
    if (registrationNumber) {
      const allocation = await HostelFee.findOne({
        registrationNumber: { $regex: new RegExp(`^${registrationNumber}$`, "i") },
        status: "active"
      });

      if (allocation) {
        applicationId = allocation._id;
        finalHostelName = allocation.hostelName;
        finalRoomNumber = allocation.roomNumber;
      } else if (!hostelName) {
        // Only error if no manual hostel info provided either
        return res.status(404).json({
          success: false,
          message: "No active hostel allocation found for this registration number"
        });
      }
    }

    const newRequest = new MaintenanceRequest({
      applicationId,
      studentId: applicationId ? studentId : undefined, // studentId is only relevant for personal requests
      category,
      description,
      priority: priority || "medium",
      hostelName: finalHostelName,
      floorNumber,
      roomNumber: finalRoomNumber
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Maintenance request submitted successfully",
      data: newRequest
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Get Student Maintenance Requests
 * @route GET /api/hostel/student/maintenance
 * @access Private (Student)
 */
exports.getStudentMaintenanceRequests = async (req, res) => {
  try {
    const studentId = req.user._id;
    const requests = await MaintenanceRequest.find({ studentId })
      .populate({
        path: "applicationId",
        select: "registrationNumber studentName roomNumber hostelName hostelId",
        populate: { path: "hostelId", select: "name" }
      })
      .populate("actionBy", "name email role")
      .sort({ createdAt: -1 });

    // Map to ensure hostelName is available
    const mappedRequests = requests.map(req => {
      const obj = req.toObject();
      if (obj.applicationId && !obj.applicationId.hostelName && obj.applicationId.hostelId) {
        obj.applicationId.hostelName = obj.applicationId.hostelId.name;
      }
      return obj;
    });

    res.status(200).json({ success: true, data: mappedRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Get All Maintenance Requests
 * @route GET /api/hostel/maintenance
 * @access Private (Admin)
 */
exports.getAllMaintenanceRequests = async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    console.log("Fetching all maintenance requests with query:", query);
    const requests = await MaintenanceRequest.find(query)
      .populate({
        path: "applicationId",
        select: "registrationNumber studentName roomNumber hostelName hostelId",
        populate: { path: "hostelId", select: "name" }
      })
      .populate("actionBy", "email role")
      .sort({ createdAt: -1 });

    // Map to ensure hostelName is available
    const mappedRequests = requests.map(req => {
      const obj = req.toObject();
      if (obj.applicationId && !obj.applicationId.hostelName && obj.applicationId.hostelId) {
        obj.applicationId.hostelName = obj.applicationId.hostelId.name;
      }
      return obj;
    });

    console.log(`Found ${requests.length} maintenance requests`);

    res.status(200).json({ success: true, data: mappedRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Update Maintenance Request Status
 * @route PUT /api/hostel/maintenance/:id/status
 * @access Private (Admin)
 */
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const request = await MaintenanceRequest.findByIdAndUpdate(
      id,
      {
        status,
        remarks,
        actionBy: req.user._id,
        actionDate: new Date()
      },
      { new: true }
    ).populate("actionBy", "email name role");

    if (!request) {
      return res.status(404).json({ success: false, message: "Maintenance request not found" });
    }

    res.status(200).json({
      success: true,
      data: request,
      message: "Maintenance status updated successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Create Work Order
 * @route POST /api/hostel/workorders
 * @access Private (Admin)
 */
exports.createWorkOrder = async (req, res) => {
  try {
    const {
      requestId,
      assignedTo,
      priority,
      estimatedCost,
      remarks,
      category,
      description,
      hostelName,
      roomNumber
    } = req.body;
    const actionBy = req.user._id;

    const workOrderData = {
      requestId: requestId || undefined,
      assignedTo,
      priority: priority || "medium",
      estimatedCost: estimatedCost || 0,
      remarks,
      actionBy
    };

    // If manual work order (no requestId), add manual fields
    if (!requestId) {
      workOrderData.category = category;
      workOrderData.description = description;
      workOrderData.hostelName = hostelName;
      workOrderData.roomNumber = roomNumber;
    }

    const workOrder = new WorkOrder(workOrderData);
    await workOrder.save();

    // If linked to a request, update maintenance request status to 'in-progress'
    if (requestId) {
      await MaintenanceRequest.findByIdAndUpdate(requestId, {
        status: "in-progress",
        actionBy,
        actionDate: new Date(),
        remarks: `Work order created and assigned to ${assignedTo}. ${remarks || ""}`
      });
    }

    res.status(201).json({
      success: true,
      data: workOrder,
      message: "Work order created successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Get All Work Orders
 * @route GET /api/hostel/workorders
 * @access Private (Admin)
 */
exports.getAllWorkOrders = async (req, res) => {
  try {
    const workOrders = await WorkOrder.find()
      .populate({
        path: "requestId",
        populate: {
          path: "applicationId",
          select: "registrationNumber studentName roomNumber hostelName"
        }
      })
      .populate("actionBy", "email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: workOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Update Work Order Status
 * @route PUT /api/hostel/workorders/:id/status
 * @access Private (Admin)
 */
exports.updateWorkOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actualCost, remarks, completionDate } = req.body;
    const actionBy = req.user._id;

    const updateData = {
      status,
      remarks,
      actionBy
    };

    if (actualCost !== undefined) updateData.actualCost = actualCost;
    if (completionDate) updateData.completionDate = completionDate;
    if (status === 'completed' && !completionDate) updateData.completionDate = new Date();

    const workOrder = await WorkOrder.findByIdAndUpdate(id, updateData, { new: true });

    if (!workOrder) {
      return res.status(404).json({ success: false, message: "Work order not found" });
    }

    // If work order is completed, update maintenance request too
    if (status === "completed") {
      await MaintenanceRequest.findByIdAndUpdate(workOrder.requestId, {
        status: "completed",
        actionBy,
        actionDate: new Date(),
        remarks: `Work order completed. ${remarks || ""}`
      });
    } else if (status === "cancelled") {
      await MaintenanceRequest.findByIdAndUpdate(workOrder.requestId, {
        status: "pending",
        remarks: `Work order was cancelled. Returning to pending. ${remarks || ""}`
      });
    }

    res.status(200).json({
      success: true,
      data: workOrder,
      message: `Work order status updated to ${status}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Get Hostel Allocation by Registration Number
 * @route GET /api/hostel/allocation/:regNumber
 * @access Private (Admin)
 */
exports.getAllocationByRegNumber = async (req, res) => {
  try {
    const { regNumber } = req.params;

    const allocation = await HostelFee.findOne({
      registrationNumber: { $regex: new RegExp(`^${regNumber}$`, "i") },
      status: "active"
    }).populate("hostelId", "name");

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: "No active hostel allocation found for this registration number"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        registrationNumber: allocation.registrationNumber,
        studentName: allocation.studentName,
        hostelName: allocation.hostelName || allocation.hostelId?.name,
        roomNumber: allocation.roomNumber,
        floorNumber: allocation.floorNumber,
        bedNumber: allocation.bedNumber,
        course: allocation.course
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


