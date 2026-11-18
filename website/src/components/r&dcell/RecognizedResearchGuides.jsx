import React, { useState } from "react";
import { BackButton } from "../BackButton";

export default function RecognizedResearchGuides() {
  const [openProfile, setOpenProfile] = useState(null);

  const handleProfileClick = (guide) => {
    setOpenProfile(guide);
  };

  const handleCloseProfile = () => {
    setOpenProfile(null);
  };

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

  // Research guides data organized by college/department
  const researchGuides = [
    {
      college: "University College of Arts & Commerce",
      departments: [
        {
          name: "CMS",
          guides: [
            { id: 1, name: "Dr N Uday Bhaskar" },
            { id: 2, name: "Dr P Uma Maheswari Devi" },
          ],
        },
        {
          name: "English",
          guides: [
            { id: 3, name: "Prof. K Sree Ramesh" },
            { id: 4, name: "Dr. D Jyothirmai" },
            { id: 5, name: "Dr. Sajna Raj N" },
          ],
        },
        // Polinaidu : 05/11/2025
        // commented psychology and telugu sections as per theur requiment mention in aknu website
        // {
        //   name: "Psychology",
        //   guides: [{ id: 6, name: "Dr. P. Rajasekhar" }],
        // },
        // {
        //   name: "Telugu",
        //   guides: [
        //     { id: 7, name: "Dr T.Vasu" },
        //     { id: 8, name: "Dr T.Satyanarayana" },
        //     { id: 9, name: "Dr. K.V.N.D.Vara Prasad" },
        //     { id: 10, name: "Dr. D.Lakshmi Narasamma" },
        //   ],
        // },
      ],
    },
    {
      college: "University College of Science & Technology",
      departments: [
        {
          name: "Chemistry",
          guides: [
            { id: 11, name: "Dr B. Jagan Mohan Reddy" },
            { id: 12, name: "Dr. K. Deepthi" },
          ],
        },
        {
          name: "Geosciences",
          guides: [
            { id: 13, name: "Prof. Y. Srinivasa Rao" },
            { id: 14, name: "Dr. K.V Swamy" },
            { id: 15, name: "Dr. K. Nooka Ratnam" },
          ],
        },
        {
          name: "Zoology",
          guides: [
            { id: 16, name: "Dr. A. Matta Reddy" },
            { id: 17, name: "Dr. K. Ramaneswari" },
            { id: 18, name: "Dr. P. Vijaya Nirmala" },
            { id: 19, name: "Dr. D. Kalyani" },
          ],
        },
      ],
    },
    {
      college: "University College of Education",
      departments: [
        {
          name: "Education",
          guides: [{ id: 20, name: "Prof. K.Subba Rao" }],
        },
      ],
    },
    {
      college: "University College of Engineering",
      departments: [
        {
          name: "CSE",
          guides: [
            { id: 21, name: "Prof. P Suresh Varma" },
            { id: 22, name: "Dr. V Persis" },
            { id: 23, name: "Dr. M. Kamala Kumari" },
            { id: 24, name: "Dr. P. Venkateswar Rao" },
            { id: 25, name: "Dr. Kezia Rani" },
            { id: 26, name: "Dr. D. Latha" },
          ],
        },
      ],
    },
    {
      college: "MSN Campus - Kakinada",
      departments: [
        {
          name: "English",
          guides: [
            { id: 27, name: "Prof. S. Prasanthi Sree" },
            { id: 28, name: "Prof. T Ashok" },
          ],
        },
      ],
    },
  ];

  return (
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      <h1 className="text-3xl sm:text-3xl font-bold text-teal-800 mb-6 text-center">
        Recognized Research Guides
      </h1>

      {researchGuides.map((college, collegeIndex) => (
        <div key={collegeIndex} className="mb-10">
          <h2 className="text-3xl font-bold text-teal-800 mb-4">
            {college.college}
          </h2>

          {college.departments.map((department, deptIndex) => (
            <div key={deptIndex} className="mb-6">
              <h3 className="text-lg font-semibold text-teal-700 mb-2">
                {department.name} Department
              </h3>

              <div
                className="overflow-x-auto"
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <table className="min-w-full text-left border border-[#ccc]">
                  <thead className="bg-teal-700 text-white">
                    <tr>
                      <th className="px-4 py-2">S.No</th>
                      <th className="px-4 py-2">Name of the Research Guide</th>
                      <th className="px-4 py-2">Department</th>
                      <th className="px-4 py-2">Profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {department.guides.map((guide, guideIndex) => (
                      <tr
                        key={guide.id}
                        className="border-t border-[#ccc] hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">{guide.id}</td>
                        <td className="px-4 py-2 font-medium">{guide.name}</td>
                        <td className="px-4 py-2">{department.name}</td>
                        <td className="px-4 py-2">
                          <button
                            className="text-blue-600   hover:text-blue-800 cursor-pointer "
                            onClick={() =>
                              handleProfileClick({
                                ...guide,
                                department: department.name,
                                college: college.college,
                              })
                            }
                            type="button"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Modal for guide profile */}
      {openProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-md transition-all duration-200"
            onClick={handleCloseProfile}
          />
          <div className="relative bg-white rounded-lg shadow-lg p-6 sm:p-8 w-[90vw] sm:w-[600px] mx-auto z-10 max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold"
              onClick={handleCloseProfile}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-teal-800 mb-2">
                Research Guide Profile
              </div>
              <div className="text-lg font-semibold text-gray-800 mb-1">
                {openProfile.name}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {openProfile.college}
              </div>

              <div className="bg-gray-100 p-4 rounded-lg text-left">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <span className="font-medium">Department:</span>{" "}
                    {openProfile.department}
                  </div>
                  <div>
                    <span className="font-medium">Guide ID:</span>{" "}
                    {openProfile.id}
                  </div>
                </div>

                {/* Additional profile information can be added here */}
                <div className="mt-4">
                  <p className="text-gray-700 italic">
                    More details about the research guide can be displayed
                    here...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
