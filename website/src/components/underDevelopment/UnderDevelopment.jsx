import React from "react";

const UnderDevelopment = () => {
  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md mx-auto">
        {/* Image - You can replace with your own */}
        {/* <img
          src="https://cdn.pixabay.com/photo/2017/06/20/08/12/maintenance-2422173_1280.png"
          alt="Under Development"
          className="w-full h-auto mb-8"
        /> */}

        {/* Title */}
        {/* <h1 className="text-3xl font-bold text-emerald-800 mb-4">
          Site Under Development
        </h1> */}

        {/* Description */}
        {/* <p className="text-lg text-emerald-700 mb-6">
          We're working hard to bring you an amazing experience. Please check
          back soon!
        </p> */}

        {/* Payment Link */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-emerald-100">
          <p className="text-emerald-700 mb-4">You can proceed to payment:</p>
          <a
            href="/online-fees/apply-cert.php" // Replace with your actual payment link
            className="inline-block px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
          >
            Go Pay Here
          </a>
        </div>

        {/* <div className="mt-8 text-emerald-600">
          <p>Launching in: 14 days</p>
          <div className="w-full bg-emerald-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-emerald-600 h-2.5 rounded-full"
              style={{ width: "65%" }}
            ></div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default UnderDevelopment;
