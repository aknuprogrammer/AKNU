const mongoose = require("mongoose");

const transportAssignmentSchema = new mongoose.Schema({
    userType: {
        type: String,
        enum: ["student", "staff"],
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: function () { return this.userType === 'student'; }
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmployeeRegistration",
        required: function () { return this.userType === 'staff'; }
    },
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route",
        required: true
    },
    pickupPoint: {
        type: String,
        required: true
    },
    dropPoint: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, { timestamps: true });

// Prevent duplicate assignment for same user on same route
// (Though a student might travel on different routes, usually it's one assigned transport)
// For simplicity, we'll allow multiple if needed, but uniqueness can be added later if requested.

module.exports = mongoose.model("TransportAssignment", transportAssignmentSchema);
