import React from "react";

const AcademicDetails = ({ formData, setFormData }) => {
  // Add new record
  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      collegeName: "",
      qualification: "",
      specialization: "",
      completionYear: "",
      result: "", // percentage, CGPA, or text
      achievements: "", // medals, certificates, etc.
    };

    const updated = [...formData.academicRecords, newEducation];
    setFormData({ ...formData, academicRecords: updated });
  };

  // Remove record
  const removeEducation = (id) => {
    if (formData.academicRecords.length > 1) {
      const updated = formData.academicRecords.filter((edu) => edu.id !== id);
      setFormData({ ...formData, academicRecords: updated });
    }
  };

  // Handle field change
  const handleEducationChange = (id, field, value) => {
    const updated = formData.academicRecords.map((edu) =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    setFormData({ ...formData, academicRecords: updated });
  };

  // Qualification → Specializations mapping
  const specializationOptions = {
    bachelor: ["B.Com", "B.Sc", "B.Tech", "BA", "Other"],
    master: ["M.Com", "M.Sc", "M.Tech", "MBA", "MA", "Other"],
    diploma: ["Polytechnic", "ITI", "Other"],
    phd: ["Sciences", "Engineering", "Management", "Other"],
  };

  const getMinYear = (index) => {
    if (index === 0) return 2000; // first education, allow from 2000
    const prevYear = parseInt(
      formData.academicRecords[index - 1]?.completionYear
    );
    return prevYear ? prevYear + 1 : 2000; // strictly greater than previous
  };

  return (
    <div className="mb-6">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-4 mt-4">
        <h3 className="text-lg font-medium text-[#525B88] border-b pb-2">
          Academic Details
        </h3>
      </div>

      {/* Education Items */}
      {formData.academicRecords.map((education, index) => (
        <div key={education.id || index}>
          {/* Add separation line except for the first record */}
          {index > 0 && <hr className="my-6 border-gray-700" />}

          <div className="mb-6 p-4 border border-gray-200 rounded-lg relative">
            {formData.academicRecords.length > 1 && (
              <button
                type="button"
                onClick={() => removeEducation(education.id)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                aria-label="Remove education"
              >
                ✕
              </button>
            )}

            <h4 className="text-md font-medium text-[#525B88] mb-3">
              Education {index + 1}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Qualification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={education.qualification}
                  onChange={(e) =>
                    handleEducationChange(
                      education.id,
                      "qualification",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="">Select Qualification</option>
                  <option value="high_school">High School (10th)</option>
                  <option value="intermediate">Intermediate (12th)</option>
                  <option value="diploma">Diploma</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD</option>
                  <option value="others">Others</option>
                </select>
              </div>

              {/* College/University */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institute/College/University{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={education.collegeName}
                  onChange={(e) =>
                    handleEducationChange(
                      education.id,
                      "collegeName",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              {/* Specialization (dynamic) */}
              {specializationOptions[education.qualification] && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={education.specialization}
                    onChange={(e) =>
                      handleEducationChange(
                        education.id,
                        "specialization",
                        e.target.value
                      )
                    }
                    placeholder="e.g. B.Com, B.Sc, B.Tech"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              )}

              {/* Completion Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Completion
                  <span className="text-red-500 ml-1">*</span>{" "}
                </label>
                <select
                  value={education.completionYear}
                  onChange={(e) =>
                    handleEducationChange(
                      education.id,
                      "completionYear",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="">Select Year</option>
                  {Array.from(
                    {
                      length: new Date().getFullYear() - getMinYear(index) + 1,
                    },
                    (_, idx) => getMinYear(index) + idx
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-purpose Marks/CGPA/Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Result (CGPA / % / Grade)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={education.result}
                  onChange={(e) =>
                    handleEducationChange(
                      education.id,
                      "result",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 85%, 9.1 CGPA, A+"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              {/* Achievements/Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Achievements / Remarks
                </label>
                <input
                  type="text"
                  value={education.achievements}
                  onChange={(e) =>
                    handleEducationChange(
                      education.id,
                      "achievements",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Gold Medalist, Top Accuracy, Certificates"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addEducation}
          className="flex items-center bg-[#525B88] hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
        >
          ＋ Add Education
        </button>
      </div>
    </div>
  );
};

export default AcademicDetails;
