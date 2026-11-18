import { useState } from "react";
import {
  main_collegeList,
  main_courseList,
  main_examFeeTypeList,
} from "./Data";
import ReCAPTCHA from "react-google-recaptcha";
import { BackButton } from "../../components/BackButton";
import { Link } from "react-router-dom";

const Page_ExamFee = () => {
  const [formData, setFormData] = useState({
    registrationNumber: "",
    nameSSC: "",
    selectCourse: "",
    selectCollege: "",
    semesterYear: "",
    feeType: "",
    totalFee: "",
    mobileNumber: "",
    eMail: "",
    termsAccepted: false,
  });

  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;
    if (name === "mobileNumber") val = val.replace(/[^0-9]/g, "").slice(0, 10);
    setFormData({ ...formData, [name]: val });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.registrationNumber.trim())
      errors.registrationNumber = "Required";
    if (!formData.nameSSC.trim()) errors.nameSSC = "Required";
    if (!formData.selectCourse) errors.selectCourse = "Required";
    if (!formData.selectCollege) errors.selectCollege = "Required";
    if (!formData.semesterYear) errors.semesterYear = "Required";
    if (!formData.feeType) errors.feeType = "Required";
    if (!formData.totalFee.trim()) errors.totalFee = "Required";
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10)
      errors.mobileNumber = "Enter 10-digit number";
    if (!formData.eMail.trim() || !/^\S+@\S+\.\S+$/.test(formData.eMail))
      errors.eMail = "Valid email required";
    if (!formData.termsAccepted) errors.termsAccepted = "You must accept terms";
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      alert("Form submitted successfully!");
    }
  };

  return (
    <main className="px-4 py-8 md:px-[20%] md:py-[100px] md:pt-10 bg-gray-50 min-h-screen">
      <BackButton className="mb-10" />
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-teal-700 p-6 text-white">
          <h2 className="text-3xl font-bold tracking-tight">
            Application Form for Examination Fee Payment
          </h2>
        </div>
        <div className="px-8 py-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <input
                type="text"
                name="registrationNumber"
                placeholder="Enter Registration Number"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md"
              />

              <select
                name="selectCourse"
                value={formData.selectCourse}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="">Select Course</option>
                {main_courseList.map((course, index) => (
                  <option key={index} value={course}>
                    {course}
                  </option>
                ))}
              </select>

              <select
                name="semesterYear"
                value={formData.semesterYear}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="">Select Semester/Year</option>
                {[
                  "1-0",
                  "2-0",
                  "3-0",
                  "4-0",
                  "1-1",
                  "1-2",
                  "2-1",
                  "2-2",
                  "3-1",
                  "3-2",
                  "4-1",
                  "4-2",
                ].map((sem, index) => (
                  <option key={index} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>

              <input
                type="tel"
                name="mobileNumber"
                placeholder="Enter 10 Digit Mobile Number"
                maxLength={10}
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div className="space-y-4">
              <input
                type="text"
                name="nameSSC"
                placeholder="Enter Name (as per SSC)"
                value={formData.nameSSC}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md"
              />

              <select
                name="selectCollege"
                value={formData.selectCollege}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="">Select College</option>
                {main_collegeList.map((college, index) => (
                  <option key={index} value={college}>
                    {college}
                  </option>
                ))}
              </select>

              <select
                name="feeType"
                value={formData.feeType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="">Select Fee Type</option>
                {main_examFeeTypeList.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <input
                type="email"
                name="eMail"
                value={formData.eMail}
                onChange={handleInputChange}
                placeholder="Email Address"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <input
                disabled
                type="text"
                name="totalFee"
                placeholder="Total Fee (Rs.)"
                value={formData.totalFee}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              className="accent-blue-600"
            />
            <label className="text-sm font-medium">
              I accept all terms and conditions.
            </label>
          </div>
           <div>
              <ReCAPTCHA
                sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ"
                
              />
             
            </div>

          <div className="text-center mt-6">
            <button
              onClick={handleSubmit}
              className="bg-[#2B7870] text-white px-6 py-2 rounded-md transition"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <div className="flex gap-[20px]">
        {/* <a
                    href="/fee-pay"
                    className="bg-teal-700 text-white p-[15px_30px] font-bold rounded-md"
                >
                    Certificate Fee Payment
                </a> */}
        <Link
          to="/fee-pay/status"
          className="bg-teal-700 text-white p-[15px_30px] font-bold rounded-md"
        >
          Check Payment Status / Print Receipt
        </Link>
      </div>
    </main>
  );
};

export default Page_ExamFee;
