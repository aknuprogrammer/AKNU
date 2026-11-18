import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const ReviewPage = () => {
  const { state } = useLocation();
  const formData = state?.formData || {};
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare data for API submission
      const submissionData = {
        regd: formData.registrationNumber,
        name: formData.nameSSC,
        course: formData.courseName,
        college: formData.collegeName,
        pass_month: formData.monthOfPassing,
        pass_year: formData.yearOfPassing,
        admit_year: formData.admittedYear,
        dob: formData.dateOfBirth,
        purpose: formData.purposeName,
        app_type: formData.applicationType?.toLowerCase(),
        amount: formData.totalFee || 0,
        address: formData.fullAddress,
        phone: formData.mobileNumber,
        email: formData.eMail,
        sets: formData.sets || "1",
        papers: formData.papers || "0",
        semester: formData.semester || "",
      };

      // Submit to backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}api/certificate`,
        submissionData
      );

      // Check for successful response structure
      if (
        response.data &&
        response.data.success &&
        response.data.reference_no
      ) {
        // Navigate to status page with reference
        navigate("/application-status", {
          state: {
            reference_no: response.data.reference_no,
            formData: formData,
          },
        });
      } else {
        // Handle unexpected response structure
        console.error("Unexpected response format:", response);
        alert(
          "Application submitted but received unexpected response. Please check your application status later."
        );
        setError("Received unexpected response from server");
      }
    } catch (err) {
      console.error("Submission error:", err);

      // Prepare user-friendly error message
      let errorMessage = "Failed to submit application";

      if (err.response) {
        // Server responded with error status
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check your connection.";
      }

      // Show alert and set error state
      alert(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-teal-800 mb-2">
          Application Review
        </h1>
        <p className="text-gray-600">
          Please verify your details before submission
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-teal-600 mb-4 pb-2 border-b border-teal-100">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem
            label="Registration Number"
            value={formData.registrationNumber}
          />
          <DetailItem label="Student Name" value={formData.nameSSC} />
          <DetailItem label="Date of Birth" value={formData.dateOfBirth} />
          <DetailItem label="Mobile Number" value={formData.mobileNumber} />
          <DetailItem label="E-Mail" value={formData.eMail} />
          <DetailItem label="Address" value={formData.fullAddress} />
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-teal-600 mb-4 pb-2 border-b border-teal-100">
          Academic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem label="Course Name" value={formData.courseName} />
          <DetailItem label="College Name" value={formData.collegeName} />
          <DetailItem
            label="Month of Passing"
            value={formData.monthOfPassing}
          />
          <DetailItem label="Year of Passing" value={formData.yearOfPassing} />
          <DetailItem label="Admitted Year" value={formData.admittedYear} />
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-teal-600 mb-4 pb-2 border-b border-teal-100">
          Application Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem
            label="Application Purpose"
            value={formData.purposeName}
          />
          <DetailItem
            label="Application Type"
            value={formData.applicationType?.toLowerCase()}
          />
          <DetailItem
            label="Total Fee (Rs.)"
            value={formData.totalFee || "0"}
          />
          <DetailItem
            label="Uploaded Documents"
            value={
              formData.uploadDocuments ? (
                <a
                  href={URL.createObjectURL(formData.uploadDocuments)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-800 font-medium hover:underline"
                >
                  View Document
                </a>
              ) : (
                "No file uploaded"
              )
            }
          />
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
        >
          Back to Edit
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-8 py-3 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm flex items-center justify-center ${
            isSubmitting ? "bg-teal-400" : "bg-teal-600 hover:bg-teal-700"
          }`}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              Submit Application
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => {
  if (!value) value = "N/A";

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-lg font-normal text-gray-800 break-words">
        {typeof value === "string" ? value : value}
      </p>
    </div>
  );
};

export default ReviewPage;
