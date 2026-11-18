import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SportsFeeForm = () => {
  const [formData, setFormData] = useState({
    collegeCode: "",
    collegeName: "",
    academicYear: "",
    totalStudents: "",
    paidStudents: "",
    pendingStudents: "",
    totalAmount: "",
    remarks: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Auto-calculate pending students
      if (name === "totalStudents" || name === "paidStudents") {
        const total = parseInt(newData.totalStudents) || 0;
        const paid = parseInt(newData.paidStudents) || 0;
        newData.pendingStudents = (total - paid).toString();
      }

      return newData;
    });
  };
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/sports`, {
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
          Sports Fee Payment
        </h1>
        <div className="w-20 h-1 bg-teal-500 mx-auto rounded-full"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            name="collegeCode"
            label="College Code"
            value={formData.collegeCode}
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
            name="academicYear"
            label="Academic Year"
            value={formData.academicYear}
            onChange={handleChange}
            required
          />
          <Input
            type="number"
            name="totalStudents"
            label="Total Students"
            value={formData.totalStudents}
            onChange={handleChange}
            required
          />
          <Input
            type="number"
            name="paidStudents"
            label="Paid Students"
            value={formData.paidStudents}
            onChange={handleChange}
            required
          />
          <Input
            type="number"
            name="pendingStudents"
            label="Pending Students"
            value={formData.pendingStudents}
            onChange={handleChange}
            readOnly
            className="bg-gray-50 text-gray-700"
          />
          <Input
            type="number"
            name="totalAmount"
            label="Total Amount (Rs.)"
            value={formData.totalAmount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="remarks"
            className="text-sm font-medium text-teal-700 mb-1"
          >
            Remarks (Optional)
          </label>
          <textarea
            id="remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="border border-teal-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition placeholder-gray-400 min-h-[100px]"
          />
        </div>

        <div className="text-center pt-4">
          <button
            type="submit"
            className="px-8 py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-teal-200/50 active:scale-[0.98]"
          >
            Submit & Proceed to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

// Reusable Input Component with consistent height
const Input = ({ name, label, type = "text", value, onChange, ...props }) => (
  <div className="flex flex-col h-full">
    <label htmlFor={name} className="text-sm font-medium text-teal-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="border border-teal-200 rounded-lg p-2.5 h-[42px] focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition placeholder-gray-400"
      {...props}
    />
  </div>
);

export default SportsFeeForm;
