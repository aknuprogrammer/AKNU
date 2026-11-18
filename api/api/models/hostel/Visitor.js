const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
    {
        visitorName: {
            type: String,
            required: true
        },
        visitorPhone: {
            type: String,
            required: true
        },
        visitorIdProof: {
            type: String,
            required: true
        },
        hostelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hostel",
            required: true
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HostelFee", // Referencing the resident
            required: true
        },
        studentRegNo: {
            type: String,
            required: true
        },
        relationship: {
            type: String,
            required: true,
            enum: ["Parent", "Sibling", "Relative", "Friend", "Guardian", "Other"]
        },
        purpose: {
            type: String,
            required: true
        },
        entryTime: {
            type: Date,
            default: Date.now
        },
        exitTime: {
            type: Date
        },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active"
        },
        actionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Authentication"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
