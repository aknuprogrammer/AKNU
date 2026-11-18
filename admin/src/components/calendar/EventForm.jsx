import { useState, useEffect } from "react";

const EventForm = ({ selectedDate, event, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    day: "",
    eventType: "Public Holiday",
    event: "",
  });

  const [errors, setErrors] = useState({});

  const eventTypes = [
    "Public Holiday",
    // "National Holiday",
    "State Holiday",
    "Festival Holiday",
    "Academic Holiday",
    "College Holiday",
    "Semester Break",
    "Vacation",
    "Mid-term Break",
    "Annual Holiday",
    "Other",
  ];

  useEffect(() => {
    if (event) {
      // Editing existing event
      const fromDate = event.fromDate || event.date || "";
      const dateObj = fromDate ? new Date(fromDate + "T00:00:00") : null;
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      setFormData({
        fromDate: fromDate,
        toDate: event.toDate || fromDate,
        day: event.day || (dateObj ? dayNames[dateObj.getDay()] : ""),
        eventType: event.eventType || "Public Holiday",
        event: event.event || "",
      });
    } else if (selectedDate) {
      // New event with pre-selected date
      const dateObj = new Date(selectedDate + "T00:00:00");
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      setFormData({
        fromDate: selectedDate,
        toDate: selectedDate,
        day: dayNames[dateObj.getDay()],
        eventType: "Public Holiday",
        event: "",
      });
    }
  }, [event, selectedDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Auto-update day when fromDate changes
    if (name === "fromDate" && value) {
      const dateObj = new Date(value + "T00:00:00");
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      setFormData((prev) => ({
        ...prev,
        day: dayNames[dateObj.getDay()],
        // If toDate is empty or earlier than fromDate, set it to fromDate
        toDate: !prev.toDate || prev.toDate < value ? value : prev.toDate,
      }));
    }

    // Validate toDate is not earlier than fromDate
    if (name === "toDate" && value && formData.fromDate) {
      if (value < formData.fromDate) {
        setErrors((prev) => ({
          ...prev,
          toDate: "To date cannot be earlier than from date",
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split("T")[0];
    const isEditing = !!event; // Check if editing existing event

    if (!formData.fromDate.trim()) {
      newErrors.fromDate = "From date is required";
    } else if (!isEditing && formData.fromDate < today) {
      // Only validate past dates for new events, not when editing
      newErrors.fromDate = "From date cannot be in the past";
    }

    if (formData.toDate && formData.fromDate && formData.toDate < formData.fromDate) {
      newErrors.toDate = "To date cannot be earlier than from date";
    }
    
    if (!isEditing && formData.toDate && formData.toDate < today) {
      // Only validate past dates for new events, not when editing
      newErrors.toDate = "To date cannot be in the past";
    }

    if (!formData.eventType.trim()) {
      newErrors.eventType = "Event type is required";
    }

    if (!formData.event.trim()) {
      newErrors.event = "Event description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
      <div className="flex flex-col w-full max-w-md border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
          <h3 className="text-lg font-semibold text-white">
            {event ? "Edit Event" : "Add Event"}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Event Type Field */}
          <div>
            <label
              htmlFor="eventType"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Event Type <span className="text-red-500">*</span>
            </label>
            <select
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.eventType ? "border-red-500" : "border-gray-200"
              }`}
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.eventType && (
              <p className="mt-1 text-sm text-red-500">{errors.eventType}</p>
            )}
          </div>

          {/* From Date Field */}
          <div>
            <label
              htmlFor="fromDate"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              From Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="fromDate"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              min={!event ? new Date().toISOString().split("T")[0] : undefined}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.fromDate ? "border-red-500" : "border-gray-200"
              }`}
              required
            />
            {errors.fromDate && (
              <p className="mt-1 text-sm text-red-500">{errors.fromDate}</p>
            )}
            {!event && (
              <p className="mt-1 text-xs text-gray-500">
                Cannot select past dates
              </p>
            )}
          </div>

          {/* To Date Field */}
          <div>
            <label
              htmlFor="toDate"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              To Date <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="date"
              id="toDate"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              min={formData.fromDate || (!event ? new Date().toISOString().split("T")[0] : undefined)}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.toDate ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.toDate && (
              <p className="mt-1 text-sm text-red-500">{errors.toDate}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Leave empty for single-day events
            </p>
          </div>

          {/* Event Description Field */}
          <div>
            <label
              htmlFor="event"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Event Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="event"
              name="event"
              value={formData.event}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.event ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Enter event description..."
            />
            {errors.event && (
              <p className="mt-1 text-sm text-red-500">{errors.event}</p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex-shrink-0 flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 transition-all border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 transition-all bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {event ? "Update Event" : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;

