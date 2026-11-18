import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { BackButton } from "../components/BackButton";
import { useNavigate } from "react-router-dom";

const FeedbackForm = () => {
  const recaptchaRef = useRef();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rating: 0,
    feedback: "",
    contact: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    rating: "",
    feedback: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [showAlert, setShowAlert] = useState(false); // Add a state for showing the alert

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      rating: "",
      feedback: "",
    };

    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    } else if (formData.email.length > 100) {
      newErrors.email = "Email must be less than 100 characters";
      isValid = false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
      isValid = false;
    }

    // Rating validation
    if (formData.rating === 0) {
      newErrors.rating = "Please provide a rating";
      isValid = false;
    }

    // Feedback validation
    if (!formData.feedback.trim()) {
      newErrors.feedback = "Feedback is required";
      isValid = false;
    } else if (formData.feedback.length > 500) {
      newErrors.feedback = "Feedback must be less than 500 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Input restrictions
    if (name === "name" && value.length > 50) return;
    if (name === "email" && value.length > 100) return;
    if (name === "phone" && !/^\d{0,10}$/.test(value)) return;
    if (name === "feedback" && value.length > 500) return;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields first
    if (!validateForm()) {
      return false;
    }

    // Check reCAPTCHA
    const token = recaptchaRef.current?.getValue();
    if (!token) {
      setErrors((prev) => ({
        ...prev,
        form: "Please verify you are human.",
      }));
      alert("Please verify you are human.");
      return false;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}api/feedback-form/submit-feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      const data = await response.json();
      console.log("Feedback submitted successfully:", data);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3500);
      setFormData({
        name: "",
        email: "",
        phone: "",
        rating: 0,
        feedback: "",
        contact: false,
      });
      recaptchaRef.current.reset();
      setErrors({
        name: "",
        email: "",
        phone: "",
        rating: "",
        feedback: "",
        form: "",
      });
      navigate("/");
    } catch (error) {
      alert("Error submitting feedback");
      console.error("Error submitting feedback:", error);
      setErrors((prev) => ({
        ...prev,
        form: "Failed to submit feedback. Please try again later.",
      }));
    }
    return false;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      rating: 0,
      feedback: "",
      contact: false,
    });
    setErrors({
      name: "",
      email: "",
      phone: "",
      rating: "",
      feedback: "",
    });
    setSubmitted(false);
  };

  return (
    <>
      <div className="max-w-md mx-auto py-5">
        <BackButton />
      </div>
      <div className="max-w-md mx-auto p-8 rounded-2xl shadow-lg bg-white relative">
        {/* Success Alert */}
        {showAlert && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-green-100 border border-green-400 text-green-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-out">
            <span className="text-2xl">🎉</span>
            <span className="font-semibold">Thank you for your feedback!</span>
          </div>
        )}

        <div className="flex items-center justify-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-teal-800">
              Share Your Feedback
            </h2>
            <p className="text-gray-600">We'd love to hear your thoughts</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-teal-700 mb-1"
            >
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => {
                // Only allow alphabets and spaces
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                if (value.length > 50) return;
                setFormData((prev) => ({ ...prev, name: value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className={`w-full px-4 py-2 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition`}
              placeholder="Name"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-teal-700 mb-1"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition`}
              placeholder="example@gmail.com"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-teal-700 mb-1"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition`}
              placeholder="10-digit phone number"
              required
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-teal-700 mb-2">
              How would you rate your experience?{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, rating: star });
                    if (errors.rating)
                      setErrors((prev) => ({ ...prev, rating: "" }));
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl focus:outline-none"
                >
                  {star <= (hoverRating || formData.rating) ? (
                    <span className="text-yellow-400">★</span>
                  ) : (
                    <span className="text-gray-300">☆</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="feedback"
              className="block text-sm font-medium text-teal-700 mb-1"
            >
              Your Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              rows="4"
              maxLength={200}
              className={`w-full px-4 py-2 border ${
                errors.feedback ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition`}
              placeholder="What did you like or dislike? (Max 200 characters)"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^A-Za-z\s'-]/g, "");
              }}
              required
            ></textarea>
            <div className="flex justify-between mt-1">
              {errors.feedback && (
                <p className="text-sm text-red-600">{errors.feedback}</p>
              )}
              <span
                className={`text-xs ${
                  formData.feedback.length > 200
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {formData.feedback.length}/200
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="contact"
              name="contact"
              checked={formData.contact}
              onChange={handleChange}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label
              htmlFor="contact"
              className="ml-2 block text-sm text-gray-700"
            >
              I'd like to be contacted about my feedback
            </label>
          </div>
          <ReCAPTCHA
            sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ"
            ref={recaptchaRef}
          />

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-medium rounded-lg shadow-md transition-all transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          >
            Submit Feedback
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Your feedback helps us create a better experience for everyone.
          </p>
        </div>
      </div>
    </>
  );
};

export default FeedbackForm;
