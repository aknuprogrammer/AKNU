import React from "react";
import { BackButton } from "./BackButton";

const FeeRefundPolicy = () => {
  const refundPolicies = [
    {
      details: [
        {
          id: 1,
          feePercentage: "100%",
          detail:
            "15 days or more before the formally- notified last date of admission",
        },
        {
          id: 2,
          feePercentage: "90%",
          detail:
            "Less than 15 days or more before the formally- notified last date of admission",
        },
        {
          id: 3,
          feePercentage: "80%",
          detail:
            "15 days or more after the formally- notified last date of admission",
        },
        {
          id: 4,
          feePercentage: "50%",
          detail:
            "30 days or less, but more than 15 days, after formally- notified last date of admission",
        },
        {
          id: 5,
          feePercentage: "0%",
          detail:
            "More than 30 days after formally- notified last date of admission",
        },
      ],
    },
  ];

  return (
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      <h1 className="text-3xl sm:text-3xl font-bold mb-6 text-teal-800">
        Fee Refund Policy
      </h1>

      <p className="text-[#303630] mb-4 text-justify text-[16px]">
        The University follows a structured fee refund policy as per UGC
        guidelines. The refund policy is applicable for all regular programs
        offered by the University. The details of the refund policy are as
        follows:
      </p>

      <div className="space-y-6">
        {refundPolicies.map((item, index) => (
          <div key={index} className="bg-white shadow-md overflow-hidden">
            {/* <h2 className="text-xl font-semibold bg-blue-50 text-blue-800 px-6 py-3 border-b border-gray-200">
                            {}
                        </h2> */}

            <div className="overflow-x-auto mt-4">
              <table className="min-w-full text-left border border-[#ccc]">
                <thead className="bg-teal-700 text-white">
                  <tr>
                    <th className="px-4 py-2">S.No</th>
                    <th className="px-4 py-2">Percentage of Refund of Fees</th>
                    <th className="px-4 py-2">
                      Point of Time when Notice of Withdrawal of Admission is
                      Received in the HEI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {item.details.map((info, idx) => (
                    <tr key={idx} className="border-t border-[#ccc]">
                      <td className="px-4 py-2">{info.id}</td>
                      <td className="px-4 py-2">{info.feePercentage}</td>
                      <td className="px-4 py-2">{info.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeeRefundPolicy;
