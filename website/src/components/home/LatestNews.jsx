// ...other imports
import React, { useRef, useEffect, useState } from "react";
import latestNewsData from "../../siteData/latestNewsData";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate, Link } from "react-router-dom";
import { loadRazorpayScript, openRazorpay } from "../payments/Razorpay";
import { X, ArrowRight, Calendar, Star } from "lucide-react";
const EventRegistrationModal = ({ isOpen, onClose, eventTitle, event }) => {
  const [formData, setFormData] = useState({
    eventTitle: eventTitle,
    name: "",
    location: "",
    occupation: "",
    phone: "",
    description: "",
    captcha: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Update eventTitle if prop changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, eventTitle }));
  }, [eventTitle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "name") {
      newValue = newValue.replace(/[^a-zA-Z\s]/g, "");
    }
    if (name === "phone") {
      newValue = newValue.replace(/\D/g, "").slice(0, 10);
    }
    if (name === "description") {
      newValue = newValue.slice(0, 200);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCaptchaChange = (value) => {
    setFormData((prev) => ({ ...prev, captcha: value }));
    if (errors.captcha) {
      setErrors((prev) => ({ ...prev, captcha: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim()))
      newErrors.name = "Name must contain only alphabets";

    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.occupation.trim())
      newErrors.occupation = "Occupation is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone number must be exactly 10 digits";

    if (formData.description && formData.description.length > 200)
      newErrors.description = "Description must be 200 characters or less";

    if (!formData.captcha) newErrors.captcha = "Please complete the captcha";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setTimeout(() => {
        const firstErrorEl = document.querySelector(".border-red-500");
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
          firstErrorEl.focus();
        }
      }, 100);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1️⃣ Submit registration to backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}api/form-upload/create-new-form/`,
        {
          eventId: event?.fullObj?._id || event?._id, // pass eventId to backend
          eventTitle: eventTitle,
          name: formData.name,
          occupation: formData.occupation,
          location: formData.location,
          phoneNumber: formData.phone,
          description: formData.description,
        },
      );

      if (response.data.success && response.data.razorpayOrder) {
        // 2️⃣ Paid Event → Open Razorpay Checkout
        // await openRazorpay({
        //   amountPaisa: response.data.razorpayOrder.amount,
        //   currency: response.data.razorpayOrder.currency,
        //   name: formData.name,
        //   email: formData.email, // TODO: collect email in form if needed
        //   contact: formData.phone,
        //   cid: response.data.form._id, // student registration id
        //   crn: response.data.razorpayOrder.receipt,
        //   remarks: "Event Registration Payment",
        // });
        await loadRazorpayScript();
        const response_HH = response;
        const options = {
          key: "rzp_test_CIu8x9gDcAj3xf", // Your Razorpay key ID
          amount: response.data.razorpayOrder.amount,
          currency: "INR",
          name: "AKNU Certificates",
          description: "Registration Payment",
          order_id: response.data.razorpayOrder.id,
          handler: async function (response) {
            alert("Payment Successful!");
            // Optional: Send success response to backend to verify and update status
            await axios.post(
              `${import.meta.env.VITE_API_URL}api/form-upload/confirm-payment`,
              { ...response, docId: response_HH.data.form._id },
            );
          },
          prefill: {
            name: response.data.form.name,
            // email: response.data.form.email,
            contact: formData.phone,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // 3️⃣ Free Event → Success directly
        alert("Registration Successful");
        onClose();
        navigate("/");
      }

      // Reset form
      setFormData({
        eventTitle: eventTitle,
        name: "",
        location: "",
        occupation: "",
        phone: "",
        description: "",
        captcha: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error.message);
      alert("Something went wrong! Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 overscroll-contain"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Modal Header */}
        <div className="bg-teal-700 px-6 sm:px-8 py-4 sm:py-5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Register For Event
            </h2>
            <p className="text-teal-100 text-xs sm:text-sm">
              Register for {eventTitle || "the selected event"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-teal-100 hover:text-white hover:bg-teal-600 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-6 md:p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {/* Registration Details Section */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3">
                Registration Details
              </h3>

              {/* Paid Event Payment Block */}
              {event?.fullObj?.eventType === "paid" && (
                <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg text-teal-900 text-sm font-semibold flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-xs text-teal-700 uppercase tracking-wider">
                    Event Category: <b>{event?.fullObj?.eventType}</b>
                  </span>
                  <span>
                    Amount Due: <b>Rs. {event?.fullObj?.amount}</b>
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } transition-all`}
                    autoComplete="off"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* occupation */}
                <div>
                  <label
                    htmlFor="occupation"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Occupation <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white ${
                      errors.occupation ? "border-red-500" : "border-gray-300"
                    } transition-all`}
                    name="occupation"
                    id="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                  >
                    <option value="">Select Occupation</option>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="others">Others</option>
                  </select>
                  {errors.occupation && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.occupation}
                    </p>
                  )}
                </div>

                {/* phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } transition-all`}
                    autoComplete="off"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* location */}
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    placeholder="City / State"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.location ? "border-red-500" : "border-gray-300"
                    } transition-all`}
                    autoComplete="off"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* description */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Provide a brief description about your purpose of registration (max 200 characters)..."
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={200}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    } transition-all`}
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-xs text-gray-400">
                      {formData.description.length}/200 characters
                    </span>
                    {errors.description && (
                      <span className="text-sm text-red-600">
                        {errors.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* captcha & buttons on the same line */}
                <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-t border-gray-100 pt-6">
                  {/* captcha */}
                  <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Verification{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="transform scale-[0.85] origin-left">
                      <ReCAPTCHA
                        sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ"
                        onChange={handleCaptchaChange}
                      />
                    </div>
                    {errors.captcha && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.captcha}
                      </p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto md:justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-base font-semibold rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                     <button
                      type="submit"
                      disabled={isSubmitting || !formData.captcha}
                      className={`w-full sm:w-auto flex justify-center items-center py-2.5 px-6 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 ${
                        isSubmitting || !formData.captcha
                          ? "bg-teal-800/40 opacity-50 cursor-not-allowed"
                          : "bg-teal-700 hover:bg-teal-800 hover:shadow-xl cursor-pointer"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        "Register"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const NewsDetailModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-fade-in overscroll-contain"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="bg-white shadow-2xl w-full max-w-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Simple Light Header */}
        <div className="relative z-10 bg-white text-gray-800 p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">News Announcement</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-white flex-1 space-y-5 overscroll-contain">
          {/* Full-width Image Display */}
          <div className="relative w-full h-64 bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden flex-shrink-0">
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 bg-teal-50 text-teal-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {item.date}
            </span>
            {item.isImportant && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-rose-500 text-white uppercase tracking-wider animate-pulse">
                Important
              </span>
            )}
          </div>

          <h3 className="text-2xl font-bold text-gray-800 leading-snug">
            {item.title}
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {item.description}
          </p>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const NewsImage = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gradient-to-br from-teal-500 to-[#525B88] flex items-center justify-center text-white">
        <svg
          className="w-8 h-8 opacity-75"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
    />
  );
};

const getEventDateParts = (dateInput) => {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      return { day: "??", month: "EVT", year: "" };
    }
    return {
      day: d.getDate(),
      month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
      year: d.getFullYear(),
    };
  } catch (e) {
    return { day: "??", month: "EVT", year: "" };
  }
};

export default function LatestNews() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventFull, setSelectedEventFull] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [data, setDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const isAnyModalOpen = isModalOpen || !!selectedNews || !!selectedImage;
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isModalOpen, selectedNews, selectedImage]);
  const handleRegisterClick = (eventTitle, event) => {
    setSelectedEvent(eventTitle);
    if (event) setSelectedEventFull(event);
    setIsModalOpen(true);
  };
  const newsScrollRef = useRef(null);
  const eventsScrollRef = useRef(null);
  const [hoveringNews, setHoveringNews] = useState(false);
  const [hoveringEvents, setHoveringEvents] = useState(false);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);

  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const fetchEvents = async (force = false) => {
    try {
      // 1. If not force & localStorage has data → use it
      if (!force) {
        const cached = localStorage.getItem("events");
        if (cached) {
          setEvents(
            JSON.parse(cached).map((ele) => ({
              ...ele,
              dateRaw: new Date(ele.dateRaw),
              date: new Date(ele.dateRaw),
            })),
          );
          setLoadingEvents(false);
          return;
        }
      }

      const today = new Date();

      const response_2_alumni_events = await axios.get(
        `${import.meta.env.VITE_API_URL}api/alumni/get-approved-events`,
      );
      const formatedEvents_2 =
        response_2_alumni_events?.data.map((event, index) => {
          const eventDate = new Date(event.date);
          const day = eventDate.getDate();
          const month = eventDate.toLocaleString("default", {
            month: "long",
          });
          const year = eventDate.getFullYear();

          return {
            id: index + 1,
            date: `${day}${getDaySuffix(day)} ${month}`,
            year: `${year}`,
            organizer: "AKNU",
            title: event.title,
            description: event.description,
            location: event.venue,
            detailsLink: `#`,
            registerLink: "#upcoming-events",
            isImportant: event.isImportant,
            dateRaw: eventDate,
            createdBy: "ALUMNI",
            fullObj: event,
          };
        }) || [];

      // 2. Otherwise fetch fresh data
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}api/event/`,
      );

      const formattedEvents =
        response?.data?.data.map((event, index) => {
          const eventDate = new Date(event.date);
          const day = eventDate.getDate();
          const month = eventDate.toLocaleString("default", {
            month: "long",
          });
          const year = eventDate.getFullYear();

          return {
            id: index + 1,
            date: `${day}${getDaySuffix(day)} ${month}`,
            year: `${year}`,
            organizer: "AKNU",
            title: event.title,
            description: event.description,
            location: event.location,
            detailsLink: `/event/${event._id}`,
            registerLink: "#upcoming-events",
            isImportant: event.isImportant,
            dateRaw: eventDate,
            fullObj: event,
          };
        }) || [];

      const combinedEvents = [...formattedEvents, ...formatedEvents_2].sort(
        (a, b) => b.dateRaw - a.dateRaw,
      );

      // Map dateRaw to date property so toLocaleDateString works in UI
      const eventsWithDateObj = combinedEvents.map((event) => ({
        ...event,
        date: event.dateRaw,
      }));

      setEvents(eventsWithDateObj);

      // Save to localStorage
      localStorage.setItem("events", JSON.stringify(eventsWithDateObj));

      setLoadingEvents(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchNews = async (force = false) => {
    try {
      // 1. If not force & localStorage has data → use it
      if (!force) {
        const cached = localStorage.getItem("news");
        if (cached) {
          setNews(JSON.parse(cached));
          console.log("507", JSON.parse(cached));
          setLoadingNews(false);
          return;
        }
      }

      // 2. Otherwise fetch fresh data
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}api/news/`,
      );

      // Transform the API data into the format you need and sort by date
      const formattedNews = response.data.data
        .map((e) => ({
          img: `${import.meta.env.VITE_API_URL}api/news/file/${e._id}`,
          date: new Date(e.date).toLocaleDateString("en-GB"), // Format date as DD/MM/YYYY
          title: e.title,
          description: e.description,
          isImportant: e.isImportant,
          timestamp: new Date(e.date).getTime(),
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      setNews(formattedNews);

      // Save to localStorage
      localStorage.setItem("news", JSON.stringify(formattedNews));

      setLoadingNews(false);
    } catch (error) {
      console.error("Error fetching news:", error);
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Helper function to get the date suffix (st, nd, rd, th)
  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) return "th"; // Covers 11th to 20th
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchNews();
  }, []);

  const duplicatedNews =
    news.length > 0 ? [...news, ...news, ...news, ...news] : [];

  const duplicatedEvents =
    events.length > 0 ? [...events, ...events, ...events, ...events] : [];

  useEffect(() => {
    const container = newsScrollRef.current;
    if (!container || news.length === 0) return;

    let animationFrameId;
    const scrollSpeed = 0.55;

    const scroll = () => {
      if (!hoveringNews && !selectedImage && !isModalOpen && !selectedNews) {
        container.scrollTop += scrollSpeed;
        if (
          container.scrollTop >= container.scrollHeight / 2 ||
          container.scrollTop >=
            container.scrollHeight - container.clientHeight - 1
        ) {
          container.scrollTop = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hoveringNews, news, selectedImage, isModalOpen, selectedNews]);

  useEffect(() => {
    const container = eventsScrollRef.current;
    if (!container || events.length === 0 || showAllEvents) return;

    let animationFrameId;
    const scrollSpeed = 1;

    const scroll = () => {
      if (!hoveringEvents && !selectedImage && !isModalOpen && !selectedNews) {
        container.scrollTop += scrollSpeed;
        if (
          container.scrollTop >= container.scrollHeight / 2 ||
          container.scrollTop >=
            container.scrollHeight - container.clientHeight - 1
        ) {
          container.scrollTop = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    hoveringEvents,
    events,
    selectedImage,
    isModalOpen,
    selectedNews,
    showAllEvents,
  ]);

  // Polinaidu: 29/10/2025:   Added this for when model is opened it will stop scrolling of latest news

  return (
    <>
      <div
        className="w-full flex flex-col items-center px-6 pt-8"
        id="latest-news"
      >
        <div className="w-full max-w-[95%] mx-auto">
          {/* Header Section */}
          <div className="w-full flex flex-col md:flex-row md:justify-between md:items-end mb-12">
            <div>
              {/* <span className="text-teal-600 font-bold uppercase tracking-wider text-xs sm:text-sm">
                AKNU Bulletin
              </span> */}
              <h2 className="text-3xl  font-bold text-teal-800 mt-1.5 leading-tight">
                Latest News & Happenings
              </h2>
              <p className="text-gray-500 text-sm sm:text-[16px]  mt-3 md:mt-0 leading-relaxed">
                Stay connected with our University latest announcements,
                academic insights, and vibrant student-led events.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* NEWS Section */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-teal-800 w-fit">
                <svg
                  className="w-6 h-6 text-teal-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <h2 className="text-2xl font-extrabold text-teal-800">
                  Campus News
                </h2>
              </div>

              <div className="p-1">
                {/* Scroll Wrapper */}
                <div
                  ref={newsScrollRef}
                  className="h-[420px] overflow-y-auto no-scrollbar cursor-pointer"
                  onMouseEnter={() => setHoveringNews(true)}
                  onMouseLeave={() => setHoveringNews(false)}
                >
                  <ul className="space-y-4 py-2">
                    {duplicatedNews.map((item, idx) => (
                      <li key={idx} className="group">
                        <div
                          onClick={() => setSelectedNews(item)}
                          className="flex items-center justify-between gap-4 p-3 border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 min-h-[80px] h-auto cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1 flex-wrap text-md sm:text-md font-semibold">
                              <span className=" flex-shrink-0">
                                {item.date}
                              </span>
                              <span className="text-gray-400 font-normal">
                                ::
                              </span>
                              <h3 className="text-gray-800 group-hover:text-teal-700 transition-colors line-clamp-1 leading-snug flex-1 min-w-0">
                                {item.title}
                              </h3>
                            </div>
                            {item.description && (
                              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0 flex items-center pl-4 border-l border-gray-100 flex-col gap-2">
                            {item.isImportant && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500 text-white uppercase tracking-wider animate-pulse rounded ml-2 flex-shrink-0">
                                Important
                              </span>
                            )}
                            <span className="text-xs sm:text-sm font-semibold  flex items-center gap-1 group-hover:gap-2 transition-all">
                              Read Article{" "}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 flex justify-end">
                  <Link
                    to="/news"
                    className="flex gap-2 cursor-pointer items-center  text-teal-800 font-bold text-sm "
                  >
                    <span>More</span> <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* EVENTS Section */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-teal-800 w-fit">
                <svg
                  className="w-6 h-6 text-teal-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h2 className="text-2xl font-extrabold text-teal-800">
                  Upcoming Events
                </h2>
              </div>

              <div className="p-1 h-full flex flex-col justify-between">
                {/* Scroll Wrapper */}
                <div
                  ref={eventsScrollRef}
                  className={`${showAllEvents ? "h-auto" : "h-[420px] overflow-y-auto"} no-scrollbar cursor-pointer`}
                  onMouseEnter={() => setHoveringEvents(true)}
                  onMouseLeave={() => setHoveringEvents(false)}
                >
                  <ul className="space-y-4 py-1 flex-1">
                    {(showAllEvents ? events : duplicatedEvents).map(
                      (event, idx) => {
                        const eventDateStr = (() => {
                          try {
                            const d = new Date(event.date);
                            return isNaN(d.getTime())
                              ? ""
                              : d.toLocaleDateString("en-GB");
                          } catch (e) {
                            return "";
                          }
                        })();
                        return (
                          <li key={idx} className="group">
                            <div
                              onClick={() =>
                                handleRegisterClick(event.title, event)
                              }
                              className="flex items-center justify-between gap-4 p-3 border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 min-h-[80px] h-auto cursor-pointer"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1 flex-wrap text-md sm:text-md font-semibold">
                                  <span className=" flex-shrink-0">
                                    {eventDateStr}
                                  </span>
                                  <span className="text-gray-400 font-normal">
                                    ::
                                  </span>
                                  <h3 className="text-gray-800 group-hover:text-teal-700 transition-colors line-clamp-1 leading-snug flex-1 min-w-0">
                                    {event.title}
                                  </h3>
                                </div>
                                {event.description && (
                                  <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex-shrink-0 flex items-center pl-4 border-l border-gray-100 flex-col gap-2">
                                {event.isImportant && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500 text-white uppercase tracking-wider animate-pulse rounded ml-2 flex-shrink-0">
                                    Important
                                  </span>
                                )}
                                <span className="text-xs sm:text-sm font-semibold  flex items-center gap-1 group-hover:gap-2 transition-all">
                                  Register Now{" "}
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      },
                    )}
                  </ul>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setShowAllEvents(!showAllEvents)}
                    className="flex gap-1 cursor-pointer items-center  text-teal-800 font-bold text-sm"
                  >
                    <span> {showAllEvents ? "Show Less" : "More"}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline styles for hiding scrollbars completely */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* New NewsDetailModal */}
      <NewsDetailModal
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        item={selectedNews}
      />

      <EventRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventTitle={selectedEvent}
        event={selectedEventFull}
      />

      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute cursor-pointer -top-4 -right-4 bg-white text-black rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
              aria-label="Close image modal"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={selectedImage}
              alt="Expanded"
              className="max-w-[90vw] max-h-[90vh] shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
