import React, { useState } from "react";
import {
  ClipboardCheck,
  Users,
  FileText,
  School,
  Clock,
  FileSearch,
  BarChart2,
  BookOpen,
  ShieldCheck,
  ListChecks,
  Download,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { persis } from "../../assets";
import { BackButton } from "../BackButton";

// Dynamic import of all IQAC assets from the assets/iqac folder
const iqacAssets = import.meta.glob("../../assets/iqac/*.{pdf,jpg,png,jpeg,php}", {
  eager: true,
  query: "?url",
  import: "default",
});

// Helper to resolve URLs to local assets if they exist (extension-flexible)
const resolveIqacPdf = (originalUrl) => {
  if (!originalUrl || typeof originalUrl !== "string") return originalUrl;

  try {
    // Decode URL and extract the filename
    const decodedUrl = decodeURIComponent(originalUrl);
    const fileNameWithExt = decodedUrl.split("/").pop().split("?")[0];
    
    // Extract base name without extension
    const lastDotIndex = fileNameWithExt.lastIndexOf('.');
    const baseName = lastDotIndex !== -1 ? fileNameWithExt.substring(0, lastDotIndex) : fileNameWithExt;

    // Find a matching local asset in the iqac folder by comparing base names
    const assetPath = Object.keys(iqacAssets).find((path) => {
      const localFileName = path.split("/").pop();
      const localDotIndex = localFileName.lastIndexOf('.');
      const localBaseName = localDotIndex !== -1 ? localFileName.substring(0, localDotIndex) : localFileName;
      
      return localBaseName.toLowerCase() === baseName.toLowerCase();
    });

    if (assetPath) {
      return iqacAssets[assetPath];
    }
  } catch (e) {
    console.warn("Error resolving PDF:", originalUrl, e);
  }

  return originalUrl;
};

export default function Iqac() {
  const [expandedItems, setExpandedItems] = useState({});
  const [showCompositionFiles, setShowCompositionFiles] = useState(false);

  const toggleItem = (groupIndex, itemIndex) => {
    setExpandedItems((prev) => ({
      ...prev,
      [`${groupIndex}-${itemIndex}`]: !prev[`${groupIndex}-${itemIndex}`],
    }));
  };

  // Composition files data
  const compositionFiles = [
    {
      title: "IQAC Composition",
      pdf: resolveIqacPdf("IQAC Constitution.pdf"),
    },
  ];

  const rawCardGroups = [
    // ... (rest of the data remains the same)
    // {
    //   title: "Organization",
    //   items: [
    //     {
    //       icon: <Users size={20} />,
    //       title: "Composition",
    //       action: () => setShowCompositionFiles(!showCompositionFiles),
    //     },
    //   ],
    // },
    {
      title: "Reports",
      items: [
        {
          icon: <FileText size={20} />,
          title: "Annual Quality Assurance Report (AQAR)",
          pdf: "https://www.aknu.edu.in/IQAC/Annual%20Quality%20Assurance%20Report(AQAR).php",
        },
        {
          icon: <School size={20} />,
          title: "Affiliated Colleges with NAAC Grade",
          pdf: "https://www.aknu.edu.in/IQAC/links/NAAC%20Accredited%20Colleges.pdf",
        },
        {
          icon: <Clock size={20} />,
          title: "Minutes of the Meetings and ATRs",
          pdf: "https://www.aknu.edu.in/IQAC/minutes.php",
        },
      ],
    },
    {
      title: "ISO Manuals",
      items: [
        {
          icon: <ShieldCheck size={20} />,
          title: "ISO-Quality Policy",
          pdf: "https://aknu.edu.in/IQAC/links/iso/ISO%20QP.pdf",
        },
        {
          icon: <BookOpen size={20} />,
          title: "ISO-Quality Manual",
          pdf: "https://aknu.edu.in/IQAC/links/iso/Quality_manual.pdf",
        },
        {
          icon: <ListChecks size={20} />,
          title: "ISO-Standard Manual",
          pdf: "https://aknu.edu.in/IQAC/links/iso/ISO9001_2015_STANDARD_MANUAL.pdf",
        },
        {
          icon: <BarChart2 size={20} />,
          title: "ISO-Process Manual",
          pdf: "https://aknu.edu.in/IQAC/links/iso/Process_manaual.pdf",
        },
        {
          icon: <Download size={20} />,
          title: "ISO-Risk and Opportunities",
          pdf: "https://www.aknu.edu.in/IQAC/links/iso/RandO.pdf",
        },
      ],
    },
    {
      title: "Audits & Feedback",
      items: [
        {
          icon: <FileSearch size={20} />,
          title: "Academic Audit Reports",
          subItems: [
            {
              subTitle: "Internal Academic Audit Reports",
              reports: [
                {
                  year: "2016-17",
                  pdf: "https://www.aknu.edu.in/IQAC/links/Audit%20reports/IAAR-2016-17.pdf",
                },
                {
                  year: "2017-18",
                  pdf: "https://www.aknu.edu.in/IQAC/links/Audit%20reports/IAAR-2017-18.pdf",
                },
                {
                  year: "2018-19",
                  pdf: "https://www.aknu.edu.in/IQAC/links/Audit%20reports/IAAR-2018-19.pdf",
                },
                {
                  year: "2019-20",
                  pdf: "https://www.aknu.edu.in/IQAC/links/Audit%20reports/IAAR-2019-20.pdf",
                },
                {
                  year: "2020-21",
                  pdf: "https://www.aknu.edu.in/IQAC/links/Audit%20reports/IAAR-2020-21.pdf",
                },
              ],
            },
            {
              subTitle: "External Academic Audit Reports",
              reports: [
                {
                  year: "2016-17",
                  pdf: "https://www.aknu.edu.in/IQAC/links/Audit%20reports/AKNU%20EAAR%2016-17.pdf",
                },
                {
                  year: "2017-19",
                  pdf: "https://www.aknu.edu.in/IQAC/links/Audit%20reports/AKNU%20EAAR%2017-19.pdf",
                },
                {
                  year: "2019-21",
                  pdf: "https://www.aknu.edu.in/IQAC/links/Audit%20reports/AKNU%20EAAR%2019-21.pdf",
                },
              ],
            },
          ],
        },
        {
          icon: <ListChecks size={20} />,
          title: "Feedback Reports",
          subItems: [
            // {
            //   subTitle: "2016-21 Reports",
            //   reports: [
            //     {
            //       type: "View Document",
            //       pdf: "https://www.aknu.edu.in/NAAC/Criteria_1/1.1.4/feedback_flowchart.pdf",
            //     },
            //   ],
            // },
            {
              subTitle: "2022-23 Reports",
              reports: [
                {
                  type: "View Document",
                  pdf: "https://www.aknu.edu.in/IQAC/links/Feedback%20reports/Students_feedback%20(1).pdf",
                },
              ],
            },
          ],
        },
        {
          icon: <FileSearch size={20} />,
          title: "Green Audit Reports",
          subItems: [
            {
              subTitle: "Green Audit Reports",
              reports: [
                // {
                //   type: "2018",
                //   pdf: "https://www.aknu.edu.in/IQAC/links/Audit%20reports/Green%20Audit%20Report%2017-18.pdf",
                // },
                {
                  type: "2021",
                  pdf: "https://www.aknu.edu.in/IQAC/links/Audit%20reports/Green%20Audit%20Report%2020-21.pdf",
                },
              ],
            },
          ],
        },
        {
          icon: <ListChecks size={20} />,
          title: "ATRs on Feedback",
          subItems: [
            {
              subTitle: "Action Taken Reports on Feedback",
              reports: [
                {
                  type: "2016-17",
                  pdf: "https://www.aknu.edu.in/IQAC/links/ATRs/ATR%20on%20Feedback%202016-17.pdf",
                },
                {
                  type: "2017-18",
                  pdf: "https://www.aknu.edu.in/IQAC/links/ATRs/ATR%20on%20Feedback%202017-18.pdf",
                },
                {
                  type: "2018-19",
                  pdf: "https://www.aknu.edu.in/IQAC/links/ATRs/ATR%20on%20Feedback%202018-19.pdf",
                },
                {
                  type: "2019-20",
                  pdf: "https://www.aknu.edu.in/IQAC/links/ATRs/ATR%20on%20Feedback%202019-20.pdf",
                },
                {
                  type: "2020-21",
                  pdf: "https://www.aknu.edu.in/IQAC/links/ATRs/ATR%20on%20Feedback%202020-21.pdf",
                },
              ],
            },
          ],
        },
        {
          icon: <ListChecks size={20} />,
          title: "ATRs on Academic Audit",
          subItems: [
            {
              subTitle: "Action Taken Reports on Audit Reports",
              reports: [
                {
                  type: "2016-17",
                  pdf: "https://www.aknu.edu.in/IQAC/links/ATRAR/27.6.2018_2016-17.pdf",
                },
                {
                  type: "2017-18",
                  pdf: "https://www.aknu.edu.in/IQAC/links/ATRAR/17.12.2018_2017-18.pdf",
                },
                {
                  type: "2018-19",
                  pdf: "https://www.aknu.edu.in/IQAC/links/ATRAR/16.12.2019_2018-19.pdf",
                },
                {
                  type: "2019-20",
                  pdf: "https://www.aknu.edu.in/IQAC/links/ATRAR/15.12.2020_2019-20.pdf",
                },
                {
                  type: "2020-21",
                  pdf: "https://www.aknu.edu.in/IQAC/links/ATRAR/14-11-2022_2020-21%20(1).pdf",
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  // Automatically resolve all PDFs in cardGroups
  const cardGroups = rawCardGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      pdf: resolveIqacPdf(item.pdf),
      subItems: item.subItems?.map((sub) => ({
        ...sub,
        reports: sub.reports?.map((report) => ({
          ...report,
          pdf: resolveIqacPdf(report.pdf),
        })),
      })),
    })),
  }));

  const associateFaculty = [
    {
      sno: 1,
      name: "Dr. S Murali Mohan",
      designation: "Assistant Professor",
      contact: "smm.biotech@aknu.edu.in",
    },
  ];

  return (
    <div className="w-full">
      <div className="mx-4 sm:mx-16 mt-6">
        <BackButton />
      </div>

      {/* Hero Section */}
      <div className="mx-4 sm:mx-16 mt-6 bg-gradient-to-r from-teal-800 to-teal-900 p-6 text-center rounded-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Internal Quality Assurance Cell (IQAC)
        </h1>
        <p className="text-teal-100">
          Ensuring quality enhancement and sustenance in all academic and
          administrative activities
        </p>
      </div>

      {/* Director and Info Section */}
      <div className="flex flex-col md:flex-row mt-4 sm:mt-6 px-4 sm:px-16">
        <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
          <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
            <img
              src={persis}
              alt="Dr. V Persis"
              className="w-full h-full object-cover "
            />
          </div>
          <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
            Dr. V Persis
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            Director
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
            9866492711
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
            directoriqac@aknu.edu.in
          </div>
        </div>

        <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
          <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
            About IQAC
          </h3>
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
            <p className="text-justify">
           The Internal Quality Assurance Cell (IQAC) of Adikavi Nannaya University functions as a central quality-monitoring and quality-enhancement body established in accordance with the guidelines of the National Assessment and Accreditation Council (NAAC). The Cell plays a vital role in developing a systematic framework for sustaining and improving academic and administrative excellence within the university.

The IQAC is committed to promoting quality culture through continuous assessment, planning, and implementation of best practices in teaching, learning, research, governance, and extension activities. It facilitates institutional initiatives aimed at enhancing academic standards, student support systems, faculty development, research productivity, and infrastructure improvement.

The Cell regularly coordinates the collection and analysis of academic and administrative data required for quality assurance processes, accreditation, and ranking frameworks. It also organizes workshops, seminars, orientation programmes, and quality-related activities to create awareness among faculty members, students, and administrative staff regarding quality benchmarks and higher education reforms.

IQAC plays an important role in preparing institutional reports such as the Annual Quality Assurance Report (AQAR), coordinating NAAC accreditation processes, encouraging innovative teaching practices, promoting feedback mechanisms, and ensuring transparency and accountability in institutional functioning. Through continuous monitoring and strategic planning, the IQAC contributes significantly to the academic growth, institutional effectiveness, and long-term development of the university.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-16 py-8">

      {/* Faculty Table */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                S.No
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Designation
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contact
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {associateFaculty.map((faculty) => (
              <tr key={faculty.sno}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {faculty.sno}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {faculty.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {faculty.designation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a
                    href={`mailto:${faculty.contact}`}
                    className="text-teal-600 hover:text-teal-800"
                  >
                    {faculty.contact}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chairperson's Message */}
      {/* <section className="mb-16 mt-10">
        <div className="flex items-center mb-8">
          <div className="bg-teal-700 p-3 rounded-full mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-teal-700">
            Chairperson's Message
          </h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-gray-700 space-y-4">
            <p className="flex items-start text-[15px] text-justify">
              <span className="bg-teal-100 text-teal-700 rounded-full p-1 mr-3 mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              I am delighted to see that, the Internal Quality Assurance Cell
              (IQAC) of Adikavi Nannaya University has been taking a better
              shape and has made a big leap, with the submission of Self-Study
              Report (SSR) to the NAAC. I understand that the, IQAC is keen on
              fostering quality education in the University, by taking feedback
              time-to-time, from different stakeholders including students,
              parents, educationists and employers and looks after the necessary
              proceedings with regard to the same.
            </p>

            <p className="flex items-start text-justify">
              <span className="bg-teal-100 text-teal-700 rounded-full p-1 mr-3 mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              The IQAC has been set-up initially with an intention of sustaining
              quality education and promote innovative teaching methods for a
              better learning experience in the University education. I strongly
              believe that, the IQAC will continue to strive hard with
              commitment to ensure quality education by adopting new and
              innovative methods and technology driven strategies.
            </p>
          </div>
        </div>
      </section> */}

      {/* Key Functions */}
      <section className="mb-16 mt-16">
        <div className="flex items-center mb-8">
          <div className="bg-teal-700 p-3 rounded-full mr-4">
            <ClipboardCheck className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-teal-700">
            Key Functions of IQAC
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            "Designing quality benchmarks/parameters for academic and administrative activities",
            "Creating learner-centric environment for quality education",
            "Encouraging faculty to develop participatory teaching methods",
            "Collecting and analyzing feedback from stakeholders",
            "Disseminating information on quality parameters through workshops",
            "Coordinating quality-related activities and best practices",
            "Maintaining institutional database for quality enhancement",
            "Preparing Annual Quality Assurance Report (AQAR) for NAAC",
          ].map((item, index) => (
            <div key={index} className="flex items-start">
              <div className="bg-teal-100 text-teal-700 rounded-full p-1 mr-3 mt-1">
                <ClipboardCheck size={16} />
              </div>
              <p className="text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Composition Files Section */}

      <section className="mb-12">
        <h3 className="text-xl font-bold text-teal-700 mb-6 border-b border-teal-200 pb-2">
          Composition
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {compositionFiles.map((file, index) => (
            <div
              key={index}
              className="bg-white border border-teal-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start mb-4">
                <div className="bg-teal-100 text-teal-700 rounded-lg p-2 mr-4">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-teal-800">{file.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {file.description}
                  </p>
                </div>
              </div>
              <a
                href={file.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded hover:bg-teal-50 mt-4"
              >
                <span className="text-sm text-gray-600">View Document</span>
                <ChevronRight size={14} className="text-teal-600" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* PDF Cards Section */}
      <section>
        {cardGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-12">
            <h3 className="text-xl font-bold text-teal-700 mb-6 border-b border-teal-200 pb-2">
              {group.title}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`bg-white border border-teal-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${
                    group.title === "Audits & Feedback" ? "" : ""
                  }`}
                >
                  <div
                    className="flex items-start mb-4 cursor-pointer"
                    onClick={() => {
                      if (group.title === "Audits & Feedback") {
                        toggleItem(groupIndex, itemIndex);
                      } else if (item.action) {
                        item.action();
                      }
                    }}
                  >
                    <div className="bg-teal-100 text-teal-700 rounded-lg p-2 mr-4">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-teal-800">
                        {item.title}
                      </h4>
                    </div>
                    <div>
                      {(group.title === "Audits & Feedback" || item.action) && (
                        <ChevronDown
                          size={18}
                          className={`text-teal-600 mt-1 transition-transform ${
                            expandedItems[`${groupIndex}-${itemIndex}`] ||
                            (item.action && showCompositionFiles)
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Render differently for Audits & Feedback */}
                  {group.title === "Audits & Feedback" ? (
                    <div
                      className={`transition-all overflow-hidden ${
                        expandedItems[`${groupIndex}-${itemIndex}`]
                          ? "max-h-[1000px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {item.subItems?.map((subItem, subIndex) => (
                        <div key={subIndex} className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2 text-sm">
                            {subItem.subTitle}
                          </h5>
                          <div className="space-y-2">
                            {subItem.reports.map((report, reportIndex) => (
                              <a
                                key={reportIndex}
                                href={report.pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded hover:bg-teal-50 transition-colors"
                              >
                                <span className="text-sm text-gray-600">
                                  {report.year || report.type}
                                </span>
                                <ChevronRight
                                  size={14}
                                  className="text-teal-600"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : item.subItems ? (
                    <div className="space-y-4">
                      {item.subItems.map((subItem, subIndex) => (
                        <div key={subIndex}>
                          <h5 className="font-medium text-gray-700 mb-2">
                            {subItem.subTitle}
                          </h5>
                          <div className="space-y-2">
                            {subItem.reports.map((report, reportIndex) => (
                              <a
                                key={reportIndex}
                                href={report.pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded hover:bg-teal-50"
                              >
                                <span className="text-sm text-gray-600">
                                  {report.year || report.type}
                                </span>
                                <ChevronRight
                                  size={14}
                                  className="text-teal-600"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : item.pdf ? (
                    <a
                      href={item.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded hover:bg-teal-50 mt-4"
                    >
                      <span className="text-sm text-gray-600">
                        View Document
                      </span>
                      <ChevronRight size={14} className="text-teal-600" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
      </div>
    </div>
  );
}
