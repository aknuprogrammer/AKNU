import React from "react";

const AdmissionSuccessModal = ({
  isOpen,
  onClose,
  student,

}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8 relative transform transition-transform duration-300 scale-95 animate-in fade-in-90 zoom-in-90">
        {/* Decorative elements */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-lg border-8 border-white">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 group"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Main content */}
        <div className="pt-12 text-center">
          {/* Success title */}
          <h2 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Admission Submitted Successfully!
          </h2>

          <p className="text-gray-600 mb-8">
            Your application has been processed successfully
          </p>

          {/* Reference Number Card */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-8 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-blue-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-gray-600">
                Reference Number
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-blue-700 bg-white py-3 px-6 rounded-lg border border-blue-200 inline-block">
              {student.referenceNumber}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Please save this number for future reference
            </p>
          </div>


          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 mb-8">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">
                  Important Notice
                </h4>
                <p className="text-yellow-700 text-sm">
                  Please carry all original documents when attending the
                  counseling session. Your reference number will be required for
                  verification.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.print()}
              className="px-8 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Print Confirmation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionSuccessModal;
