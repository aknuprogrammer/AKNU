import React from "react";
import { useNavigate } from "react-router-dom";
import { subDepartsWithFullData } from "../../siteData/edepartmentsData";



const CourseFinder = () => {
  const navigate = useNavigate();

  const selectStyle = {
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "2px solid white",
    borderRadius: 0,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/ProgramFinder");
    
  };
  
const a = subDepartsWithFullData

  return (
    <section
      className="find-programme text-left py-24 px-16 mt-12 bg-teal-800 text-white"
      data-aos="fade-up"
      data-aos-duration="800"
      id="programme-for-you"
    >
      <div className="container">
        <h2 className="text-3xl font-bold mb-6">
          Find the right programme for you
        </h2>
        <form
          method="post"
          id="course-finder"
          acceptCharset="UTF-8"
          onSubmit={handleSubmit}
        >
          <input
            type="hidden"
            name="form_build_id"
            value="form-Hgy91wwAEwPrZc8Nxk3B6xDyJJRtXDum338GLnxJWgw"
          />
          <input type="hidden" name="form_id" value="course_finder" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-8">
            <select
              style={selectStyle}
              className="form-select w-full bg-teal-800 text-white p-2"
              name="field_campus_target_id"
              required
              defaultValue="0"
            >
              <option value="0" disabled>
                Select Campus
              </option>
              <option value="3">Rajamahendravaram</option>
              <option value="1">Tadepalligudem</option>
              <option value="2">Kakinada</option>
            </select>

            <select
              style={selectStyle}
              className="form-select w-full bg-teal-800 text-white p-2"
              name="field_discipline_target_id_selective"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select Disciplines
              </option>
              <option value="engineering">Engineering</option>
              <option value="management">Management</option>
              <option value="science">Science</option>
              <option value="arts">Arts</option>
            </select>

            <select
              style={selectStyle}
              className="form-select w-full bg-teal-800 text-white p-2"
              name="field_course_level_value_selective"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select Levels
              </option>
              <option value="undergraduate">Undergraduate</option>
              <option value="postgraduate">Postgraduate</option>
              <option value="doctorate">Doctorate</option>
            </select>

            <button
              type="submit"
              onClick={() => {
                Navigate("/ProgramFinder");
              }}
              className="bg-white text-teal-800 font-semibold rounded w-full py-2 hover:bg-gray-100 transition"
            >
              Find Programme
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CourseFinder;
