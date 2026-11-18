import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HostelFeeForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: "",
    registrationNumber: "",
    course: "",
    yearSemester: "",
    hostelName: "",
    roomType: "general",
    joiningDate: "",
    duration: "",
    feePerMonth: "",
    totalFee: "",
    remarks: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    if (["duration", "feePerMonth"].includes(name)) {
      const dur = parseInt(updatedData.duration || 0, 10);
      const fee = parseFloat(updatedData.feePerMonth || 0);
      updatedData.totalFee = isNaN(dur * fee) ? "" : (dur * fee).toString();
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/hostel`, {
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
          Hostel Fee Application
        </h1>
        <div className="w-20 h-1 bg-teal-500 mx-auto rounded-full"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-teal-700 mb-4 pb-2 border-b border-teal-100">
            Student Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              name="studentName"
              label="Student Name"
              value={formData.studentName}
              onChange={handleChange}
              required
            />
            <Input
              name="registrationNumber"
              label="Registration Number"
              value={formData.registrationNumber}
              onChange={handleChange}
              required
            />
            <Input
              name="course"
              label="Course"
              value={formData.course}
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
        </div>

        <div>
          <h3 className="text-lg font-semibold text-teal-700 mb-4 pb-2 border-b border-teal-100">
            Hostel Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              name="hostelName"
              label="Hostel Name"
              value={formData.hostelName}
              onChange={handleChange}
              required
            />
            <Select
              name="roomType"
              label="Room Type"
              value={formData.roomType}
              onChange={handleChange}
              options={["general", "AC", "non-AC", "attached"]}
            />
            <Input
              name="joiningDate"
              label="Joining Date"
              type="date"
              value={formData.joiningDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-teal-700 mb-4 pb-2 border-b border-teal-100">
            Fee Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              name="duration"
              label="Duration (months)"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              required
            />
            <Input
              name="feePerMonth"
              label="Fee per Month (Rs.)"
              type="number"
              value={formData.feePerMonth}
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
              className="bg-gray-50 text-gray-700"
            />
          </div>
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

  // Reusable Select Component
  const Select = ({ name, label, value, onChange, options }) => (
    <div className="flex flex-col h-full">
      <label htmlFor={name} className="text-sm font-medium text-teal-700 mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="border border-teal-200 rounded-lg p-2.5 h-[42px] focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition bg-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );


  
export default HostelFeeForm;
