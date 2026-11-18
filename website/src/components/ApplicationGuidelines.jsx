import React, { useState } from "react";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Download,
  File,
  BookOpen,
  Clipboard,
  FileCheck,
  FileSearch,
} from "lucide-react";
import {
  AutonomousApplication,
  AutonomousGuidelines,
  AutonomousInspection,
  CPECombo,
  APEduAct,
  UGCGuidelines,
  PermanentReport,
  PermanentGuidelines,
  EstNewCollegeGuidelines,
  EstNewCollegeReport,
  EstNewCollegeApp,
  NameChangeAppUG,
  PermanentApp,
  ManagementGuidelinesUG,
  ManagementReportUG,
  APSCHEAppUG,
  ShiftingAppUG,
} from "../assets/index";
const GuidelinesSection = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const documentTypes = {
    application: {
      icon: <FileCheck size={16} />,
      color: "bg-blue-100 text-blue-600",
    },
    guidelines: {
      icon: <BookOpen size={16} />,
      color: "bg-green-100 text-green-600",
    },
    report: {
      icon: <FileSearch size={16} />,
      color: "bg-purple-100 text-purple-600",
    },
    combo: {
      icon: <Clipboard size={16} />,
      color: "bg-amber-100 text-amber-600",
    },
  };

  const sections = [
    {
      title: "AP Educational Institutions Act - 1987",
      icon: <File className="text-teal-500" size={20} />,
      items: [
        {
          name: "Guidelines",
          type: "guidelines",
          pdf: APEduAct,
        },
      ],
    },
    {
      title: "Colleges With Potential for Excellence",
      icon: <File className="text-green-500" size={20} />,
      subtitle: "CPE/College of Excellence Status",
      items: [
        {
          name: "CPE Guidelines, Application & Inspection Report",
          type: "combo",
          pdf: CPECombo,
        },
      ],
    },

    {
      title: "Establishment of New College",
      icon: <File className="text-purple-500" size={20} />,
      items: [
        {
          name: "Application",
          type: "application",
          pdf: EstNewCollegeApp,
        },
        {
          name: "Guidelines",
          type: "guidelines",
          pdf: EstNewCollegeGuidelines,
        },
        {
          name: "Inspection Report",
          type: "report",
          pdf: EstNewCollegeReport,
        },
      ],
    },
    {
      title: "UGC 12(b) & 2(f)",
      icon: <File className="text-indigo-500" size={20} />,
      items: [
        {
          name: "Guidelines",
          type: "guidelines",
          pdf: UGCGuidelines,
        },
      ],
    },
    {
      title: "Permanent Affiliation",
      icon: <File className="text-red-500" size={20} />,
      items: [
        {
          name: "Application",
          type: "application",
          pdf: PermanentApp,
        },
        {
          name: "Guidelines",
          type: "guidelines",
          pdf: PermanentGuidelines,
        },
        {
          name: "Inspection Report",
          type: "report",
          pdf: PermanentReport,
        },
      ],
    },

    {
      title: "Autonomous Status",
      icon: <File className="text-blue-500" size={20} />,
      items: [
        {
          name: "Autonomous Application",
          type: "application",
          pdf: AutonomousApplication,
        },
        {
          name: "Autonomous Guidelines",
          type: "guidelines",
          pdf: AutonomousGuidelines,
        },
        {
          name: "Autonomous Inspection Report",
          type: "report",
          pdf: AutonomousInspection,
        },
      ],
    },

    {
      title: "Management Changes",
      icon: <File className="text-amber-500" size={20} />,
      subtitle: "Shifting, Name Change of College",
      items: [
        {
          name: "Change of Name Application (UG)",
          type: "application",
          pdf: NameChangeAppUG,
        },
        {
          name: "APSCHE Application for Shifting/Management Change (UG)",
          type: "application",
          pdf: APSCHEAppUG,
        },
        {
          name: "Shifting/Management Change Application (UG)",
          type: "application",
          pdf: ShiftingAppUG,
        },
        {
          name: "Management Change Report (UG)",
          type: "report",
          pdf: ManagementReportUG,
        },
        {
          name: "Management Change Guidelines (UG)",
          type: "guidelines",
          pdf: ManagementGuidelinesUG,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 w-full">
      <div className="">
        <div className="text-center mb-12">
          {/* <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            College Documentation Portal
          </h1> */}
          <h1 className="mt-3 font-extrabold text-teal-800 sm:text-3xl">
            College Documentation Portal
          </h1>
          <h2 className="mt-3 text-gray-500 sm:text-xl">
            Applications, Guidelines, and Inspection Reports
          </h2>
        </div>

        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <button
                onClick={() => toggleSection(sectionIndex)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">{section.icon}</div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {section.title}
                    </h3>
                    {section.subtitle && (
                      <p className="text-sm text-gray-500 mt-1">
                        {section.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {expandedSections[sectionIndex] ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedSections[sectionIndex] && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <ul className="divide-y divide-gray-200">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-3 ${documentTypes[item.type].color}`}
                            >
                              {documentTypes[item.type].icon}
                            </div>
                            <a
                              href={item.pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                            >
                              {item.name}
                            </a>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${documentTypes[item.type].color}`}
                            >
                              {item.type.charAt(0).toUpperCase() +
                                item.type.slice(1)}
                            </span>
                            <a
                              href={item.pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-gray-500"
                              title="Download PDF"
                            >
                              <Download className="h-5 w-5" />
                            </a>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidelinesSection;
