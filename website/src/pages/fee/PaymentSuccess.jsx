import { useLocation } from "react-router-dom";
import { openRazorpay } from "../../components/payments/Razorpay";

const PaymentSuccess = () => {
  const { state } = useLocation();
  const formData = state?.formData || {};

  // Dummy reference number (backend should ideally generate this)
  const referenceNumber = `S${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const handlePayment = async () => {
    try {
      const amount = formData.totalFee * 100; // in paisa

      // Random rid/crn similar to your backend logic
      const cid = 6250;
      const crn = Math.floor(Math.random() * (999999 - 10000 + 1)) + 10000;

      await openRazorpay({
        amountPaisa: amount,
        currency: "INR",
        name: formData.nameSSC,
        email: formData.email,
        contact: formData.mobileNumber,
        cid,
        crn,
        remarks: "Submitted from client",
      });
    } catch (err) {
      console.error("Payment initiation failed:", err);
      alert("Something went wrong with payment.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl">
      <div className="text-center mb-10">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-14 w-14 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-green-700 tracking-tight">
          Application Submitted Successfully
        </h1>
        <p className="text-gray-600 mt-2">
          Thank you for submitting your application. Please review the summary
          below.
        </p>
      </div>

      <div className="bg-green-50 p-6 sm:p-8 rounded-xl border border-green-200 shadow-sm">
        <h2 className="text-2xl font-semibold text-green-800 mb-6 border-b pb-2">
          Application Summary
        </h2>
        <div className="space-y-4">
          <DetailRow
            label="Reference Number"
            value={referenceNumber}
            highlight
          />
          <DetailRow
            label="Registration Number"
            value={formData.registrationNumber}
          />
          <DetailRow label="Student Name" value={formData.nameSSC} />
          <DetailRow label="Course Name" value={formData.courseName} />
          <DetailRow label="College Name" value={formData.collegeName} />
          <DetailRow label="Application Purpose" value={formData.purposeName} />
          <DetailRow
            label="Application Type"
            value={formData.applicationType?.toLowerCase()}
          />
          <DetailRow label="Total Fee (Rs.)" value={formData.totalFee || "0"} />
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={handlePayment}
          className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-semibold transition duration-300 shadow-md"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, highlight = false }) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${highlight ? "bg-green-100 p-3 rounded-md" : ""}`}
    >
      <div className="md:col-span-1">
        <span className="font-medium text-gray-700">{label}</span>
      </div>
      <div className="md:col-span-2">
        <span
          className={`font-semibold ${highlight ? "text-green-700 text-lg" : "text-gray-800"}`}
        >
          {value || "N/A"}
        </span>
      </div>
    </div>
  );
};

export default PaymentSuccess;
