import { aknuEventTheme } from "@/assets";
import { ArrowUpRight, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const events = [
  {
    id: 1,
    date: "21st June",
    organizer: "AKNU",
    title: "International Yoga Day",
    description:
      "Celebrate International Yoga Day with AKNU at Rajamahendravaram. Join us for yoga sessions, meditation workshops, and wellness talks promoting physical and mental health. Open for all ages and levels.",
    location: "Rajamahendravaram",
    detailsLink: "/event/good-clinical-practice",
    registerLink: "#upcoming-events",
  },
  {
    id: 2,
    date: "10th Jul",
    organizer: "J-311",
    title: "Two Days National Seminar on Emerging Trends and Innovations",
    description:
      "Speakers from various prominent industries and Institutes like IAF, DRDO, ISRO will join this knowledge-sharing event to discuss the newest trends in engineering and research.",
    location: "Tadepalligudem",
    detailsLink:
      "/event/two-days-national-seminar-on-emerging-trends-and-innovations-in-multidisciplinary-engineering",
    registerLink: "https://gevents.gitam.edu/registration/NDM5NQ",
  },
  {
    id: 3,
    date: "17th Jul",
    organizer: "KRC Auditorium",
    title: "Narrating the Anthropocene Interdisciplinary Dialogues",
    description:
      "A two-day International Conference on environmental Humanities titled ‘Narrating the Anthropocene’ brings together scholars from literature, history, ecology, and climate studies.",
    location: "Kakinada",
    detailsLink:
      "/event/narrating-the-anthropocene-interdisciplinary-dialogues-in-environmental-humanities",
    registerLink: "https://gevents.gitam.edu/registration/NDM0Mg..",
  },
  {
    id: 4,
    date: "28th Jul",
    organizer: "Science Dept.",
    title: "National Science Day Expo",
    description:
      "A one-day science expo showcasing innovative projects by students and researchers across disciplines.",
    location: "Visakhapatnam",
    detailsLink: "/event/national-science-day-expo",
    registerLink: "#upcoming-events",
  },
  {
    id: 5,
    date: "2nd Aug",
    organizer: "Dept. of English",
    title: "Creative Writing Workshop",
    description:
      "Interactive workshop for budding writers on storytelling, poetry, and publishing tips.",
    location: "Srikakulam",
    detailsLink: "/event/creative-writing-workshop",
    registerLink: "#upcoming-events",
  },
  {
    id: 6,
    date: "15th Aug",
    organizer: "Student Union",
    title: "Independence Day Celebrations",
    description:
      "Flag hoisting, cultural performances, and guest speakers to commemorate India's independence.",
    location: "Main Grounds",
    detailsLink: "/event/independence-day-celebration",
    registerLink: "#upcoming-events",
  },
];
function UpcomingEvents() {
  const scrollRef = useRef(null);
  const recaptchaRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const form = e.target;
    const newErrors = {};

    const formData = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      location: form.location.value.trim(),
      message: form.message.value.trim(),
      token: recaptchaRef.current?.getValue(),
    };

    if (!/^[A-Za-z\s]{2,50}$/.test(formData.name)) {
      newErrors.name = "Name must be 2-50 alphabets and spaces";
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    if (formData.location.length < 3) {
      newErrors.location = "Location is required";
    }

    if (!formData.token) {
      newErrors.recaptcha = "Please verify you're not a robot";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      alert("Registration Successful!");
      setShowModal(false);
      form.reset();
      recaptchaRef.current.reset();
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Duplicate events for seamless infinite scroll
  const eventCards = [...events, ...events];

  // Smooth continuous auto-scroll
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    let speed = 0.5; // px per frame
    let frame;

    function step() {
      if (!isHovered) {
        scrollContainer.scrollLeft += speed;
        // If we've scrolled past the first set, reset to start
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        }
      }
      frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isHovered]);

  // Format date as "Day, Month Date" (e.g. "Fri, Jun 14")
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section className="pt-16 px-16 relative" id="upcoming-events">
      <h2 className="text-3xl font-bold text-left text-teal-800 mb-6">
        Upcoming Events
      </h2>
      <div
        ref={scrollRef}
        className="overflow-x-auto flex space-x-6 pb-4 "
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {eventCards.map((event, idx) => (
          <div
            key={idx + "-" + event.id}
            className="w-[330px] h-[235px] bg-cover bg-center px-3 flex flex-col flex-shrink-0"
            style={{ backgroundImage: `url(${aknuEventTheme})` }}
          >
            <div className="flex justify-between items-center mt-4">
              <div className=" text-green-700 rounded-full py-1 text-sm font-semibold">
                {event.date}
              </div>
              <div className="text-gray-600 text-xs">{event.organizer}</div>
            </div>

            {/* Event content - different background colors */}
            <div
              className={`flex-1 px-5 pb-5 flex flex-col ${idx % 3 === 0 ? "bg-green-50" : idx % 3 === 1 ? "bg-blue-50" : "bg-purple-50"}`}
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {event.description}
                </p>
                <div className="flex items-center text-gray-500 text-xs">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {event.location}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedEvent(event);
                  setShowModal(true);
                }}
                className="mt-4 text-green-700 font-medium text-sm flex items-center justify-end hover:text-green-800 transition-colors"
              >
                Register Here
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>

            <div className="flex justify-end items-end mt-auto mb-6">
              {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 overscroll-contain">
                  <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
                    
                    {/* Modal Header */}
                    <div className="bg-teal-700 px-6 sm:px-8 py-4 sm:py-5 flex justify-between items-center shrink-0">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                          Register For Event
                        </h2>
                        <p className="text-teal-100 text-xs sm:text-sm">
                          Register for {selectedEvent?.title}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setErrors({});
                        }}
                        className="p-2 text-teal-100 hover:text-white hover:bg-teal-600 rounded-full transition-colors cursor-pointer"
                        aria-label="Close modal"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="overflow-y-auto p-6 sm:p-8 md:p-10 custom-scrollbar text-left">
                      <form onSubmit={handleRegisterSubmit} noValidate className="space-y-8">
                        
                        {/* Registration Details Section */}
                        <div className="space-y-6">
                          <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3">
                            Registration Details
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                placeholder="Enter your name"
                                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                                  errors.name ? "border-red-500" : "border-gray-300"
                                } transition-all`}
                                autoComplete="off"
                                required
                              />
                              {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                  {errors.name}
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
                                maxLength={10}
                                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                                  errors.phone ? "border-red-500" : "border-gray-300"
                                } transition-all`}
                                autoComplete="off"
                                required
                              />
                              {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">
                                  {errors.phone}
                                </p>
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
                                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                                  errors.location ? "border-red-500" : "border-gray-300"
                                } transition-all`}
                                autoComplete="off"
                                required
                              />
                              {errors.location && (
                                <p className="mt-1 text-sm text-red-600">
                                  {errors.location}
                                </p>
                              )}
                            </div>

                            {/* message */}
                            <div className="md:col-span-2">
                              <label
                                htmlFor="message"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Message (Optional)
                              </label>
                              <textarea
                                id="message"
                                name="message"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                placeholder="Any additional information..."
                              />
                            </div>

                            {/* captcha */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Security Verification <span className="text-red-500">*</span>
                              </label>
                              <ReCAPTCHA
                                sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ"
                                ref={recaptchaRef}
                              />
                              {errors.recaptcha && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.recaptcha}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Form Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowModal(false);
                              setErrors({});
                            }}
                            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-base font-semibold rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full sm:w-auto flex justify-center items-center py-2.5 px-6 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 ${
                              isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl"
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
                                Registering...
                              </>
                            ) : (
                              "Confirm & Register"
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedEvent(event);
                  setShowModal(true);
                }}
                className="text-green-700 font-medium text-sm flex items-center space-x-1"
              >
                <span>Register Here</span>
                <span className="arrowup">↑</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default UpcomingEvents;
