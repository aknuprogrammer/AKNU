const Vehicle = require("../../models/transportation/Vehicle");

// Create Vehicle
exports.createVehicle = async (req, res) => {
    try {
        const { vehicleNumber, vehicleType, make, model, year, capacity, purchaseDate, purchasePrice, status } = req.body;

        const existingVehicle = await Vehicle.findOne({ vehicleNumber });
        if (existingVehicle) {
            return res.status(400).json({ error: "Vehicle number already exists" });
        }

        const newVehicle = new Vehicle({
            vehicleNumber,
            vehicleType,
            make,
            model,
            year,
            capacity,
            purchaseDate,
            purchasePrice,
            status
        });

        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Vehicles
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ createdAt: -1 });
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Single Vehicle
exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Vehicle
exports.updateVehicle = async (req, res) => {
    try {
        const { vehicleNumber, vehicleType, make, model, year, capacity, purchaseDate, purchasePrice, status } = req.body;

        if (vehicleNumber) {
            const existingVehicle = await Vehicle.findOne({ vehicleNumber, _id: { $ne: req.params.id } });
            if (existingVehicle) {
                return res.status(400).json({ error: "Vehicle number already in use" });
            }
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { vehicleNumber, vehicleType, make, model, year, capacity, purchaseDate, purchasePrice, status },
            { new: true, runValidators: true }
        );

        if (!updatedVehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }

        res.status(200).json(updatedVehicle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Vehicle
exports.deleteVehicle = async (req, res) => {
    try {
        const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!deletedVehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }
        res.status(200).json({ message: "Vehicle deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
