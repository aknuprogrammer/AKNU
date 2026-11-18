const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
    driverName: {
        type: String,
        required: true,
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    experience: {
        type: Number, // Years of experience
        default: 0,
    },
    email: { type: String },
    address: { type: String },
    photo: { type: String },
    status: {
        type: String,
        enum: ["active", "on_leave", "inactive"],
        default: "active",
    },
}, { timestamps: true });

module.exports = mongoose.model("Driver", driverSchema);
