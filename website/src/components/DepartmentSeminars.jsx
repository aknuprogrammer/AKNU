import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DepartmentSeminars({ college, department }) {
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeminars = async () => {
      try {
        setLoading(true);
        // Using the live server URL structure for fetching
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4567/';
        const response = await axios.get(`${baseUrl}api/website/department-seminars`, {
          params: { college, department }
        });
        setSeminars(response.data);
      } catch (err) {
        setError('Failed to load events.');
      } finally {
        setLoading(false);
      }
    };

    if (college && department) {
      fetchSeminars();
    }
  }, [college, department]);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading events...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (seminars.length === 0) {
    return <div className="p-4 text-gray-500">No events found for this department.</div>;
  }

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full text-left border border-[#ccc]">
        <thead className="bg-teal-700 text-white">
          <tr>
            <th className="px-4 py-2 border-r border-[#ccc]">S.No</th>
            <th className="px-4 py-2 border-r border-[#ccc]">Major Event / Programmes</th>
            <th className="px-4 py-2 border-r border-[#ccc]">Period</th>
            <th className="px-4 py-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {seminars.map((seminar, idx) => (
            <tr key={seminar._id} className="border-t border-[#ccc] hover:bg-gray-50">
              <td className="px-4 py-2 border-r border-[#ccc]">{idx + 1}</td>
              <td className="px-4 py-2 border-r border-[#ccc] font-medium text-gray-800">{seminar.majorEvent}</td>
              <td className="px-4 py-2 border-r border-[#ccc] text-gray-600">{seminar.period}</td>
              <td className="px-4 py-2 text-sm text-gray-500 whitespace-pre-wrap">{seminar.note || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
