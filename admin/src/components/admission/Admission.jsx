import React, { useState } from "react";
import {
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import RegisterAdmission from "./RegisterAdmission";
import ListOfAdmissions from "./ListOfAdmissions";

const AdmissionModule = () => {
  const [activeSection, setActiveSection] = useState("admission");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    previousCollege: "",
    marks: "",
    documents: {
      marksheet: false,
      memo: false,
      idProof: false,
      photos: false,
    },
    paymentMode: "online",
    upiId: "",
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [name]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMessage("Admission form submitted successfully!");
      setLoading(false);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    }, 1500);
  };

  const handlePayment = () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      alert("Redirecting to payment gateway...");
      // After payment success
      setShowReceipt(true);
      setLoading(false);
    }, 1500);
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className=" mx-auto p-5">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#525B88] mb-2">
            Admission Management System
          </h1>
          <p className="text-gray-600 mb-6">
            Manage and review student applications
          </p>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 border rounded bg-green-100 border-green-400 text-green-700">
          {message}
        </div>
      )}

      {/* Upload Button */}
      {/* <div className="bg-white rounded-lg p-4 mb-6">
        <button className="flex items-center justify-center w-full py-3 px-4 bg-[#525B88] hover:bg-[#3a4166] text-white font-semibold rounded-lg transition duration-300">
          <CloudArrowUpIcon className="h-5 w-5 mr-2" />
          Upload APSche Data
        </button>
      </div> */}

      {/* Collapsible Sections */}
      <div className="space-y-6">
        {/* List of Admissions Section */}
        {/* <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div
            className="flex justify-between items-center p-6 bg-gray-50 cursor-pointer"
            onClick={() => toggleSection("list")}
          >
            <h2 className="text-xl font-semibold text-[#525B88]">
              List of Admissions
            </h2>
            {activeSection === "list" ? (
              <ChevronUpIcon className="h-5 w-5 text-[#525B88]" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-[#525B88]" />
            )}
          </div>

          {activeSection === "list" && <ListOfAdmissions />}
        </div> */}
        <ListOfAdmissions />
      </div>
    </div>
  );
};

export default AdmissionModule;
