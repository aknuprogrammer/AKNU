import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config/urls";
import ResultsTable from "./excel/ResultsTable";
import BatchResultsCard from "./excel/BatchResultsCard";
import UploadResultForm from "./excel/UploadResultForm";
import UploadPdfForm from "./pdf/UploadForm";
import { PdfResultTable } from "./pdf/PdfResultsTable";

const URL = `${BASE_URL}`;

export default function Page_Results() {
  const [activeTab, setActiveTab] = useState("excel"); // "excel" | "pdf"

  const [formData, setFormData] = useState({
    title: "",
    level: "ug",
    type: "regular",
    date: "",
    file: null,
  });
  const [pdfForm, setPdfForm] = useState({
    title: "",
    date: "",
    file: null,
  });

  const [errors, setErrors] = useState({});
  const [pdfErrors, setPdfErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);
  const [batches, setBatches] = useState([]);
  const [pdfUploads, setPdfUploads] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchResults, setBatchResults] = useState([]);

  const [loading, setLoading] = useState({
    batches: false,
    upload: false,
    results: false,
    pdfUpload: false,
    pdfList: false,
  });

  const formRef = useRef();
  const fileInputRef = useRef();
  const pdfFileInputRef = useRef();
  // Fetch all batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading((prev) => ({ ...prev, batches: true }));
        const res = await axios.get(`${URL}/results/all-batches`);
        setBatches(res.data.data || []);
      } catch (err) {
        console.error("Error fetching batches:", err);
      } finally {
        setLoading((prev) => ({ ...prev, batches: false }));
      }
    };

    fetchBatches();
  }, []);
  const fetchBatchResults = async (batchId) => {
    try {
      setLoading((prev) => ({ ...prev, results: true }));
      const res = await axios.get(`${URL}/results/batch/${batchId}`);

      // Access results from the correct path in the response
      const results =
        Array.isArray(res.data?.data?.results) &&
        res.data.data.results.length === 0
          ? res.data?.data?.rvResults || []
          : res.data?.data?.results || [];

      setBatchResults(results);
    } catch (err) {
      console.error("Error fetching batch results:", err);
      setBatchResults([]);
    } finally {
      setLoading((prev) => ({ ...prev, results: false }));
    }
  };

  // View batch results
  const handleViewBatch = (batch) => {
    setSelectedBatch(batch);
    fetchBatchResults(batch._id); // Assuming each batch has an _id field
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, file }));
    setErrors((prev) => ({ ...prev, file: undefined }));
  };

  // Handle file input
  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "text/csv", // .csv
    "application/csv",
    "", // some browsers report empty mime for csv
  ];

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Result title is required";
    if (!formData.level) newErrors.level = "Level is required";
    if (!formData.type) newErrors.type = "Result type is required";
    if (!formData.date) newErrors.date = "Result date is required";
    if (!formData.file) {
      newErrors.file = "Result file is required";
    } else {
      const ext = formData.file.name.split(".").pop().toLowerCase();
      if (!["xlsx", "xls", "csv"].includes(ext)) {
        newErrors.file = "Only XLSX, XLS, or CSV files are allowed";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit (POST only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Clear previous errors
    setErrorDetails(null);
    setSubmitMessage("");

    setLoading((prev) => ({ ...prev, upload: true }));
    const payload = new FormData();
    payload.append("ResultTitle", formData.title);
    payload.append("Level", formData.level);
    payload.append("ResultType", formData.type);
    payload.append("ResultDate", formData.date);
    payload.append("file", formData.file);

    try {
      const token = localStorage.getItem("token");
      let res;
      if (formData.type === "rv") {
        res = await axios.post(`${URL}/results/upload-rv`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 300000, // 5 minutes
        });
      } else {
        res = await axios.post(`${URL}/results/upload`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 300000, // 5 minutes
        });
      }

      if (res.data?.success || res.status === 200) {
        setSubmitMessage("Result uploaded successfully!");
        setErrorDetails(null);
        setFormData({
          title: "",
          level: "ug",
          type: "regular",
          date: "",
          file: null,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        // Refresh batches list
        const batchesRes = await axios.get(`${URL}/results/all-batches`);
        setBatches(batchesRes.data.data || []);
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSubmitMessage("");
          setErrorDetails(null);
        }, 3000);
      } else {
        const errorMsg =
          res.data?.error || res.data?.message || "Upload failed.";
        setSubmitMessage(errorMsg);
        setErrorDetails({
          details: res.data?.details,
          suggestion: res.data?.suggestion,
          missingColumns: res.data?.missingColumns,
          extraColumns: res.data?.extraColumns,
        });
      }
    } catch (err) {
      // Extract error message from axios error response
      let errorMessage = "Upload failed.";
      let errorInfo = null;

      if (err.response) {
        // Server responded with error status
        const errorData = err.response.data;
        errorMessage =
          errorData?.error ||
          errorData?.message ||
          `Upload failed: ${err.response.statusText}`;
        errorInfo = {
          details: errorData?.details,
          suggestion: errorData?.suggestion,
          missingColumns: errorData?.missingColumns,
          extraColumns: errorData?.extraColumns,
          rows: errorData?.rows,
          duplicates: errorData?.duplicates,
        };
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "Network error: Please check your internet connection.";
        errorInfo = {
          details: "The server did not respond. Please try again later.",
        };
      } else {
        // Something else happened
        errorMessage = err.message || "An unexpected error occurred.";
      }

      setSubmitMessage(errorMessage);
      setErrorDetails(errorInfo);
      // Clear error messages after 10 seconds (longer to read)
      setTimeout(() => {
        setSubmitMessage("");
        setErrorDetails(null);
      }, 10000);
    } finally {
      setLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  // Fetch Excel batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading((p) => ({ ...p, batches: true }));
        const res = await axios.get(`${URL}/results/all-batches`);
        setBatches(res.data.data || []);
      } catch (err) {
        console.error("Error fetching batches:", err);
      } finally {
        setLoading((p) => ({ ...p, batches: false }));
      }
    };
    fetchBatches();
  }, []);

  // Fetch uploaded PDFs
  useEffect(() => {
    if (activeTab === "pdf") {
      const fetchPdfs = async () => {
        try {
          setLoading((p) => ({ ...p, pdfList: true }));
          const res = await axios.get(`${URL}/results/pdf/list`);
          setPdfUploads(res.data.data || []);
        } catch (err) {
          console.error("Error fetching PDFs:", err);
        } finally {
          setLoading((p) => ({ ...p, pdfList: false }));
        }
      };
      fetchPdfs();
    }
  }, [activeTab]);

  // Handlers for Excel file form
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  //   setErrors((prev) => ({ ...prev, [name]: undefined }));
  // };
  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   setFormData((prev) => ({ ...prev, file }));
  // };

  // // Excel Submit
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading((p) => ({ ...p, upload: true }));
  //   const payload = new FormData();
  //   payload.append("ResultTitle", formData.title);
  //   payload.append("Level", formData.level);
  //   payload.append("ResultType", formData.type);
  //   payload.append("ResultDate", formData.date);
  //   payload.append("file", formData.file);

  //   try {
  //     const token = localStorage.getItem("token");
  //     await axios.post(`${URL}/results/upload`, payload, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setSubmitMessage("Excel result uploaded successfully!");
  //     setFormData({ title: "", level: "ug", type: "regular", date: "", file: null });
  //     if (fileInputRef.current) fileInputRef.current.value = "";
  //   } catch (err) {
  //     setSubmitMessage("Excel upload failed.");
  //   } finally {
  //     setLoading((p) => ({ ...p, upload: false }));
  //     setTimeout(() => setSubmitMessage(""), 3000);
  //   }
  // };

  // Handlers for PDF form
  const handlePdfChange = (e) => {
    const { name, value } = e.target;
    setPdfForm((prev) => ({ ...prev, [name]: value }));
  };
  const handlePdfFileChange = (e) => {
    setPdfForm((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  // PDF Submit
  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    setLoading((p) => ({ ...p, pdfUpload: true }));
    const payload = new FormData();
    payload.append("title", pdfForm.title);
    payload.append("date", pdfForm.date);
    payload.append("file", pdfForm.file);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${URL}/results/pdf/upload`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmitMessage("PDF uploaded successfully!");
      setPdfForm({ title: "", date: "", file: null });
      if (pdfFileInputRef.current) pdfFileInputRef.current.value = "";

      // refresh PDF list
      const res = await axios.get(`${URL}/results/pdf/list`);
      setPdfUploads(res.data.data || []);
    } catch (err) {
      setSubmitMessage("PDF upload failed.");
    } finally {
      setLoading((p) => ({ ...p, pdfUpload: false }));
      setTimeout(() => setSubmitMessage(""), 3000);
    }
  };

  // Close batch results view
  const handleCloseResults = () => {
    setSelectedBatch(null);
    setBatchResults([]);
  };

  const toTitleCase = (str) => {
    if (!str) return "N/A";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <main className="max-w-6xl mx-auto p-5">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        Results Management
      </h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("excel")}
          className={`px-4 py-2 ${
            activeTab === "excel"
              ? "border-b-2 border-blue-600 font-semibold"
              : ""
          }`}
        >
          Excel Upload
        </button>
        <button
          onClick={() => setActiveTab("pdf")}
          className={`px-4 py-2 ${
            activeTab === "pdf"
              ? "border-b-2 border-blue-600 font-semibold"
              : ""
          }`}
        >
          PDF Upload
        </button>
      </div>

      {submitMessage && (
        <div
          className={`mb-6 p-4 border rounded ${
            submitMessage.includes("success")
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          }`}
        >
          <div className="font-semibold mb-2">{submitMessage}</div>

          {errorDetails && (
            <div className="mt-3 space-y-2 text-sm">
              {errorDetails.details && (
                <div className="pl-4 border-l-2 border-red-500">
                  <strong>Details:</strong> {errorDetails.details}
                </div>
              )}

              {errorDetails.suggestion && (
                <div className="pl-4 border-l-2 border-blue-500 text-blue-800">
                  <strong>Suggestion:</strong> {errorDetails.suggestion}
                </div>
              )}

              {errorDetails.missingColumns &&
                errorDetails.missingColumns.length > 0 && (
                  <div className="pl-4 border-l-2 border-orange-500">
                    <strong>Missing Columns:</strong>
                    <ul className="list-disc list-inside mt-1 ml-2">
                      {errorDetails.missingColumns.map((col, idx) => (
                        <li key={idx}>{col}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {errorDetails.extraColumns &&
                errorDetails.extraColumns.length > 0 && (
                  <div className="pl-4 border-l-2 border-yellow-500">
                    <strong>Unexpected Columns:</strong>
                    <ul className="list-disc list-inside mt-1 ml-2">
                      {errorDetails.extraColumns.map((col, idx) => (
                        <li key={idx}>{col}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {errorDetails.rows && errorDetails.rows.length > 0 && (
                <div className="pl-4 border-l-2 border-orange-500">
                  <strong>Rows with errors:</strong> Row{" "}
                  {errorDetails.rows.join(", ")}
                </div>
              )}

              {errorDetails.duplicates &&
                errorDetails.duplicates.length > 0 && (
                  <div className="pl-4 border-l-2 border-orange-500">
                    <strong>Duplicate entries found:</strong>
                    <ul className="list-disc list-inside mt-1 ml-2">
                      {errorDetails.duplicates.map((dup, idx) => (
                        <li key={idx}>{dup}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {/* Excel Tab */}
      {activeTab === "excel" && !selectedBatch && (
        <>
          <UploadResultForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            loading={loading}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
          />
          <ResultsTable
            loading={loading}
            batches={batches}
            handleViewBatch={handleViewBatch}
          />
        </>
      )}

      {activeTab === "excel" && selectedBatch && (
        <BatchResultsCard
          selectedBatch={selectedBatch}
          batchResults={batchResults}
          loading={loading}
          handleCloseResults={handleCloseResults}
          toTitleCase={toTitleCase}
        />
      )}

      {/* PDF Tab */}
      {activeTab === "pdf" && (
        <div className="space-y-6">
          <UploadPdfForm />
        </div>
      )}

      {activeTab === "pdf" && (
        <div className="space-y-6">
          <PdfResultTable />
        </div>
      )}
    </main>
  );
}
