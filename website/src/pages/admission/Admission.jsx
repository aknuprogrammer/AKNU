import React, { useEffect, useState } from "react";
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
import { BASE_URL } from "../../utils/url";

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



  return (
    <div className="max-w-7xl mx-auto p-5">
      <h1 className="text-2xl font-bold text-[#525B88] ">
        Admission Application Form
      </h1>

      <div className="mb-6 ">
        Kindly complete the form below to proceed with the admission process.
      </div>
      {message && (
        <div className="mb-6 p-4 border rounded bg-green-100 border-green-400 text-green-700">
          {message}
        </div>
      )}
      {/* Collapsible Sections */}
      <div className="space-y-6">
        {/* Admission Form Section */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          {/* <div
            className="flex justify-between items-center p-6 bg-gray-50 cursor-pointer"
            onClick={() => toggleSection("admission")}
          >
            <h2 className="text-xl font-semibold text-[#525B88]">
              Admission Form
            </h2>
            {activeSection === "admission" ? (
              <ChevronUpIcon className="h-5 w-5 text-[#525B88]" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-[#525B88]" />
            )}
          </div> */}

          {/* {activeSection === "admission" && <RegisterAdmission />} */}
          <RegisterAdmission />
        </div>
      </div>
      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-[#525B88]">
                Payment Receipt
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-600">Receipt Number</p>
                  <p className="font-semibold">RCPT2023001</p>
                </div>
                <div>
                  <p className="text-gray-600">Date</p>
                  <p className="font-semibold">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Student Name</p>
                  <p className="font-semibold">
                    {formData.name || "Student Name"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Payment Mode</p>
                  <p className="font-semibold capitalize">
                    {formData.paymentMode}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Amount</p>
                  <p className="font-semibold">₹5,000.00</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold text-green-600">Paid</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-gray-600 mb-2">Documents Submitted:</p>
                <ul className="list-disc list-inside">
                  {formData.documents.marksheet && <li>Mark Sheets</li>}
                  {formData.documents.memo && <li>Memo</li>}
                  {formData.documents.idProof && <li>ID Proof</li>}
                  {formData.documents.photos && <li>Photos</li>}
                </ul>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm mr-4"
                onClick={() => setShowReceipt(false)}
              >
                Close
              </button>
              <button className="px-5 py-1.5 bg-[#525B88] text-white rounded-lg hover:bg-[#3a4166] text-sm">
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionModule;
