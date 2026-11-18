import React, { useEffect, useMemo, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import {
  examinationCentersApi,
  examCenterCollegeMappingsApi,
  examinationPaymentApi,
  collegesApi,
  coursesApi,
  seatingArrangementsApi,
} from "../../services/apiService";
import {
  showSuccessMessage,
  showErrorMessage,
} from "../../config/Toast";

// Helper function to extract data from API responses
const extractData = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (response.data && Array.isArray(response.data)) return response.data;
  if (response.students && Array.isArray(response.students))
    return response.students;
  return [];
};

// Simple, local-only seating generator; replace mock data with API-backed lists when available.
const JumblingCenters = () => {
  const [centers, setCenters] = useState([]);
  const [centersLoading, setCentersLoading] = useState(false);
  const [centersError, setCentersError] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [mappingsError, setMappingsError] = useState(null);

  const [selectedCenter, setSelectedCenter] = useState("");
  const [numClasses, setNumClasses] = useState(1);
  const [classCapacity, setClassCapacity] = useState(30);
  const [seatingPlan, setSeatingPlan] = useState([]);
  const [loadedStudents, setLoadedStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Student filter state
  const [studentFilters, setStudentFilters] = useState({
    fromRegistrationNumber: "",
    toRegistrationNumber: "",
    courseId: "",
  });
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const qrPrintRef = useRef();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("generate");
  
  // Saved arrangements state
  const [savedArrangements, setSavedArrangements] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [selectedCenterForView, setSelectedCenterForView] = useState("");

  const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!selectedCenter || !numClasses || !classCapacity) return;

    if (!loadedStudents.length) {
      setStudentsError("Please load students first");
      return;
    }

    const shuffled = shuffle(loadedStudents);
    const allocations = [];
    let studentIndex = 0;

    for (let room = 1; room <= numClasses; room++) {
      for (
        let seat = 1;
        seat <= classCapacity && studentIndex < shuffled.length;
        seat++
      ) {
        const student = shuffled[studentIndex];
        const fullName =
          [student.firstName, student.middleName, student.lastName]
            .filter(Boolean)
            .join(" ") ||
          student.name ||
          "Unknown";

        const courseName = student.course || "-";
        const regNo = student.registrationNumber || 
                      student.registration_number ||
                      `REG${String(studentIndex + 1).padStart(8, "0")}`;
        
        // Generate unique script code for each student
        // Format: SCRIPT-{CENTERCODE}-{REGNO}-{ROOM}-{SEAT}
        const centerCode = selectedCenterDetails?.code || "CEN";
        const scriptCode = `SCRIPT-${centerCode}-${regNo.replace(/[^A-Z0-9]/gi, "")}-R${room}-S${seat}`.toUpperCase();

        allocations.push({
          ...student,
          registrationNumber: regNo,
          rollNumber: regNo,
          name: fullName,
          course: courseName,
          centerId: selectedCenter,
          roomNumber: `Room-${room}`,
          seatNumber: seat,
          scriptCode: scriptCode, // Unique script code for this student
        });
        studentIndex += 1;
      }
    }

    setSeatingPlan(allocations);
  };

  // Generate QR code data for a student
  const generateQRData = (student) => {
    const centerName = centers.find((c) => c._id === student.centerId)?.name || "";
    const centerCode = centers.find((c) => c._id === student.centerId)?.code || "";
    const data = {
      // Student Basic Information
      regNo: student.registrationNumber || student.rollNumber || "",
      name: student.name || "",
      course: student.course || "",
      semester: student.semester || "",
      email: student.email || "",
      phone: student.phone || "",
      
      // Examination Center Information
      center: centerName,
      centerCode: centerCode,
      centerId: student.centerId || "",
      
      // Seating Information
      room: student.roomNumber || "",
      seat: student.seatNumber || "",
      
      // Script Information
      scriptCode: student.scriptCode || "",
      
      // Additional Information
      college: typeof student.campus === "object" ? student.campus?.name : "",
      paymentStatus: student.payment_status || student.paymentStatus || "",
      
      // Timestamp
      generatedAt: new Date().toISOString(),
    };
    // Return JSON string for QR code
    return JSON.stringify(data);
  };

  // Generate QR code as base64 image using html2canvas
  const generateQRCodeImage = async (qrData) => {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary container
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.width = "200px";
        container.style.height = "200px";
        container.style.backgroundColor = "white";
        container.style.padding = "10px";
        document.body.appendChild(container);

        // Import React DOM dynamically
        import("react-dom/client").then(({ createRoot }) => {
          const root = createRoot(container);
          
          root.render(
            React.createElement(QRCodeSVG, {
              value: qrData,
              size: 180,
              level: "M",
              includeMargin: true,
            })
          );

          // Wait for render, then capture with html2canvas
          setTimeout(async () => {
            try {
              const canvas = await html2canvas(container, {
                backgroundColor: "#ffffff",
                scale: 2,
                logging: false,
              });
              const base64 = canvas.toDataURL("image/png");
              root.unmount();
              document.body.removeChild(container);
              resolve(base64);
            } catch (error) {
              root.unmount();
              document.body.removeChild(container);
              reject(error);
            }
          }, 300);
        }).catch((error) => {
          document.body.removeChild(container);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleDownload = () => {
    if (!seatingPlan.length) return;
    const header = [
      "Roll Number",
      "Name",
      "Course",
      "College",
      "Room",
      "Seat",
    ];
    const rows = seatingPlan.map((s) => {
      const regNo = s.registrationNumber || s.rollNumber || "-";
      const fullName = `${s.firstName || ""} ${s.middleName || ""} ${
        s.lastName || ""
      }`.trim();
      const name = fullName || (s.name && s.name !== regNo ? s.name : "-");
      const collegeName =
        typeof s.campus === "object"
          ? s.campus?.name || "-"
          : centers.find((c) => c._id === s.centerId)?.name || "-";

      return [
        regNo,
        name,
        s.course || "-",
        collegeName,
        s.roomNumber,
        s.seatNumber,
        s.scriptCode || "-",
      ];
    });
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "jumbling_seating_plan.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!seatingPlan.length) {
      showErrorMessage("No seating plan to save. Please generate a seating plan first.");
      return;
    }

    if (!selectedCenter) {
      showErrorMessage("Please select an examination center.");
      return;
    }

    setSaving(true);
    try {
      // Prepare arrangements data for the API
      // Note: QR code images can be generated later if needed, for now we'll save without images to avoid timeout
      const arrangements = seatingPlan.map((student, index) => {
        // Generate QR code data for this student
        const qrCodeData = generateQRData(student);
        
        // Get center code from selectedCenterDetails or find from centers array
        const centerDetails = selectedCenterDetails || centers.find((c) => c._id === selectedCenter);
        const centerCode = centerDetails?.code || "CEN";
        
        // Ensure required fields are present
        const registrationNumber = student.registrationNumber || student.rollNumber || "";
        const studentName = student.name || student.studentName || 
          `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`.trim() || 
          `Student ${index + 1}`;
        const roomNumber = student.roomNumber || `Room-${Math.floor(index / 30) + 1}`;
        const seatNumber = student.seatNumber || (index % 30) + 1;
        
        // Ensure scriptCode is always present and unique (required by backend)
        let scriptCode = student.scriptCode;
        if (!scriptCode || scriptCode.trim() === "") {
          // Generate script code if missing
          const regNo = registrationNumber.replace(/[^A-Z0-9]/gi, "") || `REG${String(index + 1).padStart(8, "0")}`;
          const room = roomNumber.replace(/[^A-Z0-9]/gi, "") || `R${Math.floor(index / 30) + 1}`;
          const seat = seatNumber || (index % 30) + 1;
          scriptCode = `SCRIPT-${centerCode}-${regNo}-R${room}-S${seat}`.toUpperCase();
        }
        
        // Validate required fields
        if (!registrationNumber || !studentName || !roomNumber || !seatNumber || !scriptCode) {
          console.error("Missing required fields for student:", student, {
            registrationNumber,
            studentName,
            roomNumber,
            seatNumber,
            scriptCode,
          });
        }
        
        return {
          registrationNumber: registrationNumber,
          rollNumber: student.rollNumber || registrationNumber || "",
          firstName: student.firstName || "",
          middleName: student.middleName || "",
          lastName: student.lastName || "",
          name: studentName,
          studentName: studentName,
          course: student.course || "",
          courseId: student.courseId || null,
          semester: student.semester || "",
          email: student.email || "",
          phone: student.phone || "",
          roomNumber: roomNumber,
          seatNumber: seatNumber,
          scriptCode: scriptCode, // Ensure scriptCode is always provided
          collegeId: student.collegeId || student.campus?._id || null,
          collegeName: student.collegeName || (typeof student.campus === "object" ? student.campus?.name : "") || "",
          collegeCode: student.collegeCode || (typeof student.campus === "object" ? student.campus?.code : "") || "",
          paymentStatus: student.paymentStatus || student.payment_status || "PENDING",
          transactionId: student.transactionId || student.transaction_id || "",
          qrCodeData: qrCodeData, // Include QR code data (images can be generated later from this)
          qrCodeImage: "", // Skip image generation during save to avoid timeout
          status: "Active",
        };
      });

      console.log("Saving arrangements:", {
        centerId: selectedCenter,
        count: arrangements.length,
        firstArrangement: arrangements[0],
      });
      
      // Validate required fields before sending
      const invalidArrangements = arrangements.filter((arr, index) => {
        const missing = [];
        if (!arr.registrationNumber && !arr.rollNumber) missing.push("registrationNumber/rollNumber");
        if (!arr.studentName) missing.push("studentName");
        if (!arr.roomNumber) missing.push("roomNumber");
        if (!arr.seatNumber || arr.seatNumber === 0) missing.push("seatNumber");
        if (!arr.scriptCode || arr.scriptCode.trim() === "") missing.push("scriptCode");
        
        if (missing.length > 0) {
          console.warn(`Arrangement ${index} is missing required fields:`, missing, arr);
          return true;
        }
        return false;
      });
      
      if (invalidArrangements.length > 0) {
        showErrorMessage(
          `${invalidArrangements.length} arrangement(s) are missing required fields. Please check the console for details.`
        );
        setSaving(false);
        return;
      }

      const response = await seatingArrangementsApi.create({
        centerId: selectedCenter,
        arrangements,
      });

      console.log("Save response:", response);

      if (response && response.success) {
        showSuccessMessage(
          `Successfully saved ${response.count || arrangements.length} seating arrangements!`
        );
      } else {
        const errorMsg = response?.message || "Failed to save seating arrangements";
        console.error("Save failed:", errorMsg, response);
        showErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error("Error saving seating arrangements:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        errorData: error.errorData || error.responseData,
        responseText: error.responseText,
        response: error.response,
        stack: error.stack,
      });
      
      // Log the first arrangement for debugging
      if (arrangements && arrangements.length > 0) {
        console.error("First arrangement data:", arrangements[0]);
      }
      
      // Extract detailed error message
      let errorMessage = "Failed to save seating arrangements. Please try again.";
      if (error.errorData || error.responseData) {
        const errorData = error.errorData || error.responseData;
        errorMessage = errorData.message || errorData.error || error.message || errorMessage;
      } else if (error.responseText) {
        // Try to extract message from raw response text
        try {
          const parsed = JSON.parse(error.responseText);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } catch (e) {
          // If not JSON, use the text (limited length)
          errorMessage = error.responseText.substring(0, 200) || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Add status code info for 500 errors
      if (error.status === 500) {
        errorMessage += " (Server Error - Please check the browser console and server logs for details)";
      }
      
      showErrorMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchCenters = async () => {
      setCentersLoading(true);
      setCentersError(null);
      setMappingsError(null);
      try {
        const [centersRes, mappingsRes] = await Promise.all([
          examinationCentersApi.getAll(),
          examCenterCollegeMappingsApi.getAll(),
        ]);

        const centersList = centersRes?.data || centersRes || [];
        const mappingsList = mappingsRes?.data || mappingsRes || [];

        setCenters(centersList);
        setMappings(mappingsList);
        setSelectedCenter(centersList[0]?._id || "");
      } catch (err) {
        setCentersError(err.message || "Failed to load examination centers");
        setMappingsError(err.message || "Failed to load center mappings");
      } finally {
        setCentersLoading(false);
      }
    };
    fetchCenters();
  }, []);

  // Fetch colleges and courses
  useEffect(() => {
    const fetchCollegesAndCourses = async () => {
      setLoadingColleges(true);
      setLoadingCourses(true);
      try {
        const [collegesRes, coursesRes] = await Promise.all([
          collegesApi.getAll(),
          coursesApi.getAll(),
        ]);

        const collegesList = extractData(collegesRes);
        const coursesList = extractData(coursesRes);

        setColleges(collegesList);
        setCourses(coursesList);
      } catch (err) {
        console.error("Failed to load colleges/courses", err);
      } finally {
        setLoadingColleges(false);
        setLoadingCourses(false);
      }
    };
    fetchCollegesAndCourses();
  }, []);

  const selectedCenterDetails = useMemo(
    () => centers.find((c) => c._id === selectedCenter) || null,
    [centers, selectedCenter]
  );

  // Print handler using react-to-print (must be after selectedCenterDetails is defined)
  const handlePrint = useReactToPrint({
    contentRef: qrPrintRef,
    documentTitle: `QR_Codes_${selectedCenterDetails?.name || "Center"}`,
    onBeforeGetContent: () => {
      if (!seatingPlan.length) {
        alert("No seating plan generated. Please generate seating plan first.");
        return Promise.reject();
      }
      // Wait a bit to ensure ref is attached
      return new Promise((resolve) => {
        setTimeout(() => {
          if (!qrPrintRef.current) {
            console.error("Print ref not available after wait");
            alert("Error: Print content not ready. Please try again.");
            resolve();
          } else {
            resolve();
          }
        }, 100);
      });
    },
    onPrintError: (error) => {
      console.error("Print error:", error);
      alert("Error printing QR codes. Please try again.");
    },
  });

  // Helpers to tolerate varied backend field names
  const getRoomsCount = (center) => {
    if (!center) return 0;
    const direct =
      center.numberOfRooms ??
      center.noOfRooms ??
      center.no_of_rooms ??
      center.totalRooms ??
      center.total_rooms;
    if (typeof direct === "number") return direct;
    if (typeof center.rooms === "number") return center.rooms;
    if (Array.isArray(center.rooms)) return center.rooms.length;
    return 0;
  };

  const getTotalSeats = (center) =>
    center?.capacity ??
    center?.totalSeats ??
    center?.total_seats ??
    center?.capacityTotal ??
    center?.capacity_total ??
    0;

  const filteredMappings = useMemo(() => {
    if (!selectedCenter) return [];
    return (mappings || []).filter((m) => {
      const centerId =
        typeof m.examCenterId === "object"
          ? m.examCenterId?._id
          : m.examCenterId;
      return centerId === selectedCenter;
    });
  }, [mappings, selectedCenter]);

  const parsedRollRanges = useMemo(() => {
    // Extract last 3 digits from hall ticket number
    const getLastThreeDigits = (v) => {
      if (!v) return null;
      const str = String(v).trim();
      // Extract all digits, then take last 3
      const digits = str.replace(/\D/g, "");
      if (digits.length < 3) return null;
      const lastThree = digits.slice(-3);
      const num = parseInt(lastThree, 10);
      return Number.isFinite(num) ? num : null;
    };

    return filteredMappings
      .map((m) => {
        const fromLastThree = getLastThreeDigits(m.fromRoll);
        const toLastThree = getLastThreeDigits(m.toRoll);
        return {
          from: fromLastThree,
          to: toLastThree,
          fromRoll: m.fromRoll, // Keep original for display
          toRoll: m.toRoll, // Keep original for display
          course: m.course || m.courseName,
          roomName: m.roomName,
          roomCode: m.roomCode,
          college: m.collegeName || m.college?.name,
        };
      })
      .filter((r) => r.from !== null && r.to !== null && r.from <= r.to);
  }, [filteredMappings]);

  const handleLoadStudents = async () => {
    if (
      !studentFilters.fromRegistrationNumber ||
      !studentFilters.toRegistrationNumber
    ) {
      setStudentsError("Please enter both From and To registration numbers");
      return;
    }

    setStudentsLoading(true);
    setStudentsError(null);

    try {
      const params = {
        fromRegistrationNumber: studentFilters.fromRegistrationNumber,
        toRegistrationNumber: studentFilters.toRegistrationNumber,
        status: "SUCCESS", // Only get successful payments
      };
      console.log("params", params);
      if (studentFilters.courseId) {
        // Find course name from courses list
        const selectedCourse = courses.find(
          (c) => (c._id || c.id) === studentFilters.courseId
        );
        if (selectedCourse) {
          params.course = selectedCourse.name || selectedCourse.code;
        }
      }

      const response =
        await examinationPaymentApi.getPaymentsByRegistrationRange(params);

      console.log("API Response:", response);

      if (response && response.success) {
        // Handle different response structures
        const students = response.data || response.students || [];
        console.log("Loaded students:", students);
        console.log("Students count:", students.length);
        console.log("Students array check:", Array.isArray(students));

        if (Array.isArray(students) && students.length > 0) {
          setLoadedStudents(students);
          setSeatingPlan([]);
          setStudentsError(null); // Clear any previous errors
          // Dynamically size rooms based on loaded students and per-room capacity
          const capacity = Math.max(1, classCapacity || 1);
          const availableRooms =
            (selectedCenterDetails && getRoomsCount(selectedCenterDetails)) ||
            numClasses ||
            1;
          const neededRooms = Math.max(
            1,
            Math.ceil(students.length / capacity)
          );
          setNumClasses(Math.min(availableRooms, neededRooms));
        } else {
          setLoadedStudents([]);
          setStudentsError(
            "No payment transactions found for the given registration number range"
          );
        }
      } else {
        setLoadedStudents([]);
        setStudentsError(
          response?.message || "Failed to load payment transactions"
        );
      }
    } catch (err) {
      const errorMsg =
        err.message ||
        err.response?.data?.error ||
        "Failed to load payment transactions";
      setStudentsError(errorMsg);
      console.error("Error loading payment transactions:", err);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch saved arrangements
  const fetchSavedArrangements = async () => {
    if (!selectedCenterForView) {
      setSavedArrangements([]);
      return;
    }

    setLoadingSaved(true);
    try {
      const response = await seatingArrangementsApi.getByCenter(selectedCenterForView, {
        status: "Active",
      });

      if (response.success) {
        setSavedArrangements(response.data || []);
      } else {
        showErrorMessage(response.message || "Failed to load saved arrangements");
        setSavedArrangements([]);
      }
    } catch (error) {
      console.error("Error fetching saved arrangements:", error);
      showErrorMessage("Failed to load saved arrangements");
      setSavedArrangements([]);
    } finally {
      setLoadingSaved(false);
    }
  };

  // Fetch saved arrangements when center changes
  useEffect(() => {
    if (activeTab === "saved" && selectedCenterForView) {
      fetchSavedArrangements();
    }
  }, [selectedCenterForView, activeTab]);

  // Auto-fill rooms/capacity when center changes (best-effort, non-blocking)
  useEffect(() => {
    if (!selectedCenterDetails) return;
    const rooms = getRoomsCount(selectedCenterDetails);
    const totalSeats = getTotalSeats(selectedCenterDetails);
    setNumClasses(rooms || 1);
    if (totalSeats && rooms) {
      const perRoom = Math.max(1, Math.floor(totalSeats / rooms));
      setClassCapacity(perRoom);
    } else if (totalSeats) {
      setClassCapacity(totalSeats);
    } else {
      setClassCapacity(30);
    }
  }, [selectedCenterDetails]);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Jumbling Centers
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Generate impartial seating across colleges and rooms to reduce
            malpractice
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="flex overflow-x-auto border-b border-gray-200">
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 min-w-max px-6 py-4 text-center border-b-2 font-medium transition-colors ${
              activeTab === "generate"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Generate Seating Plan
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 min-w-max px-6 py-4 text-center border-b-2 font-medium transition-colors ${
              activeTab === "saved"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Saved Arrangements
          </button>
        </div>

        <div className="p-6">
          {activeTab === "generate" && (
            <div className="space-y-6">
      <form
        onSubmit={handleGenerate}
        className="bg-white rounded-lg shadow-md border p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Examination Center
            </label>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={centersLoading || !centers.length}
              required
            >
              {centersLoading && <option value="">Loading centers...</option>}
              {!centersLoading && centers.length === 0 && (
                <option value="">No centers available</option>
              )}
              {centers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.code ? `(${c.code})` : ""}
                </option>
              ))}
            </select>
            {centersError && (
              <p className="text-xs text-red-600 mt-1">{centersError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rooms (from center)
            </label>
            <input
              type="text"
              value={
                selectedCenterDetails
                  ? getRoomsCount(selectedCenterDetails) || "-"
                  : "-"
              }
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity (total seats)
            </label>
            <input
              type="text"
              value={
                selectedCenterDetails
                  ? getTotalSeats(selectedCenterDetails) || "-"
                  : "-"
              }
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
            />
          </div>
        </div>

        {/* Student Load Section - Similar to Internal Exam Setup */}
        <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Load Students
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number From*
              </label>
              <input
                type="text"
                value={studentFilters.fromRegistrationNumber}
                onChange={(e) =>
                  setStudentFilters((prev) => ({
                    ...prev,
                    fromRegistrationNumber: e.target.value,
                  }))
                }
                placeholder="e.g., REG2025001"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number To*
              </label>
              <input
                type="text"
                value={studentFilters.toRegistrationNumber}
                onChange={(e) =>
                  setStudentFilters((prev) => ({
                    ...prev,
                    toRegistrationNumber: e.target.value,
                  }))
                }
                placeholder="e.g., REG2025100"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course (Optional)
              </label>
              <select
                value={studentFilters.courseId}
                onChange={(e) =>
                  setStudentFilters((prev) => ({
                    ...prev,
                    courseId: e.target.value,
                  }))
                }
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={loadingCourses}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option
                    key={course._id || course.id}
                    value={course._id || course.id}
                  >
                    {course.name || course.code || "-"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleLoadStudents}
                disabled={
                  !studentFilters.fromRegistrationNumber ||
                  !studentFilters.toRegistrationNumber ||
                  studentsLoading
                }
                className="w-full px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {studentsLoading ? "Loading..." : "Load Students"}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={
                !selectedCenter || centersLoading || !loadedStudents.length
              }
            >
              Generate Seating Plan
            </button>
            {seatingPlan.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !selectedCenter}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Seating Plan"}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Download Seating (CSV)
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Print QR Codes
                </button>
              </>
            )}
          </div>
          {studentsError && (
            <p className="text-sm text-red-600 mt-2">{studentsError}</p>
          )}
          <p className="text-xs text-gray-500">
            Enter registration number range (e.g., REG202500001 to
            REG202500100), optionally filter by course, then click "Load
            Students". Only students with successful payment status will be
            loaded.
          </p>
        </div>
      </form>

      {/* Loaded Students Table - Only show if seating plan is not generated */}
      {Array.isArray(loadedStudents) &&
      loadedStudents.length > 0 &&
      seatingPlan.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border mt-6">
          <div className="p-6 border-b flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-800">
              Loaded Students
            </h4>
            <span className="text-sm text-gray-500">
              {loadedStudents.length} student(s) loaded
            </span>
          </div>
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Payment Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadedStudents.map((student, idx) => (
                  <tr
                    key={`${
                      student.registrationNumber ||
                      student.registration_number ||
                      idx
                    }`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.registrationNumber ||
                        student.registration_number ||
                        "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.name || student.student_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.course || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.semester || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{student.amount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (student.payment_status || student.paymentStatus) ===
                          "SUCCESS"
                            ? "bg-green-100 text-green-800"
                            : (student.payment_status ||
                                student.paymentStatus) === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : (student.payment_status ||
                                student.paymentStatus) === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {student.payment_status || student.paymentStatus || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : loadedStudents &&
        loadedStudents.length === 0 &&
        !studentsLoading &&
        !studentsError &&
        seatingPlan.length === 0 ? (
        <div className="bg-white rounded-lg border p-6 mt-6 text-gray-600">
          No students loaded. Please click "Load Students" to fetch students.
        </div>
      ) : null}

      {/* Hidden printable QR code component - Always render but hide when no seating plan */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px", width: "210mm", opacity: seatingPlan.length > 0 ? 1 : 0, pointerEvents: "none" }}>
        <style>
          {`
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              .qr-print-sheet {
                page-break-inside: avoid;
              }
              .qr-card-print {
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
          `}
        </style>
        <div ref={qrPrintRef} className="p-8">
          {seatingPlan.length > 0 ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedCenterDetails?.name || "Examination Center"}{" "}
                  {selectedCenterDetails?.code ? `(${selectedCenterDetails.code})` : ""}
                </h2>
                <p className="text-lg mt-2">Student QR Codes for Booklet Sheets</p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "20px",
                }}
                className="qr-print-sheet"
              >
                {seatingPlan.map((student, idx) => (
              <div
                key={idx}
                style={{
                  border: "2px solid #000",
                  padding: "15px",
                  textAlign: "center",
                  minHeight: "220px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                className="qr-card-print"
              >
                <div style={{ fontSize: "11px", lineHeight: "1.5" }}>
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    Roll Number: {student.registrationNumber || student.rollNumber || "-"}
                  </div>
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    Name: {student.name || "-"}
                  </div>
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    Course: {student.course || "-"}
                  </div>
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    Room: {student.roomNumber || "-"}
                  </div>
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    Seat: {student.seatNumber || "-"}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                  <QRCodeSVG
                    value={generateQRData(student)}
                    size={150}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              </div>
                ))}
              </div>
            </>
          ) : (
            <div>No seating plan available</div>
          )}
        </div>
      </div>

      {seatingPlan.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md border">
          <div className="p-6 border-b flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-800">
              Seating Arrangement
            </h4>
            <span className="text-sm text-gray-500">
              Assigned {seatingPlan.length} students across {numClasses} rooms
            </span>
          </div>
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Seat
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    QR Code
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seatingPlan.map((row, idx) => (
                  <tr
                    key={`${row.registrationNumber || row.rollNumber || idx}-${
                      row.roomNumber
                    }-${row.seatNumber}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.registrationNumber || row.rollNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.course || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.roomNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.seatNumber}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <QRCodeSVG
                          value={generateQRData(row)}
                          size={60}
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-6 text-gray-600">
          Generate to view seating allocations across rooms.
        </div>
      )}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Examination Center
                </label>
                <select
                  value={selectedCenterForView}
                  onChange={(e) => setSelectedCenterForView(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a center</option>
                  {centers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.code ? `(${c.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {loadingSaved ? (
                <div className="text-center py-8 text-gray-500">
                  Loading saved arrangements...
                </div>
              ) : savedArrangements.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md border">
                  <div className="p-6 border-b flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Saved Seating Arrangements
                    </h4>
                    <span className="text-sm text-gray-500">
                      {savedArrangements.length} arrangement(s)
                    </span>
                  </div>
                  <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Roll Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Room
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Seat
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                            QR Code
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {savedArrangements.map((arrangement, idx) => (
                          <tr key={arrangement._id || idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {arrangement.registrationNumber || arrangement.rollNumber || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {arrangement.studentName || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {arrangement.course || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {arrangement.roomNumber || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {arrangement.seatNumber || "-"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {arrangement.qrCodeImage ? (
                                <img
                                  src={arrangement.qrCodeImage}
                                  alt="QR Code"
                                  className="w-20 h-20 mx-auto"
                                />
                              ) : arrangement.qrCodeData ? (
                                <QRCodeSVG
                                  value={arrangement.qrCodeData}
                                  size={80}
                                  level="M"
                                  includeMargin={true}
                                />
                              ) : (
                                <span className="text-xs text-gray-400">No QR</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : selectedCenterForView ? (
                <div className="bg-white rounded-lg border p-6 text-gray-600 text-center">
                  No saved arrangements found for this center.
                </div>
              ) : (
                <div className="bg-white rounded-lg border p-6 text-gray-600 text-center">
                  Please select an examination center to view saved arrangements.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JumblingCenters;
