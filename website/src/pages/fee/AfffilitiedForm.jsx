import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AffiliationFeeForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    collegeName: "",
    collegeCode: "",
    district: "",
    state: "Andhra Pradesh",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    universityName: "",
    typeOfCollege: "private",
    applicationPurpose: "",
    academicYear: "",
    feePerStudent: "",
    totalStudents: "",
    paidStudents: "",
    pendingStudents: "",
    totalFee: "",
    remarks: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedData = { ...formData, [name]: value };

    // Auto-calculate pendingStudents and totalFee
    if (["totalStudents", "paidStudents", "feePerStudent"].includes(name)) {
      const total = parseInt(updatedData.totalStudents || 0, 10);
      const paid = parseInt(updatedData.paidStudents || 0, 10);
      const fee = parseFloat(updatedData.feePerStudent || 0);
      updatedData.pendingStudents = isNaN(total - paid) ? "" : total - paid;
      updatedData.totalFee = isNaN(paid * fee) ? "" : paid * fee;
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}api/affiliation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

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
          Affiliation Fee Payment
        </h1>
        <div className="w-20 h-1 bg-teal-500 mx-auto rounded-full"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionTitle title="College Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            name="collegeName"
            label="College Name"
            value={formData.collegeName}
            onChange={handleChange}
            required
          />
          <Input
            name="collegeCode"
            label="College Code"
            value={formData.collegeCode}
            onChange={handleChange}
            required
          />
          <Input
            name="district"
            label="District"
            value={formData.district}
            onChange={handleChange}
            required
          />
          <Input
            name="state"
            label="State"
            value={formData.state}
            onChange={handleChange}
            required
          />
          <Input
            name="contactPerson"
            label="Contact Person Name"
            value={formData.contactPerson}
            onChange={handleChange}
            required
          />
          <Input
            name="contactEmail"
            label="Contact Email"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
          />
          <Input
            name="contactPhone"
            label="Contact Phone"
            type="tel"
            value={formData.contactPhone}
            onChange={handleChange}
            required
          />
        </div>

        <SectionTitle title="Affiliation Information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            name="universityName"
            label="University Name"
            value={formData.universityName}
            onChange={handleChange}
            required
          />
          <Select
            name="typeOfCollege"
            label="Type of College"
            value={formData.typeOfCollege}
            onChange={handleChange}
            options={["private", "government", "aided"]}
          />
          <Select
            name="applicationPurpose"
            label="Application Purpose"
            value={formData.applicationPurpose}
            onChange={handleChange}
            options={["affiliation", "exam", "hostel", "sports", "others"]}
            required
          />
          <Input
            name="academicYear"
            label="Academic Year"
            value={formData.academicYear}
            onChange={handleChange}
            required
          />
        </div>

        <SectionTitle title="Student & Fee Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            name="totalStudents"
            label="Total Students"
            type="number"
            value={formData.totalStudents}
            onChange={handleChange}
            required
          />
          <Input
            name="paidStudents"
            label="Paid Students"
            type="number"
            value={formData.paidStudents}
            onChange={handleChange}
            required
          />
          <Input
            name="pendingStudents"
            label="Pending Students"
            type="number"
            value={formData.pendingStudents}
            onChange={handleChange}
            disabled
          />
          <Input
            name="feePerStudent"
            label="Fee per Student (Rs.)"
            type="number"
            value={formData.feePerStudent}
            onChange={handleChange}
            required
          />
          <Input
            name="totalFee"
            label="Total Fee (Rs.)"
            type="number"
            value={formData.totalFee}
            onChange={handleChange}
            readOnly
          />
          <Input
            name="remarks"
            label="Remarks (optional)"
            value={formData.remarks}
            onChange={handleChange}
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

// Reusable Input Component with teal theme
const Input = ({
  name,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  readOnly = false,
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
      disabled={disabled}
      readOnly={readOnly}
      className={`w-full border border-teal-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition placeholder-teal-300/70 ${
        disabled || readOnly ? "bg-teal-50 text-teal-700" : ""
      }`}
    />
  </div>
);

// Reusable Select Component with teal theme
const Select = ({
  name,
  label,
  value,
  onChange,
  options = [],
  required = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-teal-700 mb-2">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border border-teal-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition"
    >
      <option value="">-- Select --</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </option>
      ))}
    </select>
  </div>
);

// Section Title with teal theme
const SectionTitle = ({ title }) => (
  <h2 className="text-lg font-semibold text-teal-700 mt-6 mb-3 border-b border-teal-200 pb-2">
    {title}
  </h2>
);

export default AffiliationFeeForm;
