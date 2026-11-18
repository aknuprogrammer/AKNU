const DigitalResource = require("../../models/library/DigitalResource");

// @desc Get all digital resources
// @route GET /api/library/digital-resources
exports.getAllResources = async (req, res) => {
    try {
        const {
            search,
            resourceType,
            category,
            accessType,
            fileFormat,
            status,
        } = req.query;

        const query = {};

        if (search) {
            query.$text = { $search: search };
        }
        if (resourceType) {
            query.resourceType = resourceType;
        }
        if (category) {
            query.category = category;
        }
        if (accessType) {
            query.accessType = accessType;
        }
        if (fileFormat) {
            query.fileFormat = fileFormat;
        }
        if (status) {
            query.status = status;
        } else {
            query.status = "active"; // Default to active resources
        }

        const resources = await DigitalResource.find(query)
            .populate("author", "name")
            .populate("category", "name")
            .populate("allowedCourses", "name code")
            .populate("allowedStreams", "name code")
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        console.error("Error fetching digital resources:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Get single digital resource
// @route GET /api/library/digital-resources/:id
exports.getResourceById = async (req, res) => {
    try {
        const resource = await DigitalResource.findById(req.params.id)
            .populate("author", "name")
            .populate("category", "name")
            .populate("allowedCourses", "name code")
            .populate("allowedStreams", "name code")
            .populate("uploadedBy", "name email");

        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        res.json(resource);
    } catch (error) {
        console.error("Error fetching resource:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Create new digital resource
// @route POST /api/library/digital-resources
exports.createResource = async (req, res) => {
    try {
        const resource = new DigitalResource(req.body);
        await resource.save();

        const populatedResource = await DigitalResource.findById(resource._id)
            .populate("author", "name")
            .populate("category", "name")
            .populate("allowedCourses", "name code")
            .populate("allowedStreams", "name code");

        res.status(201).json(populatedResource);
    } catch (error) {
        console.error("Error creating resource:", error);

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: "Validation Error",
                errors,
            });
        }

        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Update digital resource
// @route PUT /api/library/digital-resources/:id
exports.updateResource = async (req, res) => {
    try {
        const resource = await DigitalResource.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        )
            .populate("author", "name")
            .populate("category", "name")
            .populate("allowedCourses", "name code")
            .populate("allowedStreams", "name code");

        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        res.json(resource);
    } catch (error) {
        console.error("Error updating resource:", error);

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: "Validation Error",
                errors,
            });
        }

        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Delete digital resource
// @route DELETE /api/library/digital-resources/:id
exports.deleteResource = async (req, res) => {
    try {
        const resource = await DigitalResource.findByIdAndDelete(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        res.json({ message: "Resource deleted successfully", resource });
    } catch (error) {
        console.error("Error deleting resource:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Increment view count
// @route POST /api/library/digital-resources/:id/view
exports.incrementView = async (req, res) => {
    try {
        const resource = await DigitalResource.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        res.json({ message: "View count updated", views: resource.views });
    } catch (error) {
        console.error("Error incrementing view count:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Increment download count
// @route POST /api/library/digital-resources/:id/download
exports.incrementDownload = async (req, res) => {
    try {
        const resource = await DigitalResource.findByIdAndUpdate(
            req.params.id,
            { $inc: { downloads: 1 } },
            { new: true }
        );

        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        res.json({ message: "Download count updated", downloads: resource.downloads });
    } catch (error) {
        console.error("Error incrementing download count:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Get resources by type
// @route GET /api/library/digital-resources/type/:type
exports.getResourcesByType = async (req, res) => {
    try {
        const resources = await DigitalResource.find({
            resourceType: req.params.type,
            status: "active",
        })
            .populate("author", "name")
            .populate("category", "name")
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        console.error("Error fetching resources by type:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Get popular resources (most downloaded)
// @route GET /api/library/digital-resources/popular
exports.getPopularResources = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const resources = await DigitalResource.find({ status: "active" })
            .populate("author", "name")
            .populate("category", "name")
            .sort({ downloads: -1 })
            .limit(limit);

        res.json(resources);
    } catch (error) {
        console.error("Error fetching popular resources:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Search resources
// @route GET /api/library/digital-resources/search
exports.searchResources = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const resources = await DigitalResource.find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { tags: { $in: [new RegExp(q, "i")] } },
            ],
            status: "active",
        })
            .populate("author", "name")
            .populate("category", "name")
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        console.error("Error searching resources:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};
