import React from 'react';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl ">
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
          <h2 className="mt-6 text-3xl font-extrabold text-[#525b88]">
            Forgot Password?
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md  space-y-4">
            <div>
              <p className="text-gray-600 text-center">
                To reset your password, please send a mail to webmaster@aknu.edu.in.
              </p>
            </div>
          </div>

        

          <div className="text-center">
            <a
              href="/login-page"
              className="font-medium text-[#525b88] hover:text-[#3f4669]"
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