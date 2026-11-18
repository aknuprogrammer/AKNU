// Patents.jsx
import React from "react";
import { BackButton } from "../BackButton";

const patentsData = [
  {
    id: 1,
    name: "Prof. P.Suresh Verma",
    patentNumber: "2020102381",
    nature: "International - Australia",
    title:
      "Efficient resource utilization and less complex technique for mapping machine learning algorithms in to embedded systems",
    year: 2020,
  },
  {
    id: 2,
    name: "Prof. P.Suresh Verma",
    patentNumber: "2020102608",
    nature: "International - Australia",
    title:
      "Next Generation Framework for Smart Building monitoring using 6LoWPAN",
    year: 2020,
  },
  {
    id: 3,
    name: "Prof. P.Suresh Verma",
    patentNumber: "202041048061 A",
    nature: "National - India",
    title: "Smart City metering System using SIGFOX IOT Platform Approach",
    year: 2020,
  },
  {
    id: 4,
    name: "Mr BVA Swamy",
    patentNumber: "2021102935",
    nature: "International - Australia",
    title:
      "An Automatic optimized fedoral selection system with extreme learnings machido in Retinopathy defition",
    year: 2020,
  },
  {
    id: 5,
    name: "Mr BVA Swamy",
    patentNumber: "2020102228",
    nature: "International - Australia",
    title:
      "A System for Detection of Corona virus in human body using Artificial Intelligence",
    year: 2020,
  },
  {
    id: 6,
    name: "Prof. P.Suresh Verma",
    patentNumber: "202141039319 A",
    nature: "National - India",
    title:
      "Network traffic flow predictive, analytical and control model for cloud based networks",
    year: 2021,
  },
  {
    id: 7,
    name: "Dr. S. Rajyalakshmi",
    patentNumber: "202141021913A",
    nature: "National - India",
    title:
      "Crystal Chemistry, Rietveld analysis, magnetic & microwave properties of Cu doped Strontium Hexaferrites",
    year: 2021,
  },
  {
    id: 8,
    name: "Dr. S. Rajyalakshmi",
    patentNumber: "202241001111 A",
    nature: "National - India",
    title: "Impact of organized retailing on traditional retail business",
    year: 2022,
  },
  {
    id: 9,
    name: "Dr. S. Rajyalakshmi",
    patentNumber: "202241000438 A",
    nature: "National - India",
    title: "Relationship marketing in hotel organizations",
    year: 2022,
  },
  {
    id: 10,
    name: "Dr. S. Rajyalakshmi",
    patentNumber: "20 2022 100 435.8",
    nature: "International-Germany(Utility Model)",
    title:
      "Intelligent management security system to protect against fraud when accessing a mobile unit with authentication options",
    year: 2022,
  },
  {
    id: 11,
    name: "Dr. S. Rajyalakshmi",
    patentNumber: "202221000835 A",
    nature: "National - India",
    title:
      "Machine learning based personality prediction system and big 5 personality traits using python language",
    year: 2022,
  },
];

export default function Patents() {
  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto max-w-7xl">
        <div className="overflow-hidden">
          <div className="p-3 sm:p-4 md:p-6">
            <BackButton />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-800 mb-4 sm:mb-5 md:mb-6 text-center">
              Patents
            </h2>
            <p className="text-center mb-4 sm:mb-5 md:mb-6 text-gray-600 text-xs sm:text-sm md:text-base px-2 sm:px-4">
              Showcasing patented inventions that spark innovation and progress.
            </p>

            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow-md">
                  <table className="min-w-full table-auto border-collapse border border-gray-200 bg-white">
                    <thead className="bg-teal-700 text-white">
                      <tr>
                        <th className="border border-gray-300 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm md:text-base">
                          S.No
                        </th>
                        <th className="border border-gray-300 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm md:text-base min-w-[120px] sm:min-w-[150px] md:min-w-[180px]">
                          Name of the Teacher
                        </th>
                        <th className="border border-gray-300 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm md:text-base min-w-[120px] sm:min-w-[140px] md:min-w-[160px]">
                          Patent Number
                        </th>
                        <th className="border border-gray-300 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm md:text-base min-w-[150px] sm:min-w-[180px] md:min-w-[220px]">
                          Nature of the Patent
                        </th>
                        <th className="border border-gray-300 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm md:text-base min-w-[200px] sm:min-w-[300px] md:min-w-[400px]">
                          Title of the Patent
                        </th>
                        <th className="border border-gray-300 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm md:text-base min-w-[100px] sm:min-w-[120px] md:min-w-[150px]">
                          Year of Award / Publish
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {patentsData.map(
                        ({ id, name, patentNumber, nature, title, year }) => (
                          <tr
                            key={id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="border border-gray-300 px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center text-xs sm:text-sm md:text-base font-medium">
                              {id}
                            </td>
                            <td className="border border-gray-300 px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base break-words">
                              {name}
                            </td>
                            <td className="border border-gray-300 px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base break-words">
                              {patentNumber}
                            </td>
                            <td className="border border-gray-300 px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base break-words">
                              {nature}
                            </td>
                            <td className="border border-gray-300 px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base break-words">
                              {title}
                            </td>
                            <td className="border border-gray-300 px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center text-xs sm:text-sm md:text-base">
                              {year}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
