const DriverMapping = require("../../models/transportation/DriverMapping");

// Create Mapping
exports.createDriverMapping = async (req, res) => {
    try {
        const { driverId, vehicleId, shift, status } = req.body;

        // Check if mapping already exists
        const existingMapping = await DriverMapping.findOne({ driverId, vehicleId, shift });
        if (existingMapping) {
            return res.status(400).json({ error: "Driver is already assigned to this vehicle for this shift." });
        }

        const newMapping = new DriverMapping({
            driverId,
            vehicleId,
            shift,
            status
        });

        await newMapping.save();

        // Populate driver and vehicle details for response
        const populatedMapping = await DriverMapping.findById(newMapping._id)
            .populate("driverId", "driverName")
            .populate("vehicleId", "vehicleNumber vehicleType");

        res.status(201).json(populatedMapping);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Mappings
exports.getAllDriverMappings = async (req, res) => {
    try {
        const mappings = await DriverMapping.find()
            .populate("driverId", "driverName")
            .populate("vehicleId", "vehicleNumber vehicleType")
            .sort({ createdAt: -1 });
        res.status(200).json(mappings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Single Mapping
exports.getDriverMappingById = async (req, res) => {
    try {
        const mapping = await DriverMapping.findById(req.params.id)
            .populate("driverId", "driverName")
            .populate("vehicleId", "vehicleNumber vehicleType");

        if (!mapping) {
            return res.status(404).json({ error: "Mapping not found" });
        }
        res.status(200).json(mapping);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Mapping
exports.updateDriverMapping = async (req, res) => {
    try {
        const { driverId, vehicleId, shift, status } = req.body;

        // Check for duplicate if changing keys (excluding this one)
        if (driverId || vehicleId || shift) {
            const existingMapping = await DriverMapping.findOne({
                driverId: driverId || req.body.driverId,
                vehicleId: vehicleId || req.body.vehicleId,
                shift: shift || req.body.shift,
                _id: { $ne: req.params.id }
            });

            if (existingMapping) {
                return res.status(400).json({ error: "Duplicate assignment detected." });
            }
        }

        const updatedMapping = await DriverMapping.findByIdAndUpdate(
            req.params.id,
            { driverId, vehicleId, shift, status },
            { new: true, runValidators: true }
        )
            .populate("driverId", "driverName")
            .populate("vehicleId", "vehicleNumber vehicleType");

        if (!updatedMapping) {
            return res.status(404).json({ error: "Mapping not found" });
        }

        res.status(200).json(updatedMapping);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Mapping
exports.deleteDriverMapping = async (req, res) => {
    try {
        const deletedMapping = await DriverMapping.findByIdAndDelete(req.params.id);
        if (!deletedMapping) {
            return res.status(404).json({ error: "Mapping not found" });
        }
        res.status(200).json({ message: "Mapping deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
