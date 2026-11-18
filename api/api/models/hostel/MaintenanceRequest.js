const mongoose = require("mongoose");

const maintenanceRequestSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HostelFee", // Link to student allocation
            required: false // Optional for general hostel issues
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Authentication", // User who created the request (can be student or admin)
            required: false // Optional if created by management for general issues
        },
        hostelName: String, // For general requests
        floorNumber: String, // For general requests
        roomNumber: String, // For general requests
        category: {
            type: String,
            required: true,
            enum: ["Electrical", "Plumbing", "Carpentry", "Cleaning", "Others"]
        },
        description: {
            type: String,
            required: true
        },
        priority: {
            type: String,
            required: true,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },
        status: {
            type: String,
            required: true,
            enum: ["pending", "in-progress", "completed", "cancelled"],
            default: "pending"
        },
        remarks: String,
        actionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Authentication"
        },
        actionDate: Date,
        requestDate: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

const MaintenanceRequest = mongoose.model("HostelMaintenanceRequest", maintenanceRequestSchema);

module.exports = MaintenanceRequest;
