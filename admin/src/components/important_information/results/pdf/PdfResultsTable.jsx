import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../../config/urls";

export const PdfResultTable = () => {
  const [pdfUploads, setPdfUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const apiUrl = `${BASE_URL}/pdfUpload`;

  // Fetch PDFs on mount
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const res = await axios.get(apiUrl);
        setPdfUploads(res.data);
      } catch (err) {
        console.error("Error fetching PDFs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold text-[#525B88] mb-4">
        Uploaded PDFs
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#525B88]"></div>
        </div>
      ) : pdfUploads.length === 0 ? (
        <p className="text-gray-500 py-4">No PDFs uploaded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pdfUploads
                .slice()
                .reverse()
                .map((pdf, index) => (
                  <tr key={pdf._id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pdf.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pdf.createdAt
                        ? new Date(pdf.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedPdf(pdf)}
                        className="text-[#525B88] hover:text-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for viewing PDF */}
      {selectedPdf && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-11/12 md:w-3/4 lg:w-1/2 h-5/6 rounded-lg shadow-lg flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-semibold">{selectedPdf.title}</h3>
              <button
                onClick={() => setSelectedPdf(null)}
                className="text-red-500 font-bold"
              >
                ✕
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`${apiUrl}/${selectedPdf._id}`}
                title={selectedPdf.title}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
