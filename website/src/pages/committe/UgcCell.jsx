import { useState } from "react";
import { vijaya } from "../../assets";
const UGCCell = () => {
  const [activeTab, setActiveTab] = useState("home");

  // Sample circulars data
  const circulars = [
    {
      date: "10-01-2023",
      title: "Circular - Two academic programmes simultaneously - HEIs",
      link: "UGC/links/UGC_two-academic-prog-HEIs.pdf",
      isNew: true,
    },
    {
      date: "27-12-2022",
      title: "Circular - Ministry of Tribal Affairs",
      link: "UGC/links/Government of India - Ministry of Tribal Affairs circular.pdf",
      isNew: true,
    },
    {
      date: "27-12-2022",
      title:
        "National Fellowship & Scholarship for Higher Education of ST students for the year 2022-23",
      link: "UGC/links/27-12-2022.pdf",
      isNew: true,
    },
    {
      date: "20-12-2022",
      title: "Letter Minimum Standards and Procedure for the Award of PhD",
      link: "UGC/links/circular4.pdf",
      isNew: true,
    },
    {
      date: "20-12-2022",
      title: "Minimum Standards and Procedure for Award of PhD Degree",
      link: "UGC/links/circular5.pdf",
      isNew: false,
    },
    {
      date: "18-08-2021",
      title: "UGC NET cycle JUNE 2021 Notification",
      link: "UGC/links/Circular 1.pdf",
      isNew: false,
    },
    {
      date: "18-08-2021",
      title: "UGC NET information brochure",
      link: "UGC/links/Circular 2.pdf",
      isNew: false,
    },
    {
      date: "18-08-2021",
      title: "Age relaxation limit for JRF - UGC NET",
      link: "UGC/links/Circular 3.pdf",
      isNew: false,
    },
    {
      date: "11-08-2021",
      title: "DST-FIST 2021",
      link: "UGC/links/DST - FIST 2021.pdf",
      isNew: false,
    },
  ];

  // Fellowships data
  const fellowships = [
    {
      name: "UGC Fellowships",
      link: "https://www.ugc.ac.in/ugc_schemes",
      description: "University Grants Commission Fellowships",
    },
    {
      name: "DBT-JRF",
      link: "https://www.dbtjrf.gov.in",
      description: "Department of Biotechnology Junior Research Fellowship",
    },
    {
      name: "Rajiv Gandhi National Fellowship",
      link: "https://www.ugc.ac.in/rgnf",
      description: "UGC Rajiv Gandhi National Fellowship",
    },
    {
      name: "DST Fellowships",
      link: "https://dst.gov.in/fellowship-opportunities-researchers",
      description: "Department of Science and Technology Fellowships",
    },
    {
      name: "DST Inspire",
      link: "https://online-inspire.gov.in/Account/INSPIREProgramme",
      description: "Innovation in Science Pursuit for Inspired Research",
    },
  ];

  // Faculty data
  const faculty = [
    {
      id: 1,
      name: "Dr. IJN Padmavathi",
      designation: "Faculty Associate",
      contact: "ijnp.biochem@aknu.edu.in",
    },
  ];

  // Scholarships data
  const scholarships = [
    {
      name: "National Scholarship Portal",
      link: "https://scholarships.gov.in",
      description: "Government of India's scholarship platform",
    },
  ];

  // UGC Notices data
  const ugcNotices = [
    {
      name: "UGC Notices",
      link: "https://www.ugc.ac.in/ugc_notices.aspx",
      description: "Official UGC notices and announcements",
    },
  ];

  // NSQF Programs data
  const nsqfPrograms = [
    {
      date: "11-08-2021",
      title: "UGC-NSQF approved programmes",
      link: "UGC/links/UGC NSQF approved programmes.pdf",
    },
    {
      date: "11-08-2021",
      title: "AKNU UGC NSQF ongoing programmes",
      link: "UGC/links/AKNU UGC NSQF ongoing programmes.pdf",
    },
  ];

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mx-4 sm:mx-16 mt-6 bg-gradient-to-r from-teal-800 to-teal-900 p-6 text-center rounded-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          AKNU - UGC Cell
        </h1>
        <p className="text-teal-100">
          University Grants Commission Initiatives and Resources
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-teal-200 px-4 sm:px-16">
        <div className="w-full">
            <div className="flex overflow-x-auto gap-2 px-2 sm:px-4 scrollbar-hide snap-x snap-mandatory">
              <TabButton
                label="Home"
                isActive={activeTab === "home"}
                onClick={() => setActiveTab("home")}
              />
              <TabButton
                label="About"
                isActive={activeTab === "about"}
                onClick={() => setActiveTab("about")}
              />
              <TabButton
                label="UGC Notices"
                isActive={activeTab === "notices"}
                onClick={() => setActiveTab("notices")}
              />
              <TabButton
                label="Scholarships"
                isActive={activeTab === "scholarships"}
                onClick={() => setActiveTab("scholarships")}
              />
              <TabButton
                label="Fellowships"
                isActive={activeTab === "fellowships"}
                onClick={() => setActiveTab("fellowships")}
              />
              <TabButton
                label="Circulars"
                isActive={activeTab === "circulars"}
                onClick={() => setActiveTab("circulars")}
              />
              <TabButton
                label="NSQF Programs"
                isActive={activeTab === "programs"}
                onClick={() => setActiveTab("programs")}
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-4 sm:px-16 py-6">
          {activeTab === "home" && <HomeContent faculty={faculty} />}

          {activeTab === "about" && <AboutContent />}

          {activeTab === "notices" && (
            <ExternalResources title="UGC Notices" resources={ugcNotices} />
          )}

          {activeTab === "scholarships" && (
            <ExternalResources title="Scholarships" resources={scholarships} />
          )}

          {activeTab === "fellowships" && (
            <ExternalResources title="Fellowships" resources={fellowships} />
          )}

          {activeTab === "circulars" && (
            <CircularsContent circulars={circulars} />
          )}

          {activeTab === "programs" && <NSQFContent programs={nsqfPrograms} />}
        </div>
    </div>
  );
};

