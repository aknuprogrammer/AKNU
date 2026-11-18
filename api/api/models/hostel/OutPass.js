const mongoose = require("mongoose");

const outPassSchema = new mongoose.Schema({
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
    outDate: {
        type: String, // YYYY-MM-DD
        required: true
    },
    outTime: {
        type: String, // HH:mm
        required: true
    },
    expectedReturnTime: {
        type: String, // HH:mm
        required: true
    },
    expectedReturnDate: String, // YYYY-MM-DD
    actualReturnTime: String,
    purpose: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "generated", "completed", "expired", "cancelled"],
        default: "pending"
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    actionBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    actionDate: Date,
    qrCode: String, // Optional, for scanning out/in
}, { timestamps: true });

module.exports = mongoose.model("HostelOutPass", outPassSchema);
