import React, { useState, useEffect, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { performanceApi } from "../../services/performanceService";
import { toast } from "react-hot-toast";
import { Eye, Edit, Trash2, Plus, FileText, CheckCircle, XCircle, Lock, Clock, User, Hash, Building } from "lucide-react";
import FileUpload from "./FileUpload";
import { BASE_URL } from "../../config/urls";
// import DynamicSection from "./DynamicSection";

// Helper to get logged in user details from token
const getLoggedInUser = () => {
    try {
        const token = localStorage.getItem("token");
        console.log("12",token);
        if (token) {
            const decoded = jwtDecode(token);
            const user = decoded.user || {};
            console.log("17",user);
            return {
                employeeId: user.employeeId || user.employeeID || decoded.employeeId || user.role,
                fullName: user.fullName || user.fullName?.split(' ')[0] || user.role,
                // lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || "",
                department: user.department || "N/A"
            };
        }
    } catch (e) {
        console.error("Error decoding token from local storage", e);
    }
    // return { employeeId: "EMP001", fullName: "Employee", department: "N/A" };
};

// Helper to get full URL for proofs
const getFullUrl = (relativeUrl) => {
    if (!relativeUrl) return "#";
    if (relativeUrl.startsWith("http")) return relativeUrl;
    
    // BASE_URL is likely http://localhost:4567/api
    // relativeUrl is likely /api/uploads/performance/filename
    // We want http://localhost:4567/api/uploads/performance/filename
    
    try {
        const origin = new URL(BASE_URL).origin;
        return `${origin}${relativeUrl}`;
    } catch (e) {
        console.error("Invalid BASE_URL", e);
        return relativeUrl;
    }
};

const EmployeePerformance = () => {
  const [activeCycle, setActiveCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [review, setReview] = useState(null);
  // New Sections State
  const [certificates, setCertificates] = useState([]);

  const [awards, setAwards] = useState([]);
  const [eventsOrganized, setEventsOrganized] = useState([]);
  const [eventsAttended, setEventsAttended] = useState([]);
  const [publications, setPublications] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [currentCategory, setCurrentCategory] = useState("Certificates");
  const [editIndex, setEditIndex] = useState(null);
  const [modalFormData, setModalFormData] = useState({
    title: "",
    date: "",
    description: "",
    proofs: []
  });

  const categoryOptions = [
    "Certificates",
    "Awards",
    "Events Organized",
    "Events Attended",
    "Publications"
  ];

  const loggedInUser = getLoggedInUser();
  const employeeId = loggedInUser.employeeId;
 
  useEffect(() => {
    fetchActiveCycle();
    
    // Safety timeout
    const timer = setTimeout(() => {
        setLoading((prev) => {
            if (prev) {
                console.warn("Force stopping loading state due to timeout.");
                setErrorMsg("Loading timed out. Please check console for details.");
                return false;
            }
            return prev;
        });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const fetchActiveCycle = async () => {
    try {
      console.log("Fetching active cycle...");
      const cycle = await performanceApi.getActiveCycle();
      console.log("Active cycle fetched:", cycle);
      setActiveCycle(cycle);
      if (cycle) {
        console.log("Fetching review for cycle:", cycle._id);
        fetchReview(cycle._id);
      } else {
          console.log("No active cycle found.");
          setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching cycle", error);
      setLoading(false);
      setErrorMsg("Failed to load active cycle. Please try again.");
    }
  };
  
  const fetchReview = async (cycleId) => {
    try {
      const existingReview = await performanceApi.getEmployeeReview(cycleId, employeeId);
      if (existingReview) {
        setReview(existingReview);
        setCertificates(existingReview.selfAssessment?.certificates || []);
        setAwards(existingReview.selfAssessment?.awards || []);
        setEventsOrganized(existingReview.selfAssessment?.eventsOrganized || []);
        setEventsAttended(existingReview.selfAssessment?.eventsAttended || []);
        setPublications(existingReview.selfAssessment?.publications || []);
      }
    } catch (error) {
      console.error("Error fetching review", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    setModalFormData({
      title: "",
      date: "",
      description: "",
      proofs: []
    });
    setEditIndex(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category, index, item) => {
    setModalMode("edit");
    setCurrentCategory(category);
    setEditIndex(index);
    setModalFormData({
      title: item.title || "",
      date: item.date || "",
      description: item.description || "",
      proofs: item.proofs || []
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setModalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModalUpload = (newProofs) => {
      setModalFormData(prev => ({
          ...prev, 
          proofs: [...prev.proofs, ...newProofs]
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeCycle) return;

    try {
      // 1. Identify which list to update
      let targetList;
      let setTargetList;
      
      switch(currentCategory) {
          case "Certificates": targetList = certificates; setTargetList = setCertificates; break;
          case "Awards": targetList = awards; setTargetList = setAwards; break;
          case "Events Organized": targetList = eventsOrganized; setTargetList = setEventsOrganized; break;
          case "Events Attended": targetList = eventsAttended; setTargetList = setEventsAttended; break;
          case "Publications": targetList = publications; setTargetList = setPublications; break;
          default: return;
      }

      // 2. Clone and Update
      let newList = [...targetList];
      if (modalMode === "add") {
          newList.push(modalFormData);
      } else {
          newList[editIndex] = { ...newList[editIndex], ...modalFormData };
      }

      // 3. Prepare full payload (need to use the NEW list for the selected category)
      const payload = {
        employeeId,
        cycleId: activeCycle._id,
        selfAssessment: {
          certificates: currentCategory === "Certificates" ? newList : certificates,
          awards: currentCategory === "Awards" ? newList : awards,
          eventsOrganized: currentCategory === "Events Organized" ? newList : eventsOrganized,
          eventsAttended: currentCategory === "Events Attended" ? newList : eventsAttended,
          publications: currentCategory === "Publications" ? newList : publications,
        },
      };

      await performanceApi.submitSelfAssessment(payload);
      toast.success(modalMode === "add" ? "Record added successfully!" : "Record updated successfully!");
      setIsModalOpen(false);
      
      // Update local state immediately for responsiveness
      setTargetList(newList);
      fetchReview(activeCycle._id);
    } catch (error) {
      toast.error("Failed to save record");
      console.error(error);
    }
  };

  const handleDelete = async (category, index) => {
    if (!window.confirm(`Are you sure you want to delete this ${category} record?`)) return;

    try {
      let targetList;
      let setTargetList;
      
      switch(category) {
          case "Certificates": targetList = certificates; setTargetList = setCertificates; break;
          case "Awards": targetList = awards; setTargetList = setAwards; break;
          case "Events Organized": targetList = eventsOrganized; setTargetList = setEventsOrganized; break;
          case "Events Attended": targetList = eventsAttended; setTargetList = setEventsAttended; break;
          case "Publications": targetList = publications; setTargetList = setPublications; break;
          default: return;
      }

      const newList = targetList.filter((_, i) => i !== index);

      const payload = {
        employeeId,
        cycleId: activeCycle._id,
        selfAssessment: {
          certificates: category === "Certificates" ? newList : certificates,
          awards: category === "Awards" ? newList : awards,
          eventsOrganized: category === "Events Organized" ? newList : eventsOrganized,
          eventsAttended: category === "Events Attended" ? newList : eventsAttended,
          publications: category === "Publications" ? newList : publications,
        },
      };

      await performanceApi.submitSelfAssessment(payload);
      toast.success("Record deleted successfully!");
      setTargetList(newList);
      fetchReview(activeCycle._id);
    } catch (error) {
      toast.error("Failed to delete record");
      console.error(error);
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-gray-500">
        <p>Loading performance data...</p>
        <p className="text-xs text-gray-400 mt-2">Please wait...</p>
    </div>
  );

  if (errorMsg) return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-200 m-4">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{errorMsg}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-red-800 text-sm font-semibold"
          >
              Reload Page
          </button>
      </div>
  );

  if (!activeCycle) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300 m-4">
        <h2 className="text-xl font-semibold mb-2">No Active Performance Cycle</h2>
        <p>There are no performance reviews scheduled at this time.</p>
      </div>
    );
  }

  const sections = [
    { title: "Certificates", data: certificates },
    { title: "Awards", data: awards },
    { title: "Events Organized", data: eventsOrganized },
    { title: "Events Attended", data: eventsAttended },
    { title: "Publications", data: publications },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-row justify-between items-center mb-8">
            <div>
                <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
                   Employee Performance Dashboard
                </h2>
                <p className="text-gray-500 mt-1">{activeCycle.name} - {activeCycle.description}</p>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Performance
                </button>
            </div>
        </div>

        {/* Main Content */}
        {!review || 
         (review.status === "Draft" && 
          sections.every(s => s.data.length === 0)) ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-700">No Assessment Records</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">You haven't added any performance records or submitted your self-assessment yet.</p>
                <button 
                    onClick={handleOpenAdd} 
                    className="mt-6 inline-flex items-center px-6 py-3 bg-[#525B88] text-white rounded-lg hover:bg-[#3e4569] transition-all shadow-md font-semibold"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Start Self-Assessment
                </button>
            </div>
        ) : (
            <div className="space-y-8">
                
                {/* Final Results Section (if completed) */}
                {review.status === 'Completed' && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 shadow-sm">
                      <h3 className="text-lg font-bold text-[#525b88] mb-4 flex items-center gap-2">
                          <span className="bg-[#525b88] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">✓</span>
                          Final Review Results
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
                          <div className="bg-white p-4 rounded shadow-sm">
                              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Overall Rating</p>
                              <p className="text-3xl font-bold text-gray-800 mt-2">{review.managerAssessment?.ratings?.overall || "N/A"}<span className="text-lg text-gray-400 font-normal">/5</span></p>
                          </div>
                          <div className="bg-white p-4 rounded shadow-sm">
                              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Hike</p>
                              <p className="text-3xl font-bold text-green-600 mt-2">{review.managerAssessment?.hikePercentage}%</p>
                          </div>
                          <div className="bg-white p-4 rounded shadow-sm">
                              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Bonus</p>
                              <p className="text-3xl font-bold text-blue-600 mt-2">{review.managerAssessment?.bonusPercentage}%</p>
                          </div>
                           <div className="bg-white p-4 rounded shadow-sm">
                              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Promotion</p>
                              <p className="text-lg font-bold text-indigo-600 mt-3 leading-tight">
                                  {review.managerAssessment?.promotion?.recommended 
                                    ? review.managerAssessment.promotion.newTitle
                                    : "None"}
                              </p>
                          </div>
                      </div>
                      {review.managerAssessment?.remarks && (
                          <div className="mt-4 bg-white/50 p-3 rounded border border-blue-100 text-sm">
                              <span className="font-semibold text-[#525b88]">Manager Remarks:</span> {review.managerAssessment.remarks}
                          </div>
                      )}
                  </div>
                )}

                {/* Employee Details Header */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#525b88]/10 p-3 rounded-full text-[#525b88]">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee Name</p>
                            <p className="text-lg font-bold text-gray-800">
                                {
                                    loggedInUser?.fullName || loggedInUser?.role
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-[#525b88]/10 p-3 rounded-full text-[#525b88]">
                            <Hash className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee ID</p>
                            <p className="text-lg font-bold text-gray-800">{loggedInUser?.employeeId}</p>
                        </div>
                    </div>
                    {/* <div className="flex items-center gap-4">
                        <div className="bg-[#525b88]/10 p-3 rounded-full text-[#525b88]">
                            <Building className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</p>
                            <p className="text-lg font-bold text-gray-800">{loggedInUser.department}</p>
                        </div>
                    </div> */}
                </div>

                {/* Individual Performance Tables */}
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[#2a3563]">{section.title}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#525b88]">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider text-center w-16">S.No</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Proofs</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {section.data.length > 0 ? (
                                        section.data.map((item, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-center">{i + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{item.title}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={item.description}>{item.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.proofs?.length > 0 ? (
                                                        <div className="flex flex-col gap-1">
                                                            {item.proofs.map((proof, pIdx) => (
                                                                <a key={pIdx} href={getFullUrl(proof.url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 text-xs flex items-center gap-1 group">
                                                                    <FileText className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                                                    <span className="truncate max-w-[100px]">{proof.name || "View Proof"}</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : <span className="text-gray-400 text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> No Proof</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {item.adminData?.isVerified ? (
                                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                            <CheckCircle className="w-3 h-3" /> Verified
                                                        </span>
                                                    ) : item.adminData?.isLocked ? (
                                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                            <Lock className="w-3 h-3" /> Locked
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                            <Clock className="w-3 h-3" /> Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => handleOpenEdit(section.title, i, item)} 
                                                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                                                            title="Edit Record"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                                                            title="Delete"
                                                            onClick={() => handleDelete(section.title, i)}
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-400 bg-gray-50/30">
                                                No records added in this category.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Assessment Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 print:hidden">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                    
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b flex justify-between items-center bg-[#525b88] text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold">
                                {modalMode === "add" ? "Add New Record" : `Edit ${currentCategory}`}
                            </h2>
                        </div>
                        <button onClick={closeModal} className="text-white/80 hover:text-white text-2xl leading-none font-light p-2">&times;</button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
                        <form id="record-form" onSubmit={handleSubmit} className="space-y-5">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Employee Name</label>
                                    <input 
                                        type="text" 
                                        readOnly
                                        disabled
                                        value={`${loggedInUser.fullName}`}
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Employee ID</label>
                                    <input 
                                        type="text" 
                                        readOnly
                                        disabled
                                        value={loggedInUser.employeeId}
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                <select 
                                    value={currentCategory}
                                    onChange={(e) => setCurrentCategory(e.target.value)}
                                    disabled={modalMode === "edit"}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#525b88] focus:border-transparent transition-all ${modalMode === "edit" ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                                >
                                    {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                                <input 
                                    type="text" 
                                    name="title"
                                    required
                                    value={modalFormData.title}
                                    onChange={handleModalInputChange}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#525b88] focus:border-transparent transition-all"
                                    placeholder="Enter title..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        name="date"
                                        value={modalFormData.date}
                                        onChange={handleModalInputChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#525b88] focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Issuer</label>
                                <textarea 
                                    name="description"
                                    value={modalFormData.description}
                                    onChange={handleModalInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#525b88] focus:border-transparent transition-all"
                                    placeholder="Provide more details..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Proof Documents</label>
                                <FileUpload onUpload={handleModalUpload} label="Upload Files" />
                                
                                {modalFormData.proofs.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {modalFormData.proofs.map((p, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-[#525b88]/5 border border-[#525b88]/20 px-2 py-1 rounded text-xs text-[#525b88]">
                                                <FileText className="w-3 h-3" />
                                                <a 
                                                    href={getFullUrl(p.url)} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="truncate max-w-[150px] hover:underline"
                                                    title="Click to view file"
                                                >
                                                    {p.name}
                                                </a>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setModalFormData(prev => ({ ...prev, proofs: prev.proofs.filter((_, i) => i !== idx) }))}
                                                    className="text-red-500 hover:text-red-700 ml-1 font-bold"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={closeModal} 
                            className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            form="record-form"
                            className="bg-[#525b88] text-white px-6 py-2 rounded shadow hover:bg-[#3d4466] transition-all font-semibold"
                        >
                            {modalMode === "add" ? "Save Record" : "Update Changes"}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default EmployeePerformance;
