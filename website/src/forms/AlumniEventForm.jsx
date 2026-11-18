import React, { useState } from "react";
import axios from "axios";

export default function AlumniEventForm() {
  const closeModal = () => {
    window.history.pushState(
      "",
      document.title,
      window.location.pathname + window.location.search
    );
    window.dispatchEvent(new Event("hashchange"));
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    organizer: "",
    contactEmail: "",
    contactPhone: "",
    eventType: "free",
    amount: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Event title is required";
    if (!formData.organizer.trim()) newErrors.organizer = "Organizer name is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.venue.trim()) newErrors.venue = "Venue is required";

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Enter a valid email";
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = "Contact phone is required";
    } else if (!/^\d{10}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = "Enter a valid 10-digit phone number";
    }

    if (formData.eventType === "paid" && (!formData.amount || formData.amount <= 0)) {
      newErrors.amount = "Ticket price must be greater than 0";
    }

    if (!formData.description.trim()) newErrors.description = "Event description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // clear old errors
    if (!validate()) return;

    try {
      const formDataToSend = new FormData();

      // Append all fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      console.log("CCCCC", formDataToSend, formData)

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/alumni/add-event`,
        formData, // plain JSON
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      // console.log(res)
      // if (!res.ok) {
      //   throw new Error(res || "Failed to add event");
      // }

      alert("✅ Event added successfully!");

      // Reset form
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        organizer: "",
        contactEmail: "",
        contactPhone: "",
        eventType: "free",
        amount: "",
      });
      closeModal()

    } catch (err) {
      console.error("Submit error:", err);
      alert("❌ " + err.message);
    }
  };


  return (
    <div className="max-w-2xl mx-auto bg-white rounded-md overflow-hidden shadow-md">
      <div className="p-4 bg-teal-800 text-white shadow-md flex-shrink-0 relative">
        <h2 className="text-2xl font-bold">Create New Event</h2>
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-white hover:text-gray-400 transition"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-5 overflow-auto max-h-[70vh]"
      >
        {/* Event Title */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Event Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors.title ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-teal-500`}
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        {/* Organizer */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Organizer
          </label>
          <input
            type="text"
            name="organizer"
            value={formData.organizer}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors.organizer ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-teal-500`}
          />
          {errors.organizer && <p className="text-red-500 text-sm">{errors.organizer}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]} // ✅ disable past dates
            className={`w-full px-4 py-2 border ${errors.date ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-teal-500`}
          />
          {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
        </div>


        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Time
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors.time ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-teal-500`}
          />
          {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
        </div>

        {/* Venue */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Venue
          </label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors.venue ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-teal-500`}
          />
          {errors.venue && <p className="text-red-500 text-sm">{errors.venue}</p>}
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Contact Email
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors.contactEmail ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-teal-500`}
          />
          {errors.contactEmail && (
            <p className="text-red-500 text-sm">{errors.contactEmail}</p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Contact Phone
          </label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // ✅ remove non-digits
              if (value.length <= 10) {
                handleChange({ target: { name: "contactPhone", value } });
              }
            }}
            maxLength={10}
            pattern="\d{10}" // ✅ 10 digits
            placeholder="Enter 10-digit number"
            className={`w-full px-4 py-2 border ${errors.contactPhone ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-teal-500`}
          />
          {errors.contactPhone && (
            <p className="text-red-500 text-sm">{errors.contactPhone}</p>
          )}
        </div>


        {/* Free or Paid */}
        <div className="sm:col-span-2">
          <span className="block text-sm font-medium text-gray-500 mb-2">
            Event Type
          </span>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="eventType"
                value="free"
                checked={formData.eventType === "free"}
                onChange={handleChange}
              />
              Free
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="eventType"
                value="paid"
                checked={formData.eventType === "paid"}
                onChange={handleChange}
              />
              Paid
            </label>
          </div>
        </div>

        {/* Amount if Paid */}
        {formData.eventType === "paid" && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Ticket Price (₹)
            </label>
            <input
              type="number"
              name="amount"
              min={0}
              value={formData.amount}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.amount ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-teal-500`}
            />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
          </div>
        )}

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Event Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors.description ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-teal-500`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="sm:col-span-2 bg-teal-800 text-white py-3 rounded-md transition hover:bg-teal-700"
        >
          Submit Event
        </button>
      </form>
    </div>
  );
}
