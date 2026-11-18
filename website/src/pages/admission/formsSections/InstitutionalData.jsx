import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../utils/url";
import axios from "axios";

const InstitutionalDetails = ({ formData, handleInputChange }) => {
  const [collegesWithCourses, setCollegesWithCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("_;;;;__formData", formData);
  // Fetch colleges from API
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/mappings`);

        setCollegesWithCourses(res.data || []);
      } catch (error) {
        console.error("Error fetching colleges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  // Find the selected campus object
  const selectedCampus = collegesWithCourses.find(
    (c) => c.college && c.college._id === formData.campus
  );
  // Then find the selected course within that campus
  const selectedCourse = selectedCampus?.courses?.find((course) =>
    (course)
  );

  console.log("___selectedCourse", selectedCourse);

  const filteredCourses = selectedCampus?.courses?.filter(
  (course) => course
);
console.log("___filteredCourses", filteredCourses);
  return (
    <div>
      <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
        Alloted Campus & Course
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Campus Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campus <span className="text-red-500 ml-1">*</span>
          </label>
          {loading ? (
            <div>Loading campuses...</div>
          ) : (
            <select
              name="campus"
              value={formData.campus}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            >
              <option value="">Select Campus</option>
              {collegesWithCourses
                .filter((campus) => campus?.college) // only keep valid ones
                .map((campus) => (
                  <option key={campus.college._id} value={campus.college._id}>
                    {campus.college.code} -{" "}
                    {campus.college.name.charAt(0).toUpperCase() +
                      campus.college.name.slice(1)}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Department Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course <span className="text-red-500 ml-1">*</span>
          </label>
          {loading ? (
            <div>Loading Courses...</div>
          ) : (
            <select
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
              disabled={!formData.campus}
            >
              <option value="">Select Course</option>
              {selectedCampus?.courses?.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstitutionalDetails;
