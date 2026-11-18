import {
  nssForms,
  guidelineDocuments,
  nssGallary,
} from "../../../siteData/NSSData";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { venkateswaraRao } from "../../../assets/index.js";
import React, { useRef } from "react";
import { BackButton } from "../../../components/BackButton";

export function NSSGallary() {
  const displayItems = [...nssGallary, ...nssGallary]; // Duplicate for seamless scroll

  return (
    <section className="pb-8 overflow-hidden">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scrolling-track {
          display: flex;
          width: max-content;
          animation: scroll 60s linear infinite;
        }
        .scrolling-paused {
          animation-play-state: paused;
        }
      `}</style>

      <div className="mx-auto px-4 sm:px-16">
        <h2 className="text-3xl font-bold text-center text-teal-800 mb-16">
          NSS Gallery
        </h2>
        
        <div className="relative w-full overflow-hidden">
          <div
            className="scrolling-track"
            onMouseEnter={(e) =>
              e.currentTarget.classList.add("scrolling-paused")
            }
            onMouseLeave={(e) =>
              e.currentTarget.classList.remove("scrolling-paused")
            }
          >
            {displayItems.map((item, index) => (
              <div
                key={index}
                className="min-w-[300px] max-w-[300px] mx-2 rounded-lg overflow-hidden shadow-lg bg-white flex flex-col items-center justify-center transform hover:scale-[1.02] transition-all duration-500"
              >
                <img
                  src={item.link}
                  alt={item.title}
                  className="w-full h-[200px] object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const NSSFormsSection = () => {
  // Forms documents array

  const handleDownload = (pdfUrl) => {
    if (!pdfUrl) return;
    // For .xls files, force download instead of opening in new tab
    if (pdfUrl.endsWith(".xls") || pdfUrl.endsWith(".xlsx")) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = pdfUrl.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(pdfUrl, "_blank");
    }
  };

  return (
    <div className=" py-12">
      <h2 className="text-3xl font-bold text-teal-800 mb-2 text-center">
        NSS Forms & Applications
      </h2>
      <p className="text-gray-700 text-center mb-12 max-w-2xl mx-auto text-[16px]">
        Download all necessary forms for NSS unit management and volunteer
        enrollment
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {nssForms.map((form, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
            onClick={() => handleDownload(form.pdfUrl)}
          >
            <div className="p-6 flex items-start space-x-4">
              <div className="bg-teal-700/10 text-teal-700 text-3xl p-3 rounded-lg group-hover:bg-teal-700 group-hover:text-white transition-colors">
                {form.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-teal-700 transition-colors">
                  {form.title}
                </h3>
                <p className="text-gray-500 text-[16px] mt-1">
                  {form.description}
                </p>
              </div>
            </div>
            <div className="px-6 pb-4">
              <button
                className="text-teal-700 font-medium text-sm flex items-center hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(form.pdfUrl);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Download Form
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NSSGuidelinesCards = () => {
  const handleDownload = (pdfUrl) => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-teal-800  mb-8 text-center">
        NSS Guidelines & Manuals
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guidelineDocuments.map((doc, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-teal-700/20 hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between items-center text-center"
            onClick={() => handleDownload(doc.pdfUrl)}
          >
            <div className="p-4 text-teal-700">
              <h3 className="font-semibold text-lg">{doc.title}</h3>
            </div>

            <div className="p-5 flex justify-center">
              <ArrowRight className="text-teal-700 h-6 w-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NSSPage = () => {
  return (
    <div className="min-h-screen text-[16px] mt-8">
      {/* <BackButton className="px-16 p-5" /> */}
      <header className="bg-teal-700 text-white py-6 shadow-md">
        <div className="px-4 sm:px-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-full">
                <img
                  src="nss.png"
                  alt="NSS Logo"
                  className="h-16 w-16 object-contain rounded-xl"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  National Service Scheme By Adikavi Nannaya University
                </h1>
                <p className="italic">"NOT ME BUT YOU"</p>
              </div>
            </div>
            {/* <div className="hidden md:block">
              <p className="text-right">Adikavi Nannaya University</p>
              <p className="text-right">Since 2012</p>
            </div> */}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-700 to-[#00a896] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Serving the Nation with Pride
          </h2>
          <p className="max-w-3xl mx-auto">
            The National Service Scheme (NSS) is a Central Government Scheme of
            Ministry of Youth Affairs & Sports, Government of India aimed at
            developing the personality and character of student youth through
            voluntary community service.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-white opacity-20"></div>
      </section>
      {/* <div>
        <BackButton className="px-16 p-5" />
      </div> */}

      {/* Main Content */}
      <main className="px-4 sm:px-16 py-8">
        {/* About Section */}
        <section className="mb-16">
          <BackButton />
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-teal-800 mb-6">
                About NSS
              </h2>
              <p className="text-gray-700 mb-4 text-[16px] text-justify">
                Launched in 1969 with 40,000 volunteers, NSS has now expanded to
                657 Universities and +2 councils with a strength of 7.4 crore
                volunteers.
              </p>
              <p className="text-gray-700 mb-4 text-[16px] text-justify">
                Adikavi Nannaya University has been conducting NSS activities
                since 2012 through its affiliated colleges. Our NSS cell has
                achieved numerous awards at the national level, with volunteers
                participating in National Integration Camps, Youth Festivals,
                Republic Day parades, and National Adventure Camps.
              </p>
            </div>
            <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-lg border border-teal-700/20">
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                alt="NSS Volunteers"
                className="w-full h-auto rounded-md"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-teal-800 mb-4">
            About NSS Co-Ordinator
          </h2>
          <div className="flex flex-col md:flex-row w-full min-h-[260px] overflow-x-hidden">
            <div className="bg-teal-700 md:w-1/3 flex flex-col items-center justify-start pt-8 pb-4">
              <img
                src={venkateswaraRao}
                alt="Dr. P Venkateswara Rao"
                className="w-40 h-56 sm:w-48 sm:h-64 md:w-56 md:h-72 object-cover bg-white border-4 border-white mb-4 shadow-md rounded"
              />
              <p className="text-white font-bold text-[16px] mt-2 mb-1 text-left w-full px-6">
                Dr. P Venkateswara Rao
              </p>
              <p className="text-white text-[16px] mb-1 text-left w-full px-6">
                NSS Co-Ordinator
              </p>
            </div>
            <div className="md:w-2/3 px-4 sm:px-6 md:px-8 py-6 flex flex-col justify-center bg-[#f4e4c9]">
              <p className="text-gray-700 mb-3 text-[16px] leading-6 max-w-[75ch] text-justify">
                Adikavi Nannaya University was established in the year 2006 to
                cater the educational need of the public of both East and West
                Godavari districts. Sports board of the university was
                established in the year 2010 with an objective of bringing all
                round development in the students of university constituent
                colleges and affiliated colleges through promoting sportsmanship
                and team spirit. Moreover Sports is a means of physical and
                mental development besides creating harmony in the country. The
                university Sports Board is an important and key unit of Adikavi
                Nannaya University which coordinates different sports activities
                among the university constituent colleges and affiliated
                colleges.
              </p>

              {/* <a
            className="inline-flex items-center gap-1 text-lg font-medium hover:underline group"
            style={{ color: "#004d40" }}
          >
            Know More
            <ArrowUpRight
              size={16}
              className="transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </a> */}
            </div>
          </div>
        </section>

        <div className="pt-12">
          {/* Objectives Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-teal-800 mb-8 text-center">
              Objectives of NSS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "To understand the community and oneself in relation to the community",
                "To identify community needs and problems and involve in problem-solving",
                "To develop social and civic responsibility among volunteers",
                "To utilize knowledge in finding practical solutions to problems",
                "To gain skills in mobilizing community participation",
                "To acquire leadership qualities and democratic values",
                "To develop capacity to meet emergencies and natural disasters",
                "To practice national integration and social harmony",
              ].map((objective, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md border-l-4 border-teal-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start">
                    <div className="bg-teal-700 text-white rounded-full h-8 w-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 text-[16px]">{objective}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-teal-800 mb-8 text-center">
              Benefits of Being an NSS Volunteer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Social Leadership",
                  desc: "Develop into an accomplished social leader",
                  icon: "👥",
                },
                {
                  title: "Administrative Skills",
                  desc: "Become an efficient administrator",
                  icon: "📊",
                },
                {
                  title: "Human Understanding",
                  desc: "Grow as a person who understands human nature",
                  icon: "❤️",
                },
                {
                  title: "Practical Knowledge",
                  desc: "Apply classroom knowledge to real-world problems",
                  icon: "🔍",
                },
                {
                  title: "Teamwork",
                  desc: "Learn to work collaboratively in diverse groups",
                  icon: "🤝",
                },
                {
                  title: "National Pride",
                  desc: "Develop a sense of responsibility towards the nation",
                  icon: "🇮🇳",
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold text-teal-700 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-[16px]">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Badge Section */}
          <section className="mb-16">
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-xl shadow-md">
              <div className="md:w-1/3 flex justify-center">
                <img src="./nss.png" alt="" />
              </div>
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold text-teal-800 mb-4">
                  The NSS Badge
                </h2>
                <p className="text-gray-700 mb-4 text-[16px] text-justify">
                  The NSS badge is worn with pride by all volunteers,
                  symbolizing their commitment to serving the nation.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-teal-700 mr-2">✓</span>
                    <span className="text-[16px]">
                      The Konark wheel with 8 bars signifies 24 hours of service
                      readiness
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-700 mr-2">✓</span>
                    <span className="text-[16px]">
                      Red color represents the energy and spirit of NSS
                      volunteers
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-700 mr-2">✓</span>
                    <span className="text-[16px]">
                      Blue color signifies the cosmos, with NSS contributing to
                      mankind's welfare
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const NSSAdvisoryCommittee = () => {
  return (
    <div>
      <div className="bg-white rounded-xs shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-teal-700 p-5 sm:p-6 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
            College/+2 School Level NSS Advisory Committee
          </h2>
          <p className="mt-2 opacity-90 text-[16px]">
            The committee advises on programme planning and development under
            the Chairmanship of the Principal/Head Master
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Committee Composition */}
          <div className="mb-10">
            <h3 className="text-lg sm:text-xl font-semibold text-teal-700 mb-4 border-b pb-2">
              Composition of College/+2 Schools Advisory Committee
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    {
                      position: "Principal / Head Master",
                      role: "Chairperson",
                    },
                    {
                      position:
                        "Taluka/Block Development Officer, Officers from Forest, Health, Rural Development",
                      role: "Member",
                    },
                    {
                      position: "Two Staff Members",
                      role: "Member",
                    },
                    {
                      position:
                        "Sarpanch/Corporator/Wardmember of adopted village/slum",
                      role: "Member",
                    },
                    {
                      position: "Two NSS Student Leaders",
                      role: "Member",
                    },
                    {
                      position: "Two eminent social workers of the area",
                      role: "Member",
                    },
                    {
                      position: "Programme Officer, NSS",
                      role: "Member-Secretary",
                    },
                  ].map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-normal text-sm text-gray-700 max-w-md">
                        {item.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.role === "Chairperson"
                              ? "bg-teal-700 text-white"
                              : item.role === "Member-Secretary"
                                ? "bg-teal-700/20 text-teal-700 border border-teal-700/30"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Meeting Frequency */}
          <div className="mb-10 bg-[#f8fafc] p-6 rounded-lg border border-teal-700/20">
            <h3 className="text-xl font-semibold text-teal-700 mb-3">
              Frequency of Meeting
            </h3>
            <div className="flex items-start">
              <div className="bg-teal-700 text-white rounded-full h-6 w-6 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-gray-700 text-[16px] text-justify">
                The College level Advisory Committee should meet once in a year.
                The aim of meeting is to assess the development of NSS programme
                in the Institution and promote a sense of participation among
                the members of the staff, public and students for community.
              </p>
            </div>
          </div>

          {/* Limitations */}
          <div>
            <h3 className="text-xl font-semibold text-teal-700 mb-4 border-b pb-2">
              Limitations
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-teal-700/10 text-teal-700 rounded-full h-6 w-6 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-gray-700 text-[16px] text-justify">
                  The Colleges/+2 School level Advisory Committee will consider
                  the proposals submitted by the Programme Officer according to
                  the administrative and policy.
                </p>
              </div>
              <div className="flex items-start">
                <div className="bg-teal-700/10 text-teal-700 rounded-full h-6 w-6 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-gray-700 text-[16px] text-justify">
                  No administrative and financial changes can be made in the
                  pattern of financial expenditure by the College / School
                  Advisory Committee.
                </p>
              </div>
              <div className="flex items-start">
                <div className="bg-teal-700/10 text-teal-700 rounded-full h-6 w-6 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-gray-700 text-[16px] text-justify">
                  As far as programme is concerned, the Advisory Committee is
                  free to select the activities suitable for their area and
                  people from amongst the activities suggested in NSS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AboutNss() {
  return (
    <div>
      <NSSPage />
      <div className="px-4 sm:px-16 py-8">
        <NSSAdvisoryCommittee />
        <NSSGuidelinesCards />
        <NSSFormsSection />
      </div>

      <NSSGallary />
    </div>
  );
}
