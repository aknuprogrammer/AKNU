import React, { useState, useEffect } from "react";
import { performanceApi } from "../../services/performanceService";
import { toast } from "react-hot-toast";
import { Clock, Calendar, Award, TrendingUp, CheckCircle, XCircle, FileText, User, Building, Hash, Banknote, Percent } from "lucide-react";
import { BASE_URL } from "../../config/urls";

const getLoggedInUser = () => {
    // ... same as EmployeePerformance if needed, but here it's manager console context
};

// Helper to get full URL for proofs
const getFullUrl = (relativeUrl) => {
    if (!relativeUrl) return "#";
    if (relativeUrl.startsWith("http")) return relativeUrl;
    try {
        const origin = new URL(BASE_URL).origin;
        return `${origin}${relativeUrl}`;
    } catch (e) {
        return relativeUrl;
    }
};

// Helper to format decimal hours to HHh MMm
const formatHours = (decimalHours) => {
    if (!decimalHours || isNaN(decimalHours)) return "0h 0m";
    const totalMinutes = Math.round(decimalHours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
};

const ManagerPerformanceConsole = () => {
  const [activeCycle, setActiveCycle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [ratings, setRatings] = useState({ overall: 0 });
  const [hikePercentage, setHikePercentage] = useState(0);
  const [bonusPercentage, setBonusPercentage] = useState(0);
  const [promotion, setPromotion] = useState({ recommended: false, newTitle: "" });
  const [managerRemarks, setManagerRemarks] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("Pending");
  
  // New State for editing admin data in selfAssessment
  const [editedSelfAssessment, setEditedSelfAssessment] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const cycle = await performanceApi.getActiveCycle();
      setActiveCycle(cycle);
      if (cycle) {
        const reviewsData = await performanceApi.getAllReviewsForCycle(cycle._id);
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const openReview = (review) => {
    setSelectedReview(review);
    setRatings(review.managerAssessment?.ratings || { overall: 0 });
    setHikePercentage(review.managerAssessment?.hikePercentage || 0);
    setBonusPercentage(review.managerAssessment?.bonusPercentage || 0);
    setPromotion(review.managerAssessment?.promotion || { recommended: false, newTitle: "" });
    setManagerRemarks(review.managerAssessment?.remarks || "");
    setApprovalStatus(review.managerAssessment?.approvalStatus || "Pending");
    
    // Deep copy selfAssessment to avoid mutating original reviews list reference
    setEditedSelfAssessment(JSON.parse(JSON.stringify(review.selfAssessment || {})));
    
    setShowModal(true);
    fetchAttendance(review.employeeId);
  };

  const fetchAttendance = async (employeeId) => {
    try {
        const resp = await performanceApi.getTimesheetsByEmployeeId(employeeId);
        if (resp.success && resp.data) {
            const timesheets = resp.data;
            const totalHoursDecimal = timesheets.reduce((acc, curr) => acc + (curr.hours || 0), 0);
            const totalDays = timesheets.length;
            const avgHoursDecimal = totalDays > 0 ? (totalHoursDecimal / totalDays) : 0;
            
            setAttendanceSummary({
                totalHours: formatHours(totalHoursDecimal),
                totalDays,
                avgHours: formatHours(avgHoursDecimal)
            });
        }
    } catch (error) {
        console.error("Error fetching attendance", error);
    }
  };
  
  const handleAdminDataChange = (section, index, field, value) => {
      if (!editedSelfAssessment) return;
      const updated = { ...editedSelfAssessment };
      if (!updated[section]) updated[section] = [];
      if (!updated[section][index]) return;
      
      if (!updated[section][index].adminData) {
          updated[section][index].adminData = { isVerified: false, weight: 0, isLocked: false, remarks: "" };
      }
      
      updated[section][index].adminData[field] = value;
      setEditedSelfAssessment(updated);
  };


  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedReview) return;

    try {
      const payload = {
        managerAssessment: {
          ratings,
          hikePercentage,
          bonusPercentage,
          promotion,
          remarks: managerRemarks,
          approvalStatus,
        },
        selfAssessment: editedSelfAssessment
      };


      await performanceApi.updateManagerAssessment(selectedReview._id, payload);
      toast.success("Review updated successfully");
      setShowModal(false);
      fetchData(); // Refresh list
    } catch (error) {
      toast.error("Failed to update review");
      console.error(error);
    }
  };

  const handleLockCycle = async () => {
      if(!activeCycle) return;
      if(window.confirm("Are you sure you want to lock this performance cycle? Actions cannot be undone.")) {
          try {
              await performanceApi.lockCycle(activeCycle._id);
              toast.success("Cycle locked successfully");
              fetchData();
          } catch (error) {
              toast.error("Failed to lock cycle");
          }
      }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!activeCycle) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h2 className="text-xl font-semibold">No Active Performance Cycle</h2>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
              <h1 className="text-2xl font-bold text-[#525b88]">Performance Review Console</h1>
              <p className="text-gray-600">Cycle: {activeCycle.name} ({activeCycle.status})</p>
          </div>
          {activeCycle.status === "Active" && (
              <button 
                onClick={handleLockCycle}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-semibold"
              >
                  Close & Lock Cycle
              </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded shadow text-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525b88] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Dept</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Reviewer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {review.employeeObjectId?.firstName} {review.employeeObjectId?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {review.employeeId}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {review.employeeObjectId?.department || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${review.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          review.status === 'Submitted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {review.managerAssessment?.reviewerId?.username || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openReview(review)}
                      className="text-[#525b88] hover:text-[#3d4466] font-bold"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                  <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No reviews submitted yet.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-6xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
              <h2 className="text-xl font-semibold text-white">
                  Review: {selectedReview.employeeObjectId?.firstName} {selectedReview.employeeObjectId?.lastName}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
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
            
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Employee Self Assessment */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#525B88] mb-4 border-b pb-2">Employee Assessment</h3>
                    
                    <div className="space-y-4">
                        {selectedReview.selfAssessment?.activities?.map((act, idx) => (
                             <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm transition-all hover:shadow-sm">
                                <p className="font-medium text-gray-900">{act.description}</p>
                                <p className="text-gray-600 mt-1">Impact: {act.impact}</p>
                             </div>
                        ))}
                    </div>

                     {/* <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                         <h4 className="font-semibold text-sm text-gray-700 mb-2">Remarks</h4>
                         <p className="mt-2 text-sm text-gray-700 italic">"{editedSelfAssessment?.remarks || selectedReview.selfAssessment?.remarks}"</p>
                    </div> */}

                    {/* New Sections Admin Interface */}
                    <div className="space-y-6 pt-4 border-t border-gray-200">
                        {['certificates', 'awards', 'eventsOrganized', 'eventsAttended', 'publications'].map((sectionKey) => {
                            const items = editedSelfAssessment?.[sectionKey] || [];
                            if (items.length === 0) return null;
                            
                            return (
                                <div key={sectionKey} className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm">
                                    <h4 className="font-bold text-[#525B88] capitalize mb-3 border-b border-gray-300 pb-2">{sectionKey.replace(/([A-Z])/g, ' $1')}</h4>
                                    <div className="space-y-4">
                                        {items.map((item, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                                <div className="mb-3">
                                                    <p className="font-semibold text-gray-900">{item.title}</p>
                                                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                                                    {item.date && <p className="text-xs text-gray-500 mt-1">{item.date}</p>}
                                                    {item.proofs?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {item.proofs.map((p, pIdx) => (
                                                                <a 
                                                                    key={pIdx} 
                                                                    href={getFullUrl(p.url)} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-all hover:bg-blue-100"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                    Proof {pIdx + 1}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Admin Controls */}
                                                <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-4 items-center bg-blue-50/50 p-3 rounded-lg">
                                                    <label className="flex items-center text-xs font-semibold text-gray-700 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="mr-1.5 rounded text-[#525B88] focus:ring-[#525B88]"
                                                            checked={item.adminData?.isVerified || false}
                                                            onChange={(e) => handleAdminDataChange(sectionKey, idx, 'isVerified', e.target.checked)}
                                                        />
                                                        Verified
                                                    </label>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-gray-700">Weight:</span>
                                                        <input 
                                                            type="number" 
                                                            className="w-20 p-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all"
                                                            value={item.adminData?.weight || 0}
                                                            onChange={(e) => handleAdminDataChange(sectionKey, idx, 'weight', parseFloat(e.target.value))}
                                                        />
                                                    </div>

                                                    <label className="flex items-center text-xs font-semibold text-red-600 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="mr-1.5 rounded text-red-600 focus:ring-red-500"
                                                            checked={item.adminData?.isLocked || false}
                                                            onChange={(e) => handleAdminDataChange(sectionKey, idx, 'isLocked', e.target.checked)}
                                                        />
                                                        Lock
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Attendance Summary Section */}
                    {attendanceSummary && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-[#525B88] mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#525B88]" />
                                Attendance & Work Summary
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm transition-all hover:shadow-md">
                                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Total Hours</p>
                                    <p className="text-2xl font-bold text-blue-900">{attendanceSummary.totalHours}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm transition-all hover:shadow-md">
                                    <p className="text-xs text-green-600 font-bold uppercase mb-1">Days Worked</p>
                                    <p className="text-2xl font-bold text-green-900">{attendanceSummary.totalDays}</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm transition-all hover:shadow-md">
                                    <p className="text-xs text-purple-600 font-bold uppercase mb-1">Avg Hrs/Day</p>
                                    <p className="text-2xl font-bold text-purple-900">{attendanceSummary.avgHours}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3 italic">* Data pulled from official timesheet records.</p>
                        </div>
                    )}
                </div>

                {/* Right: Manager Assessment Form */}
                <form onSubmit={handleUpdate} className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#525B88] mb-4 border-b border-gray-200 pb-2">Manager Decision</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating (1-5)</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    onClick={() => setRatings({ ...ratings, overall: star })}
                                    className={`px-4 py-2 rounded-lg border-2 transition-all font-semibold ${
                                        ratings.overall === star 
                                            ? 'bg-gradient-to-r from-[#525B88] to-[#3a4166] text-white border-[#525B88] shadow-md' 
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#525B88] hover:bg-gray-50'
                                    }`}
                                >
                                    {star}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50/50 p-4 rounded-lg border-2 border-green-200 group transition-all hover:border-green-400 hover:shadow-md">
                             <label className="flex items-center gap-2 text-sm font-bold text-green-700 mb-2">
                                <TrendingUp className="w-4 h-4" />
                                Annual Hike %
                             </label>
                             <div className="relative">
                                <input 
                                    type="number" 
                                    className="w-full border-2 border-green-300 p-2.5 pl-3 pr-10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-bold text-lg text-green-900 bg-white" 
                                    value={hikePercentage}
                                    onChange={(e) => setHikePercentage(e.target.value)}
                                    placeholder="0"
                                />
                                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                             </div>
                        </div>
                        <div className="bg-amber-50/50 p-4 rounded-lg border-2 border-amber-200 group transition-all hover:border-amber-400 hover:shadow-md">
                             <label className="flex items-center gap-2 text-sm font-bold text-amber-700 mb-2">
                                <Banknote className="w-4 h-4" />
                                Performance Bonus %
                             </label>
                             <div className="relative">
                                <input 
                                    type="number" 
                                    className="w-full border-2 border-amber-300 p-2.5 pl-3 pr-10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-bold text-lg text-amber-900 bg-white" 
                                    value={bonusPercentage}
                                    onChange={(e) => setBonusPercentage(e.target.value)}
                                    placeholder="0"
                                />
                                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                             </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200 transition-all hover:border-yellow-300">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={promotion.recommended}
                                onChange={(e) => setPromotion({ ...promotion, recommended: e.target.checked })}
                                className="rounded text-[#525B88] focus:ring-[#525B88] w-4 h-4"
                            />
                            <span className="font-medium text-gray-800">Recommend Promotion</span>
                        </label>
                        {promotion.recommended && (
                            <input 
                                type="text"
                                className="w-full border-2 border-gray-300 p-2.5 rounded-lg mt-3 text-sm focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all outline-none"
                                placeholder="New Title (e.g. Senior Developer)"
                                value={promotion.newTitle}
                                onChange={(e) => setPromotion({ ...promotion, newTitle: e.target.value })}
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Manager Remarks</label>
                        <textarea
                            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all outline-none resize-none"
                            rows="4"
                            value={managerRemarks}
                            onChange={(e) => setManagerRemarks(e.target.value)}
                            placeholder="Enter your remarks..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Final Decision</label>
                        <select
                            className="w-full border-2 border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all outline-none bg-white"
                            value={approvalStatus}
                            onChange={(e) => setApprovalStatus(e.target.value)}
                        >
                            <option value="Pending">Pending Review</option>
                            <option value="Approved">Approve</option>
                            <option value="Rejected">Reject</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                         <button 
                            type="button" 
                            onClick={() => setShowModal(false)}
                            className="px-5 py-2.5 transition-all border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88]"
                        >
                             Cancel
                         </button>
                         <button 
                            type="submit" 
                            className="px-6 py-2.5 transition-all text-white rounded-lg shadow-md shadow-[#525B88]/20 bg-gradient-to-r from-[#525B88] to-[#3a4166] hover:from-[#3a4166] hover:to-[#2d3450] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88] font-semibold"
                        >
                             Save Review
                         </button>
                    </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerPerformanceConsole;
