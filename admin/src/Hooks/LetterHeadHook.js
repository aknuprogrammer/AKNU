import { useEffect, useState, useCallback } from "react";
import { API } from "../config/urls";
import {
  showAxiosError,
  showErrorMessage,
  showSuccessMessage,
} from "../config/Toast";
import { useNavigate } from "react-router-dom";
import { addTextToPDF } from "./PdfDisplay";
import axios from "axios";

import { useLetterHead } from "../Context/LetterHeadContext";

let systemIpCache = null;

/**
 * @returns {{ letterId: string|null, kind: "letter"|"template" }}
 */
export const resolveLetterRequestKind = (req, lettersList, createdLettersList) => {
  const raw = req?.letterIds?.[0];
  const letterId = raw?._id || raw;
  if (!letterId) return { letterId: null, kind: "template" };
  
  const isCreatedLetter = createdLettersList?.some((l) => String(l._id) === String(letterId));
  if (isCreatedLetter) return { letterId, kind: "letter" };
  
  if (req?.requestKind === "letter" || req?.requestKind === "template") {
    return { letterId, kind: req.requestKind };
  }
  
  const populated = typeof raw === "object" && raw != null ? raw : null;
  const meta =
    populated && populated.type
      ? populated
      : lettersList?.find((l) => String(l._id) === String(letterId)) || null;
  const kind = meta?.type === "created" ? "letter" : "template";
  return { letterId, kind, isTemplate: (meta?.type !== undefined || !isCreatedLetter) };
};

/** Uses silent /generate-letter iframe + postMessage (same as GeneratedLetters). */
const downloadGeneratedLetterPdf = (id, overrideRef, isTemplate = false) => {
  return new Promise((resolve, reject) => {
    let iframe = null;
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("PDF generation timed out"));
    }, 120000);

    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      if (iframe?.parentNode) iframe.parentNode.removeChild(iframe);
    };

    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "LETTER_PDF_GENERATED") return;
      const { blob, filename } = event.data;
      if (!(blob instanceof Blob)) {
        cleanup();
        reject(new Error("Invalid PDF payload"));
        return;
      }
      cleanup();
      resolve({ blob, filename });
    };

    window.addEventListener("message", onMessage);
    iframe = document.createElement("iframe");
    iframe.setAttribute("title", "Letter PDF generation");
    iframe.style.cssText =
      "position:fixed;left:-9999px;width:1200px;height:1600px;opacity:0;pointer-events:none;border:0;";
    const refQ = encodeURIComponent(String(overrideRef ?? ""));
    const param = isTemplate ? "templateId" : "letterId";
    iframe.src = `/generate-letter?${param}=${id}&view=pdf&silent=true&overrideRef=${refQ}&showRef=true`;
    document.body.appendChild(iframe);
  });
};

