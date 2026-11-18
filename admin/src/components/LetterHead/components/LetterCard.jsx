import { Download, Eye, Trash2, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { API } from "../../../config/urls";
import { showErrorMessage } from "../../../config/Toast";

// PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.mjs",
//   import.meta.url
// ).toString();

// import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
// pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.js";
// pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export default function LetterCard({ data, onDeleteClick }) {
  return (
    <div className="rounded-lg p-3 shadow-md bg-white border border-gray-100 space-y-3 hover:shadow-lg transition-shadow">
      <TopSection data={data} />

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <User size={12} className="text-[#525B88]" />
        <span>By: {(data.uploadedBy && data.uploadedBy !== "undefined") ? data.uploadedBy : "Admin"}</span>
      </div>

      <BottomSection
        letterId={data._id}
        fileName={data.file?.originalName}
        onDeleteClick={onDeleteClick}
      />
    </div>
  );
}

function TopSection({ data }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-semibold text-base line-clamp-1">{data.title}</h2>
      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
        {new Date(data.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
  );
}

function BottomSection({ letterId, fileName, onDeleteClick }) {
  const handleDownload = async () => {
    try {
      const response = await API.get(`/letters/${letterId}/file`, {
        responseType: "arraybuffer",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "letter.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      showErrorMessage("Failed to download file");
    }
  };

  const handleDelete = () => {
    const resp = confirm("Are You sure want to delete this file ?");

    if (resp) {
      onDeleteClick();
    } else {
      showErrorMessage("Deletion Cancelled");
    }
  };

  const viewUrl = `${API.defaults.baseURL}/letters/${letterId}/file`;

  return (
    <div className="flex items-center justify-between mt-2">
      <a
        href={viewUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm flex items-center gap-2 text-blue-600 font-semibold"
      >
        <Eye />
        <span>View Full</span>
      </a>

      <div className="space-x-2 flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="cursor-pointer flex items-center gap-1 text-gray-700 hover:text-blue-600"
        >
          <Download size={16} />
        </button>

        <button
          onClick={handleDelete}
          className="cursor-pointer flex items-center gap-1 text-gray-700 hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function PDFPreview({ letterId }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const fetchPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await API.get(`/letters/${letterId}/file`, {
          responseType: "arraybuffer",
        });

        if (!isMounted) return;

        const blob = new Blob([response.data], { type: "application/pdf" });
        objectUrl = URL.createObjectURL(blob);

        setPdfUrl(objectUrl);
      } catch (err) {
        console.error("Error fetching PDF:", err);
        if (isMounted) {
          setError("Failed to load PDF preview");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPDF();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [letterId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[160px]">
        <div className="p-4 text-sm text-gray-500">Loading PDF preview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[160px]">
        <div className="p-4 text-sm text-red-500">{error}</div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex justify-center items-center h-[160px]">
        <div className="p-4 text-sm text-gray-500">No PDF available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[160px] flex justify-center">
      <Document
        file={pdfUrl}
        loading={
          <div className="p-4 text-sm text-gray-500">Rendering PDF...</div>
        }
        error={
          <div className="p-4 text-sm text-red-500">Failed to render PDF</div>
        }
        onLoadError={(err) => console.error("PDF Load Error:", err)}
      >
        <Page
          pageNumber={1}
          width={150}
          renderAnnotationLayer={false}
          renderTextLayer={false}
        />
      </Document>
    </div>
  );
}