const TabButton = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 snap-start px-3 py-2 md:px-4 md:py-3 font-medium text-sm md:text-base whitespace-nowrap transition-colors duration-200 rounded-md md:rounded-none ${
        isActive
          ? "text-teal-800 md:border-b-2 md:border-teal-600 bg-teal-50"
          : "text-teal-600 hover:text-teal-800 hover:bg-teal-50"
      }`}
    >
      {label}
    </button>
  );
};

const HomeContent = ({ faculty }) => {
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-5 md:gap-6 mb-8">
        <div className="w-full md:w-1/3">
          <div className="bg-teal-50 rounded-lg p-4 text-center shadow-sm">
            <img
              src={vijaya}
              alt="Prof. Dr. P Vijaya Nirmala"
              className="w-48 h-48 object-cover rounded-lg mx-auto mb-4 shadow-md"
            />
            <div className="bg-teal-100 p-3 rounded-lg">
              <h4 className="font-semibold text-teal-800">
                Prof. Dr. P Vijaya Nirmala
              </h4>
              <p className="text-teal-600">UGC Coordinator</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <div className="bg-teal-50 rounded-lg p-4 md:p-5 h-full shadow-sm">
            <h3 className="text-teal-800 font-semibold mb-4 border-b border-teal-200 pb-2 text-base md:text-lg">
              Contact Information
            </h3>
            <ul className="space-y-3">
              <li className="flex flex-col sm:flex-row gap-1 sm:gap-0">
                <span className="text-teal-700 font-medium sm:w-32 w-full sm:flex-shrink-0">
                  Name:
                </span>
                <span className="text-teal-800 break-words sm:break-normal">
                  Prof. Dr. P Vijaya Nirmala
                </span>
              </li>
              <li className="flex flex-col sm:flex-row gap-1 sm:gap-0">
                <span className="text-teal-700 font-medium sm:w-32 w-full sm:flex-shrink-0">
                  Designation:
                </span>
                <span className="text-teal-800 break-words sm:break-normal">
                  UGC Coordinator
                </span>
              </li>
              <li className="flex flex-col sm:flex-row gap-1 sm:gap-0">
                <span className="text-teal-700 font-medium sm:w-32 w-full sm:flex-shrink-0">
                  Phone:
                </span>
                <span className="text-teal-800 break-words sm:break-normal">
                  7093008471
                </span>
              </li>
              <li className="flex flex-col sm:flex-row gap-1 sm:gap-0">
                <span className="text-teal-700 font-medium sm:w-32 w-full sm:flex-shrink-0">
                  Email:
                </span>
                <a
                  href="mailto:ugccell@aknu.edu.in"
                  className="text-teal-600 hover:text-teal-800 break-words sm:break-normal"
                >
                  ugccell@aknu.edu.in
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-teal-800 font-semibold mb-4 border-b border-teal-200 pb-2 text-lg">
          About Section
        </h3>
        <div className="bg-teal-50 rounded-lg p-5 shadow-sm">
          <p className="text-teal-700 mb-4 text-justify">The UGC Cell of Adikavi Nannaya University functions as an important administrative and academic support unit that coordinates matters related to the University Grants Commission (UGC). The Cell facilitates the implementation of UGC policies, guidelines, schemes, and developmental programmes within the university.

The primary objective of the UGC Cell is to ensure effective communication and coordination between the university and the University Grants Commission regarding academic development, quality enhancement, institutional funding, research promotion, faculty development, and regulatory compliance. The Cell assists various departments and centres in preparing proposals for grants, development projects, seminars, workshops, and research initiatives supported by the UGC.

The Cell also monitors the utilization of grants received under different UGC schemes and ensures the timely submission of utilization certificates, progress reports, and related documentation. In addition, it supports the implementation of academic reforms, quality assurance measures, and capacity-building programmes in accordance with national higher education policies.

Through its activities, the UGC Cell contributes to strengthening academic standards, research culture, infrastructure development, and institutional excellence across the university.</p>
          <p className="text-teal-700 mb-2">
            <b>With great wishes.</b>
          </p>
          <h6 className="text-teal-800 font-semibold">
            Dr. P Vijaya Nirmala, UGC Coordinator
          </h6>
        </div>
      </div>

      <div>
        <h3 className="text-teal-800 font-semibold mb-4 border-b border-teal-200 pb-2 text-lg">
          Faculty Associates
        </h3>
        <div className="overflow-x-auto shadow-sm rounded-lg">
          <table className="min-w-full divide-y divide-teal-200">
            <thead className="bg-teal-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
                >
                  SNo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
                >
                  Designation
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
                >
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-teal-200">
              {faculty.map((person) => (
                <tr key={person.id} className="hover:bg-teal-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-900">
                    {person.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-teal-800">
                    {person.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-teal-700">
                    {person.designation}
                  </td>
                  <td className="px-6 py-4 text-sm text-teal-600">
                    <a
                      href={`mailto:${person.contact}`}
                      className="hover:text-teal-800"
                    >
                      {person.contact}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AboutContent = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-teal-800 mb-6 border-b border-teal-200 pb-3">
        About the UGC
      </h2>

      <div className="prose max-w-none">
        <p className="text-teal-700 mb-4">
          The UGC was established in 1956 as a statutory body of the Government
          of India through an Act of Parliament for the coordination,
          determination and maintenance of standards of university education in
          India. The main objective of UGC is to promote quality education and
          research in the Universities. The UGC cell was established in 2018 at
          Adikavi Nannaya University campus, Rajamahendravaram. The office of
          the UGC cell plays a vital link between Adikavi Nannaya University and
          University Grants Commission, New Delhi for promoting and coordinating
          university education, for applying and monitoring various schemes and
          scholarships launched by UGC.
        </p>

        <p className="text-teal-700 font-semibold mb-3">
          Activities monitored by UGC cell:
        </p>

        <ul className="list-disc pl-5 text-teal-700 space-y-2 mb-6">
          <li>
            Online Submission of JRF applications for the processing of PhD
            fellowships to UGC canara bank web portal (scholarship.canara bank)
            month-wise.
          </li>
          <li>
            Processing applications of various schemes under National
            Scholarship Portal.
          </li>
          <li>
            Conveying the information retrieved from UGC notified circulars
            regularly to respective sections / departments.
          </li>
          <li>Processing 2(f) and 12(b) applications.</li>
          <li>
            Updating the University information in University Activity
            Monitoring Portal (UAMP).
          </li>
          <li>
            Monitoring UGC – National Skill Qualification Framework (NSQF)
            programme.
          </li>
        </ul>

        <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
          <h3 className="text-lg font-semibold text-teal-800 mb-2">
            UGC's Mission
          </h3>
          <p className="text-teal-700">
            The University Grants Commission is dedicated to maintaining
            standards of higher education, providing funds to universities and
            colleges, and coordinating between the central government and state
            governments on education matters.
          </p>
        </div>
      </div>
    </div>
  );
};

const ExternalResources = ({ title, resources }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-800 mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
        {resources.map((resource, index) => (
          <a
            key={index}
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 md:p-5 bg-white rounded-lg shadow-sm border border-teal-100 hover:border-teal-300 transition-colors duration-200 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-teal-700 mb-2">
              {resource.name}
            </h3>
            <p className="text-teal-600 text-sm">{resource.description}</p>
            <div className="mt-3 flex items-center text-teal-500 text-sm">
              <span>Visit resource</span>
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

const CircularsContent = ({ circulars }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-800 mb-6">
        AKNU UGC Circulars
      </h2>
      <div className="space-y-4">
        {circulars.map((circular, index) => (
          <CircularItem
            key={index}
            date={circular.date}
            title={circular.title}
            link={circular.link}
            isNew={circular.isNew}
          />
        ))}
      </div>
    </div>
  );
};

const CircularItem = ({ date, title, link, isNew }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start p-4 bg-white rounded-lg shadow-sm border border-teal-100 hover:border-teal-300 transition-colors duration-200">
      <div className="flex-shrink-0">
        <div className="bg-teal-100 text-teal-800 rounded-lg p-2 w-20 text-center">
          <span className="block text-xs font-semibold">
            {date.split("-")[0]}
          </span>
          <span className="block text-sm font-bold">
            {date.split("-")[1]}-{date.split("-")[2]}
          </span>
        </div>
      </div>

      <div className="sm:ml-4 mt-3 sm:mt-0 flex-1 min-w-0">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-800 hover:text-teal-600 font-medium transition-colors duration-200 break-words"
        >
          {title}
        </a>
      </div>

      {isNew && (
        <div className="sm:ml-2 mt-3 sm:mt-0 flex-shrink-0">
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
            New
          </span>
        </div>
      )}
    </div>
  );
};

const NSQFContent = ({ programs }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-800 mb-6">
        NSQF Programs
      </h2>
      <div className="space-y-4">
        {programs.map((program, index) => (
          <div
            key={index}
            className="p-4 bg-white rounded-lg shadow-sm border border-teal-100 hover:border-teal-300 transition-colors duration-200"
          >
            <a
              href={program.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-800 hover:text-teal-600 font-medium transition-colors duration-200 flex items-start"
            >
              <span className="text-red-600 font-medium mr-2">
                {program.date}
              </span>
              {program.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UGCCell;
