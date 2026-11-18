import { useEffect, useState } from "react";
import { bufferToBase64 } from "../../utils";
import LoadingSpinner from "./LoadingSpinner";

export default function AlumniTable() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}api/alumni/get-all-alumni`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch alumni");
        setAlumni(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  if (loading) return <LoadingSpinner  label="Loading Alumni . . ."/>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="font-bold text-teal-700 text-lg mb-2.5">Registered Alumni</h1>

      <div className="overflow-x-auto bg-white">
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-[#00786F] text-left text-sm text-white">
              <th className="p-3">S.No</th>
              <th className="p-3">Photo</th>
              <th className="p-3">Name</th>
              <th className="p-3">Pass Out</th>
              <th className="p-3">Branch</th>
              <th className="p-3">Occupation</th>
              <th className="p-3">Location</th>
            </tr>
          </thead>
          <tbody>
            {alumni.map((alum,idx) => {
              let photoSrc = "";
              if (alum.photo?.data && alum.photoContentType) {
                // Convert buffer → base64
                const base64String = btoa(
                  String.fromCharCode(...new Uint8Array(alum.photo.data.data))
                );
                photoSrc = `data:${alum.photoContentType};base64,${base64String}`;
              }

              return (
                <tr key={alum._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">
                    {photoSrc ? (
                      <img
                        // src={photoSrc}
                        src={`data:image/png;base64,${bufferToBase64(alum.photo.data)}`}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        {alum.firstName[0]}
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-medium text-gray-800">
                    {alum.firstName} {alum.lastName}
                  </td>
                  <td className="p-3 text-gray-600">{alum.passOutYear}</td>
                  <td className="p-3 text-gray-600">{alum.branch}</td>
                  <td className="p-3 text-gray-700">
                    {alum.currentDesignation
                      ? `${alum.currentDesignation} at ${alum.currentCompany}`
                      : alum.currentOccupation}
                  </td>
                  <td className="p-3 text-gray-600">
                    {alum.city}, {alum.state}, {alum.country}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
