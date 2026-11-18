import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config/urls";
import CounsellorForm from "./College_and_fees.jsx/CounsellorForm";

const EditAdmissionPage = ({ campuses = [], courses = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const studentFromState = location.state?.student;

  const [editedStudent, setEditedStudent] = useState(studentFromState || null);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [viewDocument, setViewDocument] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState({
    counsellorName: "",
    counsellorId: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCounsellorSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    // Optional: basic validation
    if (!formData.counsellorName || !formData.counsellorId) {
      setErrors({
        counsellorName: !formData.counsellorName ? "Required" : "",
        counsellorId: !formData.counsellorId ? "Required" : "",
      });
      return;
    }

    // Update editedStudent with counsellor data
    setEditedStudent((prev) => ({
      ...prev,
      counsellor: {
        counsellorName: formData.counsellorName,
        counsellorId: formData.counsellorId,
      },
    }));

    alert("Counsellor details added/updated!");
  };

  useEffect(() => {
    if (editedStudent?.campus?._id && Array.isArray(courses)) {
      const campusCourses = courses.filter(
        (course) => course.campus === editedStudent.campus._id
      );
      setFilteredCourses(campusCourses);
    } else {
      setFilteredCourses([]);
    }
  }, []);

  const handleDocumentVerification = (index, status) => {
    setEditedStudent((prev) => {
      const updatedDocuments = [...prev.documents];
      updatedDocuments[index] = {
        ...updatedDocuments[index],
        verified: status,
        verifiedAt: status === "verified" ? new Date().toISOString() : null,
      };
      return { ...prev, documents: updatedDocuments };
    });
  };

  const handleDocumentComment = (index, comment) => {
    setEditedStudent((prev) => {
      const updatedDocuments = [...prev.documents];
      updatedDocuments[index] = { ...updatedDocuments[index], comment };
      return { ...prev, documents: updatedDocuments };
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setSaving(true);

  //   try {
  //     const response = await fetch(
  //       `${BASE_URL}/students/${editedStudent._id}`,
  //       {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(editedStudent), // includes updated documents
  //       }
  //     );

  //     const data = await response.json();
  //     if (!response.ok) throw new Error(data.error || "Update failed");

  //     alert("Student updated successfully!");
  //   } catch (err) {
  //     console.error(err);
  //     alert("Error updating student: " + err.message);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if counsellor details are entered
    if (!formData.counsellorName || !formData.counsellorId) {
      alert(
        "Please enter both Counsellor Name and Counsellor ID before saving."
      );
      return; // Stop execution
    }

    setSaving(true);
    try {
      // merge counsellor details into editedStudent
      const updatedStudent = {
        ...editedStudent,
        counsellor: {
          counsellorName: formData.counsellorName,
          counsellorId: formData.counsellorId,
        },
      };

      const response = await fetch(
        `${BASE_URL}/students/${editedStudent._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedStudent),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed");

      alert("Student updated successfully!");
      setEditedStudent(updatedStudent);
    } catch (err) {
      console.error(err);
      alert("Error updating student: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  const getDocumentUrl = (doc) => {
    if (!doc?.file) return null;

    // If doc.file is already a base64 string
    if (typeof doc.file === "string") {
      const mimeType = doc.fileType || "application/pdf";
      return `data:${mimeType};base64,${doc.file}`;
    }

    // If doc.file is a buffer (old format)
    if (doc.file.data) {
      try {
        const bytes = new Uint8Array(doc.file.data);
        let binary = "";
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(
            null,
            bytes.subarray(i, i + chunkSize)
          );
        }
        const base64String = btoa(binary);
        const mimeType = doc.file.mimetype || doc.fileType || "application/pdf";
        return `data:${mimeType};base64,${base64String}`;
      } catch (err) {
        console.error("Error converting buffer to base64:", err);
        return null;
      }
    }

    return null;
  };

  const getFileType = (doc) => {
    if (doc.name) {
      const ext = doc.name.split(".").pop().toLowerCase();
      if (["pdf"].includes(ext)) return "pdf";
      if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext))
        return "image";
      return "other";
    }
    return "other";
  };

  const openDocumentView = (document) => {

    setViewDocument(document);
    setDocumentUrl(getDocumentUrl(document));
  };

  const closeDocumentView = () => {
    setViewDocument(null);
    setDocumentUrl(null);
  };

  if (!editedStudent) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Student Data
          </h3>
          <p className="text-gray-500 mb-4">
            The student information could not be loaded.
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#525B88] focus:ring-offset-2"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Dynamically render all student fields except documents
  const studentFields = Object.entries(editedStudent).filter(
    ([key]) => key !== "documents" && key !== "__v" && key !== "_id"
  );

  // Group fields by category for better organization
  const personalInfoFields = studentFields.filter(([key]) =>
    [
      "firstName",
      "middleName",
      "lastName",
      "fatherName",
      "motherName",
      "dob",
      "gender",
      "nationality",
      "caste",
      "religion",
      "aadharNumber",
      "email",
      "phone",
      "altPhone",
    ].includes(key)
  );

  const addressFields = studentFields.filter(([key]) =>
    ["addressLine1", "addressLine2", "city", "state", "pincode"].includes(key)
  );
  const academicFields = studentFields.filter(([key]) =>
    [
      "hallTicketNo",
      "admitCardId",
      "rank",
      "seatCategory",
      "seatCategorySPL",
      "college",
      "course",
      "academicRecords",
      "hasDisability",
      "hasScholarship",
      "requiresReimbursement",
      "referenceNumber",
      "status",
    ].includes(key)
  );

  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionNote, setCorrectionNote] = useState("");
  const [correctionCounsellor, setCorrectionCounsellor] = useState("");
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div
        className={`bg-white rounded-xl flex w-full ${
          viewDocument ? "flex-row h-screen" : "flex-col"
        }`}
      >
        {/* Left Side - Form */}
        <div
          className={
            viewDocument ? "h-full w-1/2 border-r overflow-y-auto" : "w-full"
          }
        >
          <div className="bg-white p-6 flex justify-between items-center  bg-white ">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Edit Admission Details
              </h1>
              <p className="text-gray-500 mt-1">
                ID: {editedStudent.referenceNumber || "N/A"}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <div className="flex justify-between items-between">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("personal")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "personal"
                        ? "border-[#525B88] text-[#525B88]"
                        : "border-transparent text-[#525B88] hover:text-[#525B88] hover:border-gray-300"
                    }`}
                  >
                    Personal Information
                  </button>
                  <button
                    onClick={() => setActiveTab("academic")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "academic"
                        ? "border-[#525B88] text-[#525B88]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Academic Details
                  </button>
                  <button
                    onClick={() => setActiveTab("documents")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "documents"
                        ? "border-[#525B88] text-[#525B88]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Documents
                  </button>
                </nav>
                <div>
                  <p
                    className="cursor-pointer text-blue-600 hover:underline"
                    onClick={() => setShowCorrectionModal(true)}
                  >
                    Send for Correction
                  </p>
                </div>
              </div>

              {/* Correction Modal */}
              {showCorrectionModal && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl p-6 w-156 relative  border border-gray-800">
                    <h2 className="text-lg font-semibold mb-4">
                      Add Correction Note
                    </h2>

                    {/* Correction Note */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note
                      </label>
                      <textarea
                        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                        placeholder="Enter your note..."
                        value={correctionNote}
                        onChange={(e) => setCorrectionNote(e.target.value)}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2">
                      <button
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={() => setShowCorrectionModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-[#525B88] text-white rounded hover:bg-blue-700"
                        onClick={async () => {
                          if (!correctionNote) {
                            alert("Please enter a note");
                            return;
                          }

                          try {
                            const payload = {
                              note: correctionNote,
                              flag: "yes", // send "yes" dynamically, can change per requirement
                            };
                            const response = await fetch(
                              `${BASE_URL}/students/${studentFromState._id}`, // <-- include ID here
                              {
                                method: "PUT", // should be PUT for update
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                              }
                            );

                            const data = await response.json();
                            if (!response.ok)
                              throw new Error(
                                data.error || "Failed to save correction"
                              );

                            alert("Correction saved successfully!");
                            setShowCorrectionModal(false);
                            setCorrectionNote("");
                            setCorrectionCounsellor("");

                            // update local state dynamically
                            setEditedStudent((prev) => ({
                              ...prev,
                              corrections: [
                                ...(prev.corrections || []),
                                payload,
                              ],
                            }));
                          } catch (err) {
                            console.error(err);
                            alert("Error saving correction: " + err.message);
                          }
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-[#525B88]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personalInfoFields.map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white p-4 rounded-lg shadow-sm"
                      >
                        <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </label>
                        <p className="text-gray-800 font-medium">
                          {typeof value === "object"
                            ? Array.isArray(value)
                              ? value.map((item, idx) => (
                                  <div key={idx} className="mb-1">
                                    {Object.entries(item).map(([k, v]) => (
                                      <span key={k}>
                                        <strong>{k}:</strong> {v.toString()}{" "}
                                      </span>
                                    ))}
                                  </div>
                                ))
                              : value?.name || JSON.stringify(value)
                            : value || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-[#525B88]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                    Address Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addressFields.map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white p-4 rounded-lg shadow-sm"
                      >
                        <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </label>
                        <p className="text-gray-800 font-medium">
                          {value || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Academic Details Tab */}
            {activeTab === "academic" && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-[#525B88]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                    ></path>
                  </svg>
                  Academic Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {academicFields.map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-white p-4 rounded-lg shadow-sm"
                    >
                      <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                        {key === "college"
                          ? "College"
                          : key.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </label>
                      <p className="text-gray-800 font-medium">
                        {key === "college"
                          ? value?.name || "N/A" // Display college name
                          : typeof value === "object"
                          ? Array.isArray(value)
                            ? value.map((item, idx) => (
                                <div key={idx} className="mb-1">
                                  {Object.entries(item).map(([k, v]) => (
                                    <span key={k}>
                                      <strong>{k}:</strong> {v.toString()}{" "}
                                    </span>
                                  ))}
                                </div>
                              ))
                            : value?.name || JSON.stringify(value)
                          : value || "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-[#525B88]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  Documents Verification
                </h2>
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          S.No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Verification
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th> */}
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {editedStudent.documents?.map((doc, index) => {
                        const hasDocument = doc.submitted === "yes" && doc.file;
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                              {doc.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                              {doc.submitted === "true" ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  No
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <label className="inline-flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-5 w-5 text-[#525B88] rounded border-gray-300 focus:ring-[#525B88]"
                                  checked={doc.verified === "verified"}
                                  onChange={(e) =>
                                    handleDocumentVerification(
                                      index,
                                      e.target.checked ? "verified" : "pending"
                                    )
                                  }
                                />
                                <span className="ml-2 text-gray-700">
                                  {doc.verified === "verified"
                                    ? "Verified"
                                    : "Verify"}
                                </span>
                              </label>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#525B88] focus:border-[#525B88]"
                                value={doc.comment || ""}
                                onChange={(e) =>
                                  handleDocumentComment(index, e.target.value)
                                }
                                placeholder="Add remarks..."
                              />
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {hasDocument && (
                                <button
                                  type="button"
                                  onClick={() => openDocumentView(doc)}
                                  className="text-[#525B88] hover:text-blue-800 font-medium inline-flex items-center"
                                >
                                  View
                                  <svg
                                    className="w-4 h-4 ml-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    ></path>
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    ></path>
                                  </svg>
                                </button>
                              )}
                            </td> */}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <CounsellorForm
                  formData={formData}
                  errors={errors}
                  handleChange={handleChange}
                  handleSubmit={handleCounsellorSubmit}
                  isSubmitted={isSubmitted}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88]"
              >
                Cancel
              </button>

              {activeTab === "personal" && (
                <button
                  onClick={() => setActiveTab("academic")}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#525B88] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88]"
                >
                  Next
                </button>
              )}

              {activeTab === "academic" && (
                <button
                  onClick={() => setActiveTab("documents")}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#525B88] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88]"
                >
                  Next
                </button>
              )}

              {activeTab === "documents" && (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#525B88] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88] disabled:opacity-75"
                >
                  {saving ? (
                    <span className="flex items-center">
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
                      Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Document Preview */}
        {viewDocument && documentUrl && (
          <div className="w-1/2 h-full bg-gray-50 border-l border-gray-200 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {viewDocument.name}
              </h2>
              <button
                onClick={closeDocumentView}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Document Content */}
            <div className="flex-1 w-full h-full">
              {getFileType(viewDocument) === "image" ||
              getFileType(viewDocument) === "other" ? (
                <img
                  src={documentUrl}
                  alt={viewDocument.name}
                  className="w-full h-full object-contain"
                />
              ) : getFileType(viewDocument) === "pdf" ? (
                <iframe
                  src={documentUrl}
                  title={viewDocument.name}
                  className="w-full h-full border-none"
                />
              ) : (
                <div className="w-full h-full flex flex-col justify-center items-center bg-white p-4">
                  <svg
                    className="w-16 h-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    ></path>
                  </svg>
                  <p className="text-gray-600 mb-4 text-center">
                    This document format cannot be previewed
                  </p>
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#525B88] hover:bg-blue-700"
                  >
                    Download Document
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditAdmissionPage;
