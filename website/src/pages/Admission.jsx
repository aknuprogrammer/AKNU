import React, { useEffect, useState } from "react";
import Modal from "react-modal";

// Accessibility requirement
Modal.setAppElement("#root");
import {
  Building2,
  Settings,
  Users,
  Gavel,
  Briefcase,
  HeartPulse,
  Pill,
  ActivitySquare,
  Stethoscope,
  Syringe,
  Landmark,
  Atom,
  BriefcaseBusiness,
  BarChart2,
  BookText,
  Scale,
  HelpingHand,
  PenLine,
  Microscope,
  Fish,
  FlaskConical,
  Dna,
  Leaf,
  Globe,
  Rabbit,
  Cpu,
  Radio,
  Library,
  GraduationCap,
  Dumbbell,
  Cog,
  ChevronRight,
  FileText,
} from "lucide-react";
import {
  Trophy,
  Castle,
  Award,
  School,
  Star,
  BookOpen,
  Feather,
  ClipboardList,
  X,
  Download,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Admission component handles the display and submission of an admission form.
 * It manages form inputs, validation, and submission logic.
 * Displays a modal form when the 'Apply Now' button is clicked.
 * Utilizes useLocation to check query parameters for initial modal display.
 * Handles form validation for various fields like fullName, email, phone, etc.
 * Submits the form data to a specified API endpoint and provides feedback on submission.
 * Displays a list of disciplines and application categories with respective icons.
 */

/*******  0bc55c6a-cee1-479c-ae45-771fdc734304  *******/
export default function Admission() {
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("register") === "true") {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [location]);

  const disciplines = [
    {
      name: "Commerce & Management Studies",
      icon: <BriefcaseBusiness size={30} className="text-teal-700" />,
    },
    {
      name: "Economics",
      icon: <BarChart2 size={30} className="text-teal-700" />,
    },
    {
      name: "English",
      icon: <BookText size={30} className="text-teal-700" />,
    },
    {
      name: "Law",
      icon: <Gavel size={30} className="text-teal-700" />,
    },
    {
      name: "Political Science",
      icon: <Scale size={30} className="text-teal-700" />,
    },
    {
      name: "Social Work",
      icon: <HelpingHand size={30} className="text-teal-700" />,
    },
    {
      name: "Pharmacy",
      icon: <Microscope size={30} className="text-teal-700" />,
    },
    {
      name: "Telugu",
      icon: <PenLine size={30} className="text-teal-700" />,
    },

    {
      name: "Aquaculture",
      icon: <Fish size={30} className="text-teal-700" />, // better than stethoscope
    },
    {
      name: "Biochemistry",
      icon: <FlaskConical size={30} className="text-teal-700" />,
    },
    {
      name: "Biotechnology",
      icon: <Dna size={30} className="text-teal-700" />,
    },
    {
      name: "Botany",
      icon: <Leaf size={30} className="text-teal-700" />,
    },
    {
      name: "Geo Sciences",
      icon: <Globe size={30} className="text-teal-700" />,
    },
    {
      name: "Zoology",
      icon: <Rabbit size={30} className="text-teal-700" />, // symbolic animal icon
    },
    {
      name: "Computer Science and Engineering",
      icon: <Cpu size={30} className="text-teal-700" />,
    },
    {
      name: "Civil Engineering",
      icon: <Building2 size={30} className="text-teal-700" />,
    },
    {
      name: "Electronics and Communication",
      icon: <Radio size={30} className="text-teal-700" />,
    },
    {
      name: "Mechanical Engineering",
      icon: <Cog size={30} className="text-teal-700" />,
    },
    {
      name: "Science and Humanities",
      icon: <Library size={30} className="text-teal-700" />,
    },
    {
      name: "Education",
      icon: <GraduationCap size={30} className="text-teal-700" />,
    },
    {
      name: "Physical Education",
      icon: <Dumbbell size={30} className="text-teal-700" />,
    },
  ];
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
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email))
      errors.email = "Valid email is required";
    if (!formData.phone || formData.phone.length !== 10)
      errors.phone = "10-digit phone number required";
    if (!formData.aadhaar || formData.aadhaar.replace(/\s/g, "").length !== 12)
      errors.aadhaar = "12-digit Aadhaar required";

    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.dob) errors.dob = "Date of birth is required";
    if (!formData.qualification)
      errors.qualification = "Qualification is required";
    if (!formData.preferredCourse.trim())
      errors.preferredCourse = "Preferred course is required";
    if (!formData.preferredCampus)
      errors.preferredCampus = "Preferred campus is required";
    if (!formData.message.trim()) errors.message = "Message is required";
    return errors;
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

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    // Clean up on unmount
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showModal]);

  const handleModalClose = () => {
    setShowModal(false);
    setFormErrors({});
    // Remove the query parameter from URL without reloading
    const url = new URL(window.location);
    url.searchParams.delete("register");
    window.history.pushState({}, "", url);
  };

  const [activeTab, setActiveTab] = useState("Discipline");
  const themeColor = "#007367";
  const accentColor = "#00a896";
  const lightColor = "#f0f7f4";
  const cardHoverColor = "#e0f2f1";
  const categories = [
    {
      name: "Autonomous-Application",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/Autonomous-Application.pdf",
    },
    {
      name: "Autonomous-Guidelines",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/Autonomous-Guidelines.pdf",
    },
    {
      name: "Autonomous-Inspection-report",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/Autonomous-Inspection%20Report.pdf",
    },
    {
      name: "CPE-Guidelines,Application & InspectionReport",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/CPE-Guidelines%20Application%20and%20InspectionReport.pdf",
    },
    {
      name: "Application",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/Application.pdf",
    },
    {
      name: "Guidelines",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/Guidelines.pdf",
    },
    {
      name: "Inspection report",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/Inspection%20report.pdf",
    },
    {
      name: "Application for Change of name of the college-UG",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/Application%20for%20Change%20of%20name%20of%20the%20college-UG.pdf",
    },
    {
      name: "Application_shifting_Change of Management-UG",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/College%20Name%20Change%20and%20Shifting%20Proforma%20-17March2020.pdf",
    },
    {
      name: "Application_shifting_Change of Management-UG",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/Shifting%20and%20Change%20of%20Mag%20-18March2020.pdf",
    },
    {
      name: "Report- Management Change, Shifting, Name of the college-UG",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/Report-%20Management%20Change,%20Shifting,%20Name%20of%20%20the%20college-UG.pdf",
    },
    {
      name: "Guidelines-Management Change, Shifting, Name of the college-UG",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/Guidelines-Management%20Change,%20Shifting,%20Name%20of%20%20the%20college-UG.pdf",
    },
    {
      name: "Permanent Affiliation - Application",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/per%20Application.pdf",
    },
    {
      name: "Permanent Affiliation - Inspection report",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/per%20Gidelines.pdf",
    },
    {
      name: "Permanent Affiliation - Application",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/per%20Inspection%20report.pdf",
    },
    {
      name: "UGC 12(b) & 2(f) Guidelines",
      link: "https://www.aknu.edu.in/CDC/links/cdc/APPLICATIONS/Ap%20Educational%20Guidlines%20act%20-18March2020.pdf",
    },
  ];
  return (
    <div className="p-10 md:p-12 lg:p-16 bg-[#f4f7f6]  text-[#333] max-w-[100vw]">
      <div className="flex flex-wrap justify-between align-center max-w-[100vw]">
        <div>
          {/* <h1 className="text-left text-teal-700 text-3xl md:text-3xl font-semibold mb-10 relative inline-block">
            Discipline
            <span className="absolute bottom-0 left-0 w-[60px] h-[3px] bg-[#388E3C] translate-y-[5px]"></span>
          </h1>
          <h1 className="text-left text-teal-700 text-3xl md:text-3xl font-semibold mb-10 relative inline-block ml-6">
            Applications/Guidelines
            <span className="absolute bottom-0 left-0 w-[60px] h-[3px] bg-[#388E3C] translate-y-[5px]"></span>
          </h1> */}
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-4">
            {["Discipline", "Applications/Guidelines"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative text-2xl md:text-3xl font-semibold pb-2 px-3 transition-colors duration-300 
                  ${activeTab === tab ? "text-teal-700 text-2xl md:text-3xl font-semibold" : "text-gray-400 hover:text-[#004d40]"}
                `}
                style={{ outline: "none" }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-3 w-[60px] h-[3px] bg-[#388E3C] translate-y-[5px]"></span>
                )}
              </button>
            ))}
          </div>
        </div>
        {/* <button
          onClick={() => setShowModal(true)}
          className="bg-[#007364] text-white w-30 h-12 font-semibold text-lg shadow-md hover:bg-[#005f53] transition-colors duration-200 whitespace-nowrap"
        >
          Apply Now
        </button> */}
      </div>
      <br />
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm bg-black/30 w-screen h-screen overflow-hidden"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[92vw] sm:w-[60vw] sm:max-w-[90vw] lg:max-w-5xl xl:max-w-6xl overflow-hidden relative max-h-[98vh] flex flex-col gap-3">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 z-[10000] text-gray-600 hover:text-gray-900 transition-colors bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:shadow-lg"
              onClick={handleModalClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="bg-teal-700 p-2 sm:p-3 text-white flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Application Form
              </h2>
              <p className="text-[#c2e5e1] mt-0.5 text-xs">
                Complete your application in just a few steps
              </p>
            </div>

            {/* Form Container */}
            <div className="px-3 sm:px-4 md:px-5 py-2 overflow-y-auto">
              <div className="md:grid md:grid-cols-2 gap-3 w-full">
                {/* Left Column */}
                <div className="space-y-1.5 w-full">
                  <div className="w-full">
                    <input
                      type="text"
                      name="fullName"
                      onChange={handleInputChange}
                      value={formData.fullName}
                      placeholder={formErrors.fullName || "Your FullName"}
                      className={`w-full px-3 py-2 text-sm border ${formErrors.fullName ? "border-red-500" : "border-gray-200"} rounded-lg transition-all`}
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      onChange={handleInputChange}
                      value={formData.email}
                      placeholder={formErrors.email || "your.email@example.com"}
                      className={`w-full px-3 py-2 text-sm border ${formErrors.email ? "border-red-500" : "border-gray-200"} rounded-lg transition-all`}
                    />
                  </div>

                  <div className="w-full">
                    <div className="flex gap-2 w-full">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        className="w-20 px-2 py-2 text-sm border border-gray-200 rounded-lg flex-shrink-0"
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
                        className={`flex-1 px-3 py-2 text-sm border ${formErrors.phone ? "border-red-500" : "border-gray-200"} rounded-lg transition-all`}
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder={
                        formErrors.fatherName || "Father's Full Name"
                      }
                      className={`w-full px-3 py-2 text-sm border ${formErrors.fatherName ? "border-red-500" : "border-gray-200"} rounded-lg transition-all`}
                    />
                  </div>

                  <div>
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
                      className={`w-full px-3 py-2 text-sm border ${formErrors.aadhaar ? "border-red-500" : "border-gray-200"} rounded-lg transition-all`}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-1.5">
                  <div>
                    <div className="mb-1">
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-1.5 text-sm">
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
                        <label className="flex items-center gap-1.5 text-sm">
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

                  <div>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 text-sm border ${formErrors.dob ? "border-red-500" : "border-gray-200"} rounded-lg transition-all`}
                    />
                  </div>

                  <div>
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 text-sm border ${formErrors.qualification ? "border-red-500" : "border-gray-200"} rounded-lg`}
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

                  <div>
                    <input
                      type="text"
                      name="preferredCourse"
                      value={formData.preferredCourse}
                      onChange={handleInputChange}
                      placeholder={
                        formErrors.preferredCourse || "Preferred Course"
                      }
                      className={`w-full px-3 py-2 text-sm border ${formErrors.preferredCourse ? "border-red-500" : "border-gray-200"} rounded-lg`}
                    />
                  </div>

                  <div>
                    <select
                      name="preferredCampus"
                      value={formData.preferredCampus}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 text-sm border ${formErrors.preferredCampus ? "border-red-500" : "border-gray-200"} rounded-lg`}
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
              <div className="mt-2 space-y-0.5 w-full">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={formErrors.message || "Your message here..."}
                  maxLength={200}
                  className={`w-full px-3 py-2 text-sm border ${formErrors.message ? "border-red-500" : "border-gray-200"} rounded-lg transition-all min-h-[60px] resize-none`}
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

              {/* Submit Button */}
            </div>
          </div>
        </div>
      )}

      {activeTab == "Discipline" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center ">
          {disciplines.map((discipline) => (
            <div
              key={discipline.name}
              onClick={() => handleDisciplineClick(discipline.name)}
              className="bg-white border-none rounded-lg p-2 text-center shadow-sm transition-all duration-300 ease-in-out cursor-pointer
                   hover:-translate-y-2 hover:shadow-lg hover:border-[#388E3C] hover:bg-gray-50 group"
            >
              <div className="flex justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                {discipline.icon}
              </div>
              <h3 className="text-lg font-semibold text-[#333]">
                {discipline.name}
              </h3>
            </div>
          ))}
        </div>
      ) : (
        <div className="">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                // className={`relative group overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 ${category.children ? "cursor-pointer" : ""}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => (category.children ? openModal(category) : null)}
              >
                {!category.children ? (
                  <a
                    href={category.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    // className="block p-6 md:p-8"
                  >
                    <CardContent
                      category={category}
                      index={index}
                      hoveredIndex={hoveredIndex}
                      themeColor={themeColor}
                      lightColor={lightColor}
                    />
                  </a>
                ) : (
                  <div className="p-6 md:p-8">
                    <CardContent
                      category={category}
                      index={index}
                      hoveredIndex={hoveredIndex}
                      themeColor={themeColor}
                      lightColor={lightColor}
                    />
                  </div>
                )}

                {/* Animated underline */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 overflow-hidden">
                  <div
                    className="h-full w-0 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: themeColor }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
const CardContent = ({
  category,
  index,
  hoveredIndex,
  themeColor,
  lightColor,
}) => {
  return (
    <div className="group p-6 rounded-xl border border-gray-100 hover:border-teal-100 transition-all duration-300 hover:shadow-lg bg-white flex flex-col h-full">
      {/* Logo Container with elegant hover effect */}
      <div
        className={`w-16 h-16 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 ${
          hoveredIndex === index
            ? "bg-gradient-to-br from-teal-600 to-teal-500 shadow-lg"
            : "bg-gray-50 shadow-sm"
        }`}
      >
        {category.icon &&
          React.cloneElement(category.icon, {
            className: `w-7 h-7 ${
              hoveredIndex === index ? "text-white" : "text-teal-600"
            } transition-colors duration-300`,
          })}
      </div>

      {/* Title with improved typography and spacing */}
      <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-teal-800 transition-colors line-clamp-2 leading-tight">
        {category.name}
      </h3>

      {/* Description text (if available) */}
      {category.description && (
        <p className="text-gray-500 text-sm mb-4 line-clamp-3">
          {category.description}
        </p>
      )}

      {/* Animated CTA that stands out */}
      <div className="mt-auto inline-flex items-center group-hover:underline underline-offset-4 decoration-teal-500">
        <span className="text-sm font-medium text-teal-600 group-hover:text-teal-700 transition-colors">
          {category.children ? "View collaborations" : "Learn more"}
        </span>
        <ChevronRight
          size={16}
          className="ml-2 text-teal-600 group-hover:text-teal-700 group-hover:translate-x-1 transition-all duration-300"
        />
      </div>
    </div>
  );
};
