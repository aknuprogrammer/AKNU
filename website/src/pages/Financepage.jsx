import React, { useState } from "react";
import { BackButton } from "../components/BackButton";
import { vswamy23 } from "../assets";
import AnnualReport from "../assets/Finance Officer/Annual Report.pdf";
import Finance2023 from "../assets/Finance Officer/Annual Account Balances 2023-24.pdf";
import Finance2022 from "../assets/Finance Officer/Annual Account Balances 2022-23.pdf";
const FinancePage = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [activeYear, setActiveYear] = useState("2023-24");

  const committeeMembers = [
    {
      id: 1,
      name: "Prof S. Prasanna Sree",
      designation: "Vice-Chancellor",
      affiliation: "Adikavi Nannaya University, Rajamahendravaram",
    },
    {
      id: 2,
      name: "Sri. D. Surendra",
      designation: "Joint Financial Advisor to Government",
      affiliation: "Finance Department, Government of Andhra Pradesh",
    },
    {
      id: 3,
      name: "Sri Y. Satya Narayana (Retd.)",
      designation: "Addl. Commissioner",
      affiliation: "Commercial Taxes",
    },
    {
      id: 4,
      name: "Sri Gandham Narayana Rao",
      designation: "President & Correspondent",
      affiliation: "Little Rose Degree College, Dhraksharammam",
    },
    {
      id: 5,
      name: "Dr K Nooka Ratnam",
      designation: "Dept. of Geology",
      affiliation:
        "College of Science and Technology, Adikavi Nannaya University, Rajamahendravaram",
    },
    {
      id: 6,
      name: "Sri K Srinivasa Rao",
      designation: "Finance Officer",
      affiliation: "Secretary",
    },
  ];

  const financialDocuments = {
    balanceSheets: {
      "2023-24": Finance2023,
      "2022-23": Finance2022,
    },
    annualReports: {
      "2023-24": AnnualReport,
    },
  };

  const financeOfficer = {
    name: "Prof. K.V. Swamy",
    designation: "Finance Officer(I/c)",
    phone: "7093008478",
    fax: "0883-2566005",
    email: "--",
    image: vswamy23, // Update this path to your actual image path
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-16">
      <BackButton />
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side Navigation */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-8">
            <div className="p-4 bg-teal-700 text-white">
              <h2 className="text-xl font-bold">COMMITTEES</h2>
            </div>
            <ul className="divide-y divide-gray-200">
              <li>
                <button
                  onClick={() => setActiveTab("home")}
                  className={`w-full text-left px-4 py-3 hover:bg-teal-50 ${activeTab === "home" ? "bg-teal-100 text-teal-800 font-medium" : "text-gray-700"}`}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("financeCommittee")}
                  className={`w-full text-left px-4 py-3 hover:bg-teal-50 ${activeTab === "financeCommittee" ? "bg-teal-100 text-teal-800 font-medium" : "text-gray-700"}`}
                >
                  Finance Committee
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("annualAccounts")}
                  className={`w-full text-left px-4 py-3 hover:bg-teal-50 ${activeTab === "annualAccounts" ? "bg-teal-100 text-teal-800 font-medium" : "text-gray-700"}`}
                >
                  Annual Accounts Including Balance Sheet
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("annualReport")}
                  className={`w-full text-left px-4 py-3 hover:bg-teal-50 ${activeTab === "annualReport" ? "bg-teal-100 text-teal-800 font-medium" : "text-gray-700"}`}
                >
                  Annual Report
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side Content */}
        <div className="w-full md:w-3/4">
          {activeTab === "home" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-teal-800 mb-6">
                Finance Department
              </h1>

              <div className="mb-8">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-teal-700 mb-4">
                    Finance Officer
                  </h2>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Finance Officer Image */}
                      <div className="w-full md:w-1/4">
                        <div className="bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={financeOfficer.image}
                            alt={financeOfficer.name}
                            className="w-full h-auto object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/default-profile.jpg"; // Fallback image
                            }}
                          />
                        </div>
                      </div>

                      {/* Finance Officer Details */}
                      <div className="w-full md:w-3/4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-gray-700">Name:</p>
                            <p className="text-gray-900">
                              {financeOfficer.name}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">
                              Designation:
                            </p>
                            <p className="text-gray-900">
                              {financeOfficer.designation}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Phone:</p>
                            <p className="text-gray-900">
                              {financeOfficer.phone}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Fax:</p>
                            <p className="text-gray-900">
                              {financeOfficer.fax}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Email:</p>
                            <p className="text-gray-900">
                              {financeOfficer.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-teal-700 mb-4">
                  About Finance Department
                </h2>
                <p className="text-[#374151] text-sm text-justify leading-6">
                  The Finance Department of Adikavi Nannaya University manages
                  all financial operations, budgeting, accounts, and financial
                  planning for the university. We ensure transparency and
                  compliance with all financial regulations.
                </p>
              </div>
            </div>
          )}

          {activeTab === "financeCommittee" && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-teal-700 text-white">
                <h2 className="text-xl font-bold">Finance Committee</h2>
              </div>
              <div className="p-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-teal-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">
                        S.No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">
                        Name of the Committee member
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {committeeMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {member.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {member.designation}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.affiliation}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "annualAccounts" && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-teal-700 text-white">
                <h2 className="text-xl font-bold">
                  Annual Accounts Including Balance Sheet
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Year Selection Sidebar */}
                  <div className="w-full md:w-1/4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="font-medium text-teal-800 mb-3">
                        Select Academic Year
                      </h3>
                      <ul className="space-y-2">
                        {Object.keys(financialDocuments.balanceSheets).map(
                          (year) => (
                            <li key={year}>
                              <button
                                onClick={() => setActiveYear(year)}
                                className={`w-full text-left px-3 py-2 rounded ${activeYear === year ? "bg-teal-100 text-teal-800 font-medium" : "text-gray-700 hover:bg-gray-100"}`}
                              >
                                {year}
                              </button>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* PDF Viewer */}
                  <div className="w-full md:w-3/4">
                    <div className="bg-gray-100 p-1 rounded-lg border border-gray-300">
                      <iframe
                        src={financialDocuments.balanceSheets[activeYear]}
                        className="w-full h-[600px]"
                        title={`Balance Sheet ${activeYear}`}
                      >
                        <p>
                          Your browser does not support iframes. Please download
                          the PDF to view it:
                          <a
                            href={financialDocuments.balanceSheets[activeYear]}
                          >
                            Download PDF
                          </a>
                        </p>
                      </iframe>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <a
                        href={financialDocuments.balanceSheets[activeYear]}
                        download
                        className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download Balance Sheet
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "annualReport" && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-teal-700 text-white">
                <h2 className="text-xl font-bold">Annual Report</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* PDF Viewer */}
                  <div className="w-full">
                    <div className="bg-gray-100 p-1 rounded-lg border border-gray-300">
                      <iframe
                        src={financialDocuments.annualReports[activeYear]}
                        className="w-full h-[600px]"
                        title={`Annual Report ${activeYear}`}
                      >
                        <p>
                          Your browser does not support iframes. Please download
                          the PDF to view it:
                          <a
                            href={financialDocuments.annualReports[activeYear]}
                          >
                            Download PDF
                          </a>
                        </p>
                      </iframe>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <a
                        href={financialDocuments.annualReports[activeYear]}
                        download
                        className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download Annual Report
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
