import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { bufferToBase64 } from "../../utils";
import LoadingSpinner from "./LoadingSpinner";

function Chip({ label, value, className }) {
  if (!value) return null;

  return (
    <div className={`flex flex-col bg-gray-100 rounded-lg px-3 py-2 shadow-sm ${className}`}>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-sm text-gray-800 font-semibold">{value}</span>
    </div>
  );
}


export default function AlumniProfileSection() {
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchData = async () => {
      try {
        const token = Cookies.get("alumni_token");
        if (!token) {
          setError("No token found. Please login.");
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}api/alumni/me`, {
          headers: { Authorization: `Bearer ${token}` },
          // signal: controller.signal,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch");

        setAlumni(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  if (loading) return <LoadingSpinner  label="Loading Profile . . ."/>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!alumni) return <p className="text-red-500 my-10 text-center">Profile Not Found</p>

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-2xl">
        <div className="p-6 flex flex-col sm:flex-row gap-6 items-center">
          {/* Profile Image */}
          {alumni?.photo ? (
            <img
              src={`data:image/png;base64,${bufferToBase64(alumni.photo.data)}`}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
              {alumni.firstName[0]}
            </div>
          )}

          {/* Details */}
          <div className="flex-1 w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {alumni.firstName} {alumni.lastName}
            </h2>

            {/* Grid of Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Chip label="Branch" value={alumni.branch} />
              <Chip label="Pass Out" value={alumni.passOutYear} />
              <Chip label="Email" value={alumni.email} />
              <Chip label="Phone" value={alumni.phone} />
              {alumni.currentOccupation && (
                <Chip
                  label="Occupation"
                  value={`${alumni.currentDesignation} at ${alumni.currentCompany}`}
                />
              )}
              {alumni.city && (
                <Chip
                  label="Location"
                  value={`${alumni.city}, ${alumni.state}, ${alumni.country}`}
                />
              )}
              {alumni.description && (
                <Chip
                  label="About me"
                  value={alumni.description}
                  className="sm:col-span-2"
                />
              )}
            </div>
          </div>
        </div>
        {/* Description / Bio */}
      </div>
    </div>

  );
}
