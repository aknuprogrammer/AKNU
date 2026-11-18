const PhysicalInventory = require("../../models/library/PhysicalInventory");

// @desc Get all physical inventory items
// @route GET /api/library/physical-inventory
exports.getAllItems = async (req, res) => {
    try {
        const {
            itemName,
            category,
            location,
            condition,
            status,
            itemType,
        } = req.query;

        const query = {};

        if (itemName) {
            query.itemName = { $regex: itemName, $options: "i" };
        }
        if (category) {
            query.category = category;
        }
        if (location) {
            query.location = { $regex: location, $options: "i" };
        }
        if (condition) {
            query.condition = condition;
        }
        if (status) {
            query.status = status;
        }
        if (itemType) {
            query.itemType = itemType;
        }

        const items = await PhysicalInventory.find(query).sort({ createdAt: -1 });

        res.json(items);
    } catch (error) {
        console.error("Error fetching physical inventory:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Get single physical inventory item
// @route GET /api/library/physical-inventory/:id
exports.getItemById = async (req, res) => {
    try {
        const item = await PhysicalInventory.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json(item);
    } catch (error) {
        console.error("Error fetching item:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Create new physical inventory item
// @route POST /api/library/physical-inventory
exports.createItem = async (req, res) => {
    try {
        const item = new PhysicalInventory(req.body);
        await item.save();

        res.status(201).json(item);
    } catch (error) {
        console.error("Error creating item:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Item code already exists",
                error: "Duplicate item code",
            });
        }

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

// @desc Update physical inventory item
// @route PUT /api/library/physical-inventory/:id
exports.updateItem = async (req, res) => {
    try {
        const item = await PhysicalInventory.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json(item);
    } catch (error) {
        console.error("Error updating item:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Item code already exists",
                error: "Duplicate item code",
            });
        }

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

// @desc Delete physical inventory item
// @route DELETE /api/library/physical-inventory/:id
exports.deleteItem = async (req, res) => {
    try {
        const item = await PhysicalInventory.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json({ message: "Item deleted successfully", item });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Get items by category
// @route GET /api/library/physical-inventory/category/:category
exports.getItemsByCategory = async (req, res) => {
    try {
        const items = await PhysicalInventory.find({
            category: req.params.category,
        }).sort({ createdAt: -1 });

        res.json(items);
    } catch (error) {
        console.error("Error fetching items by category:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Get items by location
// @route GET /api/library/physical-inventory/location/:location
exports.getItemsByLocation = async (req, res) => {
    try {
        const items = await PhysicalInventory.find({
            location: { $regex: req.params.location, $options: "i" },
        }).sort({ createdAt: -1 });

        res.json(items);
    } catch (error) {
        console.error("Error fetching items by location:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc Add maintenance record
// @route POST /api/library/physical-inventory/:id/maintenance
exports.addMaintenanceRecord = async (req, res) => {
    try {
        const item = await PhysicalInventory.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        item.maintenanceHistory.push(req.body);
        await item.save();

        res.json(item);
    } catch (error) {
        console.error("Error adding maintenance record:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};
