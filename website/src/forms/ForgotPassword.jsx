import React from 'react';

const ForgotPassword = () => {
  const closeModal = () => {
    window.history.pushState(
      "",
      document.title,
      window.location.pathname + window.location.search
    );
    window.dispatchEvent(new Event("hashchange"));
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-md overflow-hidden">
      <div className="p-4 bg-teal-700 text-white shadow-md flex-shrink-0 relative">
        <h2 className="text-2xl font-bold">Forgot Password?</h2>
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-white hover:text-gray-400 transition"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
      <div className="p-10">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-16 w-16 text-[#525b88]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-teal-700">
            Forgot Password?
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md space-y-4">
            <div>
              <p className="text-gray-600 text-center">
                To reset your password, please send a mail to webmaster@aknu.edu.in.
              </p>
            </div>
          </div>

          <div className="text-center">
            <a
              href="#alumni/login"
              className="font-medium text-teal-700 hover:text-teal-800 hover:underline transition"
            >
              Back to login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

