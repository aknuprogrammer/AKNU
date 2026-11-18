import React, { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { BackButton } from "../components/BackButton";
import { FileText, Mail, MessageSquare, X as CloseIcon } from "lucide-react";

// Import PDFs from assets
import grievanceReport from "../assets/womencell/Grievance Redressal Report.pdf";
import policyDocument from "../assets/womencell/Policy Document of Women Cell.pdf";
import programmesOrganized from "../assets/womencell/Programmes Organized by Women Cell from June 2015  to 2026.pdf";
import empowermentReport from "../assets/womencell/Report on Women Empowerment Program.pdf";
import { uma10 } from "../assets";

const WomenCell = () => {
  const recaptchaRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
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
  }, [isModalOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const form = e.target;
    const newErrors = {};

    // Extract fields
    const formData = {
      name: form.name.value.trim(),
      department: form.department.value.trim(),
      rollNo: form.rollNo.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      address: form.address.value.trim(),
      complaintTypes: new FormData(form).getAll("complaintType"),
      otherComplaint: form.otherComplaint.value.trim(),
      incidentDate: form.incidentDate.value,
      incidentTime: form.incidentTime.value,
      incidentPlace: form.incidentPlace.value.trim(),
      involvedPerson: form.involvedPerson.value.trim(),
      involvedDesignation: form.involvedDesignation.value.trim(),
      witnessName: form.witnessName.value.trim(),
      witnessContact: form.witnessContact.value.trim(),
      resolution: form.resolution.value,
      otherResolution: form.otherResolution.value.trim(),
      files: form.supportingFiles.files,
      token: recaptchaRef.current?.getValue(),
    };

    // Validations
    if (!/^[A-Za-z\s]{2,50}$/.test(formData.name)) {
      newErrors.name = "Name must be 2-50 alphabets and spaces";
    }

    if (formData.department.length < 2) {
      newErrors.department = "Department/Course/Designation is required";
    }

    if (formData.rollNo.length < 2) {
      newErrors.rollNo = "Roll No/Employee ID is required";
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (formData.address.length < 5) {
      newErrors.address = "Residential address is required";
    }

    if (formData.complaintTypes.length === 0) {
      newErrors.complaintType = "Select at least one complaint type";
    }

    if (!formData.incidentDate) {
      newErrors.incidentDate = "Incident date is required";
    }

    if (!formData.incidentTime) {
      newErrors.incidentTime = "Incident time is required";
    }

    if (formData.incidentPlace.length < 3) {
      newErrors.incidentPlace = "Place of incident is required";
    }

    if (!formData.token) {
      newErrors.recaptcha = "Please verify you're not a robot";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Prepare FormData for submission
    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "complaintTypes") {
        value.forEach((type) =>
          submissionData.append("complaintTypes", type)
        );
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
        `${import.meta.env.VITE_API_URL}api/women-cell`,
        submissionData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert("Complaint submitted successfully.");
        form.reset();
        recaptchaRef.current.reset();
        setIsModalOpen(false);
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
    <div className="w-full">
      {/* Hero Section */}
      <div className="mx-4 sm:mx-16 mt-6 bg-gradient-to-r from-teal-800 to-teal-900 p-6 text-center rounded-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Women Empowerment, Development and Grievances Cell
        </h1>
        <p className="text-teal-100">
           Your safety and comfort matter to us. Please fill this form to
          report any incidents.
        </p>
      </div>

      <div className="flex flex-col md:flex-row mt-4 sm:mt-6 px-4 sm:px-16">
              <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
                <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
                  <img
                    src={uma10}
                    alt="Uma Maheswari"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
                  Uma Maheswari
                </div>
                <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
                  
                </div>
                <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
                  {/* principal.ucoe@aknu.edu.in */}
                </div>
              </div>
      
              <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
                <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
                  About Women Cell
                </h3>
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
                  <p>
               The Women Empowerment, Development and Grievances Cell of Adikavi Nannaya University is established to promote gender equality, women’s welfare, safety, and empowerment within the university campus. The Cell functions as a supportive and responsive platform for addressing issues related to women students, faculty, and staff members.

The primary objective of the Cell is to create a secure, inclusive, and respectful academic environment that upholds the dignity and rights of women. It undertakes initiatives aimed at enhancing awareness on women’s rights, legal literacy, health, self-confidence, leadership, and social responsibility through seminars, workshops, awareness programmes, counselling sessions, and outreach activities.

The Cell also addresses grievances and complaints related to discrimination, harassment, gender bias, and other issues affecting women on campus. It works in coordination with university authorities and relevant committees to ensure timely redressal of grievances while maintaining confidentiality, fairness, and sensitivity.

Through its activities and support mechanisms, the Women Empowerment, Development and Grievances Cell seeks to foster an atmosphere of mutual respect, safety, empowerment, and equal opportunity for women in academic and professional spaces.
                  </p>
               
                </div>
              </div>
            </div>

      {/* Important Documents & Contact Info */}
      <div className="px-4 sm:px-16 py-8 bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Important Documents */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-teal-100">
            <h2 className="text-2xl font-bold text-teal-800 mb-6 flex items-center">
              <FileText className="mr-2" /> Important Documents
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { name: "Grievance Redressal Report", file: grievanceReport },
                { name: "Policy Document of Women Cell", file: policyDocument },
                { name: "Programmes Organized by Women Cell (2015-2026)", file: programmesOrganized },
                { name: "Report on Women Empowerment Program", file: empowermentReport },
              ].map((doc, idx) => (
                <a
                  key={idx}
                  href={doc.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-teal-50 rounded-lg border border-teal-100 hover:bg-teal-100 transition-colors group"
                >
                  <FileText className="text-teal-700 mr-3 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-teal-900 font-medium">{doc.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Information & Form Button */}
          <div className="flex flex-col justify-between">
            <div className="bg-white p-6 rounded-lg shadow-md border border-teal-100 flex-grow">
              <h3 className="text-xl font-bold text-teal-800 mb-4">For more information</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                If you have any concerns, complaints, or suggestions, please do not hesitate to reach out to us. Your feedback is vital in maintaining a safe and respectful campus.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-2 items-center p-4 rounded-lg mb-6 bg-teal-50/50 border border-teal-100/50">
                <div className="flex flex-col xs:flex-row items-center text-teal-900 font-medium text-sm sm:text-base gap-1 xs:gap-0">
                  <div className="flex items-center">
                    <Mail className="mr-2 text-teal-700 flex-shrink-0" size={18} />
                    <span className="whitespace-nowrap">Contact VC:&nbsp;</span>
                  </div>
                  <a href="mailto:vc@aknu.edu.in" className="text-teal-700 hover:underline break-all">vc@aknu.edu.in</a>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="cursor-pointer flex justify-center items-center py-2.5 px-6 bg-teal-700 text-white font-bold rounded-lg shadow-lg hover:bg-teal-800 transition-all hover:shadow-xl group w-full sm:w-auto"
                >
                  <MessageSquare className="mr-2 flex-shrink-0" size={18} />
                  <span className="whitespace-nowrap">Raise a Grievance</span>
                </button>
              </div>

              <div className="mt-auto">
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
            
            {/* Modal Header */}
            <div className="bg-teal-700 px-6 sm:px-8 py-4 sm:py-5 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Women's Cell Complaint Form
                </h2>
                <p className="text-teal-100 text-xs sm:text-sm">
                  Please fill out the details below accurately
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-teal-100 hover:text-white hover:bg-teal-600 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <CloseIcon size={24} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="overflow-y-auto p-6 sm:p-8 md:p-10 custom-scrollbar">
              <form onSubmit={async (e) => {
                await handleSubmit(e);
                if (Object.keys(errors).length === 0 && !isSubmitting) {
                  // If submission is successful, you might want to close the modal
                  // but keep it open if there are validation errors
                }
              }} noValidate className="space-y-8">
                {/* Personal Information Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(
                          /[^a-zA-Z' ]/g,
                          ""
                        );
                      }}
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department/Course/Designation{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="department"
                      placeholder="E.g. Computer Science, B.Tech"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.department ? "border-red-500" : "border-gray-300"}`}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(
                          /[^a-zA-Z' ]/g,
                          ""
                        );
                      }}
                      required
                    />
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.department}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll No/Employee ID{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="rollNo"
                      placeholder="Your identification number"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.rollNo ? "border-red-500" : "border-gray-300"}`}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      }}
                      required
                    />
                    {errors.rollNo && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.rollNo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-digit mobile number"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      }}
                      maxLength={10}
                      required
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your.email@example.com"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.email ? "border-red-500" : "border-gray-300"}`}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Residential Address{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      rows={2}
                      placeholder="Your complete address"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.address ? "border-red-500" : "border-gray-300"}`}
                      required
                    ></textarea>
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Complaint Details Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3">
                  Complaint Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Complaint (Select all that apply){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  {errors.complaintType && (
                    <p className="mb-2 text-sm text-red-600">
                      {errors.complaintType}
                    </p>
                  )}
                  <div className="space-y-3">
                    {[
                      "Harassment (verbal/physical/sexual)",
                      "Gender Discrimination",
                      "Safety Concern",
                      "Misconduct / Abuse",
                      "Other",
                    ].map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            name="complaintType"
                            value={item}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          />
                        </div>
                        <label className="ml-3 text-sm text-gray-700">
                          {item}
                        </label>
                      </div>
                    ))}
                    <div className="mt-2">
                      <input
                        type="text"
                        name="otherComplaint"
                        placeholder="If other, please specify"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Incident <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="incidentDate"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.incidentDate ? "border-red-500" : "border-gray-300"}`}
                      required
                    />
                    {errors.incidentDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.incidentDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time of Incident <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="incidentTime"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.incidentTime ? "border-red-500" : "border-gray-300"}`}
                      required
                    />
                    {errors.incidentTime && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.incidentTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Place of Incident <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="incidentPlace"
                      placeholder="Location where it happened"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.incidentPlace ? "border-red-500" : "border-gray-300"}`}
                      required
                    />
                    {errors.incidentPlace && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.incidentPlace}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Involved Parties Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3">
                  Involved Parties (if applicable)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Person(s) Involved
                    </label>
                    <input
                      type="text"
                      name="involvedPerson"
                      placeholder="Name(s) of involved person(s)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Their Designation/Course
                    </label>
                    <input
                      type="text"
                      name="involvedDesignation"
                      placeholder="Their position or course details"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Witness Name(s) (if any)
                    </label>
                    <input
                      type="text"
                      name="witnessName"
                      placeholder="Name(s) of witness(es)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Witness Contact (if any)
                    </label>
                    <input
                      type="text"
                      name="witnessContact"
                      placeholder="Contact information of witness(es)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Supporting Documents */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3">
                  Supporting Evidence
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Documents/Evidence (Optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="supportingFiles"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                        >
                          <span>Upload files</span>
                          <input
                            id="supportingFiles"
                            name="supportingFiles"
                            type="file"
                            multiple
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Preferences */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3">
                  Resolution Preferences (Optional)
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How would you like this matter to be addressed?
                  </label>
                  <div className="space-y-3">
                    {[
                      "Just want to report",
                      "Require counselling",
                      "Request formal inquiry",
                      "Other",
                    ].map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            type="radio"
                            name="resolution"
                            value={item}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                          />
                        </div>
                        <label className="ml-3 text-sm text-gray-700">
                          {item}
                        </label>
                      </div>
                    ))}
                    <div className="mt-2">
                      <input
                        type="text"
                        name="otherResolution"
                        placeholder="If other, please specify"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ReCAPTCHA */}
              <div className="mt-6">
                <ReCAPTCHA
                  sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ"
                  ref={recaptchaRef}
                />
                {errors.recaptcha && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.recaptcha}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center py-3 sm:py-4 px-6 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl"}`}
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
                    "Submit Complaint"
                  )}
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}

      {/* Footer Note */}
      {/* <div className="bg-teal-800 text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="container-wide text-center">
          <p className="text-sm">
            All complaints are treated with strict confidentiality. For
            immediate assistance, please contact the Women's Cell directly at
            +91-XXXXXXXXXX.
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default WomenCell;
