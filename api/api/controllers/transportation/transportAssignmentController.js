const TransportAssignment = require("../../models/transportation/TransportAssignment");

// @desc Create a new transport assignment
// @route POST /api/transportation/transport-assignments
exports.createAssignment = async (req, res) => {
    try {
        const { userType, studentId, staffId, routeId, pickupPoint, dropPoint, status } = req.body;

        const newAssignment = new TransportAssignment({
            userType,
            studentId,
            staffId,
            routeId,
            pickupPoint,
            dropPoint,
            status: status || 'active'
        });

        await newAssignment.save();

        const populated = await TransportAssignment.findById(newAssignment._id)
            .populate("studentId", "firstName lastName email phone hallTicketNo")
            .populate("staffId", "firstName lastName email contactNumber employeeId department jobTitle")
            .populate("routeId", "routeName stops")
            .lean();

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc Create bulk transport assignments
// @route POST /api/transportation/transport-assignments/bulk
exports.createBulkAssignments = async (req, res) => {
    try {
        const { userType, selectedUsers, routeId, pickupPoint, dropPoint, status } = req.body;

        if (!selectedUsers || !Array.isArray(selectedUsers) || selectedUsers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Selected users array is required"
            });
        }

        const assignments = selectedUsers.map(userId => ({
            userType,
            studentId: userType === 'student' ? userId : undefined,
            staffId: userType === 'staff' ? userId : undefined,
            routeId,
            pickupPoint,
            dropPoint,
            status: status || 'active'
        }));

        const docs = await TransportAssignment.insertMany(assignments);

        const populatedDocs = await TransportAssignment.find({ _id: { $in: docs.map(d => d._id) } })
            .populate("studentId", "firstName lastName email phone hallTicketNo")
            .populate("staffId", "firstName lastName email contactNumber employeeId department jobTitle")
            .populate("routeId", "routeName stops")
            .lean();

        res.status(201).json({
            success: true,
            message: `Successfully created ${docs.length} transport assignments`,
            data: populatedDocs,
            count: docs.length
        });
    } catch (error) {
        console.error("Error creating bulk transport assignments:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
}

// @desc Get all transport assignments with pagination and filtering
// @route GET /api/transportation/transport-assignments
exports.getAllAssignments = async (req, res) => {
    try {
        const { userType, status, routeId } = req.query;
        const query = {};

        if (userType) query.userType = userType;
        if (status) query.status = status;
        if (routeId) query.routeId = routeId;

        const assignments = await TransportAssignment.find(query)
            .populate("studentId", "firstName lastName email phone hallTicketNo")
            .populate("staffId", "firstName lastName email contactNumber employeeId department jobTitle employeeName")
            .populate("routeId", "routeName stops")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc Get single transport assignment by ID
// @route GET /api/transportation/transport-assignments/:id
exports.getAssignmentById = async (req, res) => {
    try {
        const assignment = await TransportAssignment.findById(req.params.id)
            .populate("studentId", "firstName lastName email phone hallTicketNo")
            .populate("staffId", "firstName lastName email contactNumber employeeId department jobTitle")
            .populate("routeId", "routeName stops")
            .lean();

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc Update a transport assignment
// @route PUT /api/transportation/transport-assignments/:id
exports.updateAssignment = async (req, res) => {
    try {
        const updated = await TransportAssignment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate("studentId", "firstName lastName email phone hallTicketNo")
            .populate("staffId", "firstName lastName email contactNumber employeeId department jobTitle")
            .populate("routeId", "routeName stops")
            .lean();

        if (!updated) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc Delete a transport assignment
// @route DELETE /api/transportation/transport-assignments/:id
exports.deleteAssignment = async (req, res) => {
    try {
        const deleted = await TransportAssignment.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        res.status(200).json({ message: "Transport assignment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
