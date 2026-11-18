import LanguageCard from "@/components/home/LanguageCard";
import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import {
  FaUniversity,
  FaGraduationCap,
  FaBriefcase,
  FaGlobeAmericas,
  FaEnvelope,
  FaPhone,
  FaAward,
  FaUserTie,
  FaBook,
  FaEdit,
  FaGlobe,
  FaChartLine,
  FaMicroscope,
} from "react-icons/fa";
import { knowMoreAboutVC } from "../assets";
import { allVCData, executiveCoucil } from "../siteData/departmentsData";
import { BackButton } from "../components/BackButton";

const PublicationsSection = () => {
  const stats = [
    {
      icon: <FaBook className="[color:#007367]" />,
      title: "Books Published",
      total: 32,
      items: [
        { label: "Books Edited", value: 13 },
        { label: "Books Co-edited", value: 2 },
        { label: "Books Authored", value: 15 },
        { label: "Forthcoming Publications", value: 2 },
      ],
    },
    {
      icon: <FaEdit className="[color:#007367]" />,
      title: "Research Articles",
      total: 124,
      items: [
        { label: "National", value: 24 },
        { label: "International", value: 100 },
        { label: "Accepted (International)", value: 7 },
      ],
    },
    {
      icon: <FaGlobe className="[color:#007367]" />,
      title: "Translations",
      total: 2,
      items: [],
    },
    {
      icon: <FaUniversity className="[color:#007367]" />,
      title: "Seminars",
      total: 66,
      items: [
        { label: "Attended (National)", value: 38 },
        { label: "Attended (International)", value: 18 },
        { label: "Conducted (National)", value: 4 },
        { label: "Conducted (International)", value: 5 },
        { label: "Coordinated", value: 1 },
      ],
    },
    {
      icon: <FaMicroscope className="[color:#007367]" />,
      title: "Workshops",
      total: 22,
      items: [
        { label: "Attended (National)", value: 12 },
        { label: "Attended (International)", value: 5 },
        { label: "Conducted (National)", value: 3 },
        { label: "Conducted (International)", value: 2 },
      ],
    },
  ];

  return (
    <div className="py-12 px-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container-wide">
        <h2 className="text-3xl font-bold text-teal-800 mb-2 text-center">
          ACADEMIC CONTRIBUTIONS
        </h2>
        <div className="w-24 h-1 bg-teal-700 mx-auto mb-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
            >
              {/* Header */}
              <div className="bg-teal-700 p-6 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{category.title}</h3>
                  <p className="text-sm opacity-80">Total: {category.total}</p>
                </div>
                <div className="p-3 rounded-full bg-white bg-opacity-20 group-hover:rotate-12 transition-transform duration-300">
                  {category.icon}
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                {category.items.length > 0 ? (
                  <ul className="space-y-3">
                    {category.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-bold text-teal-700">
                          {item.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 italic">
                      Exceptional contributions in this field
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-700 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(
                        100,
                        (category.total /
                          (index === 0
                            ? 32
                            : index === 1
                              ? 124
                              : index === 3
                                ? 66
                                : 22)) *
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}

          {/* Visual Summary Card */}
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-teal-700 p-6 text-white">
              <h3 className="text-xl font-bold flex items-center">
                <FaChartLine className="mr-2" /> RESEARCH IMPACT SUMMARY
              </h3>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-gray-100 rounded-lg hover:bg-teal-700 hover:text-white transition-colors">
                <p className="text-3xl font-bold">32</p>
                <p className="text-sm">Books</p>
              </div>
              <div className="text-center p-4 border border-gray-100 rounded-lg hover:bg-teal-700 hover:text-white transition-colors">
                <p className="text-3xl font-bold">124+</p>
                <p className="text-sm">Research Papers</p>
              </div>
              <div className="text-center p-4 border border-gray-100 rounded-lg hover:bg-teal-700 hover:text-white transition-colors">
                <p className="text-3xl font-bold">88</p>
                <p className="text-sm">Seminars & Workshops</p>
              </div>
              <div className="text-center p-4 border border-gray-100 rounded-lg hover:bg-teal-700 hover:text-white transition-colors">
                <p className="text-3xl font-bold">2</p>
                <p className="text-sm">Translations</p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full mt-14">
          <h2 className="text-3xl font-bold text-teal-800 mb-2 text-center">
            SUCCESSIVE VICE-CHANCELLORS
          </h2>
          <div className="w-24 h-1 bg-teal-700 mx-auto mb-12"></div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border border-[#ccc]">
              <thead className="bg-teal-700 text-white">
                <tr>
                  <th className="px-4 py-2 whitespace-nowrap">S.No</th>
                  <th className="px-4 py-2 whitespace-nowrap">Name</th>
                  <th className="px-4 py-2 whitespace-nowrap">From</th>
                  <th className="px-4 py-2 whitespace-nowrap">To</th>
                </tr>
              </thead>
              <tbody>
                {allVCData.map((faculty, idx) => (
                  <tr
                    key={faculty.email || faculty.name}
                    className="border-t border-[#ccc]"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">{idx + 1}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{faculty.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{faculty.from}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{faculty.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const PresidentialProfile = () => {
  return (
    <div className="min-h-screeny-4">
      {/* Presidential Award Hero Section */}
      <div className="max-w-6xl mx-auto mb-12 sm:mb-16 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative">
          {/* Award Hero */}
          <div className="bg-teal-700 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 px-3 sm:px-8 py-6 sm:py-10">
            <div className="max-w-prose">
              <p className="text-white mb-2 text-base sm:text-[18px]">
                Prof S Prasanna Sree, received the{" "}
                <span className="text-[#fcc203]">Nari Shakti Puraskar</span>{" "}
                from President of INDIA Ram Nath Kovind in New Delhi.
              </p>
              <p className="text-white mb-0 sm:mb-4 text-base sm:text-[18px] text-justify">
                The award has been conferred on her for preserving minority
                tribal languages. She is the first woman in the world to devise
                scripts for as many as 19 tribal languages. She had earlier won
                a place in the{" "}
                <span className="text-[#fcc203]">
                  ‘World Atlas of Endangered Alphabets’
                </span>{" "}
                for developing alphabets for these tribal languages.
              </p>
            </div>
            <img
              src="./vcaward.png"
              alt="Presidential Award Recipient"
              className="w-full sm:w-auto max-w-[320px] sm:max-w-[420px] h-auto object-contain p-4 sm:p-6"
            />
          </div>

          {/* Award Badge */}
          <div className="hidden sm:flex absolute -bottom-8 left-8 bg-white p-4 rounded-full shadow-lg border-4 border-gold-500">
            <FaAward className="text-5xl text-[#fcc203]" />
          </div>
        </div>

        {/* Profile Header */}
        <div className="pt-8 sm:pt-16 px-4 sm:px-8 pb-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-light tracking-widest text-gray-500 mb-2">
              ACADEMIC PROFILE OF
            </h3>
            <h1 className="text-3xl sm:text-4xl font-bold text-teal-800 mb-2">
              Prof. S. PRASANNA SREE
            </h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 mb-4">
              VICE CHANCELLOR
            </h2>
            <div className="flex items-center justify-center">
              <FaUniversity className="mr-2 text-teal-700" />
              <p className="text-base sm:text-lg text-gray-600">
                ADIKAVI NANNAYA UNIVERSITY, RAJAMAHENDRAVARAM
              </p>
            </div>
          </div>
          <div className="flex justify-end items-center mt-5">
            <a
              href={knowMoreAboutVC}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-full bg-[color:#007367] text-white font-medium hover:bg-[color:#00574e] transition-colors shadow-sm"
            >
              <span>Know More</span>
            </a>
          </div>

          {/* Rest of your CV content goes here */}
          {/* Keep the existing sections but update colors to match #007367 */}
        </div>
      </div>
    </div>
  );
};

const AcademicCV = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 pt-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto pb-4">
        <BackButton />
      </div>
      {/* Header Section */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-[#418079] p-4 sm:p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="md:flex-shrink-0 mb-6 md:mb-0 md:mr-8">
              <div className="relative h-58 w-58 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-xl overflow-hidden group transition-all duration-300 hover:border-indigo-200 hover:scale-105">
                <img
                  src="./vc.jpeg"
                  alt="Prof. S. Prasanna Sree"
                  className="h-full w-full object-cover object-center rounded-full border-4 border-white  transition-all duration-500 group-hover:scale-110"
                />

                {/* Optional subtle overlay on hover */}
                <div className="absolute inset-0 bg-indigo-900 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute top-0 left-0 w-20 h-32 bg-white opacity-0 group-hover:opacity-30 transform -rotate-45 group-hover:translate-x-60 transition-all duration-700"></div>
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 leading-tight">
                Prof. S. PRASANNA SREE
              </h1>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 leading-snug">
                Vice-Chancellor, Adikavi Nannaya University
              </h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <FaUniversity className="mr-2" />
                  <span>
                    Raja Raja Narendra Nagar, Rajamahendravaram – 533296
                  </span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="mr-2" />
                  <span>vc@aknu.edu.in | sathupati@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <FaPhone className="mr-2" />
                  <span>+91 9492195195</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-5 sm:p-6 md:p-8">
          <section className="bg-teal-700 text-white py-5 sm:py-8 px-3 sm:px-6 md:px-10 rounded-2xl my-5 sm:my-8 mx-1 sm:mx-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-6 text-left sm:text-center leading-tight">
              Featured Story
            </h2>

            <div className="grid md:grid-cols-2 gap-5 sm:gap-8 items-center">
              {/* Image Placeholder */}
              <div className="relative w-full h-48 sm:h-64 bg-white shadow-lg rounded-xl overflow-hidden">
                {/* Image */}
                <img
                  src="./newsadd.jpg"
                  alt="Featured News"
                  className="object-cover w-full h-full"
                />

                {/* Top-left quote mark */}
                <div className="absolute top-2 left-2 text-3xl sm:-top-6 sm:-left-6 sm:text-6xl text-yellow-400 animate-Wiggle leading-none select-none">
                  &ldquo;
                </div>

                {/* Bottom-right quote mark */}
                <div className="absolute bottom-2 right-2 text-3xl sm:-bottom-11 sm:-right-6 sm:text-6xl text-yellow-400 animate-Wiggle leading-none select-none">
                  &rdquo;
                </div>
              </div>

              {/* Story Content */}
              <div className="">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 leading-snug">
                  Scripting History
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-justify">
                  Prof. S. Prasanna Sree, Andhra Pradesh’s first tribal woman
                  vice-chancellor, has made history by creating scripts for 19
                  tribal languages. Her tireless work has preserved endangered
                  languages and cultures, enabling future generations to embrace
                  their identity.
                </p>
                <p className="text-base sm:text-lg leading-relaxed mt-3 sm:mt-4 text-justify">
                  Through years of dedication, challenges, and close community
                  engagement, she has bridged gaps between oral traditions and
                  written records, earning national recognition and transforming
                  lives.
                </p>
                <p className="text-base sm:text-lg leading-relaxed mt-3 sm:mt-4 font-semibold text-justify">
                  Read her inspiring journey and contribution to India’s
                  linguistic heritage.
                </p>
              </div>
            </div>
          </section>
          <PresidentialProfile />

          {/* Education */}
          <SectionCard
            title="Educational Qualifications"
            icon={<FaGraduationCap className="[color:#007367] " />}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Degree
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Board/University
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Year of Passing
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Division
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 whitespace-nowrap">M.A</td>
                    <td className="py-3 px-4 whitespace-nowrap">Andhra University</td>
                    <td className="py-3 px-4 whitespace-nowrap">1986</td>
                    <td className="py-3 px-4 whitespace-nowrap">I</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 whitespace-nowrap">PhD</td>
                    <td className="py-3 px-4 whitespace-nowrap">S.P.M University</td>
                    <td className="py-3 px-4 whitespace-nowrap">1999</td>
                    <td className="py-3 px-4 whitespace-nowrap">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>
          {/* <SectionCard
            title="Social Category"
            icon={<FaUserTie className="[color:#007367]" />}
          >
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-lg font-medium">S.T</p>
            </div>
          </SectionCard> */}

          {/* Experience */}
          <SectionCard
            title="Professional Experience"
            icon={<FaBriefcase className="[color:#007367]" />}
          >
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[color:#007367]">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Total Post-Graduate Teaching Experience
                </h3>
                <p className="text-lg">36 years (since 1987)</p>
                <p className="text-lg">As Professor: 21 years (since 2002)</p>
                <p className="text-lg">
                  Administrative Experience: 34 years (1987 - present)
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[color:#007367]">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Positions Held
                </h3>
                <div className="space-y-4">
                  <TimelineItem
                    title="Lecturer (Now Asst. Prof)"
                    duration="23-2-1987 - 14-6-1994"
                  />
                  <TimelineItem
                    title="Associate Professor"
                    duration="15-6-1994 - 06-3-2002"
                  />
                  <TimelineItem
                    title="Professor"
                    duration="15-06-2002 – 18 February 2025"
                    current
                  />
                  <TimelineItem
                    title="Vice-Chancellor, Adikavi Nannaya University"
                    duration="19 February 2025 - present"
                    current
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[color:#007367]">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  International Appointments
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <InternationalCard
                    title="Visiting Senior Research Fellow"
                    institution="Institute for Advanced Semitic and Afro-asiatic Studies"
                    location="Princeton, New Jersey, USA"
                    duration="May 2014 - present"
                  />
                  <InternationalCard
                    title="Visiting Professor"
                    institution="Department of Letters, Languages and Arts"
                    location="Djillali Liabes University, Sidi BelAbbes, Algeria"
                  />
                  <InternationalCard
                    title="Visiting Senior Professor"
                    institution="Department of English"
                    location="University of Gondar, Ethiopia"
                  />
                  <InternationalCard
                    title="Visiting Senior Professor"
                    institution="Department of English"
                    location="Central University of Mizoram, India"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <LanguageCard />
          <PublicationsSection />
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const SectionCard = ({ title, icon, children }) => (
  <div className="mb-6 sm:mb-8 mt-4 sm:mt-6">
    <div className="flex items-center mb-3 sm:mb-4">
      <div className="bg-indigo-100 p-2 rounded-full mr-3 text-indigo-600">
        {icon}
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-teal-800 leading-tight">{title}</h2>
    </div>
    {children}
  </div>
);

const TimelineItem = ({ title, duration, current = false }) => (
  <div className="flex">
    <div className="flex flex-col items-center mr-4">
      <div
        className={`h-4 w-4 rounded-full ${current ? "bg-[color:#007367]" : "bg-gray-300"
          }`}
      ></div>
      {!current && <div className="w-px h-full bg-gray-300"></div>}
    </div>
    <div className="pb-4">
      <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
      <p className="text-gray-600">{duration}</p>
    </div>
  </div>
);

const InternationalCard = ({ title, institution, location, duration }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <h4 className="font-bold text-[color:#007367]">{title}</h4>
    <p className="text-gray-800 font-medium">{institution}</p>
    <p className="text-gray-600 flex items-center mt-1">
      <FaGlobeAmericas className="mr-1 text-sm" /> {location}
    </p>
    {duration && <p className="text-gray-500 text-sm mt-1">{duration}</p>}
  </div>
);

export default AcademicCV;
