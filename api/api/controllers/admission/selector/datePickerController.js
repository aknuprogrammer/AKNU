// api/controllers/eventsController.js

const DatePicker = require("../../../models/admission/selector/DatePicker");


// Create event
exports.createEvent = async (req, res) => {
  try {
    const {
      sno,
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      createdBy,
      isActive,
    } = req.body;

    if (!title || !startDate || !startTime || !endDate || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const event = new DatePicker({
      sno,
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      createdBy,
      isActive,
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all events (with optional query filters like ?active=true)
exports.getEvents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.active) filter.isActive = req.query.active === "true";
    if (req.query.title) filter.title = { $regex: req.query.title, $options: "i" };

    // Sort by createdAt desc (latest first). You can change sorting as needed.
    const events = await DatePicker.find(filter).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single event by id
exports.getEventById = async (req, res) => {
  try {
    const event = await DatePicker.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const update = req.body;
    const event = await DatePicker.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await DatePicker.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Server error" });
  }
};
