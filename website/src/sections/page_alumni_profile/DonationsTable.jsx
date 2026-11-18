import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function DonationsTable() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}api/alumni/get-all-donations`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch donations");
        setDonations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  if (loading) return <LoadingSpinner  label="Loading Donations . . ."/>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  console.log("DDDDD",donations)

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="font-bold text-teal-700 text-lg mb-2.5">Recent Donations</h1>

      <div className="overflow-x-auto bg-white">
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-[#00786F] text-left text-sm text-white">
              <th className="p-3">S.No</th>
              <th className="p-3">Donor</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              {/* <th className="p-3">Method</th> */}
              <th className="p-3">Date</th>
              <th className="p-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation,idx) => (
              <tr key={donation._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{idx+1}</td>
                <td className="p-3 font-medium text-gray-800">{donation.donorName}</td>
                <td className="p-3 text-gray-700 whitespace-nowrap">
                  ₹ {donation.amount.toLocaleString()}
                </td>
                <td className="p-3 text-gray-700">{donation.donorEmail}</td>
                <td className="p-3 text-gray-700">{donation.donorPhone}</td>
                {/* <td className="p-3 text-gray-700">UPI</td> */}
                <td className="p-3 text-gray-500">
                  {new Date(donation.donationDate).toLocaleDateString()}
                </td>
                <td className="p-3 text-gray-600 italic">
                  {donation.message || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
