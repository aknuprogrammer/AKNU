import React, { useState } from "react";
import axios from "axios";
import DisplayDownload_FormDetails from "./form_upload/DisplayDownload_FormDetails";

const AdminDashboard = () => {
  const [adminPassword, setAdminPassword] = useState("");
  const [limit, setLimit] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [data, setData] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          adminPassword,
          limit: parseInt(limit),
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          name: searchName || undefined,
          mobileNumber: searchPhone || undefined,
        })
      );

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/get-documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setData(response.data.data);
      setError("");
      setIsLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch data");
    }
    setIsLoading(false);
  };
  const handleDownload = (fileObj) => {
    if (!fileObj?.buffer || !fileObj?.mimetype) {
      alert("Invalid file structure");
      return;
    }

    const byteCharacters = atob(fileObj.buffer);
    const byteNumbers = new Array(byteCharacters.length)
      .fill()
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { type: fileObj.mimetype });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileObj.originalname || "file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-[100px_15%] bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <input
          type="password"
          placeholder="Admin Password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Recent N documents"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Search by Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Search by Phone"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
          className="border p-2 rounded"
        />
      </div>
      <div className="flex gap-7">
        <div className="flex-1 flex flex-col">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
      </div>
      <br />
      <br />
      <button
        onClick={fetchDocuments}
        disabled={isLoading}
        style={
          isLoading
            ? { cursor: "progress", opacity: 0.5 }
            : { cursor: "pointer" }
        }
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
      >
        Fetch Data
      </button>

      {!isLoading & error ? <p className="text-red-500 mt-4">{error}</p> : null}
      {isLoading && (
        <p className="font-bold text-gray-500 mt-4">Loading . . .</p>
      )}

      <div className="mt-6 overflow-auto">
        <table className="w-full table-auto bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">DOB</th>
              <th className="p-2 border">View</th>
            </tr>
          </thead>
          <tbody>
            {data.map((doc) => (
              <tr
                key={doc._id}
                className="text-center border-t hover:bg-gray-100"
              >
                <td className="p-2 border">{doc.name}</td>
                <td className="p-2 border">{doc.mobileNumber}</td>
                <td className="p-2 border">{doc.email}</td>
                <td className="p-2 border">{doc.dob}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-[#0009] bg-opacity-40 flex justify-center items-start overflow-y-auto pt-10 pb-20 z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-4xl relative">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-2 right-2 text-red-500 font-bold text-lg"
            >
              ✕
            </button>
            {/* <h2 className="text-xl font-semibold mb-4">
                            Full Details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(selectedDoc).map(([key, value]) => {
                                if (key === "files") return null;
                                return (
                                    <div key={key}>
                                        <strong>{key}:</strong> {String(value)}
                                    </div>
                                );
                            })}
                        </div> */}
            <DisplayDownload_FormDetails
              obj={selectedDoc}
              files={Object.values(selectedDoc.files).map(
                (ele) => ele.fieldname
              )}
            />

            {/* File Downloads */}
            {selectedDoc.files &&
              Object.values(selectedDoc.files).length > 0 && (
                <>
                  <h3 className="mt-4 text-lg font-bold">Files</h3>
                  <ul className="list-disc list-inside mt-2">
                    {Object.values(selectedDoc.files).map((file, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>{file.originalname}</span>
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-blue-600 underline"
                        >
                          Download
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
