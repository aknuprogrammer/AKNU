import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { aknuAdikavi, aknuLogo } from "../../assets";
import {
  initiateEasebuzzPayment,
  generateTransactionId,
  redirectToPayment
} from "../../utils/easebuzzPayment";

// Fee rate for revaluation (per subject)
const REVALUATION_FEE_PER_SUBJECT = 300; // ₹300 per subject for revaluation

const RevaluationApplication = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [foundStudent, setFoundStudent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [previousResults, setPreviousResults] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]); // Array of { subjectId, subjectName, grade, semester, batchId }
  const [showPreview, setShowPreview] = useState(false);

  const resultRef = useRef();
  const previewRef = useRef();

  // Generate CAPTCHA
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(result);
    setCaptchaInput("");
    setCaptchaError("");
  };

  // Initialize CAPTCHA on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Handle student search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a registration number");
      return;
    }

    // Validate CAPTCHA
    if (!captchaInput.trim()) {
      setCaptchaError("Please enter the CAPTCHA code");
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaValue.toUpperCase()) {
      setCaptchaError("CAPTCHA code is incorrect. Please try again.");
      generateCaptcha();
      return;
    }

    setCaptchaError("");
    setLoading(true);
    setError("");
    setSelectedSubjects([]);

    try {
      // First, fetch student data
      const studentResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}api/students/registration/${searchTerm}`
      );

      if (studentResponse.data.success && studentResponse.data.data) {
        const studentData = studentResponse.data.data;
        setFoundStudent(studentData);

        // Fetch combined results to show completed exams
        try {
          const resultsResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}api/examination/combined-results`,
            {
              params: {
                registrationNumber: searchTerm,
              },
            }
          );

          if (resultsResponse.data.success && resultsResponse.data.data) {
            // Store the combined results array directly
            setPreviousResults(Array.isArray(resultsResponse.data.data) ? resultsResponse.data.data : []);
            console.log("Combined results fetched:", resultsResponse.data.data);
          } else {
            setPreviousResults([]);
            setError("No previous results found. You need completed exam results to apply for revaluation.");
          }
        } catch (resultsErr) {
          console.error("Error fetching combined results:", resultsErr);
          setPreviousResults([]);
          if (resultsErr.response?.status === 404) {
            setError("Results endpoint not found. Please contact support.");
          } else {
            setError("Failed to load previous results. Please try again later.");
          }
        }
      } else {
        setFoundStudent(null);
        setError("No student found for the provided registration number.");
      }
    } catch (err) {
      console.error("Error fetching student:", err);
      setError("Server error. Please try again later.");
      setFoundStudent(null);
      setPreviousResults([]);
    } finally {
      setLoading(false);
      generateCaptcha();
    }
  };

  // Extract all subjects from combined results
  const getAllSubjectsFromResults = () => {
    const allSubjects = [];
    
    // previousResults is now an array of result objects directly from combined-results API
    previousResults.forEach((result) => {
      // Check if result has required fields
      if (!result.subjectId || !result.subjectId._id) {
        console.warn("Result missing subjectId:", result);
        return;
      }

      const subjectId = result.subjectId._id;
      const subjectName = result.subjectId.name || result.subjectId.code || "Unknown Subject";
      const subjectCode = result.subjectId.code || "";
      
      // Calculate grade from marks (if needed)
      let grade = "N/A";
      if (result.status === "PASS" && result.isPass) {
        const percentage = (result.totalMarks / result.maxMarks) * 100;
        if (percentage >= 90) grade = "A+";
        else if (percentage >= 80) grade = "A";
        else if (percentage >= 70) grade = "B+";
        else if (percentage >= 60) grade = "B";
        else if (percentage >= 50) grade = "C+";
        else if (percentage >= 40) grade = "C";
        else grade = "D";
      } else if (result.status === "FAIL") {
        grade = "F";
      } else if (result.status === "ABSENT") {
        grade = "ABS";
      }

      // Get semester from courseStreamMappingId
      const semester = result.courseStreamMappingId?.semesterNumber 
        ? `${result.courseStreamMappingId.semesterNumber}${getOrdinalSuffix(result.courseStreamMappingId.semesterNumber)} Semester`
        : "N/A";

      // Get exam type from internalExamSetupId
      const examType = result.internalExamSetupId?.examType || "Regular";

      // Create unique key for this subject result
      const resultId = result._id || `${subjectId}_${result.courseStreamMappingId?._id || 'unknown'}`;

      allSubjects.push({
        subjectId: subjectId, // Use subjectId._id for payment
        subjectName: subjectName,
        subjectCode: subjectCode,
        grade: grade,
        marks: result.totalMarks || 0,
        internalMarks: result.internalMarks || 0,
        externalMarks: result.externalMarks || 0,
        maxMarks: result.maxMarks || 100,
        passMarks: result.passMarks || 40,
        status: result.status || "N/A", // PASS, FAIL, ABSENT
        isPass: result.isPass || false,
        semester: semester,
        examType: examType,
        resultId: resultId, // Unique ID for this specific result record
        originalResult: result,
      });
    });

    return allSubjects;
  };

  // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  // Toggle subject selection
  const toggleSubjectSelection = (subject) => {
    // Use resultId as unique key since each result is a separate record
    const subjectKey = subject.resultId;
    const isSelected = selectedSubjects.some(
      (s) => s.resultId === subjectKey
    );

    if (isSelected) {
      setSelectedSubjects(
        selectedSubjects.filter(
          (s) => s.resultId !== subjectKey
        )
      );
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  // Handle payment initiation
  const handlePaymentInitiation = async () => {
    try {
      if (!foundStudent) {
        alert("Please search for a student first.");
        return;
      }

      if (selectedSubjects.length === 0) {
        alert("Please select at least one subject for revaluation.");
        return;
      }

      // Calculate total fee
      const totalAmount = selectedSubjects.length * REVALUATION_FEE_PER_SUBJECT;

      if (totalAmount <= 0) {
        alert("Invalid payment amount. Please check your subject selections.");
        return;
      }

      setPaymentProcessing(true);
      setPaymentError("");

      // Generate unique transaction ID
      const transactionId = generateTransactionId();

      // Prepare success and failure URLs
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/revaluation-application/payment-success?txnid=${transactionId}`;
      const failureUrl = `${baseUrl}/revaluation-application/payment-failure?txnid=${transactionId}`;

      // Format phone number
      let phoneNumber = foundStudent.phone || foundStudent.mobile || "";
      phoneNumber = phoneNumber.replace(/[\s-]/g, "");
      if (phoneNumber.length === 10 && !phoneNumber.startsWith("+")) {
        phoneNumber = `+91${phoneNumber}`;
      } else if (phoneNumber.length < 5) {
        phoneNumber = "+919999999999";
      }

      // Prepare payment data
      const paymentData = {
        amount: totalAmount,
        firstname: capitalize(foundStudent.nameSSC || "").split(" ")[0] || "Student",
        email: foundStudent.email || "student@example.com",
        phone: phoneNumber,
        registration_number: foundStudent.registrationNumber || "",
        course: foundStudent.selectCourse || "",
        semester: foundStudent.semesterYear || "",
        // Send array of result IDs for revaluation
        // Each result ID represents a specific exam result that needs revaluation
        revaluation_subjects: selectedSubjects.map((sub) => sub.resultId), // Array of result _id values
        productinfo: `Revaluation Application ${selectedSubjects.length} Subjects`,
        surl: successUrl,
        furl: failureUrl,
      };

      console.log("Initiating revaluation payment with data:", paymentData);

      // Call backend API to initiate payment
      const paymentResponse = await initiateEasebuzzPayment(paymentData);

      if (paymentResponse.success && paymentResponse.paymentUrl) {
        // Store transaction details in localStorage
        const storedData = {
          transactionId: paymentResponse.transactionId || transactionId,
          amount: totalAmount,
          studentData: {
            registrationNumber: foundStudent.registrationNumber,
            name: foundStudent.nameSSC,
            course: foundStudent.selectCourse,
            semester: foundStudent.semesterYear,
            email: foundStudent.email,
            phone: phoneNumber,
          },
          subjects: {
            revaluation: selectedSubjects,
            count: selectedSubjects.length,
          },
          timestamp: new Date().toISOString(),
        };

        localStorage.setItem(
          `payment_${paymentResponse.transactionId || transactionId}`,
          JSON.stringify(storedData)
        );

        // Redirect to Easebuzz payment page
        redirectToPayment(paymentResponse.paymentUrl);
      } else {
        const errorMessage = paymentResponse.message || "Failed to initiate payment. Please try again.";
        setPaymentError(errorMessage);
        alert(errorMessage);
        setPaymentProcessing(false);
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      const errorMessage = error.message || "An error occurred while processing payment. Please try again.";
      setPaymentError(errorMessage);
      alert(errorMessage);
      setPaymentProcessing(false);
    }
  };

  const capitalize = (str) => {
    if (typeof str !== "string" || !str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const numberToWords = (num) => {
    const ones = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
      "Seventeen", "Eighteen", "Nineteen",
    ];
    const tens = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
    ];

    if (num === 0) return "Zero";
    if (num < 20) return ones[num];
    if (num < 100) {
      return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "");
    }
    if (num < 1000) {
      return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " " + numberToWords(num % 100) : "");
    }
    if (num < 100000) {
      return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 !== 0 ? " " + numberToWords(num % 1000) : "");
    }
    if (num < 10000000) {
      return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 !== 0 ? " " + numberToWords(num % 100000) : "");
    }
    return numberToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 !== 0 ? " " + numberToWords(num % 10000000) : "");
  };

  const allSubjects = getAllSubjectsFromResults();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-teal-800 mb-2">
          Revaluation Application
        </h2>
        <p className="text-gray-600 mb-4">
          Enter your registration number to view completed exams and apply for revaluation
        </p>

        <div className="flex flex-col gap-4 mb-4 no-print">
          <div className="flex gap-2 items-center justify-center flex-wrap">
            <input
              type="text"
              placeholder="Enter registration number..."
              className="flex-1 min-w-[200px] max-w-[300px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#21605A] focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />

            {/* CAPTCHA Section */}
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <div className="bg-gray-50 border-2 border-gray-300 rounded-md px-3 py-2 flex items-center justify-center min-w-[110px] h-[42px]">
                  <span className="text-lg font-bold text-gray-800 tracking-wider select-none">
                    {captchaValue}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={generateCaptcha}
                className="p-2.5 text-[#21605A] hover:text-[#1a4a45] hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
                title="Refresh CAPTCHA"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Enter CAPTCHA"
                className="w-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#21605A] focus:outline-none uppercase"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  setCaptchaError("");
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                maxLength={5}
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-[#21605A] text-white rounded-md hover:bg-[#1a4a45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Searching...
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {captchaError && (
            <p className="text-red-500 text-sm flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {captchaError}
            </p>
          )}
        </div>

        {error && (
          <p className="mt-2 text-red-500 no-print flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>

      {foundStudent && (
        <div className="space-y-6">
          <div ref={resultRef} className="border border-gray-200 rounded-lg p-6 bg-white">
            {/* Student Information */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Student Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="font-medium text-lg">
                    {foundStudent.registrationNumber || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-lg">
                    {capitalize(foundStudent.nameSSC) || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">College</p>
                  <p className="font-medium text-lg">
                    {capitalize(foundStudent.selectCollege) || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium text-lg">
                    {capitalize(foundStudent.selectCourse) || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Stream</p>
                  <p className="font-medium text-lg">
                    {capitalize(foundStudent.stream || foundStudent.selectStream) || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Current Semester</p>
                  <p className="font-medium text-lg">
                    {foundStudent.semesterYear || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Completed Exams - Select Subjects for Revaluation */}
            {allSubjects.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Completed Exams - Select Subjects for Revaluation
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select the subjects you want to apply for revaluation. Fee: ₹{REVALUATION_FEE_PER_SUBJECT} per subject.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#21605A]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                          Select
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allSubjects.map((subject, index) => {
                        const isSelected = selectedSubjects.some(
                          (s) => s.resultId === subject.resultId
                        );

                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {capitalize(subject.subjectName) || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSubjectSelection(subject)}
                                  className={`w-5 h-5 border-gray-300 rounded focus:ring-2 cursor-pointer ${
                                    isSelected
                                      ? "text-green-600 bg-green-600 border-green-600 focus:ring-green-500"
                                      : "text-gray-300 border-gray-300 focus:ring-[#21605A]"
                                  }`}
                                  style={isSelected ? { accentColor: "#16a34a" } : {}}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  No completed exam results found. You need to have completed exams to apply for revaluation.
                </p>
              </div>
            )}

            {/* Fee Summary */}
            {selectedSubjects.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-gray-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Fee Summary
                </h3>
                <div className="bg-green-50/50 rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-gray-700 font-medium text-base">
                        Revaluation Fee ({selectedSubjects.length} Subject{selectedSubjects.length > 1 ? 's' : ''}):
                      </span>
                      <span className="text-gray-900 font-semibold text-base ml-16">
                        ₹{(selectedSubjects.length * REVALUATION_FEE_PER_SUBJECT).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="border-t border-gray-300 my-3"></div>

                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-semibold text-gray-800">
                          Total Fee:
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          ₹{(selectedSubjects.length * REVALUATION_FEE_PER_SUBJECT).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-500 italic">
                          {numberToWords(selectedSubjects.length * REVALUATION_FEE_PER_SUBJECT)} Rupees Only
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-green-600 mt-4 pt-4">
                      <p className="text-xs text-gray-500 text-center">
                        Generated on: {new Date().toLocaleDateString("en-GB")} at{" "}
                        {new Date().toLocaleTimeString("en-GB")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mb-8 flex flex-wrap gap-4 justify-end no-print">
              <button
                onClick={handlePaymentInitiation}
                disabled={paymentProcessing || !foundStudent || selectedSubjects.length === 0}
                className={`px-6 py-3 bg-[#21605A] text-white rounded-md hover:bg-[#1a4a45] transition-colors flex items-center font-medium ${
                  paymentProcessing || !foundStudent || selectedSubjects.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {paymentProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                )}
              </button>
              {paymentError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md w-full">
                  <p className="text-red-800 text-sm">{paymentError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!foundStudent && !loading && (
        <div className="mt-8 text-center text-gray-500 no-print">
          <div className="bg-gray-50 p-8 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-lg">
              Please enter your registration number to search for completed exams and apply for revaluation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevaluationApplication;

