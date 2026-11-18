import React, { useEffect, useState } from "react";
import axios from "axios";
import { BackButton } from "../../components/BackButton";

function Courses() {
  const [courses, setCourses] = useState([0]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}api/courses`)
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, []);

  return (
    <div>
      <h1>Courses</h1>
      <BackButton />
      <ul>
        {courses.length && courses?.map((course) => (
          <li key={course.id}>
            <strong>{course.title}</strong>: {course.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Courses;
