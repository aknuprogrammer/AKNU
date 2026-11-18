const RouteMapping = require("../../models/transportation/RouteMapping");

// @desc Create a new vehicle-route mapping
// @route POST /api/transportation/route-mappings
exports.createRouteMapping = async (req, res) => {
    try {
        const { vehicleId, routeId, status } = req.body;

        if (!vehicleId || !routeId) {
            return res.status(400).json({ error: "Vehicle ID and Route ID are required" });
        }

        // Check if mapping already exists
        const existingMapping = await RouteMapping.findOne({ vehicleId, routeId });
        if (existingMapping) {
            return res.status(400).json({ error: "Vehicle is already assigned to this route." });
        }

        const newMapping = new RouteMapping({
            vehicleId,
            routeId,
            status: status || 'active'
        });

        await newMapping.save();

        // Populate vehicle and route details for response
        const populatedMapping = await RouteMapping.findById(newMapping._id)
            .populate("vehicleId", "vehicleNumber vehicleType")
            .populate("routeId", "routeName")
            .lean();

        res.status(201).json(populatedMapping);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc Get all vehicle-route mappings with pagination
// @route GET /api/transportation/route-mappings
exports.getAllRouteMappings = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};

        if (status) query.status = status;

        const mappings = await RouteMapping.find(query)
            .populate("vehicleId", "vehicleNumber vehicleType")
            .populate("routeId", "routeName")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(mappings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc Get single route mapping by ID
// @route GET /api/transportation/route-mappings/:id
exports.getRouteMappingById = async (req, res) => {
    try {
        const mapping = await RouteMapping.findById(req.params.id)
            .populate("vehicleId", "vehicleNumber vehicleType")
            .populate("routeId", "routeName")
            .lean();

        if (!mapping) {
            return res.status(404).json({ error: "Mapping not found" });
        }

        res.status(200).json(mapping);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc Update an existing route mapping
// @route PUT /api/transportation/route-mappings/:id
exports.updateRouteMapping = async (req, res) => {
    try {
        const { vehicleId, routeId, status } = req.body;

        // Check for duplicate if changing keys
        if (vehicleId || routeId) {
            const current = await RouteMapping.findById(req.params.id);
            if (!current) {
                return res.status(404).json({ error: "Mapping not found" });
            }

            const existingMapping = await RouteMapping.findOne({
                vehicleId: vehicleId || current.vehicleId,
                routeId: routeId || current.routeId,
                _id: { $ne: req.params.id }
            });

            if (existingMapping) {
                return res.status(400).json({ error: "Duplicate assignment detected." });
            }
        }

        const updatedMapping = await RouteMapping.findByIdAndUpdate(
            req.params.id,
            { vehicleId, routeId, status },
            { new: true, runValidators: true }
        )
            .populate("vehicleId", "vehicleNumber vehicleType")
            .populate("routeId", "routeName")
            .lean();

        if (!updatedMapping) {
            return res.status(404).json({ error: "Mapping not found" });
        }

        res.status(200).json(updatedMapping);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc Delete a route mapping
// @route DELETE /api/transportation/route-mappings/:id
exports.deleteRouteMapping = async (req, res) => {
    try {
        const deletedMapping = await RouteMapping.findByIdAndDelete(req.params.id);
        if (!deletedMapping) {
            return res.status(404).json({ error: "Mapping not found" });
        }

        res.status(200).json({ message: "Mapping deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
