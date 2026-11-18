import React, { useState } from "react";
import { openRazorpay } from "./RazorPayClient";
import ReCAPTCHA from "react-google-recaptcha";

export default function AlumniDonationForm() {
  const closeModal = () => {
    window.history.pushState(
      "",
      document.title,
      window.location.pathname + window.location.search
    );
    window.dispatchEvent(new Event("hashchange"));
  };

  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    amount: "",
    currency: "INR",
    purpose: "",
    paymentMethod: "",
    transactionId: "",
    message: "",
    reg_no: "",
  });

  const [errors, setErrors] = useState({});
  const [recaptchaValue, setRecaptchaValue] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
    if (value) setErrors((prev) => ({ ...prev, recaptcha: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.reg_no.trim())
      newErrors.reg_no = "Registration No is required.";
    if (!formData.donorName.trim()) newErrors.donorName = "Name is required.";
    if (!formData.donorEmail.trim())
      newErrors.donorEmail = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.donorEmail))
      newErrors.donorEmail = "Enter a valid email.";
    if (!formData.donorPhone.trim())
      newErrors.donorPhone = "Phone number is required.";
    else if (!/^\d{10}$/.test(formData.donorPhone))
      newErrors.donorPhone = "Enter a valid 10-digit phone number.";
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      newErrors.amount = "Donation amount must be greater than 0.";
    if (!recaptchaValue)
      newErrors.recaptcha = "Please verify that you are not a robot.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}api/alumni/donate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      await openRazorpay({
        amountPaisa: data.amount,
        currency: data.currency,
        orderId: data.orderId,
        name: formData.donorName,
        email: formData.donorEmail,
        contact: formData.donorPhone,
        onSuccess: async (paymentRes) => {
          alert("Donation Successful!");
          closeModal();
          await fetch(`${import.meta.env.VITE_API_URL}/alumni/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentRes),
          });
        },
        onFailure: (err) => {
          console.error("Payment failed:", err);
          alert("Payment Failed! Please try again.");
        },
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-md overflow-hidden">
      <div className="p-4 bg-teal-800 text-white shadow-md flex-shrink-0 relative">
        <h2 className="text-2xl font-bold">Alumni Donations</h2>
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
        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-6 overflow-auto max-h-[70vh]"
      >
        {/* Registration No */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-600">
            Registration No *
          </label>
          <input
            type="text"
            name="reg_no"
            value={formData.reg_no}
            onChange={handleChange}
            required
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.reg_no && (
            <p className="text-red-500 text-sm mt-1">{errors.reg_no}</p>
          )}
        </div>

        {/* Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-600">
            Name *
          </label>
          <input
            type="text"
            name="donorName"
            value={formData.donorName}
            onChange={handleChange}
            required
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.donorName && (
            <p className="text-red-500 text-sm mt-1">{errors.donorName}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-600">
            Email *
          </label>
          <input
            type="email"
            name="donorEmail"
            value={formData.donorEmail}
            onChange={handleChange}
            required
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.donorEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.donorEmail}</p>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-600">
            Phone *
          </label>
          <input
            type="tel"
            name="donorPhone"
            value={formData.donorPhone}
            onChange={handleChange}
            maxLength={10}
            required
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.donorPhone && (
            <p className="text-red-500 text-sm mt-1">{errors.donorPhone}</p>
          )}
        </div>

        {/* Amount */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-600">
            Amount (INR) *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Message */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-600">
            Message (Optional)
          </label>
          <input
            type="text"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={3}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* reCAPTCHA and Submit Button */}
        <div className="md:col-span-2 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="transform scale-75 origin-left">
              <ReCAPTCHA
                sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ"
                onChange={handleRecaptchaChange}
              />
            </div>
            <button
              type="submit"
              className={`bg-teal-800 text-white py-3 px-6 rounded-md hover:bg-emerald-800 transition w-full sm:w-auto text-center font-semibold flex-shrink-0 cursor-pointer ${
               !recaptchaValue ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              Pay Now
            </button>
          </div>
          {errors.recaptcha && (
            <p className="text-red-500 text-sm mt-1">{errors.recaptcha}</p>
          )}
        </div>
      </form>
    </div>
  );
}
