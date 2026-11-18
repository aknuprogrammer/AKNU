import React, { useState } from "react";

const timelineData = {
  "2006-2010": [
    {
      year: 2006,
      title: "INCEPTION",
      description:
        "Adikavi Nannaya University was established on April 22, 2006, through the Government of Andhra Pradesh Act No. 28 of 2006.",
    },
    {
      year: 2006,
      title: "FOUNDATION OF CONSTITUENT COLLEGES",
      description:
        "Launch of University Colleges of Arts & Commerce, Engineering, Education, and Science & Technology in Rajahmundry.",
    },
  ],
  "2010-2015": [
    {
      year: 2012,
      title: "CDC ESTABLISHED",
      description:
        "The College Development Council (CDC) was formed to coordinate affiliated and constituent colleges with regulatory agencies.",
    },
  ],
  "2016-2020": [
    {
      year: 2016,
      title: "ACADEMIC EXPANSION",
      description:
        "Introduced new postgraduate and research programs, strengthening its academic portfolio across disciplines.",
    },
    {
      year: 2018,
      title: "NAAC ACCREDITATION",
      description:
        "University received NAAC accreditation, marking a milestone in academic and institutional quality assurance.",
    },
  ],
  "2021-2026": [
    {
      year: 2021,
      title: "DIGITAL INITIATIVES",
      description:
        "Expansion into digital learning and academic collaborations to enhance student accessibility and research output.",
    },
    {
      year: 2025,
      title: "TOWARDS SILVER JUBILEE",
      description:
        "Moving closer to its 25-year journey, AKNU continues to innovate in education, research, and industry partnerships.",
    },
  ],
};

const TimelineSection = () => {
  const [activePeriod, setActivePeriod] = useState("2006-2010");

  return (
    <div className="bg-gradient-to-b from-sky-50 to-white py-8 px-4 sm:px-16" id="legacy">
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-5">
        <h2 className="text-3xl font-bold text-teal-800 sm:text-3xl">
          Explore Your Legacy
        </h2>
        <p className="text-gray-600 mt-3 text-[16px]">
          A journey of growth, innovation, and academic excellence.
          Explore the key milestones that shaped Adikavi Nannaya University
          from 2006 to 2026.
        </p>
      </div>

      {/* Period Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {Object.keys(timelineData).map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              activePeriod === period
                ? "bg-yellow-400 text-white shadow-md"
                : "bg-white text-gray-700 border hover:bg-gray-100"
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative mx-auto max-w-5xl  my-4">
        {/* Vertical Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-yellow-400 z-0"></div>

        {/* Items */}
        <div className="space-y-4 relative z-10">
          {timelineData[activePeriod].map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col sm:flex-row items-center relative ${
                idx % 2 === 0 ? "sm:flex-row-reverse" : ""
              }`}
            >
              {/* Content */}
              <div
                className={`sm:w-1/2 bg-white rounded-xl shadow-md p-6 border border-gray-100
                ${idx % 2 === 0 ? "ml-20" : "mr-20"}`}
              >
                <h3 className="text-teal-800 font-bold text-lg">
                  {item.title}
                </h3>
                <p className="text-gray-600 mt-2 text-justify">{item.description}</p>
              </div>

              {/* Year Circle */}
              <div
                className={`
                  top-1/2 -translate-y-1/2
                  py-1 px-4 max-w-[69px]
                  flex items-center justify-center rounded-full bg-teal-700 
                  text-white font-bold text-sm border-4 border-white shadow
                  absolute transform 
                  ${
                    idx % 2 === 0
                      ? "left-0 sm:left-1/2 sm:-translate-x-1/2"
                      : "right-0 sm:left-1/2 sm:-translate-x-1/2"
                  }
                `}
              >
                {item.year}
              </div>

              {/* Spacer */}
              <div className="sm:w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineSection;
