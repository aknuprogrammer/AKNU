import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { admissionFeesApi, otherFeesApi } from "../../../services/apiService";
import { BASE_URL } from "../../../config/urls";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { rowData } = location.state || {};
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [showPaymentSlip, setShowPaymentSlip] = useState(false);
  const [fees, setFees] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [campusAndCourse, setCampusAndCourse] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(""); // upi, dd, online
  const [paymentDetails, setPaymentDetails] = useState({
    upiTxnId: "",
    challanNo: "",
    ddNumber: "",
    bankName: "",
    branch: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [otherFees, setOtherFees] = useState([]);
  // Handle checkbox selection
  const handleFeeSelection = (id) => {
    const updatedFees = fees.map((fee) =>
      fee.id === id ? { ...fee, selected: !fee.selected } : fee
    );

    setFees(updatedFees);

    const total = updatedFees
      .filter((fee) => fee.selected)
      .reduce((sum, fee) => sum + fee.amount, 0);

    setTotalAmount(total);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
     
        if (!rowData.course._id || !rowData.college._id) return;

        const feesData = await admissionFeesApi.getByCourseAndCampus(
          rowData.course._id,
          rowData.college._id
        );

        setCampusAndCourse(feesData);

        const firstYear = feesData?.years?.find((y) => y.year === 1);

        if (firstYear?.fees) {
          const formattedFees = firstYear.fees.map((f, index) => ({
            id: f._id || index,
            name: f.feeType || "Unnamed Fee",
            amount: f.feeAmount || 0,
            selected: false,
          }));
          setFees(formattedFees);
        }
      } catch (err) {
        console.error("Error fetching fees:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const data = await otherFeesApi.getAll();
        setOtherFees(data);
        // setError(null);
      } catch (err) {
        // setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  // Handle payment submission
  const handlePayment = async (e) => {
    e.preventDefault();

    if (paymentMethod === "upi" && !paymentDetails.upiTxnId) {
      alert("Please enter UPI Transaction ID.");
      return;
    }

    if (
      paymentMethod === "dd" &&
      (!paymentDetails.ddNumber ||
        !paymentDetails.bankName ||
        !paymentDetails.branch)
    ) {
      alert("Please fill all DD details.");
      return;
    }


    // --- Step 1: select from normal fees ---
    let selectedFees = fees
      .filter((f) => f.selected)
      .map((f) => ({ feeId: f.id, name: f.name, amount: f.amount }));

    // --- Step 2: if Scholarship, also allow otherFees ---
    if (campusAndCourse?.mode === "Scholarship") {
      const selectedOtherFees = otherFees
        .filter((f) => f.selected)
        .map((f) => ({
          feeId: f._id,
          name: f.feeCategory + (f.subCategory ? ` - ${f.subCategory}` : ""),
          amount: f.amount,
        }));

      selectedFees = [...selectedFees, ...selectedOtherFees];
    }

    // --- Step 3: validation ---
    if (selectedFees.length === 0) {
      alert("Please select at least one fee to pay.");
      return;
    }

    const payload = {
      studentId: rowData._id,
      selectedFees,
      paymentMethod,
      paymentDetails,
      referenceNumber: rowData.referenceNumber,
      totalAmount,
    };

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const paymentData = await res.json();

        alert("Payment recorded successfully!");

        // Set payment slip
        setPaymentSlip({
          student: rowData,
          campus: rowData.campus,
          course: rowData.course,
          selectedFees,
          paymentMethod,
          paymentDetails,
          totalAmount,
          referenceNumber: rowData.referenceNumber,
          createdAt: new Date(),
        });

        // Show payment slip modal
        setShowPaymentSlip(true);

        // Reset selections (optional)
        setPaymentMethod("");
        setPaymentDetails({
          upiTxnId: "",
          challanNo: "",
          ddNumber: "",
          bankName: "",
          branch: "",
        });
        setFees(fees.map((f) => ({ ...f, selected: false })));
        setTotalAmount(0);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // Handle print functionality
  const handlePrint = () => {
    const printContent = document.getElementById("payment-slip-content");
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload after printing
  };

  // Handle okay button - reload the page
  const handleOkay = () => {
    setShowPaymentSlip(false);
    navigate("/admission");
    window.location.reload();
  };

  if (!rowData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p>No student data found. Please go back and try again.</p>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mb-3">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300"
        >
          ← Back
        </button>
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#525B88] px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Payment Portal</h1>
          <p className="text-indigo-200">Complete your payment process</p>
        </div>

        {/* Student Info */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Student Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-[#525B88] mb-3 border-b pb-2">
                Personal Details
              </h3>
              <p className="text-sm">
                <strong>Name: </strong>
                {rowData.firstName} {rowData.middleName} {rowData.lastName}
              </p>
              <p className="text-sm">
                <strong>Hall Ticket No: </strong>
                {rowData.hallTicketNo}
              </p>
              <p className="text-sm">
                <strong>Academic Year: </strong>
                {`${new Date().getFullYear()}-${(new Date().getFullYear() + 1)
                  .toString()
                  .slice(-2)}`}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-[#525B88] mb-3 border-b pb-2">
                Contact Details
              </h3>
              <p className="text-sm">
                <strong>Email: </strong>
                {rowData.email}
              </p>
              <p className="text-sm">
                <strong>Phone: </strong>
                {rowData.phone}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mx-6 mt-6">
          <div className="rounded-lg ">
            <h3 className="text-lg font-semibold text-[#525B88] mb-3 border-b pb-2">
              Institutional Details
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Campus */}
              <div className="flex-1">
                <p className="text-sm text-gray-600">Campus</p>
                <h2 className="text-md font-medium text-gray-800">
                  {rowData?.college?.name || "Not specified"}
                </h2>
              </div>

              {/* Course */}
              <div className="flex-1">
                <p className="text-sm text-gray-600">Course</p>
                <h2 className="text-md font-medium text-gray-800">
                  {rowData?.course?.name || "Not specified"}
                </h2>
              </div>
            </div>
          </div>
        </div>
        {/* Fee Selection */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Select Applicable Fees to Pay
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fee Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Regular Fees */}
                {fees.length > 0 && (
                  <>
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-2 bg-gray-100 font-semibold text-gray-700"
                      >
                        Regular Fees
                      </td>
                    </tr>
                    {fees.map(
                      (fee) =>
                        fee.amount > 0 &&
                        fee.name.trim() !== "" && (
                          <tr key={fee.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={fee.selected}
                                onChange={() => handleFeeSelection(fee.id)}
                                className="h-4 w-4 text-[#525B88] focus:ring-[#525B88] border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {fee.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              ₹{fee.amount.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        )
                    )}
                  </>
                )}

                {/* Other Fees */}
                {otherFees.length > 0 && (
                  <>
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-2 bg-gray-100 font-semibold text-gray-700"
                      >
                        Other Fees
                      </td>
                    </tr>
                    {otherFees.map(
                      (fee) =>
                        fee.amount > 0 && (
                          <tr key={fee._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={fee.selected || false}
                                onChange={() => {
                                  const updatedOtherFees = otherFees.map((f) =>
                                    f._id === fee._id
                                      ? { ...f, selected: !f.selected }
                                      : f
                                  );
                                  setOtherFees(updatedOtherFees);

                                  const totalRegular = fees
                                    .filter((f) => f.selected)
                                    .reduce((sum, f) => sum + f.amount, 0);
                                  const totalOther = updatedOtherFees
                                    .filter((f) => f.selected)
                                    .reduce((sum, f) => sum + f.amount, 0);

                                  setTotalAmount(totalRegular + totalOther);
                                }}
                                className="h-4 w-4 text-[#525B88] focus:ring-[#525B88] border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {fee.subCategory || fee.feeCategory}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              ₹{fee.amount.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        )
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Amount */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Total Amount
            </h3>
            <p className="text-2xl font-bold text-[#525B88]">
              ₹{totalAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <form onSubmit={handlePayment} className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Choose Payment Method
          </h2>

          <div className="space-y-3">
            {/* UPI */}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              UPI
            </label>
            {paymentMethod === "upi" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Enter UPI Transaction ID"
                  value={paymentDetails.upiTxnId}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      upiTxnId: e.target.value,
                    })
                  }
                  required
                  className="w-full border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={paymentDetails.bankName}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      bankName: e.target.value,
                    })
                  }
                  required
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Branch"
                  value={paymentDetails.branch}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      branch: e.target.value,
                    })
                  }
                  required
                  className="border rounded p-2"
                />
                <input
                  type="date"
                  placeholder="Select Date"
                  value={paymentDetails.date}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      date: e.target.value,
                    })
                  }
                  required
                  className="border rounded p-2"
                />
              </div>
            )}

            {/* chllan */}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                value="challanNo"
                checked={paymentMethod === "challanNo"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Challan
            </label>
            {paymentMethod === "challanNo" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Enter Challan Number"
                  value={paymentDetails.challanNo}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      challanNo: e.target.value,
                    })
                  }
                  required
                  className="w-full border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={paymentDetails.bankName}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      bankName: e.target.value,
                    })
                  }
                  required
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Branch"
                  value={paymentDetails.branch}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      branch: e.target.value,
                    })
                  }
                  required
                  className="border rounded p-2"
                />
                <input
                  type="date"
                  placeholder="Select Date"
                  value={paymentDetails.date}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      date: e.target.value,
                    })
                  }
                  required
                  className="border rounded p-2"
                />
              </div>
            )}

            {/* DD */}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                value="dd"
                checked={paymentMethod === "dd"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              DD
            </label>
            {paymentMethod === "dd" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="DD Number"
                  value={paymentDetails.ddNumber}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      ddNumber: e.target.value,
                    })
                  }
                  required
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={paymentDetails.bankName}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      bankName: e.target.value,
                    })
                  }
                  required
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Branch"
                  value={paymentDetails.branch}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      branch: e.target.value,
                    })
                  }
                  required
                  className="border rounded p-2"
                />
                <input
                  type="date"
                  placeholder="Select Date"
                  value={paymentDetails.date}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      date: e.target.value,
                    })
                  }
                  required
                  className="border rounded p-2"
                />
              </div>
            )}

            {/* Online Payment */}
            <label className="flex items-center gap-2 text-gray-400">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                disabled
              />
              Online Payment (Coming Soon)
            </label>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#525B88] text-white py-3 rounded-lg font-semibold hover:bg-[#414774]"
            >
              {loading ? "Processing..." : "Submit Payment"}
            </button>
          </div>
        </form>
      </div>

      {/* Payment Slip Modal */}
      {showPaymentSlip && paymentSlip && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8" id="payment-slip-content">
              {/* Header with decorative elements */}
              <div className="text-center border-b border-gray-200 pb-6 mb-6 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl"></div>
                <div className="flex justify-center mb-4 ">
                  <div className="w-16 h-16 bg-green-100 mt-4 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-green-600"
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
                </div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Payment Successful
                </h2>
                <p className="text-gray-600 mt-2">
                  Your payment has been processed successfully
                </p>
                <div className="mt-4 bg-blue-50 inline-block px-4 py-2 rounded-full">
                  <p className="text-sm font-medium text-blue-700">
                    Reference No: {paymentSlip.referenceNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Payment Details */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Payment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(paymentSlip.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {new Date(paymentSlip.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                        {paymentSlip.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                    {paymentSlip.paymentMethod === "upi" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">UPI Txn ID:</span>
                        <span className="font-medium">
                          {paymentSlip.paymentDetails.upiTxnId}
                        </span>
                      </div>
                    )}
                    {paymentSlip.paymentMethod === "dd" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">DD Number:</span>
                          <span className="font-medium">
                            {paymentSlip.paymentDetails.ddNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bank:</span>
                          <span className="font-medium">
                            {paymentSlip.paymentDetails.bankName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Branch:</span>
                          <span className="font-medium">
                            {paymentSlip.paymentDetails.branch}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Student Details */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Student Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600 text-sm">Name</p>
                      <p className="font-medium">
                        {paymentSlip.student.firstName}{" "}
                        {paymentSlip.student.middleName}{" "}
                        {paymentSlip.student.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Hall Ticket No</p>
                      <p className="font-medium">
                        {paymentSlip.student.hallTicketNo}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Course</p>
                      <p className="font-medium">
                        {campusAndCourse?.courseId?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Campus</p>
                      <p className="font-medium">
                        {campusAndCourse?.campusId?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fees Breakdown */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Fees Breakdown
                </h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Fee Type
                        </th>
                        <th className="text-right p-4 font-medium text-gray-700">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentSlip.selectedFees.map((fee, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="p-4 border-t border-gray-200">
                            {fee.name}
                          </td>
                          <td className="p-4 border-t border-gray-200 text-right font-medium">
                            ₹{fee.amount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-blue-50">
                      <tr>
                        <td className="p-4 border-t border-gray-200 font-semibold text-right">
                          Total Amount:
                        </td>
                        <td className="p-4 border-t border-gray-200 text-right font-bold text-blue-700 text-lg">
                          ₹{paymentSlip.totalAmount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500">
                  This is a computer-generated receipt and does not require a
                  signature.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Thank you for your payment!
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={handlePrint}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m4 4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-6a2 2 0 00-2 2v4a2 2 0 002 2z"
                  />
                </svg>
                Print
              </button>
              <button
                onClick={handleOkay}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
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
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
