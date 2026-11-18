import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Squares2X2Icon as SquaresIcon, 
  ListBulletIcon as ListIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CheckIcon,
  FunnelIcon,
  ChevronDownIcon,
  AcademicCapIcon as BuildingIcon,
  IdentificationIcon,
  ComputerDesktopIcon,
  EnvelopeIcon as MailIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { API, BASE_URL } from "../../config/urls";
import { showErrorMessage, showSuccessMessage } from "../../config/Toast";
import { useLetterHeadHook, resolveLetterRequestKind } from "../../Hooks/LetterHeadHook";


const LazyPreview = ({ letter, BASE_URL }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-white overflow-hidden relative">
      {!isLoaded && isVisible && (
        <div className="absolute inset-0 z-10 bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1">
             <div className="w-4 h-4 border-2 border-[#525B88]/20 border-t-[#525B88] rounded-full animate-spin"></div>
             <span className="text-[6px] font-black text-[#525B88]/40 uppercase tracking-widest">Loading</span>
          </div>
        </div>
      )}
      
      {isVisible ? (
        letter.thumbnail ? (
          <img 
            src={letter.thumbnail} 
            alt="Preview" 
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover object-top transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <iframe
            src={`${BASE_URL}/letters/${letter._id}/file#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
            title="Preview"
            onLoad={() => setIsLoaded(true)}
            className={`w-[calc(100%+24px)] h-full border-0 pointer-events-none scale-[1.1] overflow-hidden transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            scrolling="no"
            loading="lazy"
          />
        )
      ) : (
        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
           <DocumentTextIcon className="h-4 w-4 text-gray-200" />
        </div>
      )}
    </div>
  );

};

