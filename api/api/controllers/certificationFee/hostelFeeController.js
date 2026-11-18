const { HostelFee } = require("../../models/certificationFee/FormModels");
const Bed = require("../../models/hostel/Bed");
const Room = require("../../models/hostel/Room");

/**
 * Update room occupancy count
 */
const updateRoomOccupancy = async (roomId, increment) => {
    if (!roomId) return;
    try {
        const room = await Room.findById(roomId);
        if (room) {
            if (increment) {
                room.occupied = Math.min(room.capacity, room.occupied + 1);
            } else {
                room.occupied = Math.max(0, room.occupied - 1);
            }
            await room.save();
        }
    } catch (err) {
        console.error("Error updating room occupancy:", err);
    }
};

/**
 * Update bed status and optionally room occupancy
 */
const updateBedOccupancy = async (bedId, status, allocatedTo = null, allocatedToType = null, updateRoom = true) => {
    if (!bedId) return;

    try {
        const bed = await Bed.findById(bedId);
        if (!bed) return;

        const oldStatus = bed.status;

        // Update bed
        bed.status = status;
        bed.allocatedTo = status === "occupied" ? allocatedTo : null;
        bed.allocatedToType = status === "occupied" ? allocatedToType : null;
        bed.allocationDate = status === "occupied" ? new Date() : null;
        await bed.save();

        // Update room occupancy if status changed and updateRoom is true
        if (updateRoom && oldStatus !== status) {
            await updateRoomOccupancy(bed.roomId, status === "occupied");
        }
    } catch (err) {
        console.error("Error updating bed occupancy:", err);
    }
};

/**
 * @desc Create hostel fee application
 */
exports.createHostelFee = async (req, res) => {
    try {
        const doc = new HostelFee(req.body);
        await doc.save();

        // Update bed/room occupancy
        if (doc.bedId) {
            await updateBedOccupancy(doc.bedId, "occupied", null, doc.applicationType);
        } else if (doc.roomId) {
            // If no bedId but has roomId (virtual bed), just update room count
            await updateRoomOccupancy(doc.roomId, true);
        }

        res.status(201).json({ success: true, data: doc });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

/**
 * @desc Get all hostel fee applications
 */
exports.getHostelFees = async (req, res) => {
    try {
        const docs = await HostelFee.find().sort({ createdAt: -1 });
        res.json({ success: true, data: docs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc Update hostel fee application
 */
exports.updateHostelFee = async (req, res) => {
    try {
        const { id } = req.params;
        const oldDoc = await HostelFee.findById(id);
        if (!oldDoc) {
            return res.status(404).json({ success: false, error: "Application not found" });
        }

        const doc = await HostelFee.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        // Handle bed/room change
        const bedChanged = req.body.bedId?.toString() !== oldDoc.bedId?.toString();
        const roomChanged = req.body.roomId?.toString() !== oldDoc.roomId?.toString();

        if (bedChanged || roomChanged) {
            // Free old assignment
            if (oldDoc.bedId) {
                await updateBedOccupancy(oldDoc.bedId, "available");
            } else if (oldDoc.roomId) {
                await updateRoomOccupancy(oldDoc.roomId, false);
            }

            // Occupy new assignment
            if (doc.bedId) {
                await updateBedOccupancy(doc.bedId, "occupied", null, doc.applicationType);
            } else if (doc.roomId) {
                await updateRoomOccupancy(doc.roomId, true);
            }
        } else if (req.body.status === "inactive" && oldDoc.status === "active") {
            // If application becomes inactive, free assignment
            if (doc.bedId) {
                await updateBedOccupancy(doc.bedId, "available");
            } else if (doc.roomId) {
                await updateRoomOccupancy(doc.roomId, false);
            }
        } else if (req.body.status === "active" && oldDoc.status === "inactive") {
            // If application becomes active again, occupy assignment
            if (doc.bedId) {
                await updateBedOccupancy(doc.bedId, "occupied", null, doc.applicationType);
            } else if (doc.roomId) {
                await updateRoomOccupancy(doc.roomId, true);
            }
        }

        res.json({ success: true, data: doc });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

/**
 * @desc Delete hostel fee application
 */
exports.deleteHostelFee = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await HostelFee.findById(id);
        if (!doc) {
            return res.status(404).json({ success: false, error: "Application not found" });
        }

        // Free assignment before deleting
        if (doc.bedId) {
            await updateBedOccupancy(doc.bedId, "available");
        } else if (doc.roomId) {
            await updateRoomOccupancy(doc.roomId, false);
        }

        await HostelFee.findByIdAndDelete(id);
        res.json({ success: true, message: "Application deleted successfully", data: doc });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
