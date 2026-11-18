const Leave = require("../../models/hostel/Leave");

exports.getLeaves = async (req, res) => {
    try {
        const { status, hostelId } = req.query;
        let query = {};
        if (status) query.status = status;
        if (hostelId) query.hostelId = hostelId;

        const leaves = await Leave.find(query)
            .populate("applicationId", "studentName registrationNumber employeeName employeeId roomNumber")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        const leave = await Leave.findById(id);
        if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

        leave.status = status;
        if (rejectionReason) leave.rejectionReason = rejectionReason;
        leave.approvedBy = req.user?._id;

        await leave.save();
        res.status(200).json({ success: true, data: leave });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