// Modern custom dropdown component
const CustomSelect = ({ label, value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between gap-2 pl-3 pr-2.5 py-2 bg-white border rounded-lg text-sm font-medium text-gray-700 transition-all min-w-[150px] ${
          open ? 'border-[#525B88] ring-2 ring-[#525B88]/10' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span>{selected?.label || 'Select'}</span>
        <ChevronDownIcon className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 bg-white border border-gray-100 rounded-xl shadow-xl min-w-full" style={{minWidth: '190px'}}>
          <div className="py-1 max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm transition-all duration-150 text-left rounded-none ${
                  opt.value === value
                    ? 'bg-[#525B88] text-white font-semibold'
                    : 'text-gray-700 hover:bg-[#525B88]/10 hover:text-[#525B88]'
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <CheckIcon className="h-3.5 w-3.5 text-white shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LetterRequestsTable = () => {
  const { 
    userRequests, 
    getUserRequests,
    isInitialLoading,
    handleDownloadApproved,
    letters,
    createdLetters,
    downloadGeneratedLetterPdf,
  } = useLetterHeadHook();
  
  const letterRequests = userRequests || [];
  const loading = isInitialLoading;

  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });

  const role = localStorage.getItem("role")?.toLowerCase();
  const isAdmin = ["admin", "super_admin", "vc", "registrar"].includes(role);

  /*
  useEffect(() => {
    getUserRequests();
  }, []);
  */


  const handleViewFile = async (obj) => {
    let letterId = null;
    let reqRecord = null;
    if (typeof obj === "string") {
      letterId = obj;
    } else if (obj && typeof obj === "object") {
      reqRecord = obj;
      letterId = obj.letterIds?.[0]?._id || obj.letterIds?.[0];
      if (!letterId) letterId = obj.letterId;
      if (!letterId && (obj._id || obj.id)) letterId = obj._id || obj.id;
    }

    if (!letterId) {
      showErrorMessage("Document reference is missing for this request");
      return;
    }

    const { kind } = resolveLetterRequestKind(
      reqRecord || { letterIds: [{ _id: letterId }] },
      letters,
      createdLetters,
    );

    const newWin = window.open("", "_blank");
    if (!newWin) {
      showErrorMessage("Pop-up blocked! Please allow pop-ups for this site.");
      return;
    }

    newWin.document.write(`
      <html>
        <head><title>Loading Document...</title></head>
        <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; color:#525B88; background:#f8fafc;">
          <div style="width:50px; height:50px; border:4px solid #f3f3f3; border-top:4px solid #525B88; border-radius:50%; animation:spin 1s linear infinite; margin-bottom:20px;"></div>
          <p style="font-weight:bold; letter-spacing:0.05em; text-transform:uppercase; font-size:12px; margin:0;">Institutional Portal</p>
          <p style="font-size:14px; color:#64748b; margin-top:8px;">Generating PDF Preview...</p>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </body>
      </html>
    `);

    try {
      if (kind === "letter") {
        const ref = reqRecord?.requestId || reqRecord?.refNo || "";
        const { blob } = await downloadGeneratedLetterPdf(letterId, ref, false);
        const url = URL.createObjectURL(blob);
        newWin.location.href = url;
        return;
      }

      // Template (Uploaded File)
      const response = await API.get(`/letters/${letterId}/file`, {
        responseType: "arraybuffer",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      newWin.location.href = url;
    } catch (error) {
      if (newWin) newWin.close();
      console.error("Error viewing file:", error);
      showErrorMessage("Unable to retrieve the document.");
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this request?")) return;
    try {
      await API.patch(`/letters/requests/${id}/approve`);
      showSuccessMessage("Request Approved");
      getUserRequests(true);
    } catch (error) {
      console.error("Error approving:", error);
      showErrorMessage("Failed to approve request");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      await API.patch(`/letters/requests/${id}/reject`);
      showSuccessMessage("Request Rejected");
      getUserRequests(true);
    } catch (error) {
      console.error("Error rejecting:", error);
      showErrorMessage("Failed to reject request");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-tighter border border-green-100">
            <CheckCircleIcon className="h-3 w-3" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-tighter border border-red-100">
            <XMarkIcon className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-black uppercase tracking-tighter border border-yellow-100">
            <ClockIcon className="h-3 w-3" /> Pending
          </span>
        );
    }
  };

  const counts = {
    all: letterRequests.length,
    pending: letterRequests.filter(r => r.status === "pending").length,
    approved: letterRequests.filter(r => r.status === "approved").length,
    rejected: letterRequests.filter(r => r.status === "rejected").length,
  };

  const filteredRequests = useMemo(() => {
    return letterRequests
      .filter((req) => {
        const matchesStatus = statusFilter === "all" || req.status === statusFilter;
        const searchStr = `${req.name} ${req.email} ${req.requestId} ${req.reason}`.toLowerCase();
        const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
      })
      .reverse();
  }, [letterRequests, statusFilter, searchTerm]);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <div className="w-full space-y-4 p-4">
      {/* Header Section */}
      <div className="mb-5 border-[#525B88]">
        <h2 className="text-xl font-bold text-[#525B88]">Letter Head Tracker</h2>
        <p className="text-gray-600">
          {isAdmin 
            ? "Oversee and manage institutional document authorizations" 
            : "Monitor your official document request statuses"
          }
        </p>
      </div>

      {/* Filtering Section */}
      <div className="bg-white border border-gray-300 shadow-sm p-1.5 rounded-lg flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="w-full md:w-72 relative">
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#525B88] focus:ring-2 focus:ring-[#525B88]/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters right-aligned */}
        <div className="flex-1 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={() => {
              getUserRequests(true);
              showSuccessMessage("Refreshing tracking data...");
            }}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:text-[#525B88] hover:border-[#525B88]/30"
            }`}
            title="Refresh Tracker"
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Status Filter */}
          <CustomSelect
            label="Status"
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            options={[
              { label: `All Requests (${counts.all})`, value: 'all' },
              { label: `Pending only (${counts.pending})`, value: 'pending' },
              { label: `Approved letters (${counts.approved})`, value: 'approved' },
              { label: `Rejected cards (${counts.rejected})`, value: 'rejected' },
            ]}
          />

          {/* View Toggle */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden shrink-0 shadow-sm bg-white">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`px-3 md:px-4 py-2 text-[10px] md:text-xs font-medium transition-colors ${
                viewMode === "grid" ? "bg-[#525B88] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <SquaresIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List View"
              className={`px-3 md:px-4 py-2 text-[10px] md:text-xs font-medium transition-colors ${
                viewMode === "list" ? "bg-[#525B88] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area Rendering */}
      {paginatedRequests.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-20 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <DocumentTextIcon className="h-8 w-8 text-gray-200" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">No requests found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-[200px]">No letters matched your current search criteria.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW - Matching AvailableTemplates */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedRequests.map((req) => (
            <div 
              key={req._id} 
              className="group bg-white rounded-lg border border-gray-200 p-3 flex flex-col transition-all duration-300 hover:shadow-md hover:border-[#525B88]/20 hover:translate-y-[-1px]"
            >
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 line-clamp-1 text-sm group-hover:text-[#525B88] transition-colors">{req.name}</h3>
                  <div className="flex items-center gap-1.5 ">
                    <MailIcon className="h-3 w-3 text-gray-400" />
                    <span className="text-[10px] text-gray-500 font-medium truncate max-w-[100px]">{req.email}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   {getStatusBadge(req.status)}
                </div>
              </div>

              {/* Document Preview Area - Matching AvailableTemplates */}
              <div className="h-24 rounded overflow-hidden mb-2 bg-gray-50 relative">
                 <LazyPreview 
                   letter={{ _id: req?.letterIds?.[0]?._id || req?.letterIds?.[0] }} 
                   BASE_URL={BASE_URL} 
                 />
                 <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[7px] font-mono text-white/90">
                   ID: {req.requestId?.slice(-8)}
                 </div>
              </div>

              <div className="flex flex-col gap-1 mb-2">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                  <BuildingIcon className="h-3 w-3 text-gray-400" />
                  <span className="font-semibold line-clamp-1">{req.department?.title || "Staff"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                  <CalendarIcon className="h-3 w-3 text-gray-400" />
                  <span>{req.date ? new Date(req.date).toLocaleDateString() : "-"}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-auto">
                <span className="text-[9px] font-mono text-gray-400 italic truncate max-w-[100px]" title={req.reason}>
                  {req.reason}
                </span>
                <div className="flex items-center gap-1.5 ml-auto">
                  {isAdmin && req.status === "approved" && (
                    <button 
                      onClick={() => handleViewFile(req)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-all"
                      title="View Letter"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  )}
                  {req.status === "approved" && (
                    <button 
                      onClick={() => handleDownloadApproved(req)}
                      className="p-1.5 text-[#525B88] hover:bg-gray-100 rounded transition-all"
                      title="Download"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  )}
                  {isAdmin && req.status === "pending" && (
                    <>
                      <button 
                        onClick={() => handleApprove(req._id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-all"
                        title="Approve"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleReject(req._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                        title="Reject"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW - Matching AvailableTemplates */
        <div className="bg-white rounded-lg border border-[#525B88]/20 shadow-md overflow-x-auto overflow-y-auto max-h-[400px] no-scrollbar">
          <table className="w-full text-left min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525b88] sticky top-0 z-40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Applicant
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    <IdentificationIcon className="w-4 h-4 mr-2" />
                    Faculty ID
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    <BuildingIcon className="w-4 h-4 mr-2" />
                    Department
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Request Date
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    <ComputerDesktopIcon className="w-4 h-4 mr-2" />
                    System IP
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider text-center whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Status
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRequests.map((req, index) => (
                <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900 tracking-tight leading-tight">{req.name}</span>
                      <div className="flex flex-col mt-0.5">
                        <span className="text-[10px] text-gray-400 uppercase tracking-tight italic opacity-70">Ref: {req.refNo?.slice(-8) || req.requestId?.slice(-8)}</span>
                      
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                    <span className="tracking-widest">{req.facultyId || "EXTERNAL"}</span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                    {req.department?.title || "Staff"}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span className="text-gray-700">{req.date ? new Date(req.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}</span>
                      <span className="text-[10px] text-gray-400 uppercase">{req.time || ""}</span>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                    <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded tracking-tighter">{req.systemIp || "N/A"}</span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-center">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex justify-center items-center gap-2">
                       {isAdmin && req.status === "approved" && (
                        <button onClick={() => handleViewFile(req)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Letter"><EyeIcon className="w-4 h-4" /></button>
                       )}
                       {req.status === "approved" && (
                        <button onClick={() => handleDownloadApproved(req)} className="p-1.5 text-[#525B88] hover:bg-gray-100 rounded transition-colors" title="Download"><ArrowDownTrayIcon className="w-4 h-4" /></button>
                       )}
                       {isAdmin && req.status === "pending" && (
                        <>
                          <button onClick={() => handleApprove(req._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Approve"><CheckCircleIcon className="w-5 h-5" /></button>
                          <button onClick={() => handleReject(req._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Reject"><XMarkIcon className="w-5 h-5" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls - Matching AvailableTemplates */}
      <div className="flex items-center justify-between border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Showing <span className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, filteredRequests.length)}</span> of <span className="text-gray-900">{filteredRequests.length}</span> results
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all font-sans"
            title="Previous"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <div className="flex gap-1">
            {[...Array(totalPages || 1)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === i + 1 ? "bg-[#525B88] text-white shadow-md shadow-[#525B88]/20" : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
            disabled={currentPage === (totalPages || 1)}
            className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all font-sans"
            title="Next"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default LetterRequestsTable;
