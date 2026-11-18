import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/url";
import ProfileDetails from "./formsSections/ProfileDetails";
import AddressDetails from "./formsSections/AddressDetails";
import ContactDetails from "./formsSections/ContactDetails";
import InstitutionalDetails from "./formsSections/InstitutionalData";
import DisabilityInfo from "./formsSections/DisabilityInfo";
import AcademicDetails from "./formsSections/AcademicDetails";
import DocumentsChecklist from "./formsSections/DocumentsChecklist";
import ValidationAlert from "./ValidationAlert";
import AdmissionSuccessModal from "./AdmissionSuccessModal";

const RegisterAdmission = () => {
  const [activeStep, setActiveStep] = useState(0);
  const token = localStorage.getItem("token");
  const [documentsList, setDocumentsList] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [formData, setFormData] = useState({
    // Application Data
    hallTicketNo: "",
    admitCardId: "",
    rank: "",
    phase: "",
    seatCategory: "",
    seatCategorySPL: "",

    // ===========================
    // Personal Details & Contact Details
    // ===========================
    firstName: "",
    middleName: "",
    lastName: "",
    fatherName: "",
    motherName: "",
    dob: "", // format: dd/mm/yyyy
    gender: "",
    nationality: "",
    caste: "",
    religion: "",
    aadharNumber: "",
    aparId: "",

    // Parents' occupation & income
    fatherOccupation: "",
    fatherIncome: "",
    motherOccupation: "",
    motherIncome: "",

    // Personal Identification Marks
    personalMark1: "",
    personalMark2: "",

    email: "",
    phone: "",
    altPhone: "",

    // ===========================
    // Address Details
    // ===========================
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",

    // =========================== =========================== ===================
    // Academic Details (multi-entry) & Institutional / Preferred Campus & Course
    // =========================== =========================== ===================
    academicRecords: [
      {
        id: Date.now(),
        collegeName: "",
        qualification: "",
        specialization: "", // new
        completionYear: "",
        result: "", // replaces marks
        achievements: "", // new
      },
    ],

    // Institutional / Preferred Campus & Course
    campus: "",
    course: "",

    // =========================== =============================
    // Documents Checklist (using yes/no instead of checkboxes)
    // =========================== =============================
    documents: {},

    // =========================== =============================
    // Disability Information && Scholarship & Reimbursement
    // =========================== =============================

    hasDisability: "",
    disabilityCertificate: null, // store file object
    // Scholarship & Reimbursement
    hasScholarship: "",
    requiresReimbursement: "",

    // Facilities
    requiresHostel: "",
    requiresTransport: "",
  });

  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [correctFormData, setCorrectFormData] = useState(null);

  const handleFormSubmit = (e) => {
    console.log("__declarationAccepted", declarationAccepted);
    e.preventDefault();
    if (declarationAccepted) {
      setPendingEvent(e); // save the event
      setShowConfirm(true); // show confirmation modal
    }
  };

  const confirmSubmit = () => {
    setShowConfirm(false);
    if (pendingEvent) {
      handleSubmit(pendingEvent); // call your original submit
      setPendingEvent(null);
    }
  };

  const cancelSubmit = () => {
    setShowConfirm(false);
    setPendingEvent(null);
  };

  const steps = [
    { title: "Application Data", description: "Your application details" },
    {
      title: "Profile & Contact",
      description: "Personal and contact information",
    },
    { title: "Address", description: "Your address details" },
    { title: "Education", description: "Academic information" },
    { title: "Documents", description: "Required documents" },
    { title: "Other", description: "Scholarship, reimbursement etc." },
  ];

  useEffect(() => {
    const savedData = localStorage.getItem("admissionFormData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData((prev) => ({
        ...prev,
        ...parsedData, // populate saved fields
        documents: parsedData.documents || {}, // ensure documents is an object
      }));
    }
  }, []);

  const [lastHallTicket, setLastHallTicket] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [formData.hallTicketNo]);
  console.log("__formData.hallTicketNo", formData.hallTicketNo);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const hallTicket = (formData.hallTicketNo || "").trim();
      if (!hallTicket) {
        console.warn("Hall Ticket Number is required");
        return;
      }

      // ✅ If hall ticket changed, reset formData first
      if (hallTicket !== lastHallTicket) {
        // ✅ Reset formData if hall ticket changed
        if (hallTicket !== lastHallTicket) {
          setFormData({
            // Application Data
            hallTicketNo: hallTicket,
            admitCardId: "",
            rank: "",
            phase: "",
            seatCategory: "",
            seatCategorySPL: "",

            // Personal & Contact Details
            firstName: "",
            middleName: "",
            lastName: "",
            fatherName: "",
            motherName: "",
            dob: "",
            gender: "",
            nationality: "",
            caste: "",
            religion: "",
            aadharNumber: "",
            aparId: "",

            fatherOccupation: "",
            fatherIncome: "",
            motherOccupation: "",
            motherIncome: "",

            personalMark1: "",
            personalMark2: "",

            email: "",
            phone: "",
            altPhone: "",

            // Address
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            pincode: "",

            // Academic Records
            academicRecords: [
              {
                id: Date.now(),
                collegeName: "",
                qualification: "",
                specialization: "",
                completionYear: "",
                result: "",
                achievements: "",
              },
            ],

            campus: "",
            course: "",

            // Documents
            documents: {},

            // Disability & Scholarship
            hasDisability: "",
            disabilityCertificate: null,
            hasScholarship: "",
            requiresReimbursement: "",

            // Facilities
            requiresHostel: "",
            requiresTransport: "",
          });

          setNotFound(""); // clear previous errors
          setLastHallTicket(hallTicket); // update last hall ticket
        }
        setNotFound("");
        setLastHallTicket(hallTicket);
      }
      // Fetch student data
      const studentRes = await fetch(
        `${BASE_URL}/students/hallTicket/${hallTicket}`
      );
      let studentData = null;
      let hasCorrectionYes = false;

      if (studentRes.ok) {
        studentData = await studentRes.json();
        console.log("____-studentData", studentData);

        hasCorrectionYes =
          Array.isArray(studentData.corrections) &&
          studentData.corrections.some((c) => c.flag === "yes");
      }

      // Fetch allotment data
      const allotmentRes = await fetch(
        `${BASE_URL}/apsche_allotements/hallTicket/${hallTicket}`
      );
      let allotmentData = null;

      if (allotmentRes.ok) {
        allotmentData = await allotmentRes.json();
        console.log("__---_______allotment data", allotmentData);
      }
      console.log(
        "____hasCorrectionYes",
        hasCorrectionYes && studentData,
        !studentData && allotmentData,
        !studentData && !allotmentData
      );
      // Decide what to do
      if (hasCorrectionYes && studentData) {
        // Prefill with student data + allotment
        console.log("_______+++++studentData", studentData);
        setFormData({
          hallTicketNo: hallTicket,
          ...studentData,
          documents: studentData.documents || {},
          academicRecords:
            studentData.academicRecords?.length > 0
              ? studentData.academicRecords
              : [
                  {
                    id: Date.now(),
                    collegeName: "",
                    qualification: "",
                    specialization: "",
                    completionYear: "",
                    result: "",
                    achievements: "",
                  },
                ],
          campus: studentData.campus?._id || "",
          course: studentData.course?._id || "",
          allotment: allotmentData || null,
        });

        setCorrectFormData(studentData.corrections);
      } else if (!studentData && allotmentData) {
        // No student, but allotment exists: prefill with allotment
        setFormData({
          hallTicketNo: hallTicket,
          category: allotmentData?.allotedCategory || "",
          rank: allotmentData?.rank || "",
          firstName: allotmentData.applicantName || "",
          region: allotmentData?.region || "",
          admitCardId: allotmentData?.allotedCategory || "",
          gender:
            allotmentData.gender === "M"
              ? "male"
              : allotmentData.gender === "F"
                ? "female"
                : "",
          documents: {},
          academicRecords: [
            {
              id: Date.now(),
              collegeName: "",
              qualification: "",
              specialization: "",
              completionYear: "",
              result: "",
              achievements: "",
            },
          ],
          campus: "",
          course: "",
          allotment: allotmentData,
        });
      } else if (!studentData && !allotmentData) {
        // Neither found
        setNotFound(
          "Your hall ticket is not found in student records or APSCHE allotments."
        );
        setFormData({
          hallTicketNo: hallTicket,
          documents: {},
          academicRecords: [
            {
              id: Date.now(),
              collegeName: "",
              qualification: "",
              specialization: "",
              completionYear: "",
              result: "",
              achievements: "",
            },
          ],
          campus: "",
          course: "",
          allotment: null,
        });
      } else {
        console.log("_++++_allotmentData", allotmentData);
        // Student exists but no correction: prefill student minimally + allotment
        setFormData({
          hallTicketNo: hallTicket,
          documents: studentData?.documents || {},
          academicRecords:
            studentData?.academicRecords?.length > 0
              ? studentData.academicRecords
              : [
                  {
                    id: Date.now(),
                    collegeName: "",
                    qualification: "",
                    specialization: "",
                    completionYear: "",
                    result: "",
                    achievements: "",
                  },
                ],

          // Prefill campus/course from student (allotment doesn’t have them)
          campus: studentData?.campus?._id || "",
          course: studentData?.course?._id || "",

          // Prefill from allotment API
          applicantName:
            allotmentData?.applicantName || studentData?.name || "",
          rank: allotmentData?.rank || "",
          category: allotmentData?.allotedCategory || "",
          rank: allotmentData?.rank || "",
          region: allotmentData?.region || "",
          gender: allotmentData?.gender || studentData?.gender || "",

          // Keep full allotment object too
          allotment: allotmentData || null,
        });
      }
    } catch (err) {
      console.error("Error fetching student by hall ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  console.log("___formData", formData);
  // =============== INPUT HANDLER =================
  const handleInputChange = (e) => {
    const { name, value, type, checked, title } = e.target;
    console.log("____name", name, title);
    let updatedFormData;

    if (name.startsWith("documents.")) {
      const [, docId] = name.split(".");

      // Update documents as an object
      console.log("_formData.documents", formData.documents);
      updatedFormData = {
        ...formData,
        documents: {
          ...formData.documents,
          [docId]:
            type === "checkbox"
              ? {
                  submitted: checked,
                  title: title || formData.documents?.[docId]?.title,
                }
              : { value, title: title || formData.documents?.[docId]?.title },
        },
      };
    } else if (type === "checkbox" && name === "permanentAddressSame") {
      updatedFormData = { ...formData, [name]: checked };
    } else {
      updatedFormData = { ...formData, [name]: value };

      if (name === "campus") {
        updatedFormData.course = "";
      }
    }

    setFormData(updatedFormData);

    // Save everything including documents to localStorage
    localStorage.setItem("admissionFormData", JSON.stringify(updatedFormData));
  };

  useEffect(() => {
    const fetchDocumentsChecklist = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/certificate-checklist/checked`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          setDocumentsList(response.data || []);
        } else {
          setError("Failed to fetch documents checklist");
        }
      } catch (err) {
        console.error("Error fetching documents checklist:", err);
        setError("Error loading documents checklist");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentsChecklist();
  }, []);

  const generateReferenceNumber = () => {
    const date = new Date();
    return (
      "ADM" +
      date.getFullYear() +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0") +
      Math.floor(1000 + Math.random() * 9000)
    );
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStepClick = (stepIndex) => {
    // Allow navigation to completed steps or the next logical step
    if (
      completedSteps.includes(stepIndex) ||
      stepIndex === completedSteps.length
    ) {
      setActiveStep(stepIndex);
    }
  };

  // =============== FILE UPLOAD =================
  const handleFileUpload = (docId, file, title) => {
    console.log("📂 Uploading file:", { docId, fileName: file.name, title });

    const reader = new FileReader();
    reader.onload = (e) => {
      // e.target.result is a Data URL string (e.g. data:application/pdf;base64,...)
      const base64String = e.target.result.split(",")[1]; // strip metadata

      const fileData = {
        name: title, // original file name
        title, // human-readable title
        type: file.type, // MIME type
        size: file.size, // file size in bytes
        lastModified: file.lastModified,
        data: base64String, // pure base64 string
      };

      const updatedFormData = {
        ...formData,
        documents: {
          ...formData.documents,
          [docId]: {
            ...formData.documents[docId],
            ...fileData,
            docId,
            submitted: "yes",
          },
        },
      };

      setFormData(updatedFormData);

      try {
        localStorage.setItem(
          "admissionFormData",
          JSON.stringify(updatedFormData)
        );
      } catch (storageErr) {
        console.error(
          "❌ Failed to save formData to localStorage:",
          storageErr
        );
      }
    };

    reader.onerror = (err) => {
      console.error("❌ FileReader error:", err);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!declarationAccepted) {
      alert("You must accept the declaration before proceeding.");
      return;
    }

    setLoading(true);
    console.log("____correctFormData", correctFormData);
    const correctionYes = correctFormData?.[0]?.flag; // optional chaining
    console.log("________sdfsdf", correctionYes);

    try {
      const referenceNumber = generateReferenceNumber();

      // Convert documents object to array
      const documentsArray = Array.isArray(formData.documents)
        ? formData.documents
        : Object.values(formData.documents || {});

      // Prepare FormData payload
      const payload = new FormData();

      for (const key in formData) {
        if (key === "documents") {
          documentsArray.forEach((doc, index) => {
            if (doc.data) payload.append(`documents[${index}][file]`, doc.data);
            payload.append(
              `documents[${index}][submitted]`,
              doc.submitted || "no"
            );
            payload.append(
              `documents[${index}][verified]`,
              doc.verified || "not_verified"
            );
            payload.append(`documents[${index}][comment]`, doc.comment || "");
            payload.append(`documents[${index}][name]`, doc.title || "");
            payload.append(`documents[${index}][docId]`, doc.docId || index);
            payload.append(`documents[${index}][fileType]`, doc.type || "");
          });
        } else if (Array.isArray(formData[key])) {
          payload.append(key, JSON.stringify(formData[key]));
        } else {
          payload.append(key, formData[key] ?? "");
        }
      }

      payload.append("referenceNumber", referenceNumber);

      const token = localStorage.getItem("token");

      let response;

      if (correctionYes) {
        // If correction, call update API by hall ticket number
        response = await axios.put(
          `${BASE_URL}/students/hallticket/${formData.hallTicketNo}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Otherwise, create a new student
        response = await axios.post(`${BASE_URL}/students`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setStudentData(response.data.student);
      localStorage.removeItem("admissionFormData");
      setIsModalOpen(true);
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      if (error.response?.status === 409) {
        alert(
          `A student with the same phone, Aadhaar number, or hall ticket already exists.`
        );
      }
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely check if a value is empty
  const isEmpty = (value) =>
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "");

  // validateStep function
  const validateStep = (step) => {
    console.log("__+++___formData", formData);

    switch (step) {
      case 0: // Application Data
        if (isEmpty(formData.hallTicketNo))
          return { valid: false, message: "Hall Ticket Number is required" };

        // Campus & Course validation (works even if these are objects or null)
        if (isEmpty(formData.campus))
          return { valid: false, message: "Campus is required" };
        if (isEmpty(formData.course))
          return { valid: false, message: "Course is required" };

        return { valid: true };

      case 1: // Profile & Contact
        if (isEmpty(formData.firstName))
          return { valid: false, message: "First Name is required" };
        if (isEmpty(formData.lastName))
          return { valid: false, message: "Last Name is required" };
        if (
          !isEmpty(formData.aadharNumber) &&
          !/^\d{12}$/.test(formData.aadharNumber)
        )
          return { valid: false, message: "Aadhar must be 12 digits" };
        // Assuming this is inside your validateStep or similar function
        if (formData.aparId && formData.aparId.trim() !== "") {
          if (!/^\d{12}$/.test(formData.aparId)) {
            return { valid: false, message: "APAAR id must be 12 digits" };
          }
        }

        if (isEmpty(formData.phone))
          return { valid: false, message: "Phone number is required" };
        return { valid: true };

      case 2: // Address
        if (isEmpty(formData.addressLine1))
          return { valid: false, message: "Address Line 1 is required" };
        if (isEmpty(formData.city))
          return { valid: false, message: "City is required" };
        if (isEmpty(formData.state))
          return { valid: false, message: "State is required" };
        if (!isEmpty(formData.pincode) && !/^\d{6}$/.test(formData.pincode))
          return { valid: false, message: "Pincode must be 6 digits" };
        return { valid: true };

      case 3: // Academic
        const invalidRecord = formData.academicRecords?.find(
          (rec) =>
            isEmpty(rec.collegeName) ||
            isEmpty(rec.qualification) ||
            isEmpty(rec.completionYear) ||
            isEmpty(rec.result)
        );
        if (invalidRecord)
          return {
            valid: false,
            message: "Please complete all academic records",
          };
        return { valid: true };

      case 4: // Documents
        const missingDoc = documentsList
          .filter((doc) => doc.required)
          .find((doc) => !doc.check);

        if (missingDoc) {
          return {
            valid: false,
            message: `${missingDoc.name || missingDoc.title} is required`,
          };
        }
        return { valid: true };

      case 5: // Disability/Scholarship
        if (
          formData.hasDisability === "yes" &&
          !formData.disabilityCertificate
        ) {
          return { valid: false, message: "Disability certificate required" };
        }
        if (!["yes", "no"].includes(formData.hasScholarship)) {
          return { valid: false, message: "Select scholarship option" };
        }
        if (!["yes", "no"].includes(formData.requiresReimbursement)) {
          return { valid: false, message: "Select reimbursement option" };
        }
        if (!declarationAccepted) {
          return { valid: false, message: "You must accept the declaration" };
        }
        return { valid: true };

      default:
        return { valid: true };
    }
  };

  // const handleNext = () => {
  //   if (!validateStep(activeStep)) {
  //     // Instead of alert, show modal
  //     setShowValidationModal(true);
  //     return;
  //   }

  //   if (!completedSteps.includes(activeStep)) {
  //     setCompletedSteps([...completedSteps, activeStep]);
  //   }

  //   setActiveStep((prevStep) => prevStep + 1);
  // };

  const validation = validateStep(activeStep);
  const handleNext = () => {
    if (notFound != "") {
      alert(notFound);
      return;
    }
    if (!validation.valid) {
      setShowValidationModal(true);
      // alert(validation.message); // Or use modal with validation.message
      return;
    }

    if (!completedSteps.includes(activeStep)) {
      setCompletedSteps([...completedSteps, activeStep]);
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  // Render the current step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-medium text-[#525B88] mb-4 border-b pb-2">
              Application Details -{" "}
              <span className="text-sm">
                Please fill the below details from allotent Letter
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hall Ticket No */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hall Ticket No <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="hallTicketNo"
                  value={formData.hallTicketNo}
                  onChange={handleInputChange}
                  maxLength={16}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault(); // block non-numeric
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              {/* Admit Card ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category of seat alloted
                </label>
                <input
                  type="text"
                  name="admitCardId"
                  value={formData.admitCardId}
                  onChange={handleInputChange}
                  placeholder="Ex. OC_GIRLS_AU"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Rank */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rank
                </label>
                <input
                  type="text"
                  name="rank"
                  value={formData.rank}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault(); // block non-numeric
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Phase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phase of admission{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="phase"
                  value={formData.phase}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="">Select Phase</option>
                  <option value="1">Phase 1</option>
                  <option value="2">Phase 2</option>
                  <option value="3">Spot Admission</option>
                </select>
              </div>

              {/* Seat Allotted Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seat allotted in the category of
                </label>
                <select
                  name="seatCategory"
                  value={formData.seatCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select Category</option>
                  <option value="OC">OC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="BC-A">BC-A</option>
                  <option value="BC-B">BC-B</option>
                  <option value="BC-C">BC-C</option>
                  <option value="BC-D">BC-D</option>
                  <option value="BC-E">BC-E</option>
                  <option value="OBC">OBC</option>
                  <option value="EWS">EWS</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Seat Allotted Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seat allotted in SPL category of
                </label>
                <select
                  name="seatCategorySPL"
                  value={formData.seatCategorySPL}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select Category</option>
                  <option value="NSS">NSS</option>
                  <option value="CAP">CAP</option>
                  <option value="PH">PH</option>
                  <option value="SPORTS">SPORTS</option>
                  <option value="NCC">NCC</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <InstitutionalDetails
                formData={formData}
                handleInputChange={handleInputChange}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <>
            <ProfileDetails
              formData={formData}
              handleInputChange={handleInputChange}
            />
            <ContactDetails
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </>
        );
      case 2:
        return (
          <AddressDetails
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 3:
        return (
          <>
            <AcademicDetails formData={formData} setFormData={setFormData} />
            {/* <InstitutionalDetails
              formData={formData}
              handleInputChange={handleInputChange}
            /> */}
          </>
        );
      case 4:
        return (
          <DocumentsChecklist
            formData={formData}
            handleInputChange={handleInputChange}
            handleFileUpload={handleFileUpload}
            documentsList={documentsList}
          />
        );
      case 5:
        return (
          <>
            <DisabilityInfo
              formData={formData}
              handleInputChange={handleInputChange}
            />

            <div>
              {/* <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
                Scholarship, Reimbursement & Facilities
              </h3> */}

              {/* Scholarship */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Are you eligible for a scholarship?(MTF){" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="scholarshipYes"
                      name="hasScholarship"
                      value="yes"
                      checked={formData.hasScholarship === "yes"}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600"
                      required
                    />
                    <label
                      htmlFor="scholarshipYes"
                      className="ml-2 text-gray-700"
                    >
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="scholarshipNo"
                      name="hasScholarship"
                      value="no"
                      checked={formData.hasScholarship === "no"}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600"
                    />
                    <label
                      htmlFor="scholarshipNo"
                      className="ml-2 text-gray-700"
                    >
                      No
                    </label>
                  </div>
                </div>
              </div>

              {/* Reimbursement */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Are you eligible for fee reimbursement?(RTF){" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="reimbursementYes"
                      name="requiresReimbursement"
                      value="yes"
                      checked={formData.requiresReimbursement === "yes"}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600"
                      required
                    />
                    <label
                      htmlFor="reimbursementYes"
                      className="ml-2 text-gray-700"
                    >
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="reimbursementNo"
                      name="requiresReimbursement"
                      value="no"
                      checked={formData.requiresReimbursement === "no"}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600"
                    />
                    <label
                      htmlFor="reimbursementNo"
                      className="ml-2 text-gray-700"
                    >
                      No
                    </label>
                  </div>
                </div>
              </div>

              {/* Hostel Required */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do you require hostel facility?{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="hostelYes"
                      name="requiresHostel"
                      value="yes"
                      checked={formData.requiresHostel === "yes"}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600"
                      required
                    />
                    <label htmlFor="hostelYes" className="ml-2 text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="hostelNo"
                      name="requiresHostel"
                      value="no"
                      checked={formData.requiresHostel === "no"}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600"
                    />
                    <label htmlFor="hostelNo" className="ml-2 text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              {/* Transport Required */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do you require transport facility?{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="transportYes"
                      name="requiresTransport"
                      value="yes"
                      checked={formData.requiresTransport === "yes"}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600"
                      required
                    />
                    <label
                      htmlFor="transportYes"
                      className="ml-2 text-gray-700"
                    >
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="transportNo"
                      name="requiresTransport"
                      value="no"
                      checked={formData.requiresTransport === "no"}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600"
                    />
                    <label htmlFor="transportNo" className="ml-2 text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-5">
                <p>
                  <input
                    type="checkbox"
                    className="h-4 w-4 mr-2"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  />
                  I,
                  <span className="font-bold"> {formData.firstName} </span>,
                  son/daughter of{" "}
                  <span className="font-bold"> {formData.fatherName} </span>,
                  hereby solemnly affirm and declare as follows:
                </p>
                <p className="mt-2">
                  1:- That the information and particulars furnished by me in
                  this form are true, correct, and complete to the best of my
                  knowledge and belief.
                </p>
                <p className="mt-2">
                  2:- That I understand and accept that if any information is
                  found to be false, incorrect, or misleading at any stage, my
                  admission/selection shall be liable to cancellation without
                  notice, and appropriate action may be taken against me as per
                  the rules and regulations of the Institution/Authority.
                </p>
                <p className="mt-2">
                  3:- That I undertake to abide by all rules, regulations, and
                  codes of conduct prescribed by the Institution/Authority
                  during the course of my enrollment/study.
                </p>
              </div>
            </div>
          </>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="p-6 border-t">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center gap-2 sm:gap-4 mb-6">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <button
                type="button"
                onClick={() => handleStepClick(index)}
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
                  activeStep === index
                    ? "bg-[#525B88] text-white"
                    : completedSteps.includes(index)
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                } ${index <= completedSteps.length ? "cursor-pointer" : "cursor-not-allowed"}`}
                disabled={index > completedSteps.length}
              >
                {completedSteps.includes(index) && index !== activeStep ? (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>

              {/* Title hidden on small screens */}
              <div className="hidden sm:block text-xs mt-1 text-center font-medium text-gray-600">
                {step.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Current Step Content */}
        {renderStepContent(activeStep)}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={activeStep === 0}
            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {activeStep === steps.length - 1 ? (
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-[#525B88] hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 disable:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Application"}
              {/* Submit Application */}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto bg-[#525B88] hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
            >
              Next
            </button>
          )}
        </div>

        {message && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {message}
          </div>
        )}
      </form>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 bg-opacity-50">
          <div
            className="
    bg-white p-6 rounded-xl shadow-lg 
    w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl
  "
          >
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to submit the application?
            </h2>

            <p className="mb-6">
              {" "}
              Please review all details carefully, as no changes will be allowed
              once the application is submitted.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelSubmit}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Review Again
              </button>
              <button
                onClick={confirmSubmit}
                className="px-4 py-2 rounded bg-[#525B88] text-white hover:bg-blue-700"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <ValidationAlert
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Incomplete Step"
        primaryAction={{
          label: "OK",
          onClick: () => setShowValidationModal(false),
        }}
      >
        <p className="text-gray-700">
          {/* Please fill all required fields before proceeding to the next step. */}
          {validation.message}
        </p>
      </ValidationAlert>

      {/* Success Modal */}
      <AdmissionSuccessModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // window.location.reload(); // 🔄 reload page after closing modal
        }}
        student={studentData}
      />
    </div>
  );
};

export default RegisterAdmission;
