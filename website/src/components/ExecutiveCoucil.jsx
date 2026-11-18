import React, { useState } from "react";
import {
  executiveCoucil,
  subDepartsWithFullData,
} from "../siteData/departmentsData";
import { BackButton } from "./BackButton";
import { Link } from "react-router-dom";

export default function ExecutiveCouncil() {
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
    <div>
      <div className="w-full px-4 sm:px-16 py-8">
        <BackButton />
        <h2 className="text-3xl font-bold text-left text-teal-800 mb-6 mt-2">
          Executive Council
        </h2>
        <p className="text-gray-700 mb-6 text-[16px] text-justify">
          The Executive Council serves as the apex decision-making and governing
          body of the institution, responsible for steering its vision, mission,
          and strategic direction. Comprising senior officials, academic
          leaders, and external experts, the council ensures that the
          institution upholds its values of academic excellence, integrity,
          innovation, and social responsibility.
        </p>
        <ul className="mb-8">
          <li className="text-gray-700 mb-3 ">
            <span className="font-semibold text-sm">
              Roles and Responsibilities:
            </span>{" "}
            Strategic Planning: Formulating long-term goals, institutional
            policies, and growth strategies.
          </li>
          <li className="text-gray-700 mb-3 ">
            <span className="font-semibold text-sm">
              Governance & Oversight:
            </span>{" "}
            Supervising academic, administrative, and financial matters to
            ensure transparency and accountability.
          </li>
          <li className="text-gray-700 mb-3 ">
            <span className="font-semibold text-sm">Academic Excellence:</span>{" "}
            Reviewing and approving academic programs, curriculum frameworks,
            research initiatives, and quality benchmarks.
          </li>
          <li className="text-gray-700 mb-3 ">
            <span className="font-semibold text-sm">Resource Management:</span>{" "}
            Ensuring optimal utilization of human, financial, and
            infrastructural resources.
          </li>
          <li className="text-gray-700 mb-3 ">
            <span className="font-semibold text-sm">
              Stakeholder Engagement:{" "}
            </span>{" "}
            Building partnerships with industry, government, academia, and
            community stakeholders.
          </li>
          <li className="text-gray-700 mb-3 ">
            <span className="font-semibold text-sm">
              Regulatory Compliance:
            </span>{" "}
            Ensuring adherence to statutory guidelines and maintaining
            affiliation and accreditation standards.
          </li>
        </ul>
        <div
          className="overflow-x-auto mt-4 bg-white"
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
                <th className="px-4 py-2 w-[40%]">Address</th>
                {/* <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone Number</th>
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Profile</th> */}
              </tr>
            </thead>
            <tbody>
              {executiveCoucil.map((faculty, idx) => (
                <tr
                  key={faculty.email || faculty.name}
                  className="border-t border-[#ccc]"
                >
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{faculty.name}</td>
                  <td className="px-4 py-2">{faculty.designation}</td>
                  <td className="px-4 py-2">{faculty.address}</td>
                  {/* <td className="px-4 py-2">{faculty.department}</td>
                  <td className="px-4 py-2">{faculty.email}</td>
                  <td className="px-4 py-2">{faculty.phone}</td>

                  <td className="px-4 py-2">
                    <img
                      src={faculty.img}
                      alt={faculty.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 underline hover:text-blue-800"
                      onClick={() => handleProfileClick(faculty)}
                      type="button"
                    >
                      Profile
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div>
            {" "}
            <h2 className="text-3xl font-bold text-left text-teal-800 mb-6 mt-8">
              Administrative Roles
            </h2>
            <p className="text-gray-700 mb-6 text-[16px] text-justify">
              Administrative roles form the backbone of the institution's
              day-to-day operations, ensuring smooth coordination across
              departments and supporting both academic and non-academic
              functions. These roles focus on implementing policies, managing
              resources, and delivering essential services to faculty, staff,
              and students.
            </p>
            <div className="flex justify-center items-center mt-5 mb-10">
              <Link
                to="/administrative-roles"
                className="px-5 py-3 bg-[color:#007367] text-white font-medium hover:bg-[color:#00574e] transition-colors shadow-sm"
              >
                <span>Know More</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for faculty profile */}
      {openProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-md transition-all duration-200"
            onClick={handleCloseProfile}
          />
          <div className="relative bg-white rounded-lg shadow-lg p-4 sm:p-8 w-[90vw] sm:w-[700px] mx-auto z-10 flex flex-col items-center max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-3xl font-bold"
              onClick={handleCloseProfile}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <div className="text-xl sm:text-3xl font-bold text-teal-800 mb-4">
              Profile
            </div>
            <img
              src={openProfile.img}
              alt={openProfile.name}
              className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-teal-700 mb-4"
            />
            <div className="text-lg sm:text-xl font-bold text-teal-700 mb-1">
              {openProfile.name}
            </div>
            <div className="text-sm sm:text-base text-gray-700 mb-1">
              {openProfile.designation}
            </div>
            <div className="text-sm sm:text-base text-gray-700 mb-1">
              {openProfile.email}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
