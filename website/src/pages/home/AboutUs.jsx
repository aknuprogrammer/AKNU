import React from "react";

function AboutUs() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-teal-800">About Us</h1>
      <p className="text-lg">
        Welcome to our university! We are committed to providing a world-class
        education and fostering innovation. Our university is home to a vibrant
        community of students, faculty, and staff dedicated to excellence.
      </p>
      <div className="mt-6">
        <h2 className="text-3xl font-semibold mb-2 text-teal-800">Mission</h2>
        <p className="text-lg">
          To educate, inspire, and empower our students to make a positive
          impact on the world.
        </p>
      </div>
      <div className="mt-6">
        <h2 className="text-3xl font-semibold mb-2 text-teal-800">Vision</h2>
        <p className="text-lg">
          To be a leading institution of higher learning recognized globally for
          excellence in education and research.
        </p>
      </div>
    </div>
  );
}

export default AboutUs;
