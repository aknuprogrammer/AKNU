const Driver = require("../../models/transportation/Driver");

// Create a new Driver
exports.createDriver = async (req, res) => {
    try {
        const { driverName, licenseNumber, phone, experience, status, email, address, photo } = req.body;

        const existingDriver = await Driver.findOne({ licenseNumber });
        if (existingDriver) {
            return res.status(400).json({ error: "License number already exists" });
        }

        const newDriver = new Driver({
            driverName,
            licenseNumber,
            phone,
            experience,
            status,
            email,
            address,
            photo
        });

        await newDriver.save();
        res.status(201).json(newDriver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all Drivers
exports.getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find().sort({ createdAt: -1 });
        res.status(200).json(drivers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single Driver by ID
exports.getDriverById = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ error: "Driver not found" });
        }
        res.status(200).json(driver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Driver
exports.updateDriver = async (req, res) => {
    try {
        const { driverName, licenseNumber, phone, experience, status, email, address } = req.body;
        let photo = req.body.photo;

        if (req.file) {
            photo = req.file.path.replace(/\\/g, "/");
        }

        // Check if license number exists for another driver (if updated)
        if (licenseNumber) {
            const existingDriver = await Driver.findOne({ licenseNumber, _id: { $ne: req.params.id } });
            if (existingDriver) {
                return res.status(400).json({ error: "License number already in use by another driver" });
            }
        }

        const updateData = { driverName, licenseNumber, phone, experience, status, email, address };
        if (photo) updateData.photo = photo;

        const updatedDriver = await Driver.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedDriver) {
            return res.status(404).json({ error: "Driver not found" });
        }

        res.status(200).json(updatedDriver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Driver
exports.deleteDriver = async (req, res) => {
    try {
        const deletedDriver = await Driver.findByIdAndDelete(req.params.id);
        if (!deletedDriver) {
            return res.status(404).json({ error: "Driver not found" });
        }
        res.status(200).json({ message: "Driver deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
