const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    vehicleNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    vehicleType: {
        type: String,
        required: true,
        trim: true
    },
    make: {
        type: String,
        trim: true
    },
    model: {
        type: String,
        trim: true
    },
    year: {
        type: Number,
    },
    capacity: {
        type: Number,
        required: true
    },
    purchaseDate: {
        type: Date
    },
    purchasePrice: {
        type: Number
    },
    status: {
        type: String,
        enum: ["active", "maintenance", "retired"],
        default: "active",
    },
}, { timestamps: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);