export const useLetterHeadHook = () => {
  const navigate = useNavigate();
  const { 
    letters, 
    createdLetters, 
    userRequests, 
    departments, 
    isLoading,
    refreshLetters,
    refreshCreatedLetters,
    refreshRequests,
    refreshDepartments,
    setLetters,
    setCreatedLetters,
    setUserRequests
  } = useLetterHead();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [processingId, setProcessingId] = useState(null);


  const getLetterHeads = useCallback((force = false) => refreshLetters(force), [refreshLetters]);
  const getUserRequests = useCallback((force = false) => refreshRequests(force), [refreshRequests]);
  const getDepartments = useCallback((force = false) => refreshDepartments(force), [refreshDepartments]);


  const getLetterDetails = useCallback(async (id) => {
    try {
      const resp = await API.get(`/letters/created-letters/${id}`); // Fetches personal history item
      return resp.data?.letter || resp.data;
    } catch (error) {
      console.error("Error fetching history details:", error);
      return null;
    }
  }, []);

  const getTemplateDetails = useCallback(async (id) => {
    try {
      const resp = await API.get(`/letters/${id}`); // Fetches institutional template metadata
      return resp.data;
    } catch (error) {
      console.error("Error fetching template details:", error);
      return null;
    }
  }, []);


  const depts = departments;
  const isInitialLoading = isLoading.letters || isLoading.requests || isLoading.departments;

  const uploadLetterHead = async (data, reset) => {
    const rawName = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    const uploaderName = (rawName && rawName !== "undefined" && rawName !== "null") 
      ? rawName 
      : (role || "Admin");

    if (!token) {
      return navigate("/login-lage");
    }

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("file", data.file?.[0]);
      formData.append("uploadedBy", uploaderName);
      formData.append("letterCode", data.letterCode);
      formData.append("department", data.department || "");
      formData.append("type", "uploaded");

      const resp = await API.post("/letters", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      reset();
      showSuccessMessage("Uploaded Successfully");
      getLetterHeads();
    } catch (error) {
      showAxiosError(error);
    }
  };

  const deleteLetterhead = async (id) => {
    try {
      console.log(`[HOOK] Requesting Toggle Status for ID: ${id}`);
      setProcessingId(id);
      const resp = await API.delete(`/letters/${id}`);
      console.log(`[HOOK] Success Response:`, resp.data);

      
      const newStatus = resp.data.status;
      
      // OPTIMIZATION: Manually update letters state instead of refetching the whole list
      setLetters(prev => prev.map(letter => {
        if (String(letter._id) === String(id)) {
          return { ...letter, status: newStatus || (letter.status === "disabled" ? "active" : "disabled") };
        }
        return letter;
      }));
      
      showSuccessMessage(resp.data?.message || "Template status updated");
    } catch (err) {
      console.error("[HOOK ERROR] Status Toggle Failed:", err);
      showAxiosError(err);
      throw err; // Re-throw to allow component-level handling
    } finally {
      setProcessingId(null);
    }
  };

  const downloadFile = (data, filename, contentType) => {
    const blob = new Blob([data], { type: contentType || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "Institutional_Letterhead";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const requestPdfApiHit = async (data) => {
    let ip = systemIpCache;

    if (!ip) {
      try {
        const response = await axios.get("https://api.ipify.org?format=json", { timeout: 2000 });
        ip = response.data?.ip;
        systemIpCache = ip;
      } catch (error) {
        console.warn("Could not fetch IP, proceeding without it.");
      }
    }

    try {
      const selectedIds = selectedLetter
        ? letters.filter((e) => e._id === selectedLetter).map((e) => e._id)
        : [];
      const letterIdsFromForm = Array.isArray(data?.letterIds)
        ? data.letterIds
        : [];

      const dataToSend = {
        ...data,
        letterIds: letterIdsFromForm.length ? letterIdsFromForm : selectedIds,
        systemIp: ip,
      };
      const resp = await API.post("/letters/requests", dataToSend);
      return resp.data.requestId;
    } catch (error) {
      showAxiosError(error);
      return null;
    }
  };

  // Fetch the file for selected letter - FIXED VERSION
  const getLetterFile = async (id) => {
    try {
      const resp = await API.get(`/letters/${id}/file`, {
        responseType: "arraybuffer", // Important for binary data
      });
      return {
        data: new Uint8Array(resp.data),
        contentType: resp.headers["content-type"] || "application/pdf"
      };
    } catch (error) {
      console.error("Error fetching letter file:", error);
      return null;
    }
  };

  const handleRequestPdf = async (formData, reset) => {
    setProcessingId(selectedLetter || "__letter_request__");
    const campusCode = formData?.campus;
    const letterId = selectedLetter; // Capture before reset

    const id = await requestPdfApiHit(formData);

    if (id) {
      try {
        // --- 📥 IMMEDIATE DOWNLOAD ---
        const fileData = await getLetterFile(letterId);
        if (fileData) {
          const letterObj = letters.find(l => String(l._id) === String(letterId));
          let finalFile = fileData.data;
          let finalContentType = fileData.contentType;
          let ext = "pdf";
          if (finalContentType.includes("png")) ext = "png";
          else if (finalContentType.includes("jpeg") || finalContentType.includes("jpg")) ext = "jpg";

          if (letterObj?.type === "created") {
            const now = new Date();
            const dateLine = `${now.toLocaleDateString("en-GB", {
              timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })} | ${now.toLocaleTimeString("en-GB", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}`;
            finalFile = await addTextToPDF(
              fileData.data,
              id,
              campusCode,
              dateLine,
            );
            finalContentType = "application/pdf";
            ext = "pdf";
          }
          downloadFile(finalFile, `LetterHead_${id}.${ext}`, finalContentType);
          showSuccessMessage("Letterhead generated and download started!");
        } else {
          showSuccessMessage("Request recorded, but template file missing.");
        }
      } catch (err) {
        console.error("Download error:", err);
        showErrorMessage("Request recorded, but failed to generate download.");
      }
      
      getUserRequests(); 
      reset();
      setFormOpen(false);
      setSelectedLetter(null);
    } else {
      showErrorMessage("Error Requesting Pdf");
    }
    setProcessingId(null);
  };


  const formatRequestDateForPdf = (req) => {
    const raw = new Date(); // Use actual current time for issuing PDF
    const d = raw.toLocaleDateString("en-GB", {

      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const t = raw.toLocaleTimeString("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${d} | ${t}`;
  };

  const handleDownloadApproved = async (req) => {
    try {
      const { letterId, kind, isTemplate } = resolveLetterRequestKind(
        req,
        letters,
        createdLetters,
      );
      if (!letterId) throw new Error("Document reference is missing");

      setProcessingId(letterId);

      // Letter request: only the generated document (live PDF), never the blank template file.
      if (kind === "letter") {
        const refText = req.requestId || req.refNo || "N/A";
        const { blob, filename } = await downloadGeneratedLetterPdf(
          letterId,
          refText,
          isTemplate
        );
        const buf = await blob.arrayBuffer();
        downloadFile(
          new Uint8Array(buf),
          filename || `Letter_${refText}.pdf`,
          "application/pdf",
        );
        await API.patch(`/letters/requests/${req._id}/mark-used`);
        setUserRequests((prev) =>
          prev.map((r) =>
            r._id === req._id ? { ...r, isUsed: true } : r,
          ),
        );
        showSuccessMessage("Official letter downloaded successfully.");
        return;
      }

      // Template request: only the approved template file from storage.
      const fileData = await getLetterFile(letterId);
      if (!fileData) throw new Error("Template file not found");

      let finalFile = fileData.data;
      let finalContentType = fileData.contentType;

      let ext = "pdf";
      if (finalContentType.includes("png")) ext = "png";
      else if (finalContentType.includes("jpeg") || finalContentType.includes("jpg"))
        ext = "jpg";

      const letterObj = req?.letterIds?.[0];
      const meta =
        letters.find((l) => String(l._id) === String(letterId)) || letterObj;
      const isPdf =
        finalContentType.includes("pdf") ||
        meta?.file?.contentType?.includes?.("pdf");
      if (isPdf) {
        const refText = req.requestId || req.refNo || "N/A";
        const dateLine = formatRequestDateForPdf(req);
        finalFile = await addTextToPDF(
          fileData.data,
          refText,
          req.campus,
          dateLine,
        );
        finalContentType = "application/pdf";
        ext = "pdf";
      }

      const filename = `AKNU_Template_${req.requestId || "Official"}.${ext}`;
      downloadFile(finalFile, filename, finalContentType);

      await API.patch(`/letters/requests/${req._id}/mark-used`);

      setUserRequests((prev) =>
        prev.map((r) => (r._id === req._id ? { ...r, isUsed: true } : r)),
      );

      showSuccessMessage("Template downloaded successfully.");
    } catch (e) {
      console.error(e);
      showErrorMessage(e?.message || "Download failed.");
    } finally {
      setProcessingId(null);
    }
  };


  const deleteGeneratedLetter = async (id) => {
    try {
      setProcessingId(id);
      const resp = await API.delete(`/letters/created-letters/${id}`);

      // Manually update letter status for immediate feel
      setLetters(prev => prev.map(letter => {
        if (String(letter._id) === String(id)) {
          return { ...letter, status: resp.data.status || (letter.status === "disabled" ? "active" : "disabled") };
        }
        return letter;
      }));
      showSuccessMessage(resp.data?.message || "History status updated");
    } finally {
      setProcessingId(null);
    }
  };


  return {
    letters,
    createdLetters,
    getLetterHeads,
    userRequests,
    getUserRequests,
    getLetterDetails,
    uploadLetterHead,
    deleteLetterhead,
    deleteGeneratedLetter,
    selectedLetter,
    setSelectedLetter,
    formOpen,
    setFormOpen,
    handleRequestPdf,
    handleDownloadApproved,
    getTemplateDetails, // Added this
    isProcessing: processingId, // Still export as isProcessing for truthy checks

    processingId,
    isInitialLoading,

    depts,
    refreshCreatedLetters,
    downloadGeneratedLetterPdf,
    // campuses,
  };
};
