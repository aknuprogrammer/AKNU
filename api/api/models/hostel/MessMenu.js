const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
    veg: {
        type: String,
        required: true,
        default: "N/A"
    },
    nonVeg: {
        type: String,
        required: true,
        default: "N/A"
    }
}, { _id: false });

const messMenuSchema = new mongoose.Schema(
    {
        hostelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hostel",
            required: true
        },
        dayOfWeek: {
            type: String,
            required: true,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        },
        breakfast: {
            type: mealSchema,
            required: true,
            default: () => ({ veg: "N/A", nonVeg: "N/A" })
        },
        lunch: {
            type: mealSchema,
            required: true,
            default: () => ({ veg: "N/A", nonVeg: "N/A" })
        },
        snacks: {
            type: mealSchema,
            required: true,
            default: () => ({ veg: "N/A", nonVeg: "N/A" })
        },
        dinner: {
            type: mealSchema,
            required: true,
            default: () => ({ veg: "N/A", nonVeg: "N/A" })
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "published"
        },
        actionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Authentication"
        }
    },
    { timestamps: true }
);

// Prevent duplicate menu for same hostel and day
messMenuSchema.index({ hostelId: 1, dayOfWeek: 1 }, { unique: true });

const MessMenu = mongoose.model("MessMenu", messMenuSchema);

// Drop the legacy index that causes duplicate key errors during schema transition
MessMenu.collection.dropIndex("hostelId_1_date_1_mealType_1").catch(err => {
    // This is expected if the index doesn't exist or was already dropped
    console.log("Note: Legacy MessMenu index not found or already dropped.");
});

module.exports = MessMenu;
