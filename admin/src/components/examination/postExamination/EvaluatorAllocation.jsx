import React, { useState, useEffect } from "react";
import { API } from "../../../config/urls";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../../config/Toast";

const EvaluatorAllocation = () => {
  const [allocations, setAllocations] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedBundleBarcode, setSelectedBundleBarcode] = useState("");
  const [selectedEvaluator, setSelectedEvaluator] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedBundle, setSelectedBundle] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setInitialLoading(true);
      console.log("🔄 Fetching all data...");

      // 1. Fetch allocations
      const allocationsResponse = await API.get("/examination/evaluator-allocations", {
        params: { status: "Active" },
      });
      const allocationsData = allocationsResponse.data?.data || [];
      setAllocations(allocationsData);
      console.log("📊 Active allocations:", allocationsData.length);
      allocationsData.forEach(alloc => {
        console.log(`  - ${alloc.bundleBarcode} → ${alloc.evaluatorName} (${alloc.evaluatorId})`);
      });

      // 2. Fetch bundles and filter
      const bundlesResponse = await API.get("/examination/bundles");
      const allBundles = bundlesResponse.data?.data || [];
      console.log("📦 Total bundles:", allBundles.length);

      const receivedBundles = allBundles.filter(
        (bundle) =>
          bundle.status === "Received" ||
          bundle.status === "AllScriptsRegistered"
      );
      console.log("📦 Received/AllScriptsRegistered bundles:", receivedBundles.length);

      const allocatedBundleBarcodes = new Set(
        allocationsData.map((alloc) => alloc.bundleBarcode?.toUpperCase()).filter(Boolean)
      );
      console.log("🔒 Allocated bundle barcodes:", Array.from(allocatedBundleBarcodes));

      const unallocatedBundles = receivedBundles.filter(
        (bundle) => !allocatedBundleBarcodes.has(bundle.barcode?.toUpperCase())
      );
      console.log("✅ Unallocated bundles:", unallocatedBundles.length);
      unallocatedBundles.forEach(b => console.log(`  - ${b.barcode}`));

      setBundles(unallocatedBundles);

      // 3. Fetch evaluators and filter
      const evaluatorsResponse = await API.get("/examination/evaluators", {
        params: { status: "Active" },
      });
      const evaluatorsData = evaluatorsResponse.data?.data || [];
      console.log("👥 Total evaluators:", evaluatorsData.length);

      const evaluatorBundleCounts = {};
      allocationsData.forEach((alloc) => {
        const evalId = alloc.evaluatorId;
        if (evalId) {
          evaluatorBundleCounts[evalId] = (evaluatorBundleCounts[evalId] || 0) + 1;
        }
      });
      console.log("📊 Evaluator bundle counts:", evaluatorBundleCounts);

      const filteredEvaluators = evaluatorsData
        .map((e) => ({
          id: e.evaluatorId,
          evaluatorId: e.evaluatorId,
          name: e.name,
          college: e.college,
          subjects: e.subjects || [],
          currentLoad: evaluatorBundleCounts[e.evaluatorId] || 0,
          maxLoad: 3,
        }))
        .filter((e) => e.currentLoad < 3);

      console.log("✅ Available evaluators (< 3 bundles):", filteredEvaluators.length);
      filteredEvaluators.forEach(e => console.log(`  - ${e.name}: ${e.currentLoad}/3 bundles`));

      setEvaluators(filteredEvaluators);
      console.log("✅ Data fetch complete!");

    } catch (error) {
      console.error("❌ Error fetching data:", error);
      showAxiosError(error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Set selected bundle when bundle barcode is selected
  useEffect(() => {
    if (!selectedBundleBarcode) {
      setSelectedBundle(null);
      return;
    }
    const bundle = bundles.find((b) => b.barcode === selectedBundleBarcode);
    setSelectedBundle(bundle || null);
  }, [selectedBundleBarcode, bundles]);

  const handleAllocate = async () => {
    if (!selectedBundleBarcode || !selectedEvaluator) {
      showErrorMessage("Please select bundle barcode and evaluator");
      return;
    }

    if (!selectedBundle) {
      showErrorMessage("Bundle not found");
      return;
    }

    const selectedEvaluatorData = evaluators.find(
      (e) => e.id === selectedEvaluator || e.evaluatorId === selectedEvaluator
    );
    if (!selectedEvaluatorData) {
      showErrorMessage("Invalid evaluator selected");
      return;
    }

    try {
      setLoading(true);
      console.log("🚀 Allocating bundle:", selectedBundle.barcode, "to evaluator:", selectedEvaluatorData.name);

      const response = await API.post("/examination/evaluator-allocations", {
        evaluatorId:
          selectedEvaluatorData.evaluatorId || selectedEvaluatorData.id,
        evaluatorName: selectedEvaluatorData.name,
        evaluatorCollege: selectedEvaluatorData.college,
        bundleId: selectedBundle._id,
        bundleBarcode: selectedBundle.barcode,
      });

      if (response.data.success) {
        console.log("✅ Allocation successful!");
        showSuccessMessage(
          `Successfully allocated bundle ${selectedBundle.barcode} to ${selectedEvaluatorData.name}`
        );

        setShowAllocateModal(false);
        setSelectedBundleBarcode("");
        setSelectedBundle(null);
        setSelectedEvaluator("");

        // Refresh all data
        console.log("🔄 Refreshing data after allocation...");
        await fetchAllData();
      } else {
        console.error("❌ Allocation failed:", response.data.message);
        showErrorMessage(response.data.message || "Failed to allocate bundle");
      }
    } catch (error) {
      console.error("❌ Error allocating bundle:", error);
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (allocationId) => {
    if (!window.confirm("Are you sure you want to unassign this allocation?")) {
      return;
    }

    try {
      setLoading(true);

      await API.put(`/examination/evaluator-allocations/${allocationId}`, {
        status: "Cancelled",
      });

      showSuccessMessage("Allocation unassigned successfully");

      // Refresh all data
      await fetchAllData();
    } catch (error) {
      console.error("Error unassigning allocation:", error);
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAllocations = allocations.filter((allocation) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      allocation.bundleBarcode?.toLowerCase().includes(searchLower) ||
      allocation.subjectCode?.toLowerCase().includes(searchLower) ||
      allocation.subjectId?.name?.toLowerCase().includes(searchLower) ||
      allocation.evaluatorName?.toLowerCase().includes(searchLower) ||
      allocation.evaluatorId?.toLowerCase().includes(searchLower) ||
      allocation.evaluatorCollege?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Evaluator Allocation
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Assign bundles to evaluators (max 3 bundles per evaluator)
          </p>
        </div>
        <button
          onClick={() => setShowAllocateModal(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Allocate Bundle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by bundle, evaluator name, college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-x-auto">
        <div className="overflow-y-auto max-h-[600px] thin-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Evaluator Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  College
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Bundle Barcode
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Scripts
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialLoading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading allocations...
                  </td>
                </tr>
              ) : filteredAllocations.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {allocations.length === 0
                      ? "No allocations yet. Click 'Allocate Bundle' to get started."
                      : "No allocations found matching your search."}
                  </td>
                </tr>
              ) : (
                filteredAllocations.map((allocation) => (
                  <tr key={allocation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {allocation.evaluatorName || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {allocation.evaluatorId || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {allocation.evaluatorCollege || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {allocation.bundleBarcode || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {allocation.subjectId?.name || allocation.subjectCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {allocation.allocatedScripts || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${allocation.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : allocation.status === "Active"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {allocation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {allocation.status === "Active" && (
                        <button
                          onClick={() => handleUnassign(allocation._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Unassign
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocate Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                Allocate Bundle to Evaluator
              </h3>
              <button
                onClick={() => {
                  setShowAllocateModal(false);
                  setSelectedBundleBarcode("");
                  setSelectedEvaluator("");
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
                  Bundle <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBundleBarcode}
                  onChange={(e) => {
                    setSelectedBundleBarcode(e.target.value);
                    setSelectedEvaluator("");
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Bundle</option>
                  {bundles.map((bundle) => (
                    <option key={bundle._id} value={bundle.barcode}>
                      {bundle.barcode} - {bundle.subjectId?.name || bundle.subjectCode} ({bundle.scriptCount} scripts)
                    </option>
                  ))}
                </select>
                {bundles.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No unallocated bundles available
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evaluator <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEvaluator}
                  onChange={(e) => setSelectedEvaluator(e.target.value)}
                  disabled={!selectedBundleBarcode}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Evaluator</option>
                  {evaluators.map((evaluator) => (
                    <option key={evaluator.id} value={evaluator.id}>
                      {evaluator.name} ({evaluator.college}) - Bundles: {evaluator.currentLoad}/{evaluator.maxLoad}
                    </option>
                  ))}
                </select>
                {evaluators.length === 0 && selectedBundleBarcode && (
                  <p className="text-xs text-red-500 mt-1">
                    No evaluators available (all have 3 bundles)
                  </p>
                )}
              </div>
              {selectedBundle && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <span className="font-medium">Bundle:</span> {selectedBundle.barcode} - {selectedBundle.scriptCount} scripts will be allocated
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAllocateModal(false);
                  setSelectedBundleBarcode("");
                  setSelectedEvaluator("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAllocate}
                disabled={!selectedBundleBarcode || !selectedEvaluator || loading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Allocating..." : "Allocate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluatorAllocation;
