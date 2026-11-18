import { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const NannayaVani = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEdition, setExpandedEdition] = useState(null);
  const [epapers, setEpapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfError, setPdfError] = useState(null);

  const fetchEpapers = async () => {
    try {
      setLoading(true);
      setMessage("");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}api/editions`
      );

      console.log("28", response.data);
      setEpapers(response.data);
    } catch (error) {
      console.error("Error fetching editions:", error);
      setMessage("Error fetching editions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpapers();
  }, []);

  const filteredEpapers = epapers.filter(
    (paper) =>
      paper.date?.includes(searchTerm) ||
      paper.edition?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleEdition = (id) => {
    console.log("____id", id);
    setExpandedEdition(expandedEdition === id ? null : id);
    setPdfError(null);
  };

  const handlePdfError = (id) => {
    setPdfError(id);
    setMessage("Failed to load PDF preview. Try downloading instead.");
  };

  const handleDownload = async (downloadLink, originalName) => {
    try {
      const response = await axios.get(downloadLink, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", originalName || "nannaya-vani-edition.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setMessage("Failed to download PDF. Please try again.");
    }
  };

  return (
    <div className="mx-16 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-800 mb-2 mt-6">
          Nannaya Vani Archives
        </h1>
        <p className="text-gray-600">
          Explore {epapers.length}+ historic editions
        </p>
      </div>
      {/* ✅ Previous edition link */}
      <div className="mb-6 flex justify-center">
        <a
          href="https://old.aknu.edu.in/nannayavaniview.php" // <-- replace with your old site link
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-teal-600 hover:text-blue-800 font-medium transition-colors"
        >
          For previous editions please visit old site
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("Error") || message.includes("Failed")
              ? "bg-red-50 text-red-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mb-8 max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by date or edition..."
            className="w-full p-4 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 text-gray-700"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="grid grid-cols-12 bg-gray-50 p-4 font-medium text-gray-700 border-b border-gray-200">
          <div className="col-span-5 font-sans">Publication Date</div>
          <div className="col-span-5 font-sans">Edition</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredEpapers.map((paper) => (
            <div key={paper.id} className="hover:bg-gray-50 transition">
              <div
                className="grid grid-cols-12 p-4 items-center cursor-pointer"
                onClick={() => toggleEdition(paper.id)}
              >
                <div className="col-span-5">
                  <div className="text-gray-900 font-medium">
                    {new Date(paper.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="col-span-5 text-gray-700">{paper.edition}</div>
                <div className="col-span-2 text-right flex justify-end space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(
                        `${import.meta.env.VITE_API_URL}api/editions/${paper.id}/download`,
                        paper.originalName
                      );
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title="Download PDF"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  {console.log("_____paper", paper)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEdition(paper.id);
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title={expandedEdition === paper.id ? "Collapse" : "Expand"}
                  >
                    {expandedEdition === paper.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {console.log("___expandedEdition", expandedEdition)}
              {expandedEdition === paper.id && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 transition-all duration-300">
                  {pdfError === paper.id ? (
                    <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
                      <p className="text-red-700">PDF preview not available</p>
                      <button
                        onClick={() =>
                          handleDownload(
                            `${import.meta.env.VITE_API_URL}api/editions/${paper.id}/download`,
                            paper.originalName
                          )
                        }
                        className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Instead
                      </button>
                    </div>
                  ) : (
                    <div className="relative pb-[75%] h-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                      <iframe
                        src={`${import.meta.env.VITE_API_URL}api/editions/${paper.id}/preview`}
                        className="absolute top-0 left-0 w-full h-full"
                        title={`PDF Preview - ${paper.edition}`}
                        onError={() => handlePdfError(paper.id)}
                      ></iframe>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading editions...</p>
        </div>
      )}

      {!loading && filteredEpapers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? "No matching editions found" : "No editions available"}
        </div>
      )}
    </div>
  );
};

export default NannayaVani;
