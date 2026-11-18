import React, { useState, useEffect, useRef } from "react";
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  Squares2X2Icon as SquaresIcon,
  ListBulletIcon as ListIcon,
  ChevronDownIcon,
  CheckIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  NoSymbolIcon,
  ArrowPathIcon as RestoreIcon,
} from "@heroicons/react/24/outline";
import { useLetterHeadHook } from "../../Hooks/LetterHeadHook";
import RequestLetterForm from "./components/RequestLetterForm";
import { useNavigate } from "react-router-dom";
import { API } from "../../config/urls";
import { showErrorMessage, showSuccessMessage } from "../../config/Toast";

const CustomSelect = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative w-full sm:w-auto" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full sm:w-auto flex items-center justify-between gap-2 pl-3 pr-2.5 py-2 bg-white border rounded-lg text-sm font-medium text-gray-700 transition-all sm:min-w-[150px] ${
          open
            ? "border-[#525B88] ring-2 ring-[#525B88]/10"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <span className="truncate">{selected?.label || "Select"}</span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full mt-1.5 left-0 z-50 bg-white border border-gray-100 rounded-xl shadow-xl"
          style={{ minWidth: "190px" }}
        >
          <div className="py-1 max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm transition-all duration-150 text-left ${
                  opt.value === value
                    ? "bg-[#525B88] text-white font-semibold"
                    : "text-gray-700 hover:bg-[#525B88]/10 hover:text-[#525B88]"
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && (
                  <CheckIcon className="h-3.5 w-3.5 text-white shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const GeneratedLetters = ({ onLoadLetter, hideActions = false, showDownload = false, hideDeptFilter = false, showAll = false, hideRequest = false }) => {

  const navigate = useNavigate();
  const { 
    depts, 
    userRequests, 
    getUserRequests, 
    handleDownloadApproved,
    deleteGeneratedLetter,
    createdLetters,
    isInitialLoading,
    refreshCreatedLetters
  } = useLetterHeadHook();
  
  const letters = createdLetters;
  const loading = isInitialLoading;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const [roleFilter, setRoleFilter] = useState("all");

  const itemsPerPage = 8;
  
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null); // ID of letter currently downloading
  const [pendingDownloadReqId, setPendingDownloadReqId] = useState(null);

  const [actionLoading, setActionLoading] = useState({ id: null, type: null }); // { id, type: 'view' | 'status' }
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);

  const pendingDownloadReqIdRef = useRef(null);
  useEffect(() => {
    pendingDownloadReqIdRef.current = pendingDownloadReqId;
  }, [pendingDownloadReqId]);

  // --- AUTOMATIC REFRESHES REMOVED BY USER REQUEST ---

  // Periodic refresh for browser visibility or time - use a ref for the function 
  // to avoid starting/stopping interval when functions change.
  const refreshRef = useRef(getUserRequests);
  useEffect(() => {
    refreshRef.current = getUserRequests;
  }, [getUserRequests]);

  // --- AUTOMATIC REFRESHES REMOVED BY USER REQUEST ---

  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "LETTER_PDF_GENERATED") {
        const { blob, filename } = event.data;
        setDownloadingId(null);

        if (!(blob instanceof Blob)) {
          console.error("Invalid blob received for download");
          return;
        }

        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename || "Institutional_Letter.pdf";

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          setDownloadUrl(null);
        }, 5000);

        showSuccessMessage("Official Document Downloaded");

        const reqId = pendingDownloadReqIdRef.current;
        if (reqId) {
          try {
            await API.patch(`/letters/requests/${reqId}/mark-used`);
            getUserRequests(true);
          } catch (err) {
            console.error("Failed to mark request as used:", err);
          } finally {
            setPendingDownloadReqId(null);
          }
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [getUserRequests]);

  const isRequestApproved = (r) =>
    String(r?.status ?? "").toLowerCase() === "approved";
  const isRequestConsumed = (r) => r?.isUsed === true;

  const getRecipientLabel = (code) => {
    const roles = {
      "1": "Admin", "2": "Vice Chancellor", "3": "Registrar", "4": "Principal", 
      "5": "CDC", "6": "Controller of Examinations", "7": "Finance Officer", "8": "Director", 
      "9": "Dean", "10": "Others",
    };
    
    // Try numeric code first
    const codeStr = String(code);
    if (roles[codeStr]) return roles[codeStr];
    
    // Fallback for legacy text values
    const val = codeStr.toLowerCase();
    if (val.includes("vc") || val.includes("chancellor")) return "Vice Chancellor";
    if (val.includes("registrar") || val.includes("register")) return "Registrar";
    if (val.includes("admin")) return "Admin";
    if (val.includes("others")) return "Others";

    return "Staff";
  };

  const filteredLetters = letters.filter((letter) => {
    const searchStr = `${letter.title} ${letter.refNo} ${letter.email} ${letter.subject}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all" ? true : String(letter.letterCode || "") === String(roleFilter);
    return matchesSearch && matchesRole;
  });

  const paginatedLetters = filteredLetters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredLetters.length / itemsPerPage);

  const roleOptions = [
    { label: "All Recipients", value: "all" },
    ...Object.entries({
      "1": "Admin", "2": "Vice Chancellor", "3": "Registrar", "4": "Principal",
      "5": "CDC", "6": "Controller of Examinations", "7": "Finance Officer", "8": "Director",
      "9": "Dean", "10": "Others"
    }).map(([code, label]) => ({ label, value: code }))
  ];

  const getDeptLabel = (id) => {
    if (!id || id === "N/A" || id === "undefined") return "Unspecified";
    if (!depts?.length) return "Loading...";
    const dept = depts.find(d => d.value === id || d.code === id);
    if (!dept) return id;
    return dept.label.split(' - ')[0];
  };

  const getRequestForLetter = (letter) => {
    if (!letter || !userRequests?.length) return null;
    
    // Normalize IDs to strings for robust comparison
    const selfId = String(letter._id || letter);
    const templateId = letter.templateId ? String(letter.templateId._id || letter.templateId) : null;

    const matching = userRequests.filter((r) => {
      const ids = r?.letterIds || [];
      return ids.some((x) => {
        if (!x) return false;
        // x can be a populated object {_id: ...} or a raw string ID
        const idVal = String(typeof x === 'object' ? (x._id || x.id || x) : x);
        
        // STRICT MATCH: Only match against the letter's own absolute ID
        return idVal === selfId;
      });
    });
    
    if (!matching.length) return null;

    // Always sort by date first to ensure we always work with the latest relevant request
    const sorted = [...matching].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Prioritize approved + not yet downloaded; tolerate API status casing
    const bestRequest =
      sorted.find((r) => isRequestApproved(r) && !isRequestConsumed(r)) ||
      sorted.find((r) => isRequestApproved(r)) ||
      sorted[0];

    return bestRequest;
  };



  const getDisplayDate = (letter) => {
    const req = getRequestForLetter(letter);
    return req ? new Date(req.createdAt) : new Date(letter.createdAt);
  };

  const handleDownload = async (letter) => {
    const request = getRequestForLetter(letter);
    const isAdminOverride = showDownload && !!onLoadLetter;

    if (!isAdminOverride && (!request || !isRequestApproved(request))) {
       showErrorMessage("Download requires administrative approval.");
       return;
    }
    
    if (!isAdminOverride && isRequestConsumed(request)) {
       showErrorMessage("This document has already been downloaded. Please send a new request.");
       return;
    }

    const approvedRef = (!isAdminOverride && request && isRequestApproved(request)) ? (request.requestId || request.refNo || "") : "";
    const url = `/generate-letter?letterId=${letter._id}&view=pdf&silent=true&overrideRef=${encodeURIComponent(approvedRef)}&showRef=${!isAdminOverride}`;
    
    setDownloadingId(letter._id); // Local Item Loader
    if (request) setPendingDownloadReqId(request._id);
    setDownloadUrl(url);
    showSuccessMessage("Preparing your official document...");
    
    // Safety cleanup in case generation fails
    setTimeout(() => {
        setDownloadUrl(null);
        setPendingDownloadReqId(null);
        setDownloadingId(null);
    }, 45000); // 45s for safety


  };

  const handleRequest = (letter) => {
    setSelectedCards([letter]);
    setShowRequestModal(true);
  };

  const handleView = (letter) => {
    try {
      setActionLoading({ id: letter._id, type: 'view' });
      // For Generated Letters, we view them in the dynamic renderer (not a static direct file)
      const request = getRequestForLetter(letter);

      const approvedRef = isRequestApproved(request)
        ? (request.requestId || request.refNo || "")
        : "";
      
      const previewUrl = `/generate-letter?letterId=${letter._id}&view=preview&overrideRef=${encodeURIComponent(approvedRef)}`;
      navigate(previewUrl);
      
      showSuccessMessage("Opening document preview...");
    } catch (error) {
      console.error("View error:", error);
      showErrorMessage("Failed to view document");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const handleAction = (letter) => {
    const request = getRequestForLetter(letter);
    const approvedRef = isRequestApproved(request)
      ? (request.requestId || request.refNo || "")
      : "";
    // Rely exclusively on URL updating so the parent controller fetches the fully detailed database object
    navigate(`/generate-letter?letterId=${letter._id}&mode=edit&overrideRef=${encodeURIComponent(approvedRef)}`);
  };

  const handleToggleStatus = async (letterId) => {
    try {
      setActionLoading({ id: letterId, type: 'status' });
      await deleteGeneratedLetter(letterId);
      // Re-fetch to ensure local state matches backend status
      await fetchLetters();
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  // Reusable action buttons
    const ActionButtons = ({ letter, size = "md" }) => {
    const isThisDownloading = downloadingId === letter._id;
    const req = getRequestForLetter(letter);
    const canDownload =
      (isRequestApproved(req) && !isRequestConsumed(req)) || (showDownload && !!onLoadLetter) || !showDownload;
    const p = size === "sm" ? "p-1.5" : "p-2";
    const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    return (
      <div className="flex items-center gap-1">
        {showDownload && (
          <>
            <button
              onClick={() => handleDownload(letter)}
              disabled={!canDownload || downloadingId}
              className={`${p} rounded-lg transition-all ${canDownload ? "text-[#525B88] hover:bg-[#525B88]/10" : "text-gray-300 cursor-not-allowed"}`}
              title={isRequestConsumed(req) ? "Already Downloaded" : (canDownload ? "Download PDF" : "Requires Approval")}
            >
              {isThisDownloading
                ? <div className={`${icon} border-2 border-[#525B88]/20 border-t-[#525B88] rounded-full animate-spin`} />
                : <ArrowDownTrayIcon className={icon} />}
            </button>

            {!hideRequest && (
              <button
                onClick={() => handleRequest(letter)}
                className={`${p} rounded-lg transition-all text-[#525B88] hover:bg-[#525B88]/10`}
                title="Request Approval"
              >
                <ClockIcon className={icon} />
              </button>
            )}
          </>
        )}
        {!hideActions && (
          <>
            <button
              onClick={() => handleView(letter)}
              disabled={actionLoading.id === letter._id && actionLoading.type === 'view'}
              className={`${p} text-blue-600 hover:bg-blue-50 rounded-lg transition-all ${(actionLoading.id === letter._id && actionLoading.type === 'view') ? "opacity-30" : ""}`}
              title="Quick Preview"
            >
              {actionLoading.id === letter._id && actionLoading.type === 'view'
                ? <div className={`${icon} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
                : <EyeIcon className={icon} />}
            </button>
           
            <button
              onClick={() => handleAction(letter)}
              className={`${p} rounded-lg transition-all text-[#525B88] hover:bg-[#525B88]/10`}
              title="Edit"
            >
              <PencilSquareIcon className={icon} />
            </button>
             <button
              onClick={() => handleToggleStatus(letter._id)}
              disabled={actionLoading.id === letter._id && actionLoading.type === 'status'}
              className={`${p} transition-all rounded-lg ${letter.status === 'disabled' ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
              title={letter.status === 'disabled' ? 'Enable Item' : 'Disable Item'}
            >
              {actionLoading.id === letter._id && actionLoading.type === 'status'
                ? <div className={`${icon} border-2 border-t-transparent border-current rounded-full animate-spin`} />
                : (letter.status === 'disabled' ? <ArrowPathIcon className={icon} /> : <NoSymbolIcon className={icon} />)}
            </button>
          </>
        )}
      </div>
    );
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <DocumentTextIcon className="h-12 w-12 text-gray-200" />
      <h3 className="text-sm font-bold text-gray-900 uppercase">No documents found</h3>
      <p className="text-xs text-gray-400 text-center">Your generated letter history will appear here.</p>
    </div>
  );

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-[#525B88]/20 border-t-[#525B88] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full space-y-3">

      {/* ── Toolbar ── */}
      <div className="bg-white border border-gray-200 shadow-sm p-1.5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search letters..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#525B88] focus:ring-2 focus:ring-[#525B88]/10 transition-all font-sans"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              getUserRequests(true);
              refreshCreatedLetters();
              showSuccessMessage("Refreshing letter history...");
            }}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all ${loading ? "opacity-50 cursor-not-allowed" : "hover:text-[#525B88] hover:border-[#525B88]/30"}`}
            title="Refresh History"
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {!hideDeptFilter && (
            <CustomSelect
              value={roleFilter}
              onChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}
              options={roleOptions}
            />
          )}

          {/* View toggle */}
         <div className="flex border border-slate-200 rounded-lg overflow-hidden shrink-0 shadow-sm bg-white">
                     <button
                       onClick={() => setViewMode("grid")}
                       title="Grid View"
                       className={`px-3 md:px-4 py-2 text-[10px] md:text-xs font-medium transition-colors border-r border-[#525B88]/20 ${
                         viewMode === "grid" ? "bg-[#525B88] text-white" : "text-slate-500 hover:bg-slate-50"
                       }`}
                     >
                       <SquaresIcon className="h-4 w-4" />
                     </button>
                     <button
                       onClick={() => setViewMode("list")}
                       title="List View"
                       className={`px-3 md:px-4 py-2 text-[10px] md:text-xs font-medium transition-colors border-l border-[#525B88]/20 ${
                         viewMode === "list" ? "bg-[#525B88] text-white" : "text-slate-500 hover:bg-slate-50"
                       }`}
                     >
                       <ListIcon className="h-4 w-4" />
                     </button>
                   </div>
        </div>
      </div>

      {/* ── Grid View ── */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginatedLetters.length === 0 ? (
            <div className="col-span-full"><EmptyState /></div>
          ) : paginatedLetters.map((letter) => {
            const d = getDisplayDate(letter);
            return (
              <div
                key={letter._id}
                className="group bg-white rounded-xl border border-gray-200 p-3 flex flex-col transition-all duration-200 hover:shadow-md hover:border-[#525B88]/30 hover:-translate-y-0.5"
              >
                {/* Card header */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-[#525B88] transition-colors leading-tight mb-1">
                      {letter.title || "Untitled Letter"}
                    </h3>
                    <div className="flex flex-col gap-0.5">
                      {letter.subject && (
                        <p className="text-[11px] italic text-[#525B88] truncate mb-1">
                          Re: {letter.subject}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-0.5">
                        <UserIcon className="h-3 w-3 text-gray-400 shrink-0" />
                        <span className="text-[10px] text-gray-500 truncate font-semibold">{getRecipientLabel(letter.letterCode)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 shrink-0">
                    {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </span>
                </div>

                {/* Preview placeholder */}
                <div className="h-20 rounded-lg bg-gray-50 flex items-center justify-center mb-3 border border-gray-100">
                  <DocumentTextIcon className="h-8 w-8 text-gray-200" />
                </div>

                {/* Actions */}
                <div className="flex justify-end items-center pt-2 border-t border-gray-100 mt-auto">
                  <ActionButtons letter={letter} size="sm" />
                </div>
              </div>
            );
          })}
        </div>

      ) : (
        /* ── List View ── */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Desktop Table — hidden on small screens */}
          <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[600px] no-scrollbar">
            <table className="w-full divide-y divide-gray-100">
              <thead className="bg-[#525b88] sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Document & Subject</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Whom to create</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">Date & Time</th>
                  {(!hideActions || showDownload) && (
                    <th className="px-5 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedLetters.length === 0 ? (
                  <tr>
                    <td colSpan={hideActions && !showDownload ? 3 : 4} className="py-0">
                      <EmptyState />
                    </td>
                  </tr>
                ) : paginatedLetters.map((letter) => {
                  const d = getDisplayDate(letter);
                  return (
                    <tr key={letter._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#525B88]/5 rounded-lg flex items-center justify-center border border-[#525B88]/10 shrink-0 group-hover:bg-[#525B88]/10 transition-colors">
                            <DocumentTextIcon className="h-5 w-5 text-[#525B88]" />
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <p className="text-sm text-gray-900 group-hover:text-[#525B88] transition-colors truncate max-w-[200px] lg:max-w-xs leading-tight">
                              {letter.title || "Untitled Letter"}
                            </p>
                            <div className="flex flex-col gap-0.5 mt-1">
                              {letter.subject && (
                                <p className="text-[10px] italic text-[#525B88] truncate max-w-[150px] lg:max-w-64" title={letter.subject}>
                                  Re: {letter.subject}
                                </p>
                              )}
                             
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 uppercase tracking-tight">
                          {getRecipientLabel(letter.letterCode)}
                        </span>
                      </td>
                      <td className="px-5 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 group-hover:text-[#525B88] transition-colors">
                          <CalendarIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                        <p className="text-[10px] text-gray-400 ml-5 mt-0.5">{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </td>
                      {(!hideActions || showDownload) && (
                        <td className="px-5 py-2 whitespace-nowrap">
                          <div className="flex justify-center">
                            <ActionButtons letter={letter} size="md" />
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List — shown only on small screens */}
          <div className="md:hidden divide-y divide-gray-100">
            {paginatedLetters.length === 0 ? (
              <EmptyState />
            ) : paginatedLetters.map((letter) => {
              const d = getDisplayDate(letter);
              return (
                <div key={letter._id} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
                  {/* Icon */}
                  <div className="w-10 h-10 bg-[#525B88]/5 rounded-lg flex items-center justify-center border border-[#525B88]/10 shrink-0">
                    <DocumentTextIcon className="h-5 w-5 text-[#525B88]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{letter.title || "Untitled Letter"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{getRecipientLabel(letter.letterCode)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CalendarIcon className="h-3 w-3 text-gray-400 shrink-0" />
                      <span className="text-[10px] text-gray-400">
                        {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        {" · "}
                        {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {(!hideActions || showDownload) && (
                    <div className="shrink-0">
                      <ActionButtons letter={letter} size="sm" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <RequestLetterForm
          selectedCards={selectedCards}
          setSelectedCards={setSelectedCards}
          setShowRequestModal={setShowRequestModal}
          onRequestSuccess={() => getUserRequests(true)}
        />
      )}

      {/* Background PDF Generator (Hidden Iframe) */}
      {downloadUrl && (
        <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', opacity: 0, pointerEvents: 'none' }}>
           <iframe 
             src={downloadUrl} 
             title="Background Generator" 
             style={{ width: '1200px', height: '1600px' }}
           />
        </div>
      )}

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Showing <span className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, filteredLetters.length)}</span> of <span className="text-gray-900">{filteredLetters.length}</span> results
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
                  currentPage === i + 1 ? "bg-[#525B88] text-white shadow-sm" : "text-gray-400 hover:bg-gray-100"
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

      {/* ── Hidden Scrollbar Styles ── */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default GeneratedLetters;
