import React, { useState } from "react";
import { Calendar, Users, Globe, FileText } from "lucide-react";
import HashModal from "../../components/HashModal";
import ReCAPTCHA from "react-google-recaptcha";

const VolunteerSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "Event Organization",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recaptchaValue, setRecaptchaValue] = useState(null);

  const items = [
    {
      icon: <Calendar className="w-5 h-5 text-white" />,
      title: "Event Organization",
      desc: "Help plan and organize centenary events",
    },
    {
      icon: <Users className="w-5 h-5 text-white" />,
      title: "Mentorship",
      desc: "Mentor current students during events",
    },
    {
      icon: <Globe className="w-5 h-5 text-white" />,
      title: "Outreach",
      desc: "Help connect with alumni worldwide",
    },
    {
      icon: <FileText className="w-5 h-5 text-white" />,
      title: "Content Creation",
      desc: "Help document and create centenary content",
    },
  ];

  const closeModal = () => {
    window.history.pushState(
      "",
      document.title,
      window.location.pathname + window.location.search
    );
    window.dispatchEvent(new Event("hashchange"));
    setFormData({
      name: "",
      email: "",
      phone: "",
      interest: "Event Organization",
      message: "",
    });
    setError("");
    setSuccess("");
    setRecaptchaValue(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
    if (value) setError("");
  };

  const validateForm = () => {
    const { name, email, phone } = formData;

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill all required fields.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return false;
    }

    if (!recaptchaValue) {
      setError("Please verify that you are not a robot.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}api/alumni-form/volunteers/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, recaptcha: recaptchaValue }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Submission failed");

      setSuccess("Thank you for volunteering! 🎉");
      setFormData({
        name: "",
        email: "",
        phone: "",
        interest: "Event Organization",
        message: "",
      });
      setRecaptchaValue(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-16"
      id="volunteer"
    >
      <div className="mx-auto bg-white rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row">
        {/* Left Image */}
        <div className="md:w-1/2">
          <img
            src="https://media.licdn.com/dms/image/v2/D5612AQH34j1DoDsvSg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1702059465365?e=2147483647&v=beta&t=xn_zpm1Jd8O8qqxYVu45i341EcckvSs4II8NiEqGOzE"
            alt="Volunteer Students"
            className="w-full object-cover h-[100%]"
          />
        </div>

        {/* Right Content */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-teal-800 sm:text-3xl">
            Volunteer Your Time
          </h2>
          <p className="text-gray-600 mb-6 text-[16px] text-justify">
            Be an active part of the centenary celebrations by volunteering your
            time and expertise. We need alumni from all generations to help
            organize and execute various centenary events.
          </p>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10  bg-[#00786F] aspect-square text-white">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-teal-900">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Button */}
          <a
            href="#volunteer/register"
            className="bg-[#00786F] text-white font-semibold px-7 py-3 shadow-lg hover:bg-teal-900 transition-all duration-300 inline-block text-center hover:shadow-xl transform hover:-translate-y-1"
          >
            VOLUNTEER NOW
          </a>
        </div>
      </div>

      {/* Modal Form */}
      <HashModal hash="#volunteer/register">
        <div className="max-w-lg w-full mx-auto bg-white shadow-md rounded-md overflow-hidden relative">
          {/* Header */}
          <div className="p-4 bg-teal-800 text-white flex justify-between items-center">
            <h2 className="text-xl font-bold">Volunteer Registration</h2>
            <button
              onClick={closeModal}
              className="text-white hover:text-gray-300 transition"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 p-6 relative"
          >
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />

            <select
              name="interest"
              value={formData.interest}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option>Event Organization</option>
              <option>Mentorship</option>
              <option>Outreach</option>
              <option>Content Creation</option>
            </select>

            <textarea
              name="message"
              placeholder="Additional Message (optional)"
              rows="3"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            ></textarea>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            {/* reCAPTCHA and Submit Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
              <div className="transform scale-75 origin-left">
                <ReCAPTCHA
                  sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ"
                  onChange={handleRecaptchaChange}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !recaptchaValue}
                className={`bg-teal-800 text-white py-3 px-6 rounded-md hover:bg-emerald-800 transition w-full sm:w-auto text-center font-semibold flex-shrink-0 cursor-pointer ${
                  loading || !recaptchaValue
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </HashModal>
    </div>
  );
};

export default VolunteerSection;
