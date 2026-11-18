const mongoose = require("mongoose");

const maintenanceHistorySchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        cost: {
            type: Number,
            default: 0,
            min: 0,
        },
        performedBy: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const physicalInventorySchema = new mongoose.Schema(
    {
        itemType: {
            type: String,
            required: [true, "Item type is required"],
            trim: true,
            lowercase: true,
            enum: ["chair", "table", "desk", "shelf", "computer", "printer", "projector", "ac", "fan", "other"],
        },
        itemName: {
            type: String,
            required: [true, "Item name is required"],
            trim: true,
        },
        itemCode: {
            type: String,
            required: [true, "Item code is required"],
            unique: true,
            trim: true,
            uppercase: true,
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: ["furniture", "electronics", "equipment"],
            lowercase: true,
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [0, "Quantity cannot be negative"],
            default: 1,
        },
        condition: {
            type: String,
            required: [true, "Condition is required"],
            enum: ["excellent", "good", "fair", "poor", "damaged"],
            lowercase: true,
            default: "good",
        },
        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },
        library: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LibraryInfo",
            index: true,
        },
        purchaseDate: {
            type: Date,
        },
        purchasePrice: {
            type: Number,
            min: [0, "Purchase price cannot be negative"],
            default: 0,
        },
        vendor: {
            type: String,
            trim: true,
        },
        warrantyExpiry: {
            type: Date,
        },
        maintenanceHistory: [maintenanceHistorySchema],
        status: {
            type: String,
            required: true,
            enum: ["active", "under_maintenance", "retired"],
            lowercase: true,
            default: "active",
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
physicalInventorySchema.index({ itemCode: 1 });
physicalInventorySchema.index({ category: 1 });
physicalInventorySchema.index({ location: 1 });
physicalInventorySchema.index({ status: 1 });

module.exports = mongoose.model("PhysicalInventory", physicalInventorySchema);
