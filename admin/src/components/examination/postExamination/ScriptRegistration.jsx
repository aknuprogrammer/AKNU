import React, { useState, useEffect } from "react";
import { API } from "../../../config/urls";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../../config/Toast";

const ScriptRegistration = () => {
  const [receivedBundles, setReceivedBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveBarcodeInput, setReceiveBarcodeInput] = useState("");
  const [expandedBundles, setExpandedBundles] = useState(new Set());
  const [bundleScripts, setBundleScripts] = useState({});
  const [loadingScripts, setLoadingScripts] = useState({});

  // Fetch received bundles on component mount
  useEffect(() => {
    fetchReceivedBundles();
  }, []);

  const fetchReceivedBundles = async () => {
    try {
      setInitialLoading(true);
      // Fetch all bundles with Received or AllScriptsRegistered status
      const response = await API.get("/examination/bundles");
      if (response.data.success) {
        const allBundles = response.data.data || [];
        // Filter for Received and AllScriptsRegistered bundles
        const receivedBundles = allBundles.filter(
          (bundle) =>
            bundle.status === "Received" ||
            bundle.status === "AllScriptsRegistered"
        );
        setReceivedBundles(receivedBundles);
      }
    } catch (error) {
      showAxiosError(error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchScriptsForBundle = async (bundleId) => {
    if (bundleScripts[bundleId]) {
      // Already fetched
      return;
    }

    try {
      setLoadingScripts((prev) => ({ ...prev, [bundleId]: true }));
      const response = await API.get(`/examination/scripts/bundle/${bundleId}`);
      if (response.data.success) {
        setBundleScripts((prev) => ({
          ...prev,
          [bundleId]: response.data.data || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching scripts:", error);
      showErrorMessage("Failed to load scripts");
    } finally {
      setLoadingScripts((prev) => ({ ...prev, [bundleId]: false }));
    }
  };

  const toggleBundle = (bundleId) => {
    const newExpanded = new Set(expandedBundles);
    if (newExpanded.has(bundleId)) {
      newExpanded.delete(bundleId);
    } else {
      newExpanded.add(bundleId);
      // Fetch scripts when expanding
      fetchScriptsForBundle(bundleId);
    }
    setExpandedBundles(newExpanded);
  };

  const handleReceiveBundle = async () => {
    if (!receiveBarcodeInput) {
      showErrorMessage("Please scan or enter bundle barcode");
      return;
    }

    try {
      setLoading(true);
      const response = await API.put("/examination/bundles/receive", {
        barcode: receiveBarcodeInput,
      });
      if (response.data.success) {
        showSuccessMessage("Bundle received successfully!");
        setReceiveBarcodeInput("");
        setShowReceiveModal(false);
        // Refresh the received bundles list
        fetchReceivedBundles();
      }
    } catch (error) {
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Script Registration
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Receive bundles and register individual scripts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReceiveModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            Receive Bundle
          </button>
        </div>
      </div>

      {/* Received Bundles Section */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-4 border-b bg-gray-50">
          <h4 className="font-semibold text-gray-800">Received Bundles</h4>
          <p className="text-sm text-gray-500 mt-1">
            Click on a bundle to view and register scripts
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {initialLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading bundles...
            </div>
          ) : receivedBundles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No received bundles found. Receive a bundle to get started.
            </div>
          ) : (
            receivedBundles.map((bundle) => (
              <div key={bundle._id} className="border-b last:border-b-0">
                {/* Bundle Header - Accordion Toggle */}
                <div
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleBundle(bundle._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <button
                          className="text-gray-600 hover:text-gray-800 transition-transform"
                          style={{
                            transform: expandedBundles.has(bundle._id)
                              ? "rotate(90deg)"
                              : "rotate(0deg)",
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                        <div>
                          <h5 className="font-semibold text-gray-900">
                            {bundle.barcode}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {bundle.subjectId?.name || "N/A"} ({bundle.subjectCode})
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Scripts: {bundle.scriptCount}
                        </p>
                        <p className="text-xs text-gray-500">
                          Registered: {bundle.registeredScriptsCount || 0}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${bundle.status === "AllScriptsRegistered"
                          ? "bg-purple-100 text-purple-800"
                          : bundle.status === "Received"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {bundle.status === "AllScriptsRegistered"
                          ? "All Scripts Registered"
                          : bundle.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bundle Scripts - Accordion Content */}
                {expandedBundles.has(bundle._id) && (
                  <div className="bg-gray-50 border-t">
                    {loadingScripts[bundle._id] ? (
                      <div className="p-8 text-center text-gray-500">
                        Loading scripts...
                      </div>
                    ) : bundleScripts[bundle._id]?.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No scripts found in this bundle
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                S.No
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Script Barcode
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Hall Ticket
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Scanned At
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {bundleScripts[bundle._id]?.map((script, index) => (
                              <tr key={script._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {script.scriptBarcode}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {script.hallTicketNumber ? (
                                    <span className="text-green-600 font-medium">
                                      {script.hallTicketNumber}
                                    </span>
                                  ) : script.scannedAt ? (
                                    <span className="text-yellow-600 italic">
                                      Registered (No HT)
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      Not registered
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      script.status === "Registered"
                                        ? "bg-green-100 text-green-800"
                                        : script.status === "Allocated"
                                        ? "bg-blue-100 text-blue-800"
                                        : script.status === "Evaluated"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {script.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {script.scannedAt
                                    ? new Date(script.scannedAt).toLocaleString()
                                    : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Receive Bundle Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                Receive Bundle at Spot Centre
              </h3>
              <button
                onClick={() => {
                  setShowReceiveModal(false);
                  setReceiveBarcodeInput("");
                }}
                className="text-gray-500 hover:text-gray-700"
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
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scan Bundle Barcode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={receiveBarcodeInput}
                  onChange={(e) => setReceiveBarcodeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleReceiveBundle();
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Scan or enter bundle barcode"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Scan the bundle barcode or enter manually. Bundle must be in
                  "Dispatched" status.
                </p>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReceiveModal(false);
                  setReceiveBarcodeInput("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReceiveBundle}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Receiving..." : "Receive Bundle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptRegistration;
