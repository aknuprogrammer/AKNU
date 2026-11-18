import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle,
  XCircle,
  Edit,
  Search,
  RefreshCw,
  User,
  BookOpen,
  Mail,
  Phone,
  FileText,
  X,
  Save,
  AlertCircle,
  Trash2,
  Eye,
  CreditCard,
  Printer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EditAdmission from "./EditAdmission";
import AcknowledgementModal from "./College_and_fees.jsx/AcknowledgementModal";
import { BASE_URL } from "../../config/urls";
import { collegesApi, studentsApi } from "../../services/apiService";

const ListOfAdmissions = () => {
  const [students, setStudents] = useState([]);
  const [filterType, setFilterType] = useState("hallTicketNo");
  const [filterValue, setFilterValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [ackStudent, setAckStudent] = useState(null); // student to show in modal
  const [showAckModal, setShowAckModal] = useState(false);

  const [selectedCollege, setSelectedCollege] = useState(
    localStorage.getItem("selectedCollege") || "" // 👈 restore saved college
  );
  const [colleges, setColleges] = useState([]);

  // useEffect(() => {
  //   fetchStudents();
  // }, []);

  // const fetchStudents = async () => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);
  //     const res = await fetch(`${BASE_URL}/students/getAll`);
  //     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  //     const data = await res.json();
  //     setStudents(data || []);
  //   } catch (err) {
  //     console.error("Error fetching students:", err);
  //     setError("Failed to load student data. Please try again.");
  //     setStudents([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // 🔹 Fetch colleges on mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await collegesApi.getAll();
        setColleges(data || []);
      } catch (err) {
        console.error("Error fetching colleges:", err);
      }
    };
    fetchColleges();
  }, []);

  // 🔹 Fetch students whenever selectedCollege changes
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let data;
      if (selectedCollege) {
        // Call by college
        const res = await studentsApi.getByCollege(selectedCollege);
        data = res.students || []; // <-- extract array
      } else {
        // Call all students
        const res = await fetch(`${BASE_URL}/students/getAll`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        data = await res.json(); // assuming this returns an array directly
      }

      setStudents(data); // now always an array
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load student data. Please try again.");
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedCollege]);

  const filteredStudents = useMemo(() => {
    const q = (filterValue || "").toString().trim().toLowerCase();
    if (!q) return students;

    return students.filter((student) => {
      if (!student) return false;

      const get = (path) => {
        const val = student[path];
        return val === null || val === undefined ? "" : String(val);
      };

      switch (filterType) {
        case "hallTicketNo":
          return get("hallTicketNo").toLowerCase().includes(q);
        case "referenceNumber":
          return get("referenceNumber").toLowerCase().includes(q);
        case "phone":
          return get("phone").includes(q);
        case "name": {
          const fullName = `${get("firstName")} ${get("middleName")} ${get(
            "lastName"
          )}`.toLowerCase();
          return fullName.includes(q);
        }
        case "email":
          return get("email").toLowerCase().includes(q);
        default:
          return true;
      }
    });
  }, [students, filterType, filterValue]);

  const handleCollegeChange = (e) => {
    const value = e.target.value;
    setSelectedCollege(value);
    localStorage.setItem("selectedCollege", value);
  };

  const handleSaveDocuments = async (student) => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/students/${student._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
      });

      if (!res.ok) throw new Error("Failed to save document verification");

      // Update the student in the list
      setStudents((prev) =>
        prev.map((s) => (s._id === student._id ? student : s))
      );

      setShowDocsModal(false);
    } catch (err) {
      console.error("Error saving document verification:", err);
      alert("Failed to save verification. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderDocStatus = (value) =>
    (value || "").toString().toLowerCase() === "yes" ? (
      <CheckCircle className="text-green-500 w-4 h-4" />
    ) : (
      <XCircle className="text-red-500 w-4 h-4" />
    );

  const getStatusStyle = (status) => {
    switch (status) {
      case "Admitted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const openDocsModal = (student) => {
    setSelectedStudent(student);
    setShowDocsModal(true);
  };

  const DocumentModal = () => {
    if (!showDocsModal || !selectedStudent) return null;

    const handleVerificationChange = (doc, value) => {
      setSelectedStudent((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [doc]: {
            ...prev.documents[doc],
            verified: value,
          },
        },
      }));
    };

    const handleCommentChange = (doc, comment) => {
      setSelectedStudent((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [doc]: {
            ...prev.documents[doc],
            comment,
          },
        },
      }));
    };

    // Count verified documents
    const verifiedCount = Object.values(selectedStudent.documents || {}).filter(
      (doc) => doc.verified === "verified" && doc.submitted === "yes"
    ).length;

    const totalSubmitted = Object.values(
      selectedStudent.documents || {}
    ).filter((doc) => doc.submitted === "yes").length;

    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Document Verification
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {verifiedCount} of {totalSubmitted} documents verified
              </p>
            </div>
            <button
              onClick={() => setShowDocsModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Student Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Student Name
                </h4>
                <p className="text-gray-800 font-medium">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Reference Number
                </h4>
                <p className="text-gray-800">
                  {selectedStudent.applicationNumber || "-"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Hall Ticket No
                </h4>
                <p className="text-gray-800">
                  {selectedStudent.hallTicketNo || "-"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Email
                </h4>
                <p className="text-gray-800">{selectedStudent.email || "-"}</p>
              </div>
            </div>

            {/* Documents */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                Document Verification
              </h4>
              <div className="space-y-4">
                {Object.entries(selectedStudent.documents || {}).map(
                  ([doc, val]) => (
                    <div key={doc} className="p-4 border rounded-lg bg-gray-50">
                      {/* Document Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {doc.replace(/([A-Z])/g, " $1")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              val.submitted === "yes"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {val.submitted === "yes"
                              ? "Submitted"
                              : "Not Submitted"}
                          </span>
                          {val.submitted === "yes" && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                val.verified === "verified"
                                  ? "bg-green-200 text-green-800"
                                  : "bg-red-200 text-red-800"
                              }`}
                            >
                              {val.verified === "verified"
                                ? "Verified"
                                : "Not Verified"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Verification & Comment */}
                      {val.submitted === "yes" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">
                              Verification Status
                            </label>
                            <div className="flex items-center space-x-4">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`${doc}-verification`}
                                  value="verified"
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                  checked={val.verified === "verified"}
                                  onChange={() =>
                                    handleVerificationChange(doc, "verified")
                                  }
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  Verified
                                </span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`${doc}-verification`}
                                  value="not_verified"
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                  checked={val.verified === "not_verified"}
                                  onChange={() =>
                                    handleVerificationChange(
                                      doc,
                                      "not_verified"
                                    )
                                  }
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  Not Verified
                                </span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">
                              Admin Comments
                            </label>
                            <input
                              type="text"
                              placeholder="Add comments if any"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              value={val.comment || ""}
                              onChange={(e) =>
                                handleCommentChange(doc, e.target.value)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveDocuments(selectedStudent)}
                disabled={saving}
                className="px-4 py-2.5 bg-[#525B88] text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Verification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const navigate = useNavigate();

  // const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const handlePayment = (rowData) => {
    // Navigate to the payment page and pass the row data as state
    navigate("/admission-payment-fees", { state: { rowData } });
  };

  const handlePrintAcknowledgement = (student) => {
    // Only open if admissionPayment exists
    if (!student?.admissionPayment) {
      // optional: toast or modal to inform user
      alert("No payment found for this student. Cannot print acknowledgement.");
      return;
    }

    setAckStudent(student);
    setShowAckModal(true);
  };

  const handleCloseAckModal = () => {
    setShowAckModal(false);
    setAckStudent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-12xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center">
              <div className="rounded-lg bg-indigo-100 p-3 mr-4">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Applications</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {students.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Admitted</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {students?.filter((s) => s.status === "Admitted").length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center">
              <div className="rounded-lg bg-yellow-100 p-3 mr-4">
                <BookOpen className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {
                    students?.filter((s) => !s.status || s.status === "pending")
                      .length
                  }
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center">
              <div className="rounded-lg bg-red-100 p-3 mr-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {students?.filter((s) => s.status === "rejected").length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="flex justify-between bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Filter Applications
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <select
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-48"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="hallTicketNo">Hall Ticket No</option>
                <option value="referenceNumber">Reference No</option>
                <option value="phone">Phone</option>
              </select>

              <div className="relative w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                  placeholder={`Search by ${filterType
                    .replace(/([A-Z])/g, " $1")
                    .toLowerCase()}...`}
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
              </div>

              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full md:w-auto"
                onClick={() => {
                  setFilterValue("");
                  setFilterType("hallTicketNo");
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
          {/* College Filter */}
          <div className="bg-white mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Filter by College
            </h2>
            <select
              value={selectedCollege}
              onChange={handleCollegeChange}
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
            >
              <option value="">All Colleges</option>
              {colleges.map((college) => (
                <option key={college._id} value={college._id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-3">⚠️</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchStudents}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full rounded-lg">
                <thead className="bg-[#525B88] text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                      Reference No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                      Hall Ticket No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                      College
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Result
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                      Hostel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                      Transport
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    {/* Frozen Right Column */}
                    <th className="sticky right-0 z-20 bg-[#525B88] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const hasPaid = !!student.admissionPayment;
                      let totalFees = 0;
                      if (
                        hasPaid &&
                        student.admissionPayment.selectedFees?.length > 0
                      ) {
                        totalFees =
                          student.admissionPayment.selectedFees.reduce(
                            (sum, fee) => sum + (fee.amount || 0),
                            0
                          );
                      }

                      return (
                        <tr
                          key={student._id}
                          className={`hover:bg-gray-50 transition-colors ${
                            hasPaid ? "bg-green-50" : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {student.referenceNumber || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.hallTicketNo || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {student.firstName || ""} {student.lastName || ""}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-gray-400 mr-1" />
                              {student.phone || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-gray-400 mr-1" />
                              {student.email || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {student.academicRecords[0]?.collegeName || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {student.academicRecords[0]?.result || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="ml-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                              {Object.keys(student.documents || {}).length}{" "}
                              Admitted
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {(student.requiresHostel || "-").toUpperCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {(student.requiresTransport || "-").toUpperCase()}
                          </td>

                          {/* Payment Status Column */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center ${
                                hasPaid
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {hasPaid ? <>Paid: ₹{totalFees}</> : "Pending"}
                            </span>
                          </td>

                          {/* Status Dropdown */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              className={`text-xs px-3 py-1.5 rounded-full border ${getStatusStyle(
                                student.status || "pending"
                              )} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                              defaultValue={student.status || "pending"}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                setStudents((prev) =>
                                  prev.map((s) =>
                                    s._id === student._id
                                      ? { ...s, status: newStatus }
                                      : s
                                  )
                                );
                                try {
                                  await fetch(
                                    `${BASE_URL}/students/${student._id}`,
                                    {
                                      method: "PUT",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        ...student,
                                        status: newStatus,
                                      }),
                                    }
                                  );
                                } catch (err) {
                                  console.error(
                                    "Failed to update status:",
                                    err
                                  );
                                }
                              }}
                            >
                              <option value="Admitted">Admitted</option>
                              <option value="pending">Pending</option>
                              <option value="rejected">Rejected</option>
                              <option value="transfered">Transfered</option>
                            </select>
                          </td>

                          {/* Frozen Right Column */}
                          <td
                            className={`sticky right-0 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3 ${
                              hasPaid
                                ? "bg-green-50  hover:bg-gray-50 "
                                : "  bg-white "
                            }`}
                          >
                            <button
                              onClick={() =>
                                navigate("/edit-admission", {
                                  state: { student },
                                })
                              }
                              className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handlePayment(student)}
                              className={`text-green-600 hover:text-green-900 flex items-center gap-1 ${
                                hasPaid ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              title="Make Payment"
                              disabled={hasPaid}
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                            {/* Print Acknowledgement Button */}
                            <button
                              onClick={() =>
                                handlePrintAcknowledgement(student)
                              }
                              className="text-blue-600 hover:text-blue-900"
                              title="Print Acknowledgement"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="11" className="px-6 py-12 text-center">
                        <div className="text-gray-400 mb-2">
                          No records found
                        </div>
                        <p className="text-gray-500 text-sm">
                          Try adjusting your search or filter to find what
                          you're looking for.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Document Modal */}
      <DocumentModal />
      {showAckModal && ackStudent && (
        <AcknowledgementModal
          student={ackStudent}
          onClose={handleCloseAckModal}
        />
      )}
    </div>
  );
};

export default ListOfAdmissions;
