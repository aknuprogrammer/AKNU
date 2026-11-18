import React from "react";
import { BackButton } from "../BackButton";
import { FileText, ChevronRight } from "lucide-react";
// import "../../assets/R&D/";
import ResearchStudiesPDF from "../../assets/RnD/Board of Research/Research_Studies.pdf";
import BRSGuidelinesPDF from "../../assets/RnD/Board of Research/BRS_Guidelines.pdf";
import ResearchAdmissionPDF from "../../assets/RnD/Board of Research/Research_Admission_Guidelines.pdf";

const BoardResearchStudies = () => {
  // PDF links data
  const pdfLinks = [
    {
      title:
        "17-03-2023 ANUR - Dean, R&D - Constitution of BRS members - Orders - issued",
      // url: "https://aknu.edu.in/Research/links/Board%20of%20Research%20Studies%20committee%2021-03-2023.pdf",
      url: ResearchStudiesPDF,
      isNew: true,
    },
    {
      title: "BRS Guidelines",
      url: BRSGuidelinesPDF,
      isNew: false,
    },
    {
      title: "Research Admission Guidelines",
      url: ResearchAdmissionPDF,
      isNew: false,
    },
    {
      title: "BRS Guidelines 2010",
      url: "#",
      isNew: false,
    },
    {
      title: "BRS Guidelines 2017",
      url: "#",
      isNew: false,
    },
    {
      title: "BRS Guidelines 2018",
      url: "#",
      isNew: false,
    },
  ];

  // Handle PDF link click
  const handlePdfClick = (url) => {
    if (!url || url === "#") return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Main Content */}
        <div className="w-full max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-3xl font-bold text-center text-teal-800 mb-6">
              Board of Research Studies
            </h2>

            {/* PDF Link with new indicator */}
            <div
              className="mb-6 p-4 border border-teal-700 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors"
            >
              <div className="flex items-center ">
                <span className="text-teal-700 font-medium flex-grow cursor-pointer" onClick={() => handlePdfClick(pdfLinks[0].url)}>

                  {pdfLinks[0].title}
                </span>
                {pdfLinks[0].isNew && (
                  <span className="ml-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </span>
                )}
              </div>

              <div className="lg:w-full">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-teal-700 mb-4">
                    Research Documents
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left border border-[#ccc]">
                      <thead className="bg-teal-700 text-white">
                        <tr>
                          <th className="px-4 py-2">S.No</th>
                          <th className="px-4 py-2">Title</th>
                          <th className="px-4 py-2">PDF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pdfLinks.slice(1).map((link, index) => (
                          <tr key={index} className="border-t border-[#ccc]">
                            <td className="px-4 py-2">{index + 1}</td>
                            <td className="px-4 py-2">{link.title}</td>
                            <td className="px-4 py-2">
                              <button
                                type="button"

                                className={`inline-flex items-center p-2 rounded hover:bg-teal-50 ${!link.url || link.url === "#"
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer"
                                  }`}
                                aria-label={`Open ${link.title}`}
                              >
                                <FileText className="w-5 h-5 text-teal-700" onClick={() => handlePdfClick(link.url)} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
      </div>
    </div>
  );
};

export default BoardResearchStudies;
