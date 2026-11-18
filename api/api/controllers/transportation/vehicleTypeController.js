const VehicleType = require("../../models/transportation/VehicleType");

// Create Vehicle Type
exports.createVehicleType = async (req, res) => {
    try {
        const { typeName, description, status } = req.body;

        const existingType = await VehicleType.findOne({ typeName });
        if (existingType) {
            return res.status(400).json({ error: "Vehicle type already exists" });
        }

        const newType = new VehicleType({
            typeName,
            description,
            status
        });

        await newType.save();
        res.status(201).json(newType);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Vehicle Types
exports.getAllVehicleTypes = async (req, res) => {
    try {
        const types = await VehicleType.find().sort({ createdAt: -1 });
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Single Vehicle Type
exports.getVehicleTypeById = async (req, res) => {
    try {
        const type = await VehicleType.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ error: "Vehicle Type not found" });
        }
        res.status(200).json(type);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Vehicle Type
exports.updateVehicleType = async (req, res) => {
    try {
        const { typeName, description, status } = req.body;

        if (typeName) {
            const existingType = await VehicleType.findOne({ typeName, _id: { $ne: req.params.id } });
            if (existingType) {
                return res.status(400).json({ error: "Vehicle type name already exists" });
            }
        }

        const updatedType = await VehicleType.findByIdAndUpdate(
            req.params.id,
            { typeName, description, status },
            { new: true, runValidators: true }
        );

        if (!updatedType) {
            return res.status(404).json({ error: "Vehicle Type not found" });
        }

        res.status(200).json(updatedType);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Vehicle Type
exports.deleteVehicleType = async (req, res) => {
    try {
        const deletedType = await VehicleType.findByIdAndDelete(req.params.id);
        if (!deletedType) {
            return res.status(404).json({ error: "Vehicle Type not found" });
        }
        res.status(200).json({ message: "Vehicle Type deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
