const mongoose = require("mongoose");

const driverMappingSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        required: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
    },
    shift: {
        type: String,
        enum: ["Morning", "Afternoon"],
        default: "Morning",
        required: true
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, { timestamps: true });

// Prevent duplicate mapping for same driver/vehicle/shift
driverMappingSchema.index({ driverId: 1, vehicleId: 1, shift: 1 }, { unique: true });

module.exports = mongoose.model("DriverMapping", driverMappingSchema);
