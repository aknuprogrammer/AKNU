const mongoose = require("mongoose");

const routeMappingSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
    },
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route",
        required: true
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, { timestamps: true });

// Prevent duplicate mapping for same vehicle/route
routeMappingSchema.index({ vehicleId: 1, routeId: 1 }, { unique: true });

module.exports = mongoose.model("RouteMapping", routeMappingSchema);
