import React, { useState } from "react";
import {
  adminitrativeRoles,
  executiveCoucil,
  subDepartsWithFullData,
} from "../siteData/departmentsData";
import { BackButton } from "./BackButton";

export default function AdministrativeRoles() {
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
          Administrative Roles
        </h2>
        {/* <p className="text-gray-700 mb-6 text-[16px]">
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
        </ul> */}
        <div
          className="overflow-x-auto mt-4 "
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
                <th className="px-4 py-2">Phone Number</th>
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Profile</th>
              </tr>
            </thead>
            <tbody>
              {adminitrativeRoles.map((faculty, idx) => (
                <tr
                  key={faculty.email || faculty.name}
                  className="border-t border-[#ccc]"
                >
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{faculty.name}</td>
                  <td className="px-4 py-2">{faculty.designation}</td>

                  <td className="px-4 py-2">{faculty.department}</td>
                  <td className="px-4 py-2">{faculty.email}</td>
                  <td className="px-4 py-2">{faculty.phone}</td>

                  <td className="px-4 py-2">
                    {faculty?.img ? (
                      <img
                        src={faculty.img || null}
                        alt={faculty.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md"
                      />
                    ) : null}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 underline hover:text-blue-800"
                      onClick={() => handleProfileClick(faculty)}
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
      </div>
      {/* Modal for faculty profile */}
      {/* {openProfile && (
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
      )} */}

      {openProfile && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
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
            {openProfile?.img ? (
              <img
                src={openProfile.img || null}
                alt={openProfile.name}
                className="w-32 h-32 object-cover rounded-full border-4 border-teal-700 mb-4"
              />
            ) : null}
            <div className="text-lg sm:text-xl font-bold text-teal-700 mb-1">
              {openProfile.name}
            </div>
            <div className="text-sm sm:text-base text-gray-700 mb-1">
              {openProfile.designation}
            </div>
            <div className="text-sm sm:text-base text-gray-700 mb-1">
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
