import React, { useEffect, useMemo, useState } from "react";
import { HiOutlineExternalLink } from "react-icons/hi";
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
  Lightbulb,
  Pencil,
  UserRound,
  Bell,
  IndianRupee,
  ChevronUp,
  ChevronDown,
  DoorOpen,
} from "lucide-react";

import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import Admission from "../pages/Admission";
import { admissionsOpen } from "../assets";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { BackButton } from "./BackButton";
import { BASE_URL } from "../utils/url";
import dayjs from "dayjs";

// =============================================================================
// ImportantDates Component (Modified with Tailwind CSS)
// =============================================================================
const ImportantDates = () => {
  // const datesData = [
  //   {
  //     icon: <Lightbulb size={20} />,
  //     color: "#ff4081",
  //     date: "05",
  //     month: "Jun",
  //     year: "2025",
  //     description: "Last date to apply",
  //   },
  //   {
  //     icon: <Pencil size={20} />,
  //     color: "#9c27b0",
  //     date: "08",
  //     month: "Jun",
  //     year: "2025",
  //     description: "Date of Examination",
  //   },
  //   {
  //     icon: <UserRound size={20} />,
  //     color: "#3f51b5",
  //     date: "08",
  //     month: "Jun",
  //     year: "2025",
  //     description: "Personal Interview",
  //   },
  //   {
  //     icon: <Bell size={20} />,
  //     color: "#2196f3",
  //     date: "08",
  //     month: "Jun",
  //     year: "2025",
  //     description: "Results announcement",
  //   },
  //   {
  //     icon: <IndianRupee size={20} />,
  //     color: "#00bcd4",
  //     date: "15",
  //     month: "Jun",
  //     year: "2025",
  //     description: "Last date for payment of fees for scholarships candidates",
  //   },
  //   {
  //     icon: <DoorOpen size={20} />,
  //     color: "#4caf50",
  //     date: "24",
  //     month: "Jun",
  //     year: "2025",
  //     description: "Last date for admission",
  //   },
  // ];

  const [datesData, setDatesData] = useState([]);

  const fetchImportantDates = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}api/important-dates/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDatesData(response.data.data || []);
    } catch (error) {
      console.log("Error fetching important dates:", error);
      setDatesData([]);
    }
  };

  useEffect(() => {
    fetchImportantDates();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("PG Courses");

  const filteredDates = datesData.filter((item) => {
    if (selectedCategory === "Others") return item.program === "others";
    if (selectedCategory === "UG Courses") return item.program === "ug";
    if (selectedCategory === "PG Courses") return item.program === "pg";
    return false;
  });

  return (
    <div className="px-4 sm:px-16 py-8 bg-[#f8faf9] text-[#333]">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#007367] mb-3 sm:mb-4 pb-2 relative inline-block">
          Important Dates
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#388E3C]"></span>
        </h2>

        <div className="flex flex-wrap gap-4 sm:gap-6 my-4 sm:my-6 md:my-8">
          {["PG Courses", "UG Courses", "Others"].map((category) => (
            <label
              key={category}
              className="inline-flex items-center cursor-pointer"
            >
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={() => setSelectedCategory(category)}
                className="appearance-none w-5 h-5 border-2 border-gray-300 rounded-full mr-2 relative
                       checked:border-[#388E3C] checked:bg-[#388E3C]
                       checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 
                       checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full 
                       checked:after:transform checked:after:-translate-x-1/2 checked:after:-translate-y-1/2
                       focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
              />
              <span
                className={`font-medium ${selectedCategory === category ? "text-[#388E3C]" : "text-[#555]"}`}
              >
                {category}
                {selectedCategory === category && (
                  <span className="ml-1">✓</span>
                )}
              </span>
            </label>
          ))}
        </div>

        <div className="relative mt-12">
          {/* Timeline line - hidden on mobile */}
          {filteredDates.length > 0 && (
            <div className="hidden md:block absolute left-4 md:left-1/2 h-full w-0.5 bg-[#007367] bg-opacity-30 transform -translate-x-1/2"></div>
          )}

          <div className="space-y-8">
            {filteredDates.length > 0 ? (
              filteredDates.map((item, index) => {
                const dateObj = new Date(item.date);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleString("default", {
                  month: "long",
                });
                const year = dateObj.getFullYear();

                return (
                  <div
                    key={index}
                    className="relative flex flex-row items-center md:items-start gap-4 group"
                  >
                    {/* Mobile date bubble - shown above content */}
                    <div className="md:hidden flex-shrink-0 relative z-10 h-14 mx-auto">
                      <div
                        className="w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-md"
                        style={{ backgroundColor: item.color }}
                      >
                        <span className="text-white text-base font-bold">
                          {day}
                        </span>
                        <span className="text-white text-xs">{month}</span>
                      </div>
                      <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-600">
                        {year}
                      </div>
                    </div>

                    {/* Content */}
                    <div
                      className={`flex-1 transition-all duration-300 flex flex-col md:flex-row
                          ${index % 2 === 0 ? "md:mr-auto md:max-w-[49%]" : "md:ml-auto md:max-w-[49%]"}`}
                    >
                      {index % 2 !== 0 && (
                        <div className="hidden md:flex flex-shrink-0 relative z-10 h-16 ml-2 mr-6">
                          <div
                            className="w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-md"
                            style={{ backgroundColor: item.color }}
                          >
                            <span className="text-white text-lg font-bold">
                              {day}
                            </span>
                            <span className="text-white text-xs">{month}</span>
                          </div>
                          <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-600">
                            {year}
                          </div>
                        </div>
                      )}
                      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 md:mr-6">
                        <div className="flex flex-col gap-3 mb-3">
                          <h3 className="font-semibold  md:ml-11 text-lg text-gray-800">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 md:ml-11 text-sm">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      {index % 2 === 0 && (
                        <div className="hidden md:flex flex-shrink-0 relative z-10 h-16">
                          <div
                            className="w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-md"
                            style={{ backgroundColor: item.color }}
                          >
                            <span className="text-white text-lg font-bold">
                              {day}
                            </span>
                            <span className="text-white text-xs">{month}</span>
                          </div>
                          <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-600">
                            {year}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-8">
                No important dates found for {selectedCategory}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// FeeStructure Component (Modified with Tailwind CSS)
// =============================================================================
const FeeStructure = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const [programType, setProgramType] = useState("Undergraduate");

  const [openProgram, setOpenProgram] = useState(null);
  const [openSection, setOpenSection] = useState({});

  useEffect(() => {
    if (type) {
      const formattedType =
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      if (formattedType === "Pg") setProgramType("Postgraduate");
      else if (formattedType === "Ug") setProgramType("Undergraduate");
      else setProgramType("Others");
    }
  }, [type]);

  const toggleProgram = (programName) => {
    setOpenProgram((prev) => (prev === programName ? null : programName));
    setOpenSection({}); // Reset sub-accordions when switching programs
  };

  const [programs, setItems] = useState([]);

  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedProgramType, setSelectedProgramType] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  // const uniqueCampuses = [...new Set(programs.map((item) => item.campusLocation))];
  const uniqueCampuses = programs.map((item) => item.campusLocation);
  const uniquePrograms = [...new Set(programs.map((item) => item.programType))];
  const uniqueSpecialization = [
    ...new Set(programs.map((item) => item.specialization)),
  ];
  useEffect(() => {
    fetchItems();
  }, []);

  // console.log("294", uniqueCampuses);
  const fetchItems = async () => {
    try {
      // const response = await axios.get(
      //   `${import.meta.env.VITE_API_URL}api/admission_fees/`
      // );
      // console.log("308", response.data);
      // setItems([...response.data] || []);
      setItems([
        {
          _id: "68d134187c5cf2f579bc7086",
          courseId: {
            _id: "68d124147c5cf2f579bc43fa",
            code: "92",
            name: "B.Ed - SOCIAL STUDIES",
          },
          campusId: {
            _id: "68c8434a56f2db58f4925dd8",
            code: "501",
            name: "UNIVERSITY COLLEGE OF EDUCATION, ADIKAVI NANNAYA UNIVERSITY",
            location: "RAJAMAHENDRAVARAM",
          },
          mode: "Regular",
          years: [
            {
              year: 1,
              fees: [
                {
                  feeType: "TUITION FEE",
                  feeAmount: 16500,
                  remarks: "",
                  _id: "68d134187c5cf2f579bc7088",
                },
              ],
              _id: "68d134187c5cf2f579bc7087",
            },
          ],
          __v: 0,
          courseName: "B.Ed - SOCIAL STUDIES",
          courseCode: "92",
          campusName:
            "UNIVERSITY COLLEGE OF EDUCATION, ADIKAVI NANNAYA UNIVERSITY",
          campusCode: "501",
          campusLocation: "RAJAMAHENDRAVARAM",
        },
      ]);
    } catch (error) {
      setItems([]);
    }
  };

  // [
  //   {
  //     _id: "690a3cb61c7ce76f4284b1d1",
  //     courseId: {
  //       _id: "6906dcbda3acd3d733ce385a",
  //       code: "BSC",
  //       name: "Bachelor of science",
  //     },
  //     campusId: {
  //       _id: "68c8432c56f2db58f4925dc8",
  //       code: "885",
  //       name: "UNIVERSITY COLLEGE OF SCIENCE AND TECHNOLOGY, ADIKAVI NANNAYA UNIVERSITY",
  //       location: "RAJAMAHENDRAVARAM",
  //     },
  //     mode: "Regular",
  //     years: [
  //       {
  //         year: 1,
  //         fees: [
  //           {
  //             feeType: "regular",
  //             feeAmount: 300,
  //             remarks: "byvbh ",
  //             _id: "690a3cb61c7ce76f4284b1d3",
  //           },
  //           {
  //             feeType: "",
  //             feeAmount: 0,
  //             remarks: "",
  //             _id: "690a3cb61c7ce76f4284b1d4",
  //           },
  //         ],
  //         _id: "690a3cb61c7ce76f4284b1d2",
  //       },
  //     ],
  //     __v: 0,
  //     courseName: "Bachelor of science",
  //     courseCode: "BSC",
  //     campusName:
  //       "UNIVERSITY COLLEGE OF SCIENCE AND TECHNOLOGY, ADIKAVI NANNAYA UNIVERSITY",
  //     campusCode: "885",
  //     campusLocation: "RAJAMAHENDRAVARAM",
  //   },
  // ];
  const toggleAccordion = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };
  const [selectedProgram, setSelectedProgram] = useState("");
  useEffect(() => {
    const normalize = (str) =>
      str
        ?.toLowerCase()
        .replace(/[^a-z0-9]/gi, "")
        .trim();
    const selectedProgram = programs.find((p) => {
      const isMatch =
        p.campus === selectedCampus &&
        p.programType === selectedProgramType &&
        p.specialization === selectedSpecialization;

      return isMatch;
    });
    setSelectedProgram(selectedProgram);
  }, [selectedProgramType, selectedSpecialization, selectedCampus, programs]);

  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const levelMap = {
    Undergraduate: "ug",
    Postgraduate: "pg",
  };

  const matchedLevel = levelMap[programType];

  // const availableProgramTypes = [
  //   ...new Set(
  //     programs
  //       .filter((item) => item.campus === selectedCampus)
  //       .map((item) => item.abbreviation)
  //   ),
  // ];

  const availableProgramTypes = [
    ...new Set(
      programs
        .filter((item) => {
          const isSameCampus = item.campus === selectedCampus;

          if (!isSameCampus) return false;

          if (matchedLevel) {
            return item.programLevel === matchedLevel;
          } else {
            return item.programLevel !== "ug" && item.programLevel !== "pg";
          }
        })
        .map((item) => item.programType)
    ),
  ];

  const availableSpecializations = [
    ...new Set(
      programs
        .filter(
          (item) =>
            item.campusLocation === selectedCampus &&
            item.courseCode === selectedProgramType
        )
        .map((item) => item.specialization)
    ),
  ];
  console.log("383", availableSpecializations);

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
  // const [message, setMessage] = useState("");
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
  };

  const getSyllabusLink = () => {
    const obj = {
      Undergraduate: {
        // TADEPALLIGUDEM
        Tadepalligudem: {
          Bsc: {
            mpc: "/ug-syllabus#year=2023-24+Onwards", // NOT_EXACT
          },
          BCA: {
            "Computer Applications":
              "/ug-syllabus#year=2023-24+Onwards&dept=BCA+Subjects&q=Computer+Applications",
          },
          "B.Sc": {
            "Computer Science":
              "/ug-syllabus#year=2023-24+Onwards&dept=B.Sc+Subjects&q=Computer+Science",
          },
        },
        // RAJAMAHENDRAVARAM
        Rajamahendravaram: {
          Mpc: {
            Mathamatics: "/ug-syllabus#year=2023-24+Onwards", // NOT_EXACT
          },
          "B.Ed": {
            Education: "/ug-syllabus#year=2023-24+Onwards", // NOT_EXACT
          },
          BBA: {
            "General Management":
              "/ug-syllabus#year=2023-24+Onwards&dept=BBA+Subjects", // NOT_EXACT
          },
          "B.Com": {
            "Computer Applications":
              "/ug-syllabus#year=2023-24+Onwards&dept=B.Com+Subjects&q=Computer+Applications",
          },
          "B.A": {
            English:
              "/ug-syllabus#year=2023-24+Onwards&dept=B.A+Subjects&q=Special+English",
          },
          "B.Sc": {
            Biotechnology:
              "/ug-syllabus#year=2023-24+Onwards&dept=B.Sc+Subjects&q=Bio-Technology",
          },
          "B.Tech": {
            "Electrical & Instrumentation Engineering (EIE)":
              "/ug-syllabus#year=2023-24+Onwards",
            "Electronics & Communication Engineering (ECE)":
              "/ug-syllabus#year=2023-24+Onwards",
            "Computer Science & Engineering (CSE)":
              "/ug-syllabus#year=2023-24+Onwards",
          },
        },
        // KAKINADA
        Kakinada: {
          Mpc: {
            Mathamatics: "/ug-syllabus#year=2023-24+Onwards", // NOT_EXACT
          },
        },
      },
      // ---------------------------------------
      Postgraduate: {
        Tadepalligudem: {
          "Mesters ": {
            "organic chemistry ": "/pg-syllabus#year=2024-25+Onwards", // NOT_EXACT
          },
        },
        Rajamahendravaram: {
          Mesters: {
            Chemistry: "/pg-syllabus#year=2024-25+Onwards", // NOT_EXACT
          },
          "M.Tech": {
            "Big Data Analytics": "/pg-syllabus#year=2024-25+Onwards", // NOT_EXACT
          },
          MBA: {
            "General MBA":
              "/pg-syllabus#year=2016-17+AB&dept=Professional&q=MBA", // NOT_EXACT
          },
          "M.Sc": {
            "Computer Science":
              "/pg-syllabus#year=2016-17+AB&dept=Science&q=M.Sc.+Computer+Science",
            "Organic Chemistry":
              "/pg-syllabus#year=2019-20+AB&dept=Science&q=M.Sc.+Organic+Chemistry",
          },
        },
        Kakinada: {
          Mesters: {
            "chemistry ": "/pg-syllabus#year=2019-20+AB&q=chemistry", // NOT_EXACT
          },
          others: {
            Yoga: "/pg-syllabus#year=2024-25+Onwards&dept=Diploma&q=PG+Diploma+in+Yoga", // NOT_EXACT
          },
          MCA: {
            "Computer Applications":
              "/pg-syllabus#year=2019-20+AB&dept=Professional&q=MCA", // NOT_EXACT
          },
          "M.Com": {
            "Commerce (General)":
              "/pg-syllabus#year=2019-20+AB&dept=Arts&q=M.Com",
          },
          "M.A": {
            English: "/pg-syllabus#year=2019-20+AB&dept=Arts&q=M.A+English",
          },
        },
      },
    };
    let slug;
    if (obj[programType]) {
      if (obj[programType][selectedCampus]) {
        if (obj[programType][selectedCampus][selectedProgramType]) {
          if (
            obj[programType][selectedCampus][selectedProgramType][
              selectedSpecialization
            ]
          ) {
            slug =
              obj[programType][selectedCampus][selectedProgramType][
                selectedSpecialization
              ];
          }
        }
      }
    }
    return slug;
  };
  const [dates, setDates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios(`${BASE_URL}/date-picker`);
      setDates(res.data);
    };
    fetchData();
  }, []);
  const admission = dates;
  const { message, status } = useMemo(() => {
    if (!dates || dates.length === 0) return { message: "", status: "unknown" };

    // Take the first admission object
    const admission = dates[0];

    const now = dayjs();
    const start = dayjs(`${admission.startDate}T${admission.startTime}`);
    const end = dayjs(`${admission.endDate}T${admission.endTime}`);

    if (now.isBefore(start)) {
      return {
        message: `Admissions for "${admission.title}" open at ${start.format(
          "MMM D, YYYY h:mm A"
        )}`,
        status: "upcoming",
      };
    } else if (now.isAfter(end)) {
      return {
        message: `Admissions for "${admission.title}" closed on ${end.format(
          "MMM D, YYYY h:mm A"
        )}`,
        status: "closed",
      };
    } else {
      return {
        message: `Admissions for "${admission.title}" are open until ${end.format(
          "MMM D, YYYY h:mm A"
        )}`,
        status: "open",
      };
    }
  }, [dates]);

  console.log("670", programs);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = decodeURIComponent(location.hash.replace("#", ""));
      const el = document.getElementById(id);
      if (el) {
        // account for sticky header
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  return (
    <div className="bg-[#f4e4c9] text-[#333] px-4 sm:px-16 py-8 overflow-x-hidden">
      <BackButton className="" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 space-y-3 md:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full md:w-auto md:flex-1 gap-3 sm:gap-4">
          <h2 className="text-left text-[#007367] text-2xl sm:text-3xl md:text-3xl font-bold mb-2 relative inline-block">
            Admissions
            <span className="absolute bottom-0 left-0 w-16 sm:w-20 h-[3px] bg-[#388E3C] translate-y-[5px]"></span>
          </h2>
          <div className="flex items-center text-teal-700 hover:text-[#005f53] font-semibold text-base">
            <span>director.doa@aknu.edu.in</span>
            <span className="mx-2">/</span>
            <span>7093008477</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          {message && (
            <div
              className={`px-4 py-2 font-medium text-sm animate-pulse rounded  ${
                status === "open"
                  ? "text-red-700 "
                  : status === "closed"
                    ? "bg-red-100 text-red-700 border-red-300"
                    : "bg-yellow-100 text-yellow-700 border-yellow-300"
              }`}
            >
              {message}
            </div>
          )}

          {status === "open" && (
            <button
              onClick={() => navigate("/admission")}
              className="bg-[#007364] text-white w-full sm:w-48 h-12 px-4 font-semibold text-lg shadow-md hover:bg-[#005f53] transition-colors duration-200 whitespace-nowrap"
            >
              Admission Form
            </button>
          )}
        </div>
      </div>

      {/* How to Apply anchor targets for menu links */}
      <div id="how-to-apply" className="pt-24 -mt-24" />
      <div id="admissions/how-to-apply" className="pt-24 -mt-24" />

      <p className="text-[#555] text-[16px] md:text-[16px] mb-4 sm:mb-6 text-justify leading-relaxed">
        Adikavi Nannaya University welcomes aspiring students to join a vibrant
        academic community committed to excellence in education, research, and
        holistic development. The Admissions Office facilitates a transparent
        and streamlined process for enrolling in undergraduate, postgraduate,
        diploma, and research programs across a wide range of disciplines.
      </p>

      <div className="flex gap-x-2 sm:gap-x-4 md:gap-x-8 lg:gap-x-12 mb-4 sm:mb-5 flex-wrap gap-y-2">
        <label className="inline-flex items-center cursor-pointer text-[#333] font-medium whitespace-nowrap text-sm sm:text-base">
          <input
            type="radio"
            name="programType"
            value="Undergraduate"
            checked={programType === "Undergraduate"}
            onChange={() => setProgramType("Undergraduate")}
            className="appearance-none w-5 h-5 border-2 border-gray rounded-full mr-2 relative transition-all duration-200 ease-in-out cursor-pointer align-middle
                       checked:border-[#388E3C] checked:bg-[#388E3C]
                       checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full checked:after:translate-x-[-50%] checked:after:translate-y-[-50%]
                       focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:ring-opacity-20"
          />
          Undergraduate
          {programType === "Undergraduate" && (
            <span className="ml-1 text-[#388E3C] font-semibold text-lg">✓</span>
          )}
        </label>
        <label className="inline-flex items-center cursor-pointer text-[#333] font-medium whitespace-nowrap text-sm sm:text-base">
          <input
            type="radio"
            name="programType"
            value="Postgraduate"
            checked={programType === "Postgraduate"}
            onChange={() => setProgramType("Postgraduate")}
            className="appearance-none w-5 h-5 border-2 border-gray rounded-full mr-2 relative transition-all duration-200 ease-in-out cursor-pointer align-middle
                       checked:border-[#388E3C] checked:bg-[#388E3C]
                       checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full checked:after:translate-x-[-50%] checked:after:translate-y-[-50%]
                       focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:ring-opacity-20"
          />
          Postgraduate
          {programType == "Postgraduate" && (
            <span className="ml-1 text-[#388E3C] font-semibold text-lg">✓</span>
          )}
        </label>

        <label className="inline-flex items-center cursor-pointer text-[#333] font-medium whitespace-nowrap">
          <input
            type="radio"
            name="programType"
            value="others"
            checked={programType === "others"}
            onChange={() => setProgramType("others")}
            className="appearance-none w-5 h-5 border-2 border-gray rounded-full mr-2 relative transition-all duration-200 ease-in-out cursor-pointer align-middle
                       checked:border-[#388E3C] checked:bg-[#388E3C]
                       checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full checked:after:translate-x-[-50%] checked:after:translate-y-[-50%]
                       focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:ring-opacity-20"
          />
          Others
          {programType == "others" && (
            <span className="ml-1 text-[#388E3C] font-semibold text-lg">✓</span>
          )}
        </label>
      </div>

      <div className="flex gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 flex-wrap">
        {/* Campus Dropdown */}
        <select
          value={selectedCampus}
          onChange={(e) => {
            setSelectedCampus(e.target.value);
            setSelectedProgramType("");
            setSelectedSpecialization("");
          }}
          className="flex-1 min-w-[150px] sm:min-w-[180px] md:min-w-[200px] px-2 sm:px-3 py-2 text-sm sm:text-base border bg-white border-[#e0e0e0] rounded"
        >
          <option value="Select Campus">Select Campus</option>
          {uniqueCampuses.map((campus, index) => (
            <option key={index} value={campus}>
              {campus}
            </option>
          ))}
        </select>

        {/* Program Type Dropdown */}
        <select
          value={selectedProgramType}
          onChange={(e) => {
            setSelectedProgramType(e.target.value);
            setSelectedSpecialization("");
          }}
          className="flex-1 min-w-[150px] sm:min-w-[180px] md:min-w-[200px] px-2 sm:px-3 py-2 text-sm sm:text-base bg-white border border-[#e0e0e0] rounded"
        >
          <option value="">Select program type</option>

          {availableProgramTypes.map((item, index) => (
            <option key={index} value={item}>
              {item.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Specialization Dropdown */}
        <select
          value={selectedSpecialization}
          onChange={(e) => setSelectedSpecialization(e.target.value)}
          className="flex-1 min-w-[150px] sm:min-w-[180px] md:min-w-[200px] px-2 sm:px-3 py-2 text-sm sm:text-base bg-white border border-[#e0e0e0] rounded"
        >
          <option value="">Select specialization</option>
          {availableSpecializations.map((item, index) => (
            <option key={index} value={item}>
              {item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
        {selectedProgram && (
          <div className="mt-4 sm:mt-6 rounded-lg shadow-sm overflow-hidden max-w-md w-full sm:w-auto">
            <div className="bg-teal-700 px-3 sm:px-4 py-3 sm:py-4 text-white flex flex-col items-center">
              <h5 className="text-base sm:text-lg font-semibold mb-2 tracking-wide">
                Fee Structure
              </h5>
              <div className="text-lg sm:text-xl font-bold mb-1">
                {(() => {
                  const s1 = parseFloat(
                    (selectedProgram?.semester1Fees || "0").replace(/,/g, "")
                  );
                  const s2 = parseFloat(
                    (selectedProgram?.semester2Fees || "0").replace(/,/g, "")
                  );
                  const total = s1 + s2;
                  return total.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  });
                })()}
              </div>
              <div className="text-sm opacity-80">Total Fees (First Year)</div>
            </div>

            <div className="h-[3px] w-full bg-white" />

            <div className="bg-[#007367] flex justify-between items-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-white">
              <div className="flex flex-col items-center flex-1">
                <div className="text-sm sm:text-base font-medium mb-1">
                  Sem 1
                </div>
                <div className="text-xs sm:text-sm font-bold">
                  ₹{selectedProgram.semester1Fees.toLocaleString()}
                </div>
              </div>
              <div className="w-[2px] h-8 sm:h-10 bg-white mx-2 sm:mx-4 rounded-full opacity-60" />
              <div className="flex flex-col items-center flex-1">
                <div className="text-sm sm:text-base font-medium mb-1">
                  Sem 2
                </div>
                <div className="text-xs sm:text-sm font-bold">
                  ₹{selectedProgram.semester2Fees.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedProgram?.feeNotes?.length > 0 && (
          <div className="mt-4 sm:mt-6 bg-teal-700 flex justify-center items-center rounded-xl shadow-sm overflow-hidden max-w-50 w-full sm:w-auto p-3 sm:p-4">
            <div className="text-white text-center text-xs sm:text-sm leading-relaxed">
              {selectedProgram.feeNotes.map((note, idx) => (
                <div key={idx} className="mb-1 last:mb-0">
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4">
        {selectedProgram?.feeNotes?.length == 0 && (
          <p className="text-center text-sm sm:text-base font-medium px-2">
            <span className="text-[#007367] font-semibold">Note :</span>
            <span className="text-black">
              {" "}
              3% increase of tuition fee, if paid in semester wise
            </span>
          </p>
        )}
        {/* Eligibility Accordion */}
        <div className="border border-none overflow-hidden">
          <div
            className="flex justify-between items-center bg-teal-700 p-2 sm:p-3 cursor-pointer text-white font-semibold text-sm sm:text-base transition-colors duration-300"
            onClick={() => toggleAccordion("eligibility")}
          >
            Eligibility
            <span className="text-lg sm:text-xl">
              {openSection === "eligibility" ? (
                <ChevronUp size={18} className="sm:w-5 sm:h-5" />
              ) : (
                <ChevronDown size={18} className="sm:w-5 sm:h-5" />
              )}
            </span>
          </div>
          {openSection === "eligibility" && (
            <div className="p-3 sm:p-4 md:p-5 bg-white border-t border-[#e0f2f1] text-[#555] text-xs sm:text-sm">
              {" "}
              {selectedProgram ? (
                <ul className="list-disc ml-5">
                  {selectedProgram.eligibility.map((item, idx) => (
                    <li key={idx}>
                      {item.charAt(0).toUpperCase() +
                        item.slice(1).toLowerCase()}
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <p className="mb-2">
                    Details regarding the eligibility criteria for different
                    programs.
                  </p>
                  <ul className="list-disc ml-5">
                    <li>Minimum academic qualifications.</li>
                    <li>Age limit, if any.</li>
                    <li>Specific subject requirements.</li>
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
        {/* Exam Pattern Accordion */}
        <div className="border border-none overflow-hidden">
          <div
            className="flex justify-between items-center bg-teal-700 p-2 sm:p-3 cursor-pointer text-white font-semibold text-sm sm:text-base transition-colors duration-300"
            onClick={() => toggleAccordion("examPattern")}
          >
            Exam pattern
            <span className="text-lg sm:text-xl">
              {openSection === "examPattern" ? (
                <ChevronUp size={18} className="sm:w-5 sm:h-5" />
              ) : (
                <ChevronDown size={18} className="sm:w-5 sm:h-5" />
              )}
            </span>
          </div>
          {openSection === "examPattern" && (
            <div className="p-3 sm:p-4 md:p-5 bg-white border-t border-[#e0f2f1] text-[#555] text-xs sm:text-sm">
              {selectedProgram ? (
                <ul className="list-disc ml-5">
                  {selectedProgram.examPattern.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <>
                  <p className="mb-2">
                    Information about the structure and format of the entrance
                    examination.
                  </p>
                  <ul className="list-disc ml-5">
                    <li>Number of sections.</li>
                    <li>Marking scheme.</li>
                    <li>Duration of the exam.</li>
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
        {/* Syllabus Accordion */}
        <div className="border border-none overflow-hidden">
          <div
            className="flex justify-between items-center bg-teal-700 p-2 sm:p-3 cursor-pointer text-white font-semibold text-sm sm:text-base transition-colors duration-300"
            onClick={() => toggleAccordion("syllabus")}
          >
            Syllabus
            <span className="text-lg sm:text-xl">
              {openSection === "syllabus" ? (
                <ChevronUp size={18} className="sm:w-5 sm:h-5" />
              ) : (
                <ChevronDown size={18} className="sm:w-5 sm:h-5" />
              )}
            </span>
          </div>
          {openSection === "syllabus" && (
            <div className="p-3 sm:p-4 md:p-5 bg-white border-t border-[#e0f2f1] text-[#555] text-xs sm:text-sm">
              {selectedProgram ? (
                <ul className="list-disc ml-5">
                  {selectedProgram.syllabus.map((item, idx) => (
                    <li key={idx}>
                      {item.charAt(0).toUpperCase() +
                        item.slice(1).toLowerCase()}
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <p className="mb-2">
                    Comprehensive syllabus details for the entrance examination
                    and specific courses.
                  </p>
                  <ul className="list-disc ml-5">
                    <li>Topics covered in each subject.</li>
                    <li>Recommended study materials.</li>
                  </ul>
                </>
              )}
              <br />
              {getSyllabusLink() ? (
                <a
                  href={getSyllabusLink()}
                  className="text-[#007367] hover:text-white duration-300 flex items-center gap-2 border-[#007367] border rounded-md w-min px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-[#007367] mt-2 sm:mt-0"
                >
                  Syllabus{" "}
                  <HiOutlineExternalLink size={16} className="sm:w-4 sm:h-4" />
                </a>
              ) : null}
            </div>
          )}
        </div>
        {/* Admission Process Accordion */}
        <div className="border border-none overflow-hidden">
          <div
            className="flex justify-between items-center bg-teal-700 p-2 sm:p-3 cursor-pointer text-white font-semibold text-sm sm:text-base transition-colors duration-300"
            onClick={() => toggleAccordion("admissionProcess")}
          >
            Admissions Through State Level CETs
            <span className="text-lg sm:text-xl">
              {openSection === "admissionProcess" ? (
                <ChevronUp size={18} className="sm:w-5 sm:h-5" />
              ) : (
                <ChevronDown size={18} className="sm:w-5 sm:h-5" />
              )}
            </span>
          </div>
          {openSection === "admissionProcess" && (
            <div className="p-3 sm:p-4 md:p-5 bg-white border-t border-[#e0f2f1] text-[#555] text-xs sm:text-sm">
              {/* <h4 className="text-lg sm:text-xl font-semibold text-[#007367] mb-3 sm:mb-4">
                Admissions Through State Level CETs Only
              </h4> */}
              <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-5">
                <div className="inline-block min-w-full align-middle px-3 sm:px-4 md:px-5">
                  <table className="min-w-full bg-white border border-gray-200 overflow-hidden">
                    <thead className="bg-teal-700 text-white">
                      <tr>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">
                          CET Name
                        </th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">
                          Programs
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap font-medium text-gray-900 text-xs sm:text-sm">
                          AP POCET
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm break-words">
                          M.Sc, M.A., M.Com & M.P.Ed
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 bg-gray-50">
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap font-medium text-gray-900 text-xs sm:text-sm">
                          AP ICET
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm break-words">
                          MCA, MBA & MBA (Tourism & Hospitality)
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap font-medium text-gray-900 text-xs sm:text-sm">
                          AP PGECET
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm break-words">
                          M.Tech. CSE
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 bg-gray-50">
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap font-medium text-gray-900 text-xs sm:text-sm">
                          AP EAPCET
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm break-words">
                          B.Tech. CSE, ECE, EIE, Civil, Mech & B.Pharm
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap font-medium text-gray-900 text-xs sm:text-sm">
                          AP EDCET
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm break-words">
                          B.Ed
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 border-l-4 border-blue-400 rounded">
                <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
                  <strong>Note:</strong> Hostel facility available for men/women
                  in Rajamahendravaram, Kakinada & only for women in
                  Tadepalligudem campus. Fee Reimbursement Facility Available
                  for eligible CET Candidates
                </p>
              </div>
            </div>
          )}
        </div>
        {/* fees */}
        {/* <div className="border border-none overflow-hidden ">
          <div
            className="flex justify-between items-center bg-[#007367] p-3 cursor-pointer text-white font-semibold transition-colors duration-300
                      "
            onClick={() => toggleAccordion("feestructure")}
          >
            Fee structure
            <span className="text-xl">
              {openSection === "feestructure" ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </span>
          </div>
          {openSection === "feestructure" && (
            <div className="p-5 bg-white border-t border-[#e0f2f1] text-[#555] text-sm">
              {selectedProgram ? (
                <ul className="list-disc ml-5">
                  {selectedProgram.examPattern.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <>
                  <p className="mb-2">
                    Information about the structure and format of the entrance
                    examination.
                  </p>
                  <ul className="list-disc ml-5">
                    <li>Number of sections.</li>
                    <li>Marking scheme.</li>
                    <li>Duration of the exam.</li>
                  </ul>
                </>
              )}
            </div>
          )}
        </div> */}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm bg-black/30 w-[100vw] h-[100vh] overflow-hidden"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl w-full overflow-x-hidden overflow-y-auto relative max-h-[90vh] max-w-[92vw] sm:max-w-[90vw] lg:max-w-4xl ">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white text-3xl transition-colors"
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
    </div>
  );
};

// =============================================================================
// InstructionsPage Component (Modified with Tailwind CSS)
// =============================================================================

const InstructionsPage = ({ selectedDiscipline, onLogout }) => {
  const [citizenshipType, setCitizenshipType] = useState("indian");
  const [authMode, setAuthMode] = useState("login");
  const [loginMethod, setLoginMethod] = useState("mobile");
  const [openSection, setOpenSection] = useState("onlineApplication");

  const navigate = useNavigate();

  const toggleSection = (sectionName) => {
    setOpenSection((prev) => (prev === sectionName ? null : sectionName));
  };

  return (
    <div className=" text-[#333] min-h-screen flex flex-col">
      <FeeStructure />
      <ImportantDates />
      <Admission />

      {/* Header Section (Removed as per previous instructions to embed within AdmissionPage if needed, or assume external) */}

      <main>
        {/* <BackButton /> */}
        {/* Left Section with Image and Overlays */}

        <div className="flex justify-between items-center px-4 sm:px-16 mt-6 sm:mt-8 overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#007367] mb-3 sm:mb-4">
            Admission Process
          </h2>
        </div>
        <div className="flex flex-col lg:flex-row flex-grow px-4 sm:px-16 overflow-hidden mb-6 sm:mb-8">
          <div className="flex-1  flex justify-center relative overflow-hidden">
            <div className="relative w-full  h-full flex justify-center ">
              <img
                src={admissionsOpen}
                alt="Student"
                className="w-full h-56 sm:h-72 md:h-96 lg:h-[480px] object-cover shadow-lg -pb-48 -mt-24"
              />
              {/* Overlays - positioned absolutely within image-container's context */}
            </div>
          </div>

          {/* Right Section with Instructions */}
          <div className="flex-1 lg:pl-8 xl:pl-16 pt-4 sm:pt-6 md:pt-8">
            <div className="space-y-3 sm:space-y-4">
              {/* Section 1: Instructions for filling online application */}
              <div className="border-b border-[#e0e0e0] overflow-hidden">
                <div
                  className="flex justify-between items-center bg-white p-3 sm:p-4 cursor-pointer text-[#333] font-medium text-sm sm:text-base transition-colors duration-300 hover:bg-gray-50"
                  onClick={() => toggleSection("onlineApplication")}
                >
                  Instructions for filling online application
                  <span className="text-lg sm:text-xl">
                    {openSection === "onlineApplication" ? (
                      <ChevronUp size={18} className="sm:w-5 sm:h-5" />
                    ) : (
                      <ChevronDown size={18} className="sm:w-5 sm:h-5" />
                    )}
                  </span>
                </div>
                {openSection === "onlineApplication" && (
                  <div className="p-3 sm:p-4 md:p-5 bg-white border-t border-[#e0e0e0] text-[#555] text-xs sm:text-sm">
                    <p className="mb-2">
                      Detailed instructions for the online application process
                      will go here. This includes steps for creating an account,
                      filling out forms, uploading documents, etc.
                    </p>
                    <ul className="list-disc ml-5">
                      <li>Step 1: Create your profile.</li>
                      <li>Step 2: Fill in personal details.</li>
                      <li>Step 3: Upload necessary documents.</li>
                      <li>Step 4: Review and submit.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Section 2: Academic qualification details */}
              <div className="border-b border-[#e0e0e0] overflow-hidden">
                <div
                  className="flex justify-between items-center bg-white p-3 sm:p-4 cursor-pointer text-[#333] font-medium text-sm sm:text-base transition-colors duration-300 hover:bg-gray-50"
                  onClick={() => toggleSection("academicQualification")}
                >
                  Academic qualification details
                  <span className="text-lg sm:text-xl">
                    {openSection === "academicQualification" ? (
                      <ChevronUp size={18} className="sm:w-5 sm:h-5" />
                    ) : (
                      <ChevronDown size={18} className="sm:w-5 sm:h-5" />
                    )}
                  </span>
                </div>
                {openSection === "academicQualification" && (
                  <div className="p-3 sm:p-4 md:p-5 bg-white border-t border-[#e0e0e0] text-[#555] text-xs sm:text-sm">
                    <p className="mb-2">
                      Information required regarding your academic background,
                      previous degrees, marks, and institutions.
                    </p>
                    <ul className="list-disc ml-5">
                      <li>10th Standard details (Board, Year, Marks).</li>
                      <li>12th Standard details (Board, Year, Marks).</li>
                      <li>
                        Undergraduate/Postgraduate details (University, Degree,
                        Marks/GPA).
                      </li>
                      <li>Any other relevant qualifications.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Section 3: Program selection details */}
              <div className="border-b border-[#e0e0e0] overflow-hidden">
                <div
                  className="flex justify-between items-center bg-white p-3 sm:p-4 cursor-pointer text-[#333] font-medium text-sm sm:text-base transition-colors duration-300 hover:bg-gray-50"
                  onClick={() => toggleSection("programSelection")}
                >
                  Program selection details
                  <span className="text-lg sm:text-xl">
                    {openSection === "programSelection" ? (
                      <ChevronUp size={18} className="sm:w-5 sm:h-5" />
                    ) : (
                      <ChevronDown size={18} className="sm:w-5 sm:h-5" />
                    )}
                  </span>
                </div>
                {openSection === "programSelection" && (
                  <div className="p-3 sm:p-4 md:p-5 bg-white border-t border-[#e0e0e0] text-[#555] text-xs sm:text-sm">
                    <p className="mb-2">
                      Guidance on how to select your desired program and
                      discipline ({selectedDiscipline} is currently selected).
                    </p>
                    <ul className="list-disc ml-5">
                      <li>
                        Browse available programs under {selectedDiscipline}.
                      </li>
                      <li>Check eligibility criteria for each program.</li>
                      <li>Select your preferred program.</li>
                      <li>
                        Option for multiple program choices if applicable.
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Section 4: Personal details */}
              <div className="border-b border-[#e0e0e0] overflow-hidden ">
                {" "}
                <div
                  className="flex justify-between items-center bg-white p-4 cursor-pointer text-[#333] font-medium transition-colors duration-300
                           hover:bg-gray-50"
                  onClick={() => toggleSection("personalDetails")}
                >
                  Personal details
                  <span className="text-xl">
                    {openSection === "personalDetails" ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </span>
                </div>
                {openSection === "personalDetails" && (
                  <div className="p-5 bg-white border-t border-[#e0e0e0] text-[#555] text-sm">
                    <p className="mb-2">
                      Details about your personal information, contact details,
                      and demographic data.
                    </p>
                    <ul className="list-disc ml-5">
                      <li>Full Name, Date of Birth.</li>
                      <li>Gender, Nationality.</li>
                      <li>Contact Address, Email, Phone Number.</li>
                      <li>Parent/Guardian details.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* These sections are now part of the main AdmissionPage, so they don't need their own `section` tags here */}
    </div>
  );
};

export default InstructionsPage;
// =============================================================================
// AdmissionPage Component (Main component, now including others)
// =============================================================================
