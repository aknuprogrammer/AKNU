// api/routes/eventsRoutes.js
const express = require("express");
const { createEvent, getEvents, getEventById, updateEvent, deleteEvent } = require("../../../controllers/admission/selector/datePickerController");
const router = express.Router();


// POST   /api/events        -> create
router.post("/", createEvent);

// GET    /api/events        -> list (supports ?active=true & ?title=foo)
router.get("/", getEvents);

// GET    /api/events/:id    -> single
router.get("/:id", getEventById);

// PUT    /api/events/:id    -> update
router.put("/:id", updateEvent);

// DELETE /api/events/:id    -> delete
router.delete("/:id", deleteEvent);

module.exports = router;
