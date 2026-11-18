import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config/urls";
import Coordinate from "../../../config/Coordinate";
import { XMarkIcon, DocumentTextIcon, ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useLetterHeadHook } from "../../../Hooks/LetterHeadHook";


const CustomSelect = ({ label, value, onChange, options, error, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative w-full" ref={ref}>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white border rounded-lg text-sm transition-all duration-200 ${
          open ? "border-[#525B88] ring-2 ring-[#525B88]/10" : "border-gray-200 hover:border-gray-300"
        } ${error ? "border-red-500" : ""}`}
      >
        <span className={`truncate ${!selected ? "text-gray-400" : "text-gray-900"}`}>
          {selected?.label || placeholder || "Select..."}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-[100] w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-150 text-left ${
                opt.value === value ? "bg-[#525B88] text-white" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{opt.label}</span>
              {opt.value === value && <CheckIcon className="h-4 w-4 text-white" />}
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

const RequestLetterForm = ({
  selectedCards,
  setSelectedCards,
  setShowRequestModal,
  onRequestSuccess,
}) => {
  const { depts, getUserRequests } = useLetterHeadHook();
  const [formData, setFormData] = useState({
    name: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "",
    department: "",
    campus: "",
    systemIp: "Detecting...",
    date: new Date().toLocaleDateString('en-CA'),
    time: new Date().toLocaleTimeString(),
    facultyId: "",
    letterType: selectedCards.length > 0 ? selectedCards[0].title : "",
    refNo: "",
    reason: "",
    authorization: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const API_URL = `${BASE_URL}/letters`;

  useEffect(() => {
    if (selectedCards.length > 0) {
      setFormData((prev) => ({
        ...prev,
        letterType: selectedCards[0].title,
      }));
    }
  }, [selectedCards]);

  useEffect(() => {
    // Location validation - Optimized to be non-blocking
    const checkLocation = async () => {
      if ("geolocation" in navigator) {
        const options = { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 };
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const campusLat = Coordinate.baseLat;
            const campusLng = Coordinate.baseLng;
            const radius = Coordinate.range;

            function getDistance(lat1, lon1, lat2, lon2) {
              const R = 6371000;
              const dLat = ((lat2 - lat1) * Math.PI) / 180;
              const dLon = ((lon2 - lon1) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((lat1 * Math.PI) / 180) *
                  Math.cos((lat2 * Math.PI) / 180) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
              return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            }

            const distance = getDistance(latitude, longitude, campusLat, campusLng);
            setLocationAllowed(distance <= radius);
          },
          (err) => {
            console.warn("Location permission denied or timeout:", err.message);
            // Default to allowed for now to not block user, or handle as per policy
            setLocationAllowed(true); 
          },
          options
        );
      } else {
        setLocationAllowed(true);
      }
    };

    // IP Fetch - Optimized with local cache Check
    const fetchIP = async () => {
      try {
        // Use a faster or more reliable IP service if needed
        const response = await axios.get("https://api.ipify.org?format=json", { timeout: 3000 });
        setFormData((prev) => ({ ...prev, systemIp: response.data.ip || "Unknown" }));
      } catch {
        // Fallback to empty string so the backend 'req.ip' takes over
        setFormData((prev) => ({ ...prev, systemIp: "" }));
      }
    };

    checkLocation();
    fetchIP();
  }, []);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.department.trim()) newErrors.department = "Department is required";
    if (!formData.campus) newErrors.campus = "Campus is required";
    if (!formData.facultyId.trim()) newErrors.facultyId = "Faculty ID is required";
    if (!formData.reason.trim()) newErrors.reason = "Reason is required";
    if (!formData.authorization) newErrors.authorization = "Authorization required";
    return newErrors;
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      // Generate unique Ref No: AKNU-{Campus}-{Dept}-FC11B5CD7012
      const selectedDept = depts.find(d => d._id === formData.department);
      const deptCode = selectedDept?.shortCode?.toUpperCase() || "DEPT";
      const campusCode = formData.campus?.toUpperCase() || "RJY";
      const uniqueSuffix = Math.random().toString(16).toUpperCase().substring(2, 14);
      const generatedRefNo = `AKNU-${campusCode}-${deptCode}-${uniqueSuffix}`;

      const firstCard = selectedCards[0];
      const isDraftLetter = firstCard?.subject !== undefined || firstCard?.signatureName !== undefined;
      const requestKind = isDraftLetter ? "letter" : "template";

      const requestData = {
        ...formData,
        date: new Date().toLocaleDateString('en-CA'),
        time: new Date().toLocaleTimeString(),
        refNo: generatedRefNo,
        letterIds: selectedCards.map((card) => card._id),
        requestKind,
      };

      await axios.post(`${API_URL}/requests`, requestData);
      setShowRequestModal(false);
      getUserRequests(true); // Refresh requests after submission (FORCE)
      if (onRequestSuccess) onRequestSuccess();
      alert("Letter Request Submitted Successfully!");
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
      <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-6 w-6 text-white" />
            <h2 className="text-lg font-semibold text-white">
              Letterhead Request Form
            </h2>
          </div>
          <button 
            onClick={() => setShowRequestModal(false)} 
            className="text-white/80 hover:text-white transition-colors focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form className="space-y-6" onSubmit={handleSubmitRequest}>

            {/* Signatory Details */}
            <div>
              <h3 className="text-lg font-semibold text-[#525B88] mb-4 border-b pb-2">
                Signatory Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="e.g. Dr. John Doe" 
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${errors.name ? 'border-red-500' : 'border-gray-200'}`} 
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Faculty ID / Roll No <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="facultyId" 
                    value={formData.facultyId} 
                    onChange={handleChange} 
                    placeholder="e.g. AKNU-0012" 
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${errors.facultyId ? 'border-red-500' : 'border-gray-200'}`} 
                  />
                  {errors.facultyId && <p className="mt-1 text-sm text-red-500">{errors.facultyId}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Official Email Address <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="name@nannayauniversity.edu" 
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${errors.email ? 'border-red-500' : 'border-gray-200'}`} 
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Institutional Context */}
            <div>
              <h3 className="text-lg font-semibold text-[#525B88] mb-4 border-b pb-2">
                Institutional Context
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomSelect
                  label="Department"
                  value={formData.department}
                  onChange={(val) => handleSelectChange("department", val)}
                  options={depts}
                  error={errors.department}
                  placeholder="Select Department"
                />
                <CustomSelect
                  label="Designated Campus"
                  value={formData.campus}
                  onChange={(val) => handleSelectChange("campus", val)}
                  options={[
                    { label: "Rajamahendravaram", value: "RJY" },
                    { label: "Kakinada", value: "KKD" },
                    { label: "Tadepalligudem", value: "TPG" },
                  ]}
                  error={errors.campus}
                  placeholder="Select Campus"
                />
              </div>
            </div>

            {/* Purpose & Scope */}
            <div>
              <h3 className="text-lg font-semibold text-[#525B88] mb-4 border-b pb-2">
                Purpose &amp; Scope
              </h3>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Reason for Document Generation <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="reason" 
                  value={formData.reason} 
                  onChange={handleChange} 
                  rows={4} 
                  placeholder="Briefly state why this official letterhead is required..." 
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${errors.reason ? 'border-red-500' : 'border-gray-200'}`} 
                />
                {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason}</p>}
              </div>
            </div>

            {/* Declaration */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-[#525B88] mb-3">
                Institutional Declaration
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                I hereby accept and agree that this letterhead is to be used strictly for official university purposes. Any unauthorized utilization is prohibited.
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    name="authorization" 
                    checked={formData.authorization} 
                    onChange={handleChange} 
                    className="peer appearance-none w-4 h-4 rounded border border-gray-300 checked:bg-[#525B88] checked:border-transparent transition-all cursor-pointer" 
                  />
                  <svg className="absolute left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-sm font-medium text-gray-700 select-none">
                  I declare that all information provided is accurate
                </span>
              </label>
              {errors.authorization && <p className="mt-2 text-sm text-red-500">⚠ Authorization consent required</p>}
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button 
            type="button"
            onClick={() => setShowRequestModal(false)} 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none"
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmitRequest} 
            disabled={submitting} 
            className={`px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2 ${
              submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#525B88] hover:bg-[#3a4166]'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestLetterForm;
