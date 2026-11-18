import { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { main_collegeList, main_courseList, main_purposeList } from "./Data";
import { BackButton } from "../../components/BackButton";
import {
  applicationPurposeApi,
  collegeApi,
  courseApi,
} from "../../utils/apiService";
import { useNavigate, Link } from "react-router-dom";

const Page_CertificateFee = () => {
  const courseList = main_courseList;
  const purposeList = main_purposeList;
  const collegeList = main_collegeList;

  const [formData, setFormData] = useState({
    registrationNumber: "",
    nameSSC: "",
    selectCourse: "",
    selectCollege: "",
    monthOfPassing: "",
    yearOfPassing: "",
    admittedYear: "",
    dateOfBirth: "",
    applicationPurpose: "",
    applicationType: "Normal",
    totalFee: "0",
    fullAddress: "",
    mobileNumber: "",
    eMail: "",
    uploadDocuments: null,
    termsAccepted: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [purposes, setPurposes] = useState([]);

  const navigate = useNavigate();

  console.log("____ASdfasf");

  const fetchColleges = async () => {
    try {
      console.log("__________");
      setLoading(true);
      const data = await collegeApi.getAll();
      console.log("_____data", data);
      setColleges(data.data);
      setError(null);
    } catch (err) {
      console.log("_____err", err);
      setError(err.message);
    } finally {
      console.log("__________wdfasfsdasfdf");
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseApi.getAll();
      console.log("_____fetchCoursesdata", data);
      setCourses(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      console.log("__________wdfasfsdasfdf");
      setLoading(false);
    }
  };

  const fetchPurposes = async () => {
    try {
      setLoading(true);
      const data = await applicationPurposeApi.getAll();
      setPurposes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      console.log("__________wdfasfsdasfdf");
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        await Promise.all([fetchColleges(), fetchCourses(), fetchPurposes()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAll();
  }, []);

  const calculateFee = () => {
    if (
      !formData.monthOfPassing ||
      !formData.yearOfPassing ||
      !formData.applicationPurpose ||
      !formData.applicationType
    ) {
      return 0;
    }

    const selectedPurpose = purposes.find(
      (purpose) => purpose._id === formData.applicationPurpose
    );

    if (!selectedPurpose) return 0;

    let fee = selectedPurpose.fee;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const passingYear = parseInt(formData.yearOfPassing);
    const passingMonth =
      new Date(`${formData.monthOfPassing} 1, 2000`).getMonth() + 1;
    console.log("______passingMonth", passingMonth);
    let yearsDifference = currentYear - passingYear;

    if (currentMonth < passingMonth) {
      yearsDifference -= 1;
    }

    if (yearsDifference > selectedPurpose.revised_rate_year) {
      const belatedYears = yearsDifference;
      fee += selectedPurpose.belated_fee * belatedYears;
    }

    if (formData.applicationType === "Tatkal") {
      fee *= 2;
    }

    return fee;
  };

  useEffect(() => {
    const calculatedFee = calculateFee();
    console.log("______calculatedFee", calculatedFee);
    setFormData((prev) => ({
      ...prev,
      totalFee: calculatedFee.toString(),
    }));
  }, [
    formData.monthOfPassing,
    formData.yearOfPassing,
    formData.applicationPurpose,
    formData.applicationType,
    purposes,
  ]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    let val = value;
    if (type === "checkbox") val = checked;
    if (type === "file") val = files[0];
    if (name === "mobileNumber") val = val.replace(/[^0-9]/g, "").slice(0, 10);
    setFormData({ ...formData, [name]: val });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.registrationNumber.trim())
      errors.registrationNumber = "Registration Number is required";
    if (!formData.nameSSC.trim())
      errors.nameSSC = "Name as per SSC is required";
    if (!formData.selectCourse)
      errors.selectCourse = "Course selection is required";
    if (!formData.selectCollege)
      errors.selectCollege = "College selection is required";
    if (!formData.monthOfPassing)
      errors.monthOfPassing = "Month of Passing is required";
    if (!formData.yearOfPassing)
      errors.yearOfPassing = "Year of Passing is required";
    if (!formData.admittedYear)
      errors.admittedYear = "Admitted Year is required";
    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of Birth is required";
    if (!formData.applicationPurpose)
      errors.applicationPurpose = "Application Purpose is required";
    if (!formData.fullAddress.trim())
      errors.fullAddress = "Full Address is required";
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10)
      errors.mobileNumber = "10-digit Mobile Number is required";
    if (
      !formData.eMail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.eMail)
    )
      errors.eMail = "Valid email is required";
    if (!formData.termsAccepted)
      errors.termsAccepted = "You must accept the terms and conditions";
    return errors;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const errors = validateForm();
  //   setFormErrors(errors);

  //   if (Object.keys(errors).length === 0) {
  //     try {
  //       const formDataToSend = new FormData();
  //       Object.keys(formData).forEach((key) => {
  //         if (key !== "uploadDocuments") {
  //           formDataToSend.append(key, formData[key]);
  //         }
  //       });

  //       if (formData.uploadDocuments) {
  //         formDataToSend.append("uploadDocuments", formData.uploadDocuments);
  //       }

  //       const response = await fetch(
  //         `${import.meta.env.VITE_API_URL}api/certification-form/apply-certificate`,
  //         {
  //           method: "POST",
  //           body: formDataToSend,
  //         }
  //       );

  //       const result = await response.json();

  //       if (response.ok) {
  //         alert("Form submitted successfully!");
  //       } else {
  //         alert(`Submission failed: ${result.message}`);
  //       }
  //     } catch (error) {
  //       console.error("Error submitting form:", error);
  //       alert("An error occurred while submitting the form.");
  //     }
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    console.log("__afsd");
    if (Object.keys(errors).length === 0) {
      try {
        setLoading((prev) => ({ ...prev, submitting: true }));
        console.log("______SADfsdfs");
        // Map the selected display names
        const selectedCourse = courses.find(
          (c) => c._id === formData.selectCourse
        );
        const selectedCollege = colleges.find(
          (c) => c._id === formData.selectCollege
        );
        const selectedPurpose = purposes.find(
          (p) => p._id === formData.applicationPurpose
        );

        // Combine display names with existing form data
        const reviewData = {
          ...formData,
          courseName: selectedCourse?.coursename || "",
          collegeName: selectedCollege?.college_name || "",
          purposeName: selectedPurpose?.purpose || "",
        };
        navigate("/review", {
          state: { formData: reviewData },
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading((prev) => ({ ...prev, submitting: false }));
      }
    }
  };

  return (
    <main className="px-4 py-8 md:px-[15%] md:py-12 bg-gray-50 min-h-screen md:pt-10">
      <BackButton className="mb-10" />
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">
            Certificate Application Form
          </h1>
          <p className="text-teal-100 mt-1">
            Please fill all the required details carefully
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          {/* 50-50 Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Registration Number"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.registrationNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formErrors.registrationNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.registrationNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (As per SSC) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nameSSC"
                  value={formData.nameSSC}
                  onChange={handleInputChange}
                  placeholder="Enter Name"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.nameSSC ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.nameSSC && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.nameSSC}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  name="selectCourse"
                  value={formData.selectCourse}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.selectCourse
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select Course</option>
                  {courses &&
                    courses.map((course, index) => (
                      <option key={index} value={course._id}>
                        {course.coursename}
                      </option>
                    ))}
                </select>
                {formErrors.selectCourse && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.selectCourse}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College <span className="text-red-500">*</span>
                </label>
                <select
                  name="selectCollege"
                  value={formData.selectCollege}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.selectCollege
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select College</option>
                  {colleges.map((college, index) => (
                    <option key={index} value={college._id}>
                      {college.college_code} {college.college_name}
                    </option>
                  ))}
                </select>
                {console.log("___college", colleges)}
                {formErrors.selectCollege && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.selectCollege}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month of Passing <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="monthOfPassing"
                    value={formData.monthOfPassing}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                      formErrors.monthOfPassing
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Month</option>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month, index) => (
                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  {formErrors.monthOfPassing && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.monthOfPassing}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year of Passing <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="yearOfPassing"
                    value={formData.yearOfPassing}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                      formErrors.yearOfPassing
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 25 }, (_, i) => 2001 + i).map(
                      (year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      )
                    )}
                  </select>
                  {formErrors.yearOfPassing && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.yearOfPassing}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admitted Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="admittedYear"
                  value={formData.admittedYear}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.admittedYear
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 26 }, (_, i) => 2000 + i).map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  )}
                </select>
                {formErrors.admittedYear && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.admittedYear}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  max={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 18)
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.dateOfBirth
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />

                {formErrors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.dateOfBirth}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3-in-a-row section for purpose, type, and fee */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Purpose <span className="text-red-500">*</span>
              </label>
              <select
                name="applicationPurpose"
                value={formData.applicationPurpose}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                  formErrors.applicationPurpose
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select Purpose</option>
                {purposes &&
                  purposes.map((purpose, index) => (
                    <option key={index} value={purpose._id}>
                      {purpose.purpose}
                    </option>
                  ))}
              </select>
              {formErrors.applicationPurpose && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.applicationPurpose}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Type <span className="text-red-500">*</span>
              </label>
              <select
                name="applicationType"
                value={formData.applicationType}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                  formErrors.applicationType
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="Normal">Normal</option>
                <option value="Tatkal">Tatkal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Fee (Rs.)
              </label>
              <input
                type="text"
                name="totalFee"
                value={formData.totalFee}
                onChange={handleInputChange}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Full width fields */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="fullAddress"
                value={formData.fullAddress}
                onChange={handleInputChange}
                rows={4}
                placeholder="Enter your complete address"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                  formErrors.fullAddress ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formErrors.fullAddress && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.fullAddress}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.mobileNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formErrors.mobileNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.mobileNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="eMail"
                  value={formData.eMail}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.eMail ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.eMail && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.eMail}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Documents (if required)
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                    Choose File
                  </span>
                  <input
                    type="file"
                    name="uploadDocuments"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-500">
                  {formData.uploadDocuments
                    ? formData.uploadDocuments.name
                    : "No file chosen"}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Supported formats: PDF, JPG, PNG (Max 5MB)
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor="termsAccepted"
                  className="text-sm text-gray-700"
                >
                  I hereby declare that all the information provided is correct
                  to the best of my knowledge. I accept all terms and
                  conditions.
                </label>
                {formErrors.termsAccepted && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.termsAccepted}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <ReCAPTCHA
              sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ"
              className="flex justify-center"
            />
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          to="/fee-pay/status"
          className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Check Payment Status / Print Receipt
        </Link>
      </div>
    </main>
  );
};

export default Page_CertificateFee;
