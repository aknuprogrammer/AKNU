import Location from "../../models/faculty_track/Location.js";
import FacultyTrackBatch from "../../models/faculty_track/FacultyTrackBatch.js";

export const updateLocation = async (req, res) => {
  try {
    const { userId, batchId, latitude, longitude, accuracy, speed, heading } =
      req.body;

    console.log("📍 Received location data:", req.body);

    if (!userId || !batchId || !latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Missing required fields (userId, batchId, latitude, longitude)" });
    }

    const locationEntry = new Location({
      user: userId,
      batchId, // now properly linked
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
    });

    await locationEntry.save();

    res.json({
      message: "Location updated successfully",
      location: locationEntry,
    });
  } catch (err) {
    console.error("❌ Error saving location:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const startTrip = async (req, res) => {
  try {
    const { userId, tripId, latitude, longitude } = req.body;

    const batch = new FacultyTrackBatch({
      user: userId,
      tripId,
      startTime: new Date(),
      startLocation: { latitude, longitude },
    });


    await batch.save();
    res.json({ message: "Trip started", batchId: batch._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const endTrip = async (req, res) => {
  try {
    const { batchId, latitude, longitude } = req.body;

    if (!batchId) {
      return res.status(400).json({ message: "batchId is required" });
    }

    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: "latitude and longitude are required" });
    }

    console.log("Ending trip for batchId:", batchId, req.body);

    // Find the batch by ID
    const batch = await FacultyTrackBatch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Trip batch not found" });
    }

    // Update end time and location
    batch.endTime = new Date();
    batch.endLocation = {
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    // Save batch
    await batch.save();

    console.log("Trip batch updated successfully:", batch);
    res.json({ message: "Trip ended", batch });
  } catch (err) {
    console.error("❌ Error ending trip:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

