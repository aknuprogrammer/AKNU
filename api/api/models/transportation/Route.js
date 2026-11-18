const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
    routeName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    stops: {
        type: [String], // Array of stop names
        default: []
    },
    distance: {
        type: Number, // In km
        default: 0
    },
    estimatedTime: {
        type: String, // e.g. "45 mins"
        trim: true
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, { timestamps: true });

module.exports = mongoose.model("Route", routeSchema);
