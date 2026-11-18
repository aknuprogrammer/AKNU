import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdmissionFeeForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: "",
    registrationNumber: "",
    course: "",
    branch: "",
    yearSemester: "",
    gender: "",
    dob: "",
    category: "",
    aadhaar: "",
    mobile: "",
    email: "",
    address: "",
    totalStudents: "",
    paidStudents: "",
    pendingStudents: "",
    totalFee: "",
    paidFee: "",
    pendingFee: "",
    paymentMode: "",
    paymentStatus: "",
    remarks: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Auto-calculate pending students and fees
      if (name === "totalStudents" || name === "paidStudents") {
        const total = parseInt(newData.totalStudents) || 0;
        const paid = parseInt(newData.paidStudents) || 0;
        newData.pendingStudents = (total - paid).toString();
      }

      if (name === "totalFee" || name === "paidFee") {
        const total = parseInt(newData.totalFee) || 0;
        const paid = parseInt(newData.paidFee) || 0;
        newData.pendingFee = (total - paid).toString();
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/admission`, {
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
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg border border-teal-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-teal-800 mb-2">
          Admission Fee Payment
        </h1>
        <div className="w-20 h-1 bg-teal-500 mx-auto rounded-full"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-teal-700 mb-4 pb-2 border-b border-teal-100">
              Student Details
            </h2>
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
                name="branch"
                label="Branch"
                value={formData.branch}
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
              <Select
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleChange}
                options={["Male", "Female", "Other"]}
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
                name="category"
                label="Category"
                value={formData.category}
                onChange={handleChange}
                required
              />
              <Input
                name="aadhaar"
                label="Aadhaar Number"
                value={formData.aadhaar}
                onChange={handleChange}
                required
              />
              <Input
                name="mobile"
                label="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
              <Input
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mt-6">
              <label
                htmlFor="address"
                className="text-sm font-medium text-teal-700 mb-1 block"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-teal-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition placeholder-gray-400 min-h-[100px]"
                required
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-teal-700 mb-4 pb-2 border-b border-teal-100">
              Fee Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                type="number"
                name="totalStudents"
                label="Total Students"
                value={formData.totalStudents}
                onChange={handleChange}
              />
              <Input
                type="number"
                name="paidStudents"
                label="Paid Students"
                value={formData.paidStudents}
                onChange={handleChange}
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
                name="totalFee"
                label="Total Fee (Rs.)"
                value={formData.totalFee}
                onChange={handleChange}
              />
              <Input
                type="number"
                name="paidFee"
                label="Paid Fee (Rs.)"
                value={formData.paidFee}
                onChange={handleChange}
              />
              <Input
                type="number"
                name="pendingFee"
                label="Pending Fee (Rs.)"
                value={formData.pendingFee}
                onChange={handleChange}
                readOnly
                className="bg-gray-50 text-gray-700"
              />
              <Select
                name="paymentMode"
                label="Payment Mode"
                value={formData.paymentMode}
                onChange={handleChange}
                options={["ONLINE", "CASH", "CHEQUE"]}
              />
              <Select
                name="paymentStatus"
                label="Payment Status"
                value={formData.paymentStatus}
                onChange={handleChange}
                options={["PAID", "PARTIAL", "PENDING"]}
              />
            </div>
            <div className="mt-6">
              <label
                htmlFor="remarks"
                className="text-sm font-medium text-teal-700 mb-1 block"
              >
                Remarks (Optional)
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full border border-teal-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition placeholder-gray-400 min-h-[100px]"
              />
            </div>
          </div>
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

export default AdmissionFeeForm;
