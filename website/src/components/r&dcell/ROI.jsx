import React from "react";
import { BackButton } from "../BackButton";
import IntershipOpportunities from "../../assets/RnD/Research Opportunities/Internship Oppurtunities.pdf";
import InstFacilities from "../../assets/RnD/Research Opportunities/Instrumentation Facilities.pdf";

const ROI = () => {
  // Internship links data
  const internshipLinks = [
    {
      title: "Research Programs and Internship Opportunities",
      description: "ANUR - Office of the Dean R&D Cell",
      url: IntershipOpportunities,
      isNew: true,
      date: "May 15, 2023",
    },
    {
      title: "Instrumentation Facilities for Research",
      description: "ANUR - Office of the Dean R&D Cell",
      url: InstFacilities,
      isNew: true,
      date: "June 2, 2023",
    },
  ];

  // Additional resources links
  const resourceLinks = [
    {
      title: "Research and Development Cell",
      icon: "📋",
      url: "links/Research_and_Development_Cell.pdf",
    },
    {
      title: "Research Policy",
      icon: "📜",
      url: "links/Research_Policy.pdf",
    },
    {
      title: "Research Consultancy Policy",
      icon: "🤝",
      url: "links/Research_Consultancy_Policy.pdf",
    },
    {
      title: "Research Ethics",
      icon: "⚖️",
      url: "links/Research_Ethics.pdf",
    },
  ];

  // Handle PDF link click
  const handlePdfClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className=" px-4 sm:px-6 lg:px-16 py-8">
      <BackButton />
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-teal-800 mb-2">
          Research & Internships
        </h1>
        <p className="text-lg text-teal-700">
          Opportunities and resources for research scholars
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Tabs Navigation */}
        <div className="bg-[#004d40]">
          <nav className="flex">
            <button className="w-full py-5 px-1 text-center font-medium text-white border-b-2 border-white">
              <h5 className="font-bold text-lg">Internship Programs</h5>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8">
          {/* Internship Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {internshipLinks.map((link, index) => (
              <div
                key={index}
                onClick={() => handlePdfClick(link.url)}
                className="group relative p-6 border border-gray-100 rounded-lg hover:shadow-md transition-all cursor-pointer bg-white hover:border-green-200"
              >
                {link.isNew && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    NEW
                  </div>
                )}
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-teal-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-teal-700 group-hover:text-[#004d40] mb-1">
                      {link.title}
                    </h3>
                    <p className="text-sm text-teal-700 mb-2">
                      {link.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-teal-700">{link.date}</span>
                      <span className="inline-flex items-center text-sm font-medium text-teal-700 group-hover:text-[#004d40]">
                        View PDF
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="ml-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resources Section */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-teal-700 mb-6 pb-2 border-b border-gray-200">
              Research Resources
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {resourceLinks.map((link, index) => (
                <div
                  key={index}
                  onClick={() => handlePdfClick(link.url)}
                  className="p-5 border border-gray-100 rounded-lg hover:shadow-sm transition-all cursor-pointer bg-white hover:border-teal-700 group"
                >
                  <div className="text-3xl mb-3">{link.icon}</div>
                  <h4 className="font-medium text-gray-900 group-hover:text-teal-700">
                    {link.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">Download PDF</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Card */}
          <div className="mt-10 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Need Help?
                </h4>
                <p className="text-gray-600">
                  Contact the Research & Development office
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center text-gray-700 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-teal-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>7993353755</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-teal-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>deanrd@aknu.edu.in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROI;
