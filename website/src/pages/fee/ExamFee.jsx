import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ExamFeeForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    registrationNumber: "",
    hallTicketNumber: "",
    studentName: "",
    fatherName: "",
    dob: "",
    collegeName: "",
    courseName: "",
    yearSemester: "",
    subjects: "",
    applicationType: "regular",
    feePaid: "",
    email: "",
    mobile: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/exam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Form submitted successfully:", data);
        alert("Form submitted successfully!");
        navigate("/")
      } else {
        const error = await res.json();
        alert("Submission failed: " + error.error);
      }
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg border border-teal-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-teal-800 mb-2">
          Examination Fee Payment
        </h1>
        <div className="w-20 h-1 bg-teal-500 mx-auto rounded-full"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            name="registrationNumber"
            label="Registration Number"
            value={formData.registrationNumber}
            onChange={handleChange}
            required
          />
          <Input
            name="hallTicketNumber"
            label="Hall Ticket Number"
            value={formData.hallTicketNumber}
            onChange={handleChange}
            required
          />
          <Input
            name="studentName"
            label="Student Name"
            value={formData.studentName}
            onChange={handleChange}
            required
          />
          <Input
            name="fatherName"
            label="Father's Name"
            value={formData.fatherName}
            onChange={handleChange}
            required
          />
          <Input
            name="dob"
            label="Date of Birth"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            required
          />
          <Input
            name="collegeName"
            label="College Name"
            value={formData.collegeName}
            onChange={handleChange}
            required
          />
          <Input
            name="courseName"
            label="Course Name"
            value={formData.courseName}
            onChange={handleChange}
            required
          />
          <Input
            name="yearSemester"
            label="Year / Semester"
            value={formData.yearSemester}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-teal-700 mb-2">
            Subjects Applied For
          </label>
          <textarea
            name="subjects"
            value={formData.subjects}
            onChange={handleChange}
            rows={3}
            className="w-full border border-teal-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-teal-700 mb-2">
              Application Type
            </label>
            <select
              name="applicationType"
              value={formData.applicationType}
              onChange={handleChange}
              className="w-full border border-teal-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition"
            >
              <option value="regular">Regular</option>
              <option value="supplementary">Supplementary</option>
            </select>
          </div>

          <Input
            name="feePaid"
            label="Fee Paid (Rs.)"
            type="number"
            value={formData.feePaid}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            label="Email ID (optional)"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            name="mobile"
            label="Mobile Number"
            type="tel"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-teal-200/50 active:scale-[0.99]"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
};

// Reusable input component with teal theme
const Input = ({
  name,
  label,
  value,
  onChange,
  type = "text",
  required = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-teal-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border border-teal-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition placeholder-teal-300/70"
    />
  </div>
);

export default ExamFeeForm;
