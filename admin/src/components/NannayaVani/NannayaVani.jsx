import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { BASE_URL } from "../../config/urls";

const NannayaVaniAdmin = () => {
  const [epapers, setEpapers] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    edition: "",
    pdfFile: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentPdf, setCurrentPdf] = useState(null);
  const fileInputRef = useRef();
  const token = localStorage.getItem("token");

  // Fetch all editions
  const fetchEpapers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/editions`);

      setEpapers(response.data);
    } catch (error) {
      console.error("Error fetching editions:", error);
      setMessage("Error fetching editions");
    } finally {
      setLoading(false);
    }
  };

  // Create new edition
  const addEpaper = async (formData) => {
    const formPayload = new FormData();
    formPayload.append("date", formData.date);
    formPayload.append("edition", `${formData.edition}`);
    formPayload.append("pdf", formData.pdfFile);


    const response = await axios.post(`${BASE_URL}/editions`, formPayload, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, // moved outside nested headers
      },
    });


    return response.data;
  };

  // Update edition
  const updateEpaper = async (id, formData) => {
    const formPayload = new FormData();
    formPayload.append("date", formData.date);
    formPayload.append("edition", `${formData.edition}`);
    if (formData.pdfFile) {
      formPayload.append("pdf", formData.pdfFile);
    }

    const response = await axios.put(
      `${BASE_URL}/editions/${id}`,
      formPayload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  };

  // Delete edition
  const deleteEpaper = async (id) => {

    const res = await axios.delete(`${BASE_URL}/editions/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // moved outside nested headers
      },
    });

    return true;
  };

  // Download PDF
  const downloadPdf = async (id) => {
    const response = await axios.get(`${BASE_URL}/editions/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  };

  // Preview PDF
  const previewPdf = async (id) => {
    const response = await axios.get(`${BASE_URL}/editions/${id}/preview`, {
      responseType: "blob",
    });

    return URL.createObjectURL(response.data);
  };

  useEffect(() => {
    fetchEpapers();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Form validation
  const validate = () => {
    const errs = {};
    if (!formData.date) errs.date = "Date is required";
    if (!formData.edition) errs.edition = "Edition number is required";
    if (!editingId && !formData.pdfFile) errs.pdfFile = "PDF file is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "edition" && (value === "" || /^[0-9]+$/.test(value))) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (name !== "edition") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setErrors((prev) => ({
          ...prev,
          pdfFile: "Only PDF files are allowed",
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, pdfFile: file }));
      setErrors((prev) => ({ ...prev, pdfFile: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Normalize edition input to just numbers
    const newEditionNumber = String(formData.edition).replace(/\D/g, "");

    // Check if this edition already exists (ignore the one we’re editing)
    const alreadyExists = epapers.some(
      (paper) =>
        paper.id !== editingId &&
        paper.edition.replace(/\D/g, "") === newEditionNumber
    );

    if (alreadyExists) {
      alert(`Edition #${newEditionNumber} already exists!`);
      return;
    }

    setLoading(true);
    try {
      if (editingId) {

        await updateEpaper(editingId, formData);
        setMessage("Edition updated successfully");
      } else {

        const res = await addEpaper(formData);

        setMessage("New edition added successfully");
      }
      resetForm();
      fetchEpapers();
    } catch (error) {

      setMessage(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Edit existing edition
  const handleEdit = (epaper) => {
    // Extract only digits from the edition string
    const editionNumber = epaper.edition.replace(/\D/g, "");

    setFormData({
      date: epaper.date,
      edition: editionNumber,
      pdfFile: null,
    });

    setEditingId(epaper.id);
    fileInputRef.current.value = "";
  };

  // Delete edition
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this edition?")) return;
    setLoading(true);
    try {
      await deleteEpaper(id);
      setMessage("Edition deleted successfully");
      fetchEpapers();
    } catch (error) {
      setMessage("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      date: "",
      edition: "",
      pdfFile: null,
    });
    setEditingId(null);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // View PDF
  const handleView = async (id) => {
    try {
      setLoading(true);

      const pdfUrl = await previewPdf(id);
      setCurrentPdf(pdfUrl);
      setShowModal(true);
    } catch (error) {
      setMessage("Failed to load PDF");
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const handleDownload = async (id, originalName) => {
    try {
      setLoading(true);

      const pdfBlob = await downloadPdf(id);

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = originalName || `edition-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      setMessage("Failed to download PDF");
    } finally {
      setLoading(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    if (currentPdf) {
      URL.revokeObjectURL(currentPdf);
      setCurrentPdf(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-5">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        {editingId ? "Edit Nannaya Vani Edition" : "Add New Edition"}
      </h1>

      {message && (
        <div
          className={`mb-6 p-4 border rounded ${
            message.toLowerCase().includes("fail") ||
            message.toLowerCase().includes("error")
              ? "bg-red-100 border-red-400 text-red-700"
              : "bg-green-100 border-green-400 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Edition Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="date"
              className="block text-gray-700 font-medium mb-1.5 text-sm"
            >
              Publication Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.date
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="edition"
              className="block text-gray-700 font-medium mb-1.5 text-sm"
            >
              Edition Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">#</span>
              </div>
              <input
                type="text"
                id="edition"
                name="edition"
                value={formData.edition}
                onChange={handleChange}
                className={`w-full pl-8 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.edition
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                placeholder="245"
                inputMode="numeric"
                pattern="\d*"
              />
            </div>
            {errors.edition && (
              <p className="mt-1 text-sm text-red-500">{errors.edition}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="pdfFile"
            className="block text-gray-700 font-medium mb-1.5 text-sm"
          >
            PDF File {!editingId && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center">
            <label className="flex flex-col items-center px-3 py-3 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
              <DocumentTextIcon className="h-5 w-5 text-[#525B88] mb-1" />
              <span className="text-xs text-gray-600">
                {formData.pdfFile ? formData.pdfFile.name : "Choose a PDF file"}
              </span>
              <input
                type="file"
                id="pdfFile"
                name="pdfFile"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf"
                ref={fileInputRef}
              />
            </label>
            {formData.pdfFile && (
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, pdfFile: null }));
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="ml-3 p-1.5 text-red-500 hover:text-red-700"
                title="Remove file"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          {errors.pdfFile && (
            <p className="mt-1 text-sm text-red-500">{errors.pdfFile}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Accepted format: PDF only (max 10MB)
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-1.5 bg-[#525B88] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
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
                {editingId ? "Updating..." : "Adding..."}
              </>
            ) : editingId ? (
              <>
                <CheckIcon className="h-4 w-4 inline mr-1.5" />
                Update Edition
              </>
            ) : (
              "Add Edition"
            )}
          </button>
        </div>
      </form>

      {/* Editions Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#525b88]">
            Nannaya Vani Editions
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#525b88]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Edition
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {epapers.length > 0 ? (
                  epapers.map((epaper) => (
                    <tr
                      key={epaper._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {new Date(epaper.date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {epaper.edition}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleView(epaper.id)}
                          className="text-[#525b88] hover:text-[#3a4166] p-1"
                          title="View"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            handleDownload(epaper.id, epaper.originalName)
                          }
                          className="text-[#525b88] hover:text-[#3a4166] p-1"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(epaper)}
                          className="text-[#525b88] hover:text-[#3a4166] p-1"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(epaper.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No editions found. Add your first edition!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {showModal && currentPdf && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">PDF Viewer</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <iframe
                src={currentPdf}
                width="100%"
                height="100%"
                className="min-h-[70vh] border-none"
                title="PDF Preview"
              />
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = currentPdf;
                  a.download = "edition.pdf";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="px-4 py-2 bg-[#525B88] text-white rounded hover:bg-[#3a4166] transition flex items-center"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NannayaVaniAdmin;
