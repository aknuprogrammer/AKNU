const Route = require("../../models/transportation/Route");

// Create Route
exports.createRoute = async (req, res) => {
    try {
        const { routeName, stops, distance, estimatedTime, status } = req.body;

        const existingRoute = await Route.findOne({ routeName });
        if (existingRoute) {
            return res.status(400).json({ error: "Route name already exists" });
        }

        const newRoute = new Route({
            routeName,
            stops,
            distance,
            estimatedTime,
            status
        });

        await newRoute.save();
        res.status(201).json(newRoute);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Routes
exports.getAllRoutes = async (req, res) => {
    try {
        const routes = await Route.find().sort({ createdAt: -1 });
        res.status(200).json(routes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Single Route
exports.getRouteById = async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);
        if (!route) {
            return res.status(404).json({ error: "Route not found" });
        }
        res.status(200).json(route);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Route
exports.updateRoute = async (req, res) => {
    try {
        const { routeName, stops, distance, estimatedTime, status } = req.body;

        if (routeName) {
            const existingRoute = await Route.findOne({ routeName, _id: { $ne: req.params.id } });
            if (existingRoute) {
                return res.status(400).json({ error: "Route name already exists" });
            }
        }

        const updatedRoute = await Route.findByIdAndUpdate(
            req.params.id,
            { routeName, stops, distance, estimatedTime, status },
            { new: true, runValidators: true }
        );

        if (!updatedRoute) {
            return res.status(404).json({ error: "Route not found" });
        }

        res.status(200).json(updatedRoute);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Route
exports.deleteRoute = async (req, res) => {
    try {
        const deletedRoute = await Route.findByIdAndDelete(req.params.id);
        if (!deletedRoute) {
            return res.status(404).json({ error: "Route not found" });
        }
        res.status(200).json({ message: "Route deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
