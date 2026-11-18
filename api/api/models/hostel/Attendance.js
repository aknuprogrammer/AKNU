const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HostelFee",
        required: true
    },
    hostelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hostel",
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    status: {
        type: String,
        enum: ["present", "absent", "leave"],
        default: "present"
    },
    checkInTime: String,
    checkOutTime: String,
    remarks: String,
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

// Ensure one attendance record per student per day
attendanceSchema.index({ applicationId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("HostelAttendance", attendanceSchema);
