const mongoose = require("mongoose");

const messAttendanceSchema = new mongoose.Schema(
    {
        registrationNumber: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HostelFee"
        },
        date: {
            type: Date,
            required: true
        },
        mealType: {
            type: String,
            required: true,
            enum: ["Breakfast", "Lunch", "Dinner", "Snacks"]
        },
        attended: {
            type: Boolean,
            default: true
        },
        guestMeals: {
            type: Number,
            default: 0
        },
        remarks: String,
        actionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Authentication"
        }
    },
    { timestamps: true }
);

// Prevent duplicate attendance for same student, date, and meal type
messAttendanceSchema.index({ registrationNumber: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model("MessAttendance", messAttendanceSchema);
