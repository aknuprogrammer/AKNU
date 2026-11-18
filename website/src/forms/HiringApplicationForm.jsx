import { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  User,
  Mail,
  Phone,
  FileText,
  Send,
  Upload,
  CheckCircle,
  AlertCircle,
  Briefcase,
} from "lucide-react";

export default function HiringApplicationForm({
  job: initialJob,
  onClose,
  isEmbedded = false,
  isOpen = false,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [job, setJob] = useState(initialJob);
  const [showModal, setShowModal] = useState(!!initialJob || isOpen);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    candidateName: "",
    email: "",
    phone: "",
    coverLetter: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Update showModal when isOpen prop changes (when parent controls visibility)
  useEffect(() => {
    if (isOpen !== undefined) {
      setShowModal(isOpen);
    }
  }, [isOpen]);

  // ✅ Auto-manage visibility and fetching if not embedded and not controlled by parent
  useEffect(() => {
    if (isEmbedded || isOpen !== undefined) return;

    const checkHash = async () => {
      const hash = window.location.hash;
      if (hash.startsWith("#jobs/apply/")) {
        const id = hash.split("/").pop();
        setShowModal(true);
        if (!job || job._id !== id) {
          await fetchJobForModal(id);
        }
      } else {
        setShowModal(false);
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [isEmbedded, isOpen]);

  const fetchJobForModal = async (id) => {
    setLoading(true);
    try {
      const BACKEND_DOMAIN = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${BACKEND_DOMAIN}api/hiring/${id}`);
      if (response.data.success) {
        setJob(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching job for modal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    if (onClose) onClose();
    setShowModal(false);
    // ✅ Clear the hash without reloading if via hash
    if (window.location.hash.includes("#jobs/apply/")) {
      window.history.pushState(
        "",
        document.title,
        window.location.pathname + window.location.search
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "phone") val = val.replace(/[^0-9]/g, "").slice(0, 10);
    setFormData({ ...formData, [name]: val });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Resume file size should be less than 5MB");
        return;
      }
      setResumeFile(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.candidateName.trim())
      errors.candidateName = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errors.email = "Invalid email format";
    if (!formData.phone.trim()) errors.phone = "Phone is required";
    else if (formData.phone.length !== 10)
      errors.phone = "Phone must be 10 digits";
    if (!resumeFile) errors.resume = "Resume is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!job) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const BACKEND_DOMAIN = import.meta.env.VITE_API_URL;
      const submitData = new FormData();
      submitData.append("notificationId", job._id);
      submitData.append("candidateName", formData.candidateName);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("coverLetter", formData.coverLetter);
      submitData.append("resume", resumeFile);

      const response = await axios.post(
        `${BACKEND_DOMAIN}api/hiring/applications`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("Application submitted successfully!");
        handleModalClose();
        // Reset form
        setFormData({
          candidateName: "",
          email: "",
          phone: "",
          coverLetter: "",
        });
        setResumeFile(null);
      } else {
        alert(response.data.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert(
        error.response?.data?.error || "Something went wrong! Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormContent = (
    <div
      className={`bg-white rounded-lg overflow-hidden relative z-[9999] shadow-lg border border-gray-200 ${!isEmbedded ? "w-full max-w-2xl" : ""}`}
    >
      {/* Header */}
      <div className="bg-teal-700 p-6 text-white relative border-b border-teal-800">
        {!isEmbedded && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-lg">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Apply for Position
            </h2>
            <p className="text-teal-100 text-sm font-medium mt-1">
              Submit your application
            </p>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <form
        onSubmit={handleSubmit}
        className={`p-6 space-y-5 ${!isEmbedded ? "max-h-[75vh] overflow-y-auto" : ""}`}
      >
        <div className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-700" /> Full Name
            </label>
            <input
              type="text"
              name="candidateName"
              value={formData.candidateName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
                formErrors.candidateName
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              }`}
            />
            {formErrors.candidateName && (
              <p className="text-xs text-red-600 ml-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> {formErrors.candidateName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-700" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
                  formErrors.email
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                }`}
              />
              {formErrors.email && (
                <p className="text-xs text-red-600 ml-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" /> {formErrors.email}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-700" /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit mobile"
                maxLength={10}
                className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
                  formErrors.phone
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                }`}
              />
              {formErrors.phone && (
                <p className="text-xs text-red-600 ml-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" /> {formErrors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-700" /> Upload Resume
            </label>
            <div className="relative group">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className={`w-full px-4 py-3 border-2 border-dashed rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                  resumeFile
                    ? "border-teal-300 bg-teal-50 text-teal-800"
                    : formErrors.resume
                      ? "border-red-300 bg-red-50 text-red-600"
                      : "border-gray-300 hover:border-teal-500 hover:bg-teal-50 text-gray-600"
                }`}
              >
                <span className="truncate max-w-[250px] text-sm font-medium">
                  {resumeFile ? resumeFile.name : "Select PDF/Doc (Max 5MB)"}
                </span>
                {resumeFile ? (
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </label>
            </div>
            {formErrors.resume && (
              <p className="text-xs text-red-600 ml-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> {formErrors.resume}
              </p>
            )}
          </div>
        </div>

        {/* Cover Letter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-700" /> Brief Introduction
          </label>
          <textarea
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleInputChange}
            rows={4}
            placeholder="Tell us a bit about why you're a good fit..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          {!isEmbedded && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-2.5 px-6 bg-[#21605A] text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                Send Application
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  if (isEmbedded) {
    return FormContent;
  }

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      {FormContent}
    </div>
  );
}
