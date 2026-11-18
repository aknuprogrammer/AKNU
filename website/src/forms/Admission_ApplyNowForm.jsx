import { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function Admission_ApplyNowForm() {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCode: "+91",
    phone: "",
    fatherName: "",
    aadhaar: "",
    gender: "Male",
    dob: "",
    qualification: "",
    preferredCourse: "",
    preferredCampus: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  // ✅ Open modal if hash is present
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#admissions/how-to-apply") {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    };

    checkHash(); // run on mount
    window.addEventListener("hashchange", checkHash);

    return () => {
      window.removeEventListener("hashchange", checkHash);
    };
  }, []);

  useEffect(() => {
    if (showModal) {
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
  }, [showModal]);

  const handleModalClose = () => {
    setShowModal(false);
    setFormErrors({});
    // ✅ Clear the hash without reloading
    window.history.pushState("", document.title, window.location.pathname + window.location.search);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "phone") val = val.replace(/[^0-9]/g, "").slice(0, 10);
    if (name === "aadhaar") val = val.replace(/[^0-9]/g, "").slice(0, 12);
    setFormData({ ...formData, [name]: val });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}api/admission-form/create-new-admission`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error("Form submission failed.");
        }

        const result = await response.json();

        // Success feedback (you can add toast here)
        alert("Form submitted successfully!");

        // Reset form
        setFormData({
          fullName: "",
          email: "",
          countryCode: "+91",
          phone: "",
          fatherName: "",
          aadhaar: "",
          gender: "Male",
          dob: "",
          qualification: "",
          preferredCourse: "",
          preferredCampus: "",
          message: "",
        });

        // Optionally close modal if you have one
        setShowModal(false);
      } catch (error) {
        console.error("Error submitting form:", error.message);
        alert("Something went wrong! Please try again.");
      } finally {
        // Stop loading
        setIsSubmitting(false);
      }
    }
  };
  return <>
    {showModal && (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm bg-black/30 w-[100vw] h-[100vh] overflow-hidden"
        aria-modal="true"
      >
        <div className="bg-white rounded-2xl shadow-xl w-full overflow-x-hidden overflow-y-auto relative max-h-[90vh] max-w-[92vw] sm:max-w-[90vw] lg:max-w-4xl ">
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 z-[10000] text-gray-600 hover:text-gray-900 text-3xl transition-colors bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg"
            onClick={handleModalClose}
            aria-label="Close modal"
          >
            &times;
          </button>

          {/* Header */}
          <div className="bg-teal-700 p-6 text-white">
            <h2 className="text-3xl font-bold tracking-tight">
              Application Form
            </h2>
            <p className="text-[#c2e5e1] mt-1">
              Complete your application in just a few steps
            </p>
          </div>

          {/* Form Container */}
          <div className="px-4 sm:px-8 py-4 max-w-[100%] ">
            <div className="md:grid md:grid-cols-2 gap-3 max-w-[100%] p-1 ">
              {/* Left Column */}
              <div className="space-y-2 w-[100%] ">
                <div className="space-y-1 w-[100%]">
                  <input
                    type="text"
                    name="fullName"
                    onChange={handleInputChange}
                    value={formData.fullName}
                    placeholder={formErrors.fullName || "Your FullName"}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^a-zA-Z' ]/g,
                        ""
                      );
                    }}
                    className={`w-full px-4 py-2 max-w-[100%] border ${formErrors.fullName ? "border-red-500" : "border-gray-200"} rounded-lg transition-all`}
                  />
                </div>

                <div className="space-y-1">
                  <input
                    type="email"
                    name="email"
                    onChange={handleInputChange}
                    value={formData.email}
                    placeholder={formErrors.email || "your.email@example.com"}
                    className={`w-full px-4 py-2 border ${formErrors.email ? "border-red-500" : "border-gray-200"} rounded-lg transition-all`}
                  />
                </div>

                <div className="space-y-1 max-w-[100%]">
                  <div className="flex gap-3 max-w-[100%] overflow-x-hidden px-1">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      className="w-20 px-2 py-2 border border-gray-200 rounded-lg flex-0"
                    >
                      <option>+91</option>
                      <option>+1</option>
                    </select>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={formErrors.phone || "1234567890"}
                      maxLength={10}
                      className={`px-4 py-2 max-w-[100%] w-[100%] border ${formErrors.phone ? "border-red-500" : "border-gray-200"} rounded-lg transition-all`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    placeholder={
                      formErrors.fatherName || "Father's Full Name"
                    }
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^a-zA-Z' ]/g,
                        ""
                      );
                    }}
                    className={`w-full px-4 py-2 border ${formErrors.fatherName ? "border-red-500" : "border-gray-200"} rounded-lg transition-all`}
                  />
                </div>

                <div className="space-y-1">
                  <input
                    name="aadhaar"
                    type="text"
                    value={formData.aadhaar}
                    onChange={(e) => {
                      let value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 12);
                      setFormData({ ...formData, aadhaar: value });
                    }}
                    placeholder={
                      formErrors.aadhaar || "Enter 12-digit Aadhaar"
                    }
                    className={`w-full px-4 py-2 border ${formErrors.aadhaar ? "border-red-500" : "border-gray-200"} rounded-lg transition-all`}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <div className="space-y-2">
                  <div className="space-y-1 mb-7">
                    <div className="flex gap-6  items-center">
                      <label className="flex items-center gap-2 ">
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={formData.gender === "Male"}
                          onChange={handleInputChange}
                          className="accent-teal-700"
                        />
                        <span>Male</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={formData.gender === "Female"}
                          onChange={handleInputChange}
                          className="accent-teal-700"
                        />
                        <span>Female</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${formErrors.dob ? "border-red-500" : "border-gray-200"} rounded-lg transition-all`}
                  />
                </div>

                <div className="space-y-1">
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${formErrors.qualification ? "border-red-500" : "border-gray-200"} rounded-lg`}
                  >
                    <option value="">
                      {formErrors.qualification || "Select Qualification"}
                    </option>
                    <option>10th Standard</option>
                    <option>12th Standard</option>
                    <option>Diploma</option>
                    <option>Graduate</option>
                    <option>Post Graduate</option>
                    <option>Others</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    name="preferredCourse"
                    value={formData.preferredCourse}
                    onChange={handleInputChange}
                    placeholder={
                      formErrors.preferredCourse || "Preferred Course"
                    }
                    className={`w-full px-4 py-2 border ${formErrors.preferredCourse ? "border-red-500" : "border-gray-200"} rounded-lg`}
                  />
                </div>

                <div className="space-y-1">
                  <select
                    name="preferredCampus"
                    value={formData.preferredCampus}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border ${formErrors.preferredCampus ? "border-red-500" : "border-gray-200"} rounded-lg`}
                  >
                    <option value="">
                      {formErrors.preferredCampus || "Preferred Campus"}
                    </option>
                    <option>Rajamahendravaram</option>
                    <option>Tadepalligudem</option>
                    <option>Kakinada</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Message Field */}
            <div className="mt-5 space-y-1">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder={formErrors.message || "Your message here..."}
                maxLength={200}
                className={`w-full px-4 py-2 border ${formErrors.message ? "border-red-500" : "border-gray-200"} rounded-lg transition-all min-h-[100px]`}
              />
              <p className="text-xs text-gray-500 text-right">
                {formData.message.length}/200 characters
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start justify-between mt-4">
              <div className="!scale-[0.85] sm:!scale-90 origin-center sm:origin-left flex-shrink-0">
                <ReCAPTCHA sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ" />
              </div>
              <div className="w-full sm:w-auto text-center sm:text-right mt-2 sm:mt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-teal-700 hover:bg-[#005a50] text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02] w-[260px] sm:w-auto"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
}