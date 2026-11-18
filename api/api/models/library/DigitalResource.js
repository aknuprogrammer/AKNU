const mongoose = require("mongoose");

const digitalResourceSchema = new mongoose.Schema(
    {
        resourceType: {
            type: String,
            required: [true, "Resource type is required"],
            enum: ["ebook", "course", "video", "document"],
            lowercase: true,
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Author",
            required: [true, "Author is required"],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BookCategory",
            required: [true, "Category is required"],
        },
        library: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LibraryInfo",
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        fileUrl: {
            type: String,
            trim: true,
        },
        fileSize: {
            type: Number,
            min: 0,
        },
        fileFormat: {
            type: String,
            trim: true,
            lowercase: true,
            enum: ["pdf", "epub", "mobi", "mp4", "avi", "mkv", "zip", "rar", "doc", "docx", "ppt", "pptx"],
        },
        thumbnail: {
            type: String,
            trim: true,
        },
        accessType: {
            type: String,
            required: true,
            enum: ["free", "premium", "restricted"],
            lowercase: true,
            default: "free",
        },
        allowedCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course_data",
            },
        ],
        allowedStreams: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Stream",
            },
        ],
        downloads: {
            type: Number,
            default: 0,
            min: 0,
        },
        views: {
            type: Number,
            default: 0,
            min: 0,
        },
        uploadDate: {
            type: Date,
            default: Date.now,
        },
        lastModified: {
            type: Date,
            default: Date.now,
        },
        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],
        status: {
            type: String,
            required: true,
            enum: ["active", "archived", "pending_review"],
            lowercase: true,
            default: "active",
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        externalLink: {
            type: String,
            trim: true,
        },
        duration: {
            type: Number,
            min: 0,
        },
        language: {
            type: String,
            trim: true,
            default: "English",
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
digitalResourceSchema.index({ title: "text", tags: "text" });
digitalResourceSchema.index({ resourceType: 1 });
digitalResourceSchema.index({ category: 1 });
digitalResourceSchema.index({ accessType: 1 });
digitalResourceSchema.index({ status: 1 });

// Update lastModified on save
digitalResourceSchema.pre("save", function (next) {
    this.lastModified = Date.now();
    next();
});

module.exports = mongoose.model("DigitalResource", digitalResourceSchema);
