import React, { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { X as CloseIcon } from "lucide-react";

const CDCComplaintModal = ({ isOpen, onClose }) => {
  const recaptchaRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const form = e.target;
    const newErrors = {};

    // Extract fields
    const formData = {
      complainantName: form.complainantName.value.trim(),
      affiliatedCollegeName: form.affiliatedCollegeName.value.trim(),
      collegeName: form.collegeName.value.trim(),
      address: form.address.value.trim(),
      mobileNumber: form.mobileNumber.value.trim(),
      emailId: form.emailId.value.trim(),
      natureOfComplaint: new FormData(form).getAll("natureOfComplaint"),
      otherNature: form.otherNature.value.trim(),
      incidentDate: form.incidentDate.value,
      description: form.description.value.trim(),
      reportedToAuthority: form.reportedToAuthority.value,
      authorityDetails: form.authorityDetails.value.trim(),
      supportingDocuments: new FormData(form).getAll("supportingDocuments"),
      files: form.supportingFiles.files,
      token: recaptchaRef.current?.getValue(),
    };

    // Validations
    if (!formData.complainantName) newErrors.complainantName = "Name is required";
    if (!formData.affiliatedCollegeName) newErrors.affiliatedCollegeName = "Affiliated College Name is required";
    if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = "Mobile Number must be 10 digits";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) newErrors.emailId = "Invalid email address";
    if (formData.natureOfComplaint.length === 0 && !formData.otherNature) newErrors.natureOfComplaint = "Select at least one category or specify other";
    if (!formData.incidentDate) newErrors.incidentDate = "Date of incident is required";
    if (!formData.description) newErrors.description = "Detailed description is required";
    if (!formData.reportedToAuthority) newErrors.reportedToAuthority = "Please specify if reported to authorities";
    if (!form.declaration.checked) newErrors.declaration = "You must accept the declaration to proceed";
    if (!formData.token) newErrors.recaptcha = "Please verify you're not a robot";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "natureOfComplaint") {
        value.forEach((val) => submissionData.append("natureOfComplaint", val));
      } else if (key === "supportingDocuments") {
        value.forEach((val) => submissionData.append("supportingDocuments", val));
      } else if (key === "files") {
        for (let i = 0; i < value.length; i++) {
          submissionData.append("supportingFiles", value[i]);
        }
      } else if (key !== "token") {
        submissionData.append(key, value);
      }
    });

    try {
      const axios = (await import("axios")).default;
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/cdc-complaint`,
        submissionData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert("Complaint submitted successfully.");
        form.reset();
        recaptchaRef.current.reset();
        onClose();
      } else {
        alert("Submission failed: " + (res.data.message || "Please try again"));
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server error. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Modal Header */}
        <div className="bg-teal-700 px-6 sm:px-8 py-4 sm:py-5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Complaint Form (Affiliated Colleges)
            </h2>
            <p className="text-teal-100 text-xs sm:text-sm">
              Adikavi Nannaya University College Development Cell
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-teal-100 hover:text-white hover:bg-teal-600 rounded-full transition-colors"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-8 md:p-10 custom-scrollbar">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            
            {/* 1. Details of the Complainant */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3">
                1. Details of the Complainant
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" name="complainantName" className="w-full px-4 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-teal-500" required />
                  {errors.complainantName && <p className="text-red-500 text-xs mt-1">{errors.complainantName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name of the Affiliated College *</label>
                  <input type="text" name="affiliatedCollegeName" className="w-full px-4 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-teal-500" required />
                  {errors.affiliatedCollegeName && <p className="text-red-500 text-xs mt-1">{errors.affiliatedCollegeName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                  <input type="text" name="collegeName" className="w-full px-4 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea name="address" rows={2} className="w-full px-4 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-teal-500"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input type="tel" name="mobileNumber" maxLength={10} className="w-full px-4 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-teal-500" required />
                  {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail ID *</label>
                  <input type="email" name="emailId" className="w-full px-4 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-teal-500" required />
                  {errors.emailId && <p className="text-red-500 text-xs mt-1">{errors.emailId}</p>}
                </div>
              </div>
            </div>

            {/* 2. Nature of Complaint */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3">
                2. Nature of Complaint (Please tick the appropriate category)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Academic Issues", "Examination Issues", "Fee Related Issues",
                  "Infrastructure Deficiency", "Faculty Related Issues", "Attendance Issues",
                  "Harassment / Misconduct", "Scholarship Issues", "Affiliation Norm Violations",
                  "Administrative Delay"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    <input type="checkbox" name="natureOfComplaint" value={item} className="h-4 w-4 text-teal-600 rounded border-gray-300" />
                    <label className="ml-2 text-sm text-gray-700">{item}</label>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other:</label>
                <input type="text" name="otherNature" className="w-full px-4 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-teal-500" />
                {errors.natureOfComplaint && <p className="text-red-500 text-xs mt-1">{errors.natureOfComplaint}</p>}
              </div>
            </div>

            {/* 3. Details of the Complaint */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3">
                3. Details of the Complaint
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date(s) of Incident *</label>
                  <input type="date" name="incidentDate" className="w-full px-4 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-teal-500" required />
                  {errors.incidentDate && <p className="text-red-500 text-xs mt-1">{errors.incidentDate}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description of Complaint *</label>
                <textarea name="description" rows={4} className="w-full px-4 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-teal-500" required></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* 4. Action Already Taken */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3">
                4. Action Already Taken
              </h3>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Have you reported the matter to the College Authorities? *</p>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input type="radio" name="reportedToAuthority" value="Yes" className="text-teal-600" />
                    <span className="ml-2">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="reportedToAuthority" value="No" className="text-teal-600" />
                    <span className="ml-2">No</span>
                  </label>
                </div>
                {errors.reportedToAuthority && <p className="text-red-500 text-xs mt-1">{errors.reportedToAuthority}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">If yes, specify the authority approached and response received:</label>
                <textarea name="authorityDetails" rows={2} className="w-full px-4 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-teal-500"></textarea>
              </div>
            </div>

            {/* 5. Supporting Documents Enclosed */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3">
                5. Supporting Documents Enclosed
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Copies of Certificates/Documents", "Fee Receipts", "Photographs",
                  "Screenshots/Correspondence", "Any Other Evidence"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    <input type="checkbox" name="supportingDocuments" value={item} className="h-4 w-4 text-teal-600 rounded border-gray-300" />
                    <label className="ml-2 text-sm text-gray-700">{item}</label>
                  </div>
                ))}
              </div>
              <div className="flex flex-col md:flex-row gap-35 items-center ">
                <div className="">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Files (Max 10MB)</label>
                  <input type="file" name="supportingFiles" multiple className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                </div>
                {/* <div className="shrink-0 flex flex-col items-center md:items-end"> */}
                <div>
                    <ReCAPTCHA 
                    key={isOpen ? "open" : "closed"}
                    sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ" 
                    ref={recaptchaRef} 
                    size="normal"
                  />
                  {errors.recaptcha && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.recaptcha}</p>}
                </div>
                {/* </div> */}
              </div>
            </div>

            {/* 6. Declaration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-teal-800  tracking-wider">
                Declaration
              </h3>
              <div className="flex items-start">
                <input 
                  type="checkbox" 
                  name="declaration" 
                  id="declaration" 
                  className="mt-1 h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer" 
                  required 
                />
                <label htmlFor="declaration" className="ml-3 text-sm text-gray-700 leading-relaxed select-none cursor-pointer">
                  I hereby declare that the information furnished above is true and correct to the best of my knowledge and belief. I understand that appropriate action will be taken only after verification of facts and supporting records.
                </label>
              </div>
              {errors.declaration && <p className="text-red-500 text-xs font-bold mt-2">{errors.declaration}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-teal-700 text-white font-bold rounded-lg shadow-lg hover:bg-teal-800 disabled:opacity-50 transition-all">
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CDCComplaintModal;
