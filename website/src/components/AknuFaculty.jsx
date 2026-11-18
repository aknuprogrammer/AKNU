import React, { useState } from "react";
import { subDepartsWithFullData } from "../siteData/departmentsData";
import { BackButton } from "./BackButton";

export default function AknuFaculty() {
  const [openProfile, setOpenProfile] = useState(null);

  const handleProfileClick = (faculty) => {
    setOpenProfile(faculty);
  };

  const handleCloseProfile = () => {
    setOpenProfile(null);
  };

  // Combine all faculty data into a single array with department info
  const allFaculty = subDepartsWithFullData.flatMap((dept) =>
    dept.faculty.map((faculty) => ({
      ...faculty,
      department: dept.name,
    }))
  );

  // Drag-and-scroll handlers
  const handleDragStart = (e) => {
    e.currentTarget.style.cursor = "grabbing";
    e.currentTarget.dataset.dragging = true;
    e.currentTarget.dataset.scrollStart = e.currentTarget.scrollLeft;
    e.currentTarget.dataset.mouseStart = e.clientX;
  };

  const handleDragMove = (e) => {
    const container = e.currentTarget;
    if (container.dataset.dragging === "true") {
      const scrollDelta =
        parseInt(container.dataset.mouseStart, 10) - e.clientX;
      container.scrollLeft =
        parseInt(container.dataset.scrollStart, 10) + scrollDelta;
    }
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.cursor = "grab";
    e.currentTarget.dataset.dragging = false;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full px-4 sm:px-16 py-8">
        <BackButton />
        <h2 className="text-2xl sm:text-3xl font-bold text-teal-800 mb-3 sm:mb-4">
          Our Faculty
        </h2>
        <p className="text-gray-700 mb-6 text-sm sm:text-base md:text-md text-justify">
          Our faculty members are a distinguished team of academicians, industry
          experts, and dedicated professionals committed to delivering
          high-quality education and hands-on training. Each faculty member
          brings a unique combination of academic knowledge and practical
          experience, ensuring students receive a balanced and career-oriented
          learning environment.
        </p>
        {/* Key Highlights Section */}
        <div className="mb-8">
          <h4 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-800 mb-4 sm:mb-6">
            Key Highlights
          </h4>
          <div className="p-6 sm:p-6 sm:py-0">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left Section - Magnifying Glass Icon */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <svg
                    width="200"
                    height="200"
                    viewBox="0 0 200 200"
                    className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56"
                  >
                    {/* Magnifying Glass Circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="white"
                      stroke="#dc2626"
                      strokeWidth="8"
                    />
                    {/* Magnifying Glass Handle */}
                    <line
                      x1="150"
                      y1="150"
                      x2="180"
                      y2="180"
                      stroke="#dc2626"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Text inside magnifying glass */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-teal-700 font-bold text-lg sm:text-xl lg:text-2xl">
                        Key
                      </div>
                      <div className="text-teal-700 font-bold text-lg sm:text-xl lg:text-2xl">
                        Highlights
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Highlights List */}
              <div className="flex-1 w-full space-y-3 sm:space-y-4">
                {[
                  { label: "1", description: "Highly Qualified" },
                  {
                    label: "2",
                    description: "Experienced Educators",
                  },
                  {
                    label: "3",
                    description: "Industry Exposure",
                  },
                  {
                    label: "4",
                    description: "Research & Innovation",
                  },
                  {
                    label: "5",
                    description: "Student-Centric",
                  },
                  { label: "6", description: "Mentorship & Guidance" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    {/* Left Segment - Label */}
                    <div className="bg-teal-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 font-semibold text-sm sm:text-base flex-shrink-0 min-w-[60px] sm:min-w-[80px] text-center">
                      {item.label}
                    </div>
                    {/* Right Segment - Description */}
                    <div className="bg-white border border-gray-300 px-4 sm:px-5 py-2 sm:py-2.5 flex-1 text-gray-800 text-sm sm:text-base">
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 mb-8">
          <div
            className="border border-gray-200 shadow-sm overflow-x-auto"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <table className="min-w-full text-left border border-[#ccc]">
              <thead className="bg-teal-700 text-white">
                <tr>
                  <th className="px-4 py-2">S.No</th>
                  <th className="px-4 py-2">Staff Member</th>
                  <th className="px-4 py-2">Designation</th>
                  <th className="px-4 py-2">Department</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2 ">Phone</th>
                  <th className="px-4 py-2">Photo</th>
                  <th className="px-4 py-2">Profile</th>
                </tr>
              </thead>
              <tbody>
                {allFaculty.map((faculty, idx) => (
                  <tr
                    key={faculty.email || faculty.name}
                    className="border-t border-[#ccc]"
                  >
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{faculty.name}</td>
                    <td className="px-4 py-2">{faculty.designation}</td>
                    <td className="px-4 py-2">{faculty.department}</td>
                    <td className="px-4 py-2">
                      {/* <a
                        href={`mailto:${faculty.email}`}
                        className="text-blue-600 hover:underline"
                      > */}
                      {faculty.email}
                      {/* </a> */}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <a
                        href={`tel:${faculty.phone}`}
                        className="hover:text-teal-700"
                      >
                        {faculty.phone}
                      </a>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12">
                        <img
                          src={faculty.img}
                          alt={faculty.name}
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-fill"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/100";
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleProfileClick(faculty)}
                        className="text-blue-600 underline hover:text-blue-800"
                        type="button"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* <p className="mt-2 text-xs text-gray-500 text-right">
            Scroll horizontally to view all columns on mobile
          </p> */}
        </div>
      </div>
      {/* Modal for faculty profile */}
      {openProfile && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-md transition-all duration-200"
            // onClick={handleCloseProfile}
          />
          <div className="relative bg-white rounded-lg shadow-lg p-8 w-[700px] mx-auto z-10 flex flex-col items-center max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-3xl font-bold"
              onClick={handleCloseProfile}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <div className="text-3xl font-bold text-teal-800 mb-4">Profile</div>
            <img
              src={openProfile.img}
              alt={openProfile.name}
              className="w-32 h-32 object-fill rounded-full border-4 border-teal-700 mb-4"
            />
            <div className="text-lg font-bold text-teal-700 mb-1">
              {openProfile.name}
            </div>
            <div className="text-base text-gray-700 mb-1">
              {openProfile.designation}
            </div>
            <div className="text-base text-gray-700 mb-1">
              {openProfile.email}
            </div>

            {openProfile.qualifications &&
              Array.isArray(openProfile.qualifications) && (
                <div className="w-full mt-3 mb-2">
                  <div className="font-semibold text-teal-700 mb-1">
                    Qualifications
                  </div>
                  <table className="min-w-full text-left border border-[#ccc] mb-2">
                    <thead className="bg-[#f5f5f5]">
                      <tr>
                        <th className="px-3 py-1 border">Degree</th>
                        <th className="px-3 py-1 border">Specialization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openProfile.qualifications.map((q, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1 border">{q.label}</td>
                          <td className="px-3 py-1 border">{q.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            {openProfile.experience && (
              <div className="w-full mb-2">
                <div className="font-semibold text-teal-700">Experience</div>
                <div className="text-gray-700 text-sm mb-1">
                  {openProfile.experience}
                </div>
              </div>
            )}

            {openProfile.publications && (
              <div className="w-full mb-2">
                <div className="font-semibold text-teal-700">
                  Publications & Projects
                </div>
                <div className="text-gray-700 text-sm mb-1">
                  {openProfile.publications}
                </div>
              </div>
            )}

            {openProfile.brief && Array.isArray(openProfile.brief) && (
              <div className="w-full mb-2">
                <div className="font-semibold text-teal-700">Brief</div>
                <ul className="list-disc pl-5 text-gray-700 text-sm">
                  {openProfile.brief.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
