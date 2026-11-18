import React from "react";
import { BackButton } from "../BackButton";
import ResearchStudiesPDF from "../../assets/RnD/Thesis Section/Ph.D Awardees List 2022.pdf";

const ThesisSection = () => {
  // Content array for easy management
  const content = {
    title: "Ph.D Awardees",
    description:
      "Explore the list of our distinguished Ph.D graduates from the year 2022.",
    pdfLink: ResearchStudiesPDF,
    buttonText: "View Awardees List (PDF)",
    years: [2022, 2021, 2020], // Example of additional years if needed
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <BackButton className="mb-6" />
      <div className="bg-white rounded-lg duration-300">
        <h2 className="text-3xl font-bold text-teal-800 mb-4">
          {content.title}
        </h2>
        <p className="text-teal-700 mb-4">{content.description}</p>

        <div className="flex flex-col space-y-3">
          <a
            href={content.pdfLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-[#004d40] text-white rounded-md hover:bg-[#004d40] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                clipRule="evenodd"
              />
            </svg>
            {content.buttonText}
          </a>

          {/* Example of rendering multiple years */}
          {content.years.length > 1 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Previous Years
              </h3>
              <div className="flex flex-wrap gap-2">
                {content.years
                  .filter((year) => year !== 2022)
                  .map((year) => (
                    <a
                      key={year}
                      href={`/Academics/links/AAF/Thesis/Ph.D Awardees List ${year}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                    >
                      {year} List
                    </a>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThesisSection;
