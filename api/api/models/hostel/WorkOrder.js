const mongoose = require("mongoose");

const workOrderSchema = new mongoose.Schema(
    {
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HostelMaintenanceRequest",
            required: false // Optional for manual work orders
        },
        category: String, // For manual work orders
        description: String, // For manual work orders
        hostelName: String, // For manual work orders
        roomNumber: String, // For manual work orders
        assignedTo: {
            type: String, // Can be staff name or vendor name
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ["issued", "in-progress", "completed", "cancelled"],
            default: "issued"
        },
        priority: {
            type: String,
            required: true,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },
        estimatedCost: {
            type: Number,
            default: 0
        },
        actualCost: {
            type: Number,
            default: 0
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        completionDate: Date,
        remarks: String,
        actionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Authentication"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("WorkOrder", workOrderSchema);
