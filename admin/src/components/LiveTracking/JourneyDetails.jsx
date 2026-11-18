import React, { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Clock, User, Phone, Mail } from "lucide-react";
import { API } from "../../config/urls";

const JourneyDetails = () => {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchJourneyDetails();
  }, []);

  // Convert buffer to base64 image
  const bufferToBase64 = (buffer, contentType) => {
    if (!buffer || !buffer.data) return null;

    // Convert buffer array to base64
    const base64 = btoa(
      new Uint8Array(buffer.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    return `data:${contentType};base64,${base64}`;
  };

  const fetchJourneyDetails = async () => {
    try {
      // Get journey ID from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const journeyId = urlParams.get("id");

      if (!journeyId) {
        console.error("No journey ID provided");
        setLoading(false);
        return;
      }

      // Replace with your actual API endpoint
      const res = await API.get(`/faculty-tracking/get-journey/${journeyId}`);

      console.log(res.data, "JOURNEY");

      // Process the data to convert buffers to base64
      const processedJourney = {
        ...res.data,
        // Process bills
        bills: res.data.bills?.map((bill) => ({
          ...bill,
          url: bufferToBase64(bill.data, bill.contentType),
        })),
        // Process stop points images
        stopPoints: res.data.stopPoints?.map((stop) => ({
          ...stop,
          images: stop.images?.map((image) => ({
            ...image,
            url: bufferToBase64(image.data, image.contentType),
          })),
        })),
      };

      setJourney(processedJourney);
    } catch (err) {
      console.error("Error fetching journey details:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading journey details...</p>
        </div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Journey not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Journey Details</h1>
        </div>

        {/* Faculty Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Faculty Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {journey.facultyId?.fullName || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium">
                  {journey.facultyId?.phone || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">
                  {journey.facultyId?.email || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Journey Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Journey Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Purpose</p>
              <p className="font-medium">{journey.purpose}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  journey.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : journey.status === "in-progress"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {journey.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">From</p>
              <p className="font-medium">{journey.fromLocation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">To</p>
              <p className="font-medium">{journey.toLocation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Started At</p>
              <p className="font-medium">{formatDate(journey.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium">{formatDate(journey.updatedAt)}</p>
            </div>
            {journey.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{journey.description}</p>
              </div>
            )}
            {journey.endingNotes && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Ending Notes</p>
                <p className="font-medium">{journey.endingNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Expenses</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Travel</p>
              <p className="text-xl font-bold text-purple-600">
                ₹{journey.travelExpense || 0}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Fuel</p>
              <p className="text-xl font-bold text-blue-600">
                ₹{journey.fuelExpense || 0}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Food</p>
              <p className="text-xl font-bold text-green-600">
                ₹{journey.foodExpense || 0}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Accommodation</p>
              <p className="text-xl font-bold text-orange-600">
                ₹{journey.accommodationExpense || 0}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-700">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-purple-600">
                ₹
                {(journey.travelExpense || 0) +
                  (journey.fuelExpense || 0) +
                  (journey.foodExpense || 0) +
                  (journey.accommodationExpense || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Bills Section */}
        {journey.bills && journey.bills.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Bills</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {journey.bills.map((bill, index) => (
                <div
                  key={bill._id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {bill.url ? (
                    <img
                      src={bill.url}
                      alt={`Bill ${index + 1}`}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => handleImageClick(bill.url)}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm text-gray-600 truncate">
                      {bill.filename}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stop Points Section */}
        {journey.stopPoints && journey.stopPoints.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Stop Points
            </h2>
            <div className="space-y-6">
              {journey.stopPoints.map((stop, index) => (
                <div key={stop._id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <MapPin className="h-5 w-5 text-purple-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{stop.name}</h3>
                      <p className="text-gray-600">{stop.location}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {stop.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {formatDate(stop.time)}
                      </div>
                    </div>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      Stop {index + 1}
                    </span>
                  </div>

                  {stop.images && stop.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Images
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {stop.images.map((image, imgIndex) => (
                          <div
                            key={image._id}
                            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                          >
                            {image.url ? (
                              <img
                                src={image.url}
                                alt={`Stop ${index + 1} - Image ${
                                  imgIndex + 1
                                }`}
                                className="w-full h-32 object-cover cursor-pointer"
                                onClick={() => handleImageClick(image.url)}
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                                <p className="text-xs text-gray-500">
                                  No image
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyDetails;
