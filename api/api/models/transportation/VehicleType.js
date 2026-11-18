const mongoose = require("mongoose");

const vehicleTypeSchema = new mongoose.Schema({
    typeName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, { timestamps: true });

module.exports = mongoose.model("VehicleType", vehicleTypeSchema);
