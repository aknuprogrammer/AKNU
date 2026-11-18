import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { BackButton } from "./BackButton";

const programs = [
  {
    id: 1,
    image:
      "https://www.gitam.edu/sites/default/files/course/image/Sub-Image_14.jpg",
    title: "Bachelor of Arts with major in Psychology",
    school: "GITAM School of Humanities and Social Sciences - Hyderabad",
    discipline: "Humanities and Social Sciences",
    level: "Undergraduate",
    duration: "3 Years",
    link: "/hyderabad/psychology/course/bachelor-of-arts-with-major-in-psychology",
  },
  {
    id: 2,
    image:
      "https://www.gitam.edu/sites/default/files/course/image/Sub-Image_10.jpg",
    title: "Bachelor of Arts with major in Economics",
    school: "GITAM School of Humanities and Social Sciences - Hyderabad",
    discipline: "Humanities and Social Sciences",
    level: "Undergraduate",
    duration: "3 Years",
    link: "/hyderabad/economics/course/bachelor-of-arts-with-major-in-economics",
  },
  {
    id: 3,
    image:
      "https://www.gitam.edu/sites/default/files/course/image/Sub-Image_15.jpg",
    title: "Bachelor of Arts with major in English",
    school: "GITAM School of Humanities and Social Sciences - Hyderabad",
    discipline: "Humanities and Social Sciences",
    level: "Undergraduate",
    duration: "3 Years",
    link: "/hyderabad/english/course/bachelor-of-arts-with-major-in-english",
  },
];

function ProgramFinder() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFilterPopup = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const filteredPrograms = programs.filter((program) =>
    program.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-5 mt-6 overflow-x-hidden bg-white">
      <div className="w-[93%] pb-4">
        <BackButton />
      </div>
      {/* Banner */}
      <div className="relative w-[93%]">
        <img
          src="https://www.gitam.edu/sites/default/files/styles/webp/public/banners/programme-finder-header.png.webp?itok=1iqkdFVq"
          alt="programfinder"
          className="w-full object-cover shadow-md"
          style={{
            borderRadius: "1.2vh",
            clipPath:
              "polygon(0 0, calc(100% - 56px) 0, 100% 56px, 100% 100%, 0 100%)",
          }}
        />
        <h1
          className="absolute top-0 left-0 px-6 py-2 bg-white text-teal-700 font-bold text-3xl rounded-br-[1.5rem]"
          style={{
            letterSpacing: "0.05em",
            zIndex: 10,
            height: "56px",
            display: "flex",
            alignItems: "center",
          }}
        >
          Programme Finder
        </h1>
      </div>

      {/* Search + Filter */}
      <div className="mt-6 w-full max-w-[95%]">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="relative w-full max-w-[300px] ml-3">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-b border-gray-300 py-2 pr-8 text-base placeholder-teal-700 text-teal-700 focus:outline-none focus:border-teal-700 transition-colors"
            />

            <img
              src="https://www.gitam.edu/themes/gitam/assets/images/search-green.svg"
              alt="search icon"
              className="absolute right-2 top-2.5 h-4 w-4"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={toggleFilterPopup}
            className="mr-4 flex items-center gap-2 bg-teal-700 text-white px-10 py-2 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              class="bi bi-funnel"
              viewBox="0 0 16 16"
            >
              <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
            </svg>
            <span className="text-lg font-large">Filter</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[95%] ">
        {filteredPrograms.map((program) => (
          <div
            key={program.id}
            className="bg-white  rounded-lg  p-4 flex flex-col"
          >
            <img
              src={program.image}
              alt={program.title}
              className="h-48 w-full object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">{program.title}</h3>
            <p className="text-sm mb-1">
              <span className="font-semibold">School:</span> {program.school}
            </p>
            <p className="text-sm mb-1">
              <span className="font-semibold">Discipline:</span>{" "}
              {program.discipline}
            </p>
            <p className="text-sm mb-1">
              <span className="font-semibold">Programme Level:</span>{" "}
              {program.level}
            </p>
            <p className="text-sm mb-3">
              <span className="font-semibold">Duration:</span>{" "}
              {program.duration}
            </p>
            <div>
              <a
                href={program.link}
                className="inline-flex items-center gap-1 text-xl font-medium hover:underline group"
                style={{ color: "#004d40" }}
              >
                Know More
                <ArrowUpRight
                  size={18}
                  className="transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgramFinder;
