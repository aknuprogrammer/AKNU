import React from "react";
import {
  FaUniversity,
  FaBriefcase,
  FaGavel,
  FaAward,
  FaBalanceScale,
} from "react-icons/fa";
import { chancellor } from "@/assets";
import { BackButton } from "../components/BackButton";

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
                  src={chancellor}
                  alt="S. Abdul Nazeer"
                  className="h-full w-full object-cover object-center rounded-full border-4 border-white transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-indigo-900 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute top-0 left-0 w-20 h-32 bg-white opacity-0 group-hover:opacity-30 transform -rotate-45 group-hover:translate-x-60 transition-all duration-700"></div>
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 leading-tight">
                S. ABDUL NAZEER
              </h1>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 leading-snug">
                24th Governor of Andhra Pradesh
              </h2>
              <h3 className="text-base sm:text-lg md:text-xl font-medium mb-4">
                Chancellor, Adikavi Nannaya University
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <FaUniversity className="mr-2" />
                  <span>Andhra Pradesh, India</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-5 sm:p-6 md:p-8">
          <section className="bg-teal-700 text-white py-5 sm:py-8 px-3 sm:px-6 md:px-10 rounded-2xl my-5 sm:my-8 mx-1 sm:mx-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-6 text-left sm:text-center leading-tight">
              Distinguished Legal Career
            </h2>

            <div className="grid md:grid-cols-2 gap-5 sm:gap-8 items-center">
              <div className="relative w-full h-48 sm:h-64 bg-white shadow-lg rounded-xl">
                <div className="flex items-center justify-center h-full">
                  <FaBalanceScale className="text-8xl text-teal-700" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 leading-snug">
                  Four Decades of Judicial Excellence
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-justify">
                  S. Abdul Nazeer has served the Indian judiciary with distinction
                  for over four decades, rising from an advocate to a Supreme Court
                  judge. His journey exemplifies dedication to constitutional values
                  and judicial integrity.
                </p>
                <p className="text-base sm:text-lg leading-relaxed mt-3 sm:mt-4 text-justify">
                  As a Supreme Court judge, he was part of several landmark
                  constitutional benches that shaped India's legal landscape,
                  including the historic Ayodhya dispute verdict and the Triple
                  Talaq case.
                </p>
                <p className="text-base sm:text-lg leading-relaxed mt-3 sm:mt-4 font-semibold text-justify text-teal-700">
                  His elevation to Governor of Andhra Pradesh brings exceptional
                  legal acumen and leadership to the state.
                </p>
              </div>
            </div>
          </section>

          {/* Judicial Career Timeline */}
          <SectionCard
            title="Judicial Career (1983–4 January 2023)"
            icon={<FaGavel className="[color:#007367]" />}
          >
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[color:#007367]">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Career Timeline
                </h3>
                <div className="space-y-4">
                  <TimelineItem
                    title="Advocate"
                    institution="Karnataka High Court, Bangalore"
                    duration="1983 - May 2003"
                  />
                  <TimelineItem
                    title="Additional Judge"
                    institution="Karnataka High Court"
                    duration="May 2003 - Later"
                  />
                  <TimelineItem
                    title="Permanent Judge"
                    institution="Karnataka High Court"
                    duration="After May 2003 - February 2017"
                  />
                  <TimelineItem
                    title="Judge"
                    institution="Supreme Court of India"
                    duration="February 2017 - 4 January 2023 (Retired)"
                  />
                  <TimelineItem
                    title="24th Governor"
                    institution="Andhra Pradesh"
                    duration="February 2023 - Present"
                    current
                    highlight
                  />
                </div>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-teal-800 mb-2">
                  Notable Achievement
                </h4>
                <p className="text-gray-700">
                  Only the third judge ever to be elevated to the Supreme Court
                  without first becoming the chief justice of a high court.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Landmark Cases */}
          <SectionCard
            title="Landmark Cases & Constitutional Bench Hearings"
            icon={<FaAward className="[color:#007367]" />}
          >
            <div className="space-y-6">
              <CaseCard
                title="Triple Talaq Case (2017)"
                description="Served as the lone Muslim judge in a multi-faith bench that heard the controversial Triple Talaq case. While he and one other judge upheld the validity of the practice based on Muslim Sharia Law, the majority view (3–2) asked the Central government to bring legislation in six months to govern marriage and divorce in the Muslim community."
                year="2017"
              />
              <CaseCard
                title="Ayodhya Dispute (2019)"
                description="Part of the five-judge bench that delivered the historic Supreme Court verdict on the Ayodhya dispute. He upheld the report of ASI, which stated the existence of a Hindu structure in the disputed region. The verdict in favour of Ram Mandir ended the years-long dispute with a 5-0 verdict."
                year="2019"
              />
              <CaseCard
                title="Demonetisation Case (2022-2023)"
                description="In the months leading up to his retirement, Nazeer led a constitution bench that heard cases about the 2016 Indian banknote demonetisation carried out by the Government of India. This significant constitutional matter was addressed before his retirement on 4 January 2023."
                year="2022-2023"
              />
            </div>
          </SectionCard>

          {/* Governor Role */}
          <SectionCard
            title="Governor of Andhra Pradesh (February 2023–Present)"
            icon={<FaUniversity className="[color:#007367]" />}
          >
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border-l-4 border-[color:#007367]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Appointment
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed text-justify">
                On 12 February 2023, the President of India appointed S. Abdul
                Nazeer as the 24th Governor of Andhra Pradesh, succeeding
                Biswabhusan Harichandan.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed text-justify">
                As the Governor and Chancellor of Adikavi Nannaya University, he
                brings exceptional legal acumen, constitutional wisdom, and
                leadership experience to guide the university's vision for academic
                excellence and institutional growth.
              </p>
              <div className="bg-white p-4 rounded-lg mt-4">
                <h4 className="font-semibold text-teal-800 mb-2">
                  Key Responsibilities
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Ceremonial head of the university</li>
                  <li>Provides guidance to strengthen the university's vision</li>
                  <li>Supports academic excellence and good governance</li>
                  <li>Promotes community engagement</li>
                </ul>
              </div>
            </div>
          </SectionCard>

          {/* Early Career */}
          <SectionCard
            title="Early Legal Practice"
            icon={<FaBriefcase className="[color:#007367]" />}
          >
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <p className="text-gray-700 leading-relaxed text-justify">
                After obtaining his law degree, S. Abdul Nazeer enrolled as an
                advocate in 1983 and practised at the Karnataka High Court in
                Bangalore. His extensive practice at the High Court level provided
                him with deep insights into constitutional law and judicial
                procedures, laying the foundation for his distinguished career in
                the higher judiciary.
              </p>
            </div>
          </SectionCard>
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

const TimelineItem = ({
  title,
  institution,
  duration,
  current = false,
  highlight = false,
}) => (
  <div className="flex">
    <div className="flex flex-col items-center mr-4">
      <div
        className={`h-4 w-4 rounded-full ${
          current ? (highlight ? "bg-teal-600" : "bg-[color:#007367]") : "bg-gray-300"
        }`}
      ></div>
      {!current && <div className="w-px h-full bg-gray-300"></div>}
    </div>
    <div className="pb-4">
      <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
      {institution && (
        <p className="text-gray-700 font-medium">{institution}</p>
      )}
      <p className="text-gray-600">{duration}</p>
    </div>
  </div>
);

const CaseCard = ({ title, description, year }) => (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border-l-4 border-teal-600 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <h4 className="font-bold text-xl text-[color:#007367]">{title}</h4>
      <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">
        {year}
      </span>
    </div>
    <p className="text-gray-700 leading-relaxed text-justify">{description}</p>
  </div>
);

export default AcademicCV;

