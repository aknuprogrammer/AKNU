import { useEffect, useMemo, useState } from "react";
import AddFormModal from "./AddFormModal";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";
import { timetableEntriesApi, subjectsApi, streamsApi, coursesApi, academicYearsApi } from "../../../services/apiService";

import jsPDF from "jspdf";

// Helper function to load logo as base64
const loadLogoAsBase64 = () => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = reject;
    // Try public path first, then assets path
    img.src = '/aknu-logo_new.png';
  });
};

// Removed STORAGE_KEY - now using API



// Helper function to get day name from date
const getDayName = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

const TimetableTable = ({ tabKey }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");


  // Section filters (visual only; do not alter saved data)
  const [filterExamType, setFilterExamType] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterAcademicYearId, setFilterAcademicYearId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [streams, setStreams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [emptyRowId] = useState(() => `timetable_new_${Date.now()}_${Math.random()}`);
  const [showPreview, setShowPreview] = useState(false);
  const [emptyRowSteps, setEmptyRowSteps] = useState({}); // Track step for each empty row: { rowId: 1 or 2 }

  useEffect(() => {


    fetchData();
  }, []);

  // Create a new empty row inside a specific section/group
  const handleAddRowForGroup = (group) => {
    setEntries((prev) => {
      // Avoid creating multiple empty rows for the same group that are at step 2
      const exists = prev.some(
        (e) =>
          e._id &&
          e._id.includes("new") &&
          (e.examinationType || "") === (group.examinationType || "") &&
          (e.semester || "") === (group.semester || "") &&
          (e.courseId || "") === (group.courseId || "") &&
          (e.academicYearId || "") === (group.academicYearId || "") &&
          emptyRowSteps[e._id] === 2
      );
      if (exists) return prev;

      const newRowId = `timetable_new_${Date.now()}_${Math.random()}`;
      const newRow = {
        _id: newRowId,
        subjectId: "",
        subjectName: "",
        subjectCode: "",
        paperType: "",
        streamId: "",
        streamName: "",
        streamCode: "",
        examDate: "",
        examTime: "",
        duration: "",
        notes: "",
        examinationType: group.examinationType || "",
        semester: group.semester || "",
        courseId: group.courseId || "",
        courseName: group.courseName || "",
        courseCode: group.courseCode || "",
        academicYearId: group.academicYearId || "",
        academicYearName: group.academicYearName || "",
        academicYearCode: group.academicYearCode || "",
      };
      // Start at step 2 since section fields are already filled - show entry fields immediately
      setEmptyRowSteps(prev => ({ ...prev, [newRowId]: 2 }));
      return [...prev, newRow];
    });
  };

  // Ensure empty row always exists in entries state (only run once after initial load)
  useEffect(() => {
    if (!loading) {
      const hasEmptyRow = entries.some(e => e._id && e._id.includes("new"));
      if (!hasEmptyRow) {
        const emptyEntry = {
          _id: emptyRowId,
          subjectId: "",
          subjectName: "",
          subjectCode: "",
          paperType: "",
          streamId: "",
          streamName: "",
          streamCode: "",
          examDate: "",
          examTime: "",
          duration: "",
          notes: "",
          examinationType: "",
          semester: "",
          courseId: "",
          courseName: "",
          courseCode: "",
          academicYearId: "",
          academicYearName: "",
          academicYearCode: "",
        };
        setEntries(prev => {
          const hasEmpty = prev.some(e => e._id && e._id.includes("new"));
          if (!hasEmpty) {
            return [emptyEntry, ...prev.filter(e => !e._id.includes("new"))];
          }
          return prev;
        });
      }
    }
  }, [loading, emptyRowId]); // Only depend on loading, not entries to avoid infinite loop

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch timetable entries from API
      const entriesData = await timetableEntriesApi.getAll().catch(() => []);
      const loadedEntries = Array.isArray(entriesData) ? entriesData : [];
      
      // Fetch subjects, streams, courses, and academic years from APIs for dropdowns
      const [subjectsData, streamsData, coursesData, academicYearsData] = await Promise.all([
        subjectsApi.getAll().catch(() => []),
        streamsApi.getAll().catch(() => []),
        coursesApi.getAll().catch(() => []),
        academicYearsApi.getAll().catch(() => [])
      ]);
      
      // Filter out inactive records for dropdowns
      const filterActive = (data) => {
        if (!Array.isArray(data)) return [];
        return data.filter(item => {
          // If item has status field, only include Active ones
          if (item.status !== undefined) {
            return item.status === 'Active';
          }
          // If no status field, include all (for backward compatibility)
          return true;
        });
      };
      
      setSubjects(filterActive(Array.isArray(subjectsData) ? subjectsData : []));
      setStreams(filterActive(Array.isArray(streamsData) ? streamsData : []));
      setCourses(filterActive(Array.isArray(coursesData) ? coursesData : []));
      setAcademicYears(filterActive(Array.isArray(academicYearsData) ? academicYearsData : []));
      
      // Always ensure there's at least one empty row in entries
      const hasEmptyRow = loadedEntries.some(e => e._id && e._id.includes("new"));
      if (!hasEmptyRow) {
        const emptyEntry = {
          _id: emptyRowId,
          subjectId: "",
          subjectName: "",
          subjectCode: "",
          paperType: "",
          streamId: "",
          streamName: "",
          streamCode: "",
          examDate: "",
          examTime: "",
          duration: "",
          notes: "",
          examinationType: "",
          semester: "",
          courseId: "",
          courseName: "",
          courseCode: "",
          academicYearId: "",
          academicYearName: "",
          academicYearCode: "",
        };
        setEntries([emptyEntry, ...loadedEntries]);
      } else {
        setEntries(loadedEntries);
      }
      
      setError(null);
    } catch (err) {
      setError("Failed to load timetable entries");
      showErrorMessage("Failed to load timetable entries");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this timetable entry?")) {
      // Normalize ID - extract _id if it's a populated object
      const normalizeId = (id) => {
        if (!id) return "";
        return typeof id === 'object' && id?._id ? id._id : id;
      };
      
      const entryId = normalizeId(id);
      
      // Optimistically remove from UI
      const entryToDelete = entries.find(e => {
        const eId = normalizeId(e._id);
        return eId === entryId;
      });
      
      if (!entryToDelete) {
        showErrorMessage("Entry not found");
        return;
      }
      
      // Remove from state immediately
      setEntries(prevEntries => prevEntries.filter(e => {
        const eId = normalizeId(e._id);
        return eId !== entryId;
      }));
      
      try {
        await timetableEntriesApi.delete(entryId);
        showSuccessMessage("Timetable entry deleted successfully");
        // Optionally refresh to ensure sync with backend
        await fetchData();
      } catch (err) {
        // Restore the entry on error
        setEntries(prevEntries => {
          const hasEntry = prevEntries.some(e => {
            const eId = normalizeId(e._id);
            return eId === entryId;
          });
          if (!hasEntry && entryToDelete) {
            return [...prevEntries, entryToDelete];
          }
          return prevEntries;
        });
        
        const errorMessage = err.message || "Failed to delete entry";
        showErrorMessage(errorMessage);
      }
    }
  };

  // Delete entire section (all entries in a group)
  const handleDeleteSection = async (group) => {
    const normalizeId = (id) => {
      if (!id) return "";
      return typeof id === 'object' && id?._id ? id._id : id;
    };

    const entryCount = group.entries.length;
    const sectionInfo = `${group.semester} - ${group.examinationType} (${group.courseName || group.courseCode || 'Course'})`;

    if (entryCount === 0) {
      showErrorMessage("No entries to delete in this section");
      return;
    }

    const confirmMessage = `Are you sure you want to delete the entire timetable section?\n\nSection: ${sectionInfo}\nEntries to delete: ${entryCount}\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        // Build query params for bulk delete
        const params = {
          examinationType: group.examinationType,
          semester: group.semester,
          courseId: normalizeId(group.courseId),
          academicYearId: normalizeId(group.academicYearId)
        };

        // Call bulk delete API
        await timetableEntriesApi.deleteBulk(params);
        
        showSuccessMessage(`${entryCount} timetable entr${entryCount > 1 ? 'ies' : 'y'} deleted successfully from ${sectionInfo}`);
        
        // Refresh data to update UI
        await fetchData();
      } catch (err) {
        const errorMessage = err.message || "Failed to delete timetable section";
        showErrorMessage(errorMessage);
      }
    }
  };



  const checkDuplicate = (entry, excludeId = null) => {
    // Helper to normalize ID (extract _id if populated object)
    const normalizeId = (id) => {
      if (!id) return "";
      return typeof id === 'object' && id?._id ? id._id : id;
    };

    return entries.some((item) => {
      if (excludeId && item._id === excludeId) {
        return false;
      }
      // Normalize paperType for comparison (trim and case-insensitive)
      const itemPaperType = (item.paperType || "").trim().toLowerCase();
      const entryPaperType = (entry.paperType || "").trim().toLowerCase();
      // Scope duplicate check within the SAME section only:
      // Section is identified by Examination Type + Semester + Course + Academic Year
      const sameSection =
        (item.examinationType || "") === (entry.examinationType || "") &&
        (item.semester || "") === (entry.semester || "") &&
        normalizeId(item.courseId) === normalizeId(entry.courseId) &&
        normalizeId(item.academicYearId) === normalizeId(entry.academicYearId);
      if (!sameSection) return false;
      // Timetable is unique within a section by Subject + Stream (Department) + Paper
      return (
        normalizeId(item.subjectId) === normalizeId(entry.subjectId) &&
        normalizeId(item.streamId) === normalizeId(entry.streamId) &&
        itemPaperType === entryPaperType
      );
    });
  };

  const handleInlineEdit = (entryId, field, value) => {
    setEntries(prevEntries => {
      return prevEntries.map((entry) => {
        if (entry._id === entryId) {
          const updated = { ...entry, [field]: value };
          
          // Auto-populate related fields only if the field being updated is subjectId or streamId
          if (field === "subjectId") {
            if (value) {
              // Handle both ObjectId string and populated object
              const subjectId = typeof value === 'object' && value?._id ? value._id : value;
              const subject = typeof value === 'object' && value?.name
                ? value
                : subjects.find(s => (s._id || s.id) === subjectId);
              if (subject) {
                updated.subjectName = subject.name || "";
                updated.subjectCode = subject.code || "";
                updated.subjectId = subject._id || subject.id;
              }
            } else {
              updated.subjectName = "";
              updated.subjectCode = "";
            }
          }
          
          if (field === "streamId") {
            if (value) {
              // Handle both ObjectId string and populated object
              const streamId = typeof value === 'object' && value?._id ? value._id : value;
              const stream = typeof value === 'object' && value?.name
                ? value
                : streams.find(s => (s._id || s.id) === streamId);
              if (stream) {
                updated.streamName = stream.name || "";
                updated.streamCode = stream.code || "";
                updated.streamId = stream._id || stream.id;
              }
            } else {
              updated.streamName = "";
              updated.streamCode = "";
            }
          }
          
          // Handle courseId and academicYearId for denormalized fields
          if (field === "courseId") {
            if (value) {
              const courseId = typeof value === 'object' && value?._id ? value._id : value;
              const course = typeof value === 'object' && value?.name
                ? value
                : courses.find(c => (c._id || c.id) === courseId);
              if (course) {
                updated.courseName = course.name || "";
                updated.courseCode = course.code || "";
                updated.courseId = course._id || course.id;
              }
            } else {
              updated.courseName = "";
              updated.courseCode = "";
            }
          }
          
          if (field === "academicYearId") {
            if (value) {
              const academicYearId = typeof value === 'object' && value?._id ? value._id : value;
              const year = typeof value === 'object' && value?.name
                ? value
                : academicYears.find(y => (y._id || y.id) === academicYearId);
              if (year) {
                updated.academicYearName = year.name || "";
                updated.academicYearCode = year.code || "";
                updated.academicYearId = year._id || year.id;
              }
            } else {
              updated.academicYearName = "";
              updated.academicYearCode = "";
            }
          }
          
          return updated;
        }
        return entry;
      });
    });
  };

  const handleInlineSave = async (entryId) => {
    const entry = entries.find(e => e._id === entryId);
    if (!entry) return;

    // Only validate required fields for NEW entries (entries with "new" in ID)
    // For existing entries being edited, allow partial updates
    const isNewEntry = entryId.includes("new");
    if (isNewEntry) {
      // Validate required fields only for new entries
      if (!entry.examinationType || !entry.semester || !entry.courseId || !entry.academicYearId || !entry.subjectId || !entry.paperType || !entry.streamId || !entry.examDate || !entry.examTime || !entry.duration) {
        showErrorMessage("Please fill all required fields (Examination Type, Semester, Course, Academic Year, Subject, Paper, Department, Date, Time, Duration)");
        return;
      }
    }

    // Check for duplicates - based on Subject + Stream (Department) + Paper only
    // Only check duplicates if Subject, Stream, and Paper are all present
    if (entry.subjectId && entry.streamId && entry.paperType && checkDuplicate(entry, entryId)) {
      showErrorMessage("This timetable entry already exists. A unique combination of Subject, Department (Stream), and Paper is required. Please edit the existing entry or use different values.");
      return;
    }

    try {
      // Normalize IDs - extract _id if they are populated objects
      const normalizeId = (id) => {
        return typeof id === 'object' && id?._id ? id._id : id;
      };

      // Get denormalized data from populated objects or lookups
      const getCourseData = () => {
        if (typeof entry.courseId === 'object' && entry.courseId?.name) {
          return {
            courseId: entry.courseId._id,
            courseName: entry.courseId.name || "",
            courseCode: entry.courseId.code || ""
          };
        }
        const course = courses.find(c => (c._id || c.id) === normalizeId(entry.courseId));
        return {
          courseId: normalizeId(entry.courseId),
          courseName: course?.name || entry.courseName || "",
          courseCode: course?.code || entry.courseCode || ""
        };
      };

      const getAcademicYearData = () => {
        if (typeof entry.academicYearId === 'object' && entry.academicYearId?.name) {
          return {
            academicYearId: entry.academicYearId._id,
            academicYearName: entry.academicYearId.name || "",
            academicYearCode: entry.academicYearId.code || ""
          };
        }
        const year = academicYears.find(y => (y._id || y.id) === normalizeId(entry.academicYearId));
        return {
          academicYearId: normalizeId(entry.academicYearId),
          academicYearName: year?.name || entry.academicYearName || "",
          academicYearCode: year?.code || entry.academicYearCode || ""
        };
      };

      const getSubjectData = () => {
        if (typeof entry.subjectId === 'object' && entry.subjectId?.name) {
          return {
            subjectId: entry.subjectId._id,
            subjectName: entry.subjectId.name || "",
            subjectCode: entry.subjectId.code || ""
          };
        }
        const subject = subjects.find(s => (s._id || s.id) === normalizeId(entry.subjectId));
        return {
          subjectId: normalizeId(entry.subjectId),
          subjectName: subject?.name || entry.subjectName || "",
          subjectCode: subject?.code || entry.subjectCode || ""
        };
      };

      const getStreamData = () => {
        if (typeof entry.streamId === 'object' && entry.streamId?.name) {
          return {
            streamId: entry.streamId._id,
            streamName: entry.streamId.name || "",
            streamCode: entry.streamId.code || ""
          };
        }
        const stream = streams.find(s => (s._id || s.id) === normalizeId(entry.streamId));
        return {
          streamId: normalizeId(entry.streamId),
          streamName: stream?.name || entry.streamName || "",
          streamCode: stream?.code || entry.streamCode || ""
        };
      };

      const courseData = getCourseData();
      const yearData = getAcademicYearData();
      const subjectData = getSubjectData();
      const streamData = getStreamData();

      const payload = {
        examinationType: entry.examinationType || "",
        semester: entry.semester || "",
        ...courseData,
        ...yearData,
        ...subjectData,
        ...streamData,
        paperType: entry.paperType?.trim() || "",
        examDate: entry.examDate || "",
        examTime: entry.examTime?.trim() || "",
        duration: entry.duration?.trim() || "",
        notes: entry.notes?.trim() || "",
      };

      if (isNewEntry) {
        // Create new entry
        await timetableEntriesApi.create(payload);
        showSuccessMessage("Timetable entry created successfully");
    } else {
        // Update existing entry
        await timetableEntriesApi.update(entryId, payload);
        showSuccessMessage("Timetable entry updated successfully");
      }

      // Remove step for the saved entry
      setEmptyRowSteps(prev => {
        const newSteps = { ...prev };
        delete newSteps[entryId];
        return newSteps;
      });

      // Refresh data from API
      await fetchData();
    } catch (err) {
      const errorMessage = err.message || "Failed to save timetable entry";
      showErrorMessage(errorMessage);
    }
  };

  const handleAddNewRow = () => {
    const newEntry = {
      _id: `timetable_${Date.now()}_${Math.random()}`,
      subjectId: "",
      subjectName: "",
      subjectCode: "",
      paperType: "",
      streamId: "",
      streamName: "",
      streamCode: "",
      examDate: "",
      examTime: "",
      duration: "",
      notes: "",
    };
    setEntries([...entries, newEntry]);
  };

  const handleDownloadPDF = async (entriesToDownload) => {
    try {
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      let yPos = 20;

      // Get common metadata from first entry (assuming all entries share same exam type, semester, course, year)
      const firstEntry = entriesToDownload[0] || {};
      const examType = firstEntry.examinationType || 'Regular';
      const semester = firstEntry.semester || '';
      const courseName = firstEntry.courseName || firstEntry.course || '';
      const academicYear = firstEntry.academicYearName || firstEntry.academicYearCode || '';
      const examTime = firstEntry.examTime || firstEntry.startTime || '02:00 PM';
      const endTime = firstEntry.endTime || '05:00 PM';

      // Add Logo at the top
      try {
        const logoBase64 = await loadLogoAsBase64();
        const logoWidth = 20; // mm
        const logoHeight = 20; // mm
        const logoX = (pageWidth - logoWidth) / 2; // Center horizontally
        pdf.addImage(logoBase64, 'PNG', logoX, yPos, logoWidth, logoHeight);
        yPos += logoHeight + 5; // Add space after logo
      } catch (err) {
        console.error("Error adding logo to PDF:", err);
        // Continue without logo if there's an error
      }

      // Header - Match preview format
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('ADIKAVI NANNAYA UNIVERSITY :: RAJAHMUNDRY', pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
      
      if (courseName) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text(courseName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
      }
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      const examTitle = `${semester ? semester + ' ' : ''}End Examinations`;
      pdf.text(examTitle, pageWidth / 2, yPos, { align: 'center' });
      pdf.setFont(undefined, 'bold');
      pdf.text(`(${examType})`, pageWidth / 2, yPos + 4, { align: 'center' });
      yPos += 8;
      
      if (academicYear) {
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        pdf.text(`(${academicYear})`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
      }
      
      // Time table header row
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('TIME TABLE', margin, yPos, { align: 'left' });
      const timeText = `${examTime} – ${endTime}`;
      pdf.text(`Time: ${timeText}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 6;

      // Helper functions for time calculation
      const parseDurationToMinutes = (durStr) => {
        if (!durStr) return 0;
        const s = String(durStr).toLowerCase().trim();
        const hrMatch = s.match(/(\d+(\.\d+)?)/);
        if (!hrMatch) return 0;
        const num = parseFloat(hrMatch[1]);
        if (s.includes("min")) return Math.round(num);
        return Math.round(num * 60);
      };

      const addMinutes = (timeStr, minutes) => {
        if (!timeStr) return "";
        let t = timeStr.trim();
        let is12 = /am|pm/i.test(t);
        let hours = 0, mins = 0;
        if (is12) {
          const m = t.match(/(\d{1,2}):(\d{2})\s*([ap]m)/i);
          if (!m) return timeStr;
          hours = parseInt(m[1], 10) % 12;
          if (m[3].toLowerCase() === "pm") hours += 12;
          mins = parseInt(m[2], 10);
        } else {
          const m = t.match(/(\d{1,2}):(\d{2})/);
          if (!m) return timeStr;
          hours = parseInt(m[1], 10);
          mins = parseInt(m[2], 10);
        }
        const total = hours * 60 + mins + (minutes || 0);
        const newH = Math.floor((total % (24 * 60)) / 60);
        const newM = Math.floor(total % 60);
        const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
        if (is12) {
          const ampm = newH >= 12 ? "PM" : "AM";
          const dispH = newH % 12 === 0 ? 12 : newH % 12;
          return `${dispH}:${pad(newM)} ${ampm}`;
        }
        return `${pad(newH)}:${pad(newM)}`;
      };

      // Transform data: Group by date, then pivot by department
      const dateGroups = {};
      const departments = new Set();
      
      entriesToDownload.forEach(entry => {
        if (!entry.examDate) return;
        const dateKey = entry.examDate;
        const deptKey = entry.streamName || entry.streamCode || 'Unknown';
        departments.add(deptKey);
        
        if (!dateGroups[dateKey]) {
          dateGroups[dateKey] = {
            date: entry.examDate,
            day: getDayName(entry.examDate),
            from: "",
            to: "",
            departments: {}
          };
        }
        
        dateGroups[dateKey].departments[deptKey] = {
          subject: entry.subjectName || entry.subjectCode || '-',
          code: entry.subjectCode || '',
          paper: entry.paperType || ''
        };
      });

      // Calculate from/to times for each date
      Object.keys(dateGroups).forEach((dk) => {
        const sameDate = entriesToDownload.filter((e) => e.examDate === dk);
        const from = sameDate.find((e) => e.examTime || e.startTime)?.examTime || sameDate.find((e) => e.startTime)?.startTime || "";
        let to = sameDate.find((e) => e.endTime)?.endTime || "";
        if (!to && from) {
          const durationStr = sameDate.find((e) => e.duration)?.duration || "";
          const mins = parseDurationToMinutes(durationStr);
          if (mins > 0) {
            to = addMinutes(from, mins);
          }
        }
        dateGroups[dk].from = from;
        dateGroups[dk].to = to;
      });

      // Sort dates
      const sortedDates = Object.keys(dateGroups).sort();
      const sortedDepartments = Array.from(departments).sort();

      // Calculate column widths (S.No, Date, Day, Time, then departments)
      const snoColWidth = 20;
      const dateColWidth = 30;
      const dayColWidth = 25;
      const timeColWidth = 35;
      const deptColWidth = (pageWidth - 2 * margin - snoColWidth - dateColWidth - dayColWidth - timeColWidth) / sortedDepartments.length;
      
      // Table headers - exact match to preview
      const headerStartY = yPos;
      const headerHeight = 10; // Height for two-line header (dept name + "Subject")
      const rowHeight = 12; // Standard row height for data rows
      let xPos = margin;
      
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5); // Thicker borders to match preview

      // S.No header cell
      pdf.setFillColor(240, 240, 240); // bg-gray-100 equivalent
      pdf.rect(xPos, headerStartY, snoColWidth, headerHeight, 'FD');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.text('S.No', xPos + 3, headerStartY + 6, { align: 'left' });
      xPos += snoColWidth;

      // Date header cell
      pdf.setFillColor(240, 240, 240);
      pdf.rect(xPos, headerStartY, dateColWidth, headerHeight, 'FD');
      pdf.text('Date', xPos + 3, headerStartY + 6, { align: 'left' });
      xPos += dateColWidth;

      // Day header cell
      pdf.setFillColor(240, 240, 240);
      pdf.rect(xPos, headerStartY, dayColWidth, headerHeight, 'FD');
      pdf.text('Day', xPos + 3, headerStartY + 6, { align: 'left' });
      xPos += dayColWidth;

      // Time header cell
      pdf.setFillColor(240, 240, 240);
      pdf.rect(xPos, headerStartY, timeColWidth, headerHeight, 'FD');
      pdf.text('Time', xPos + 3, headerStartY + 6, { align: 'left' });
      xPos += timeColWidth;

      // Department headers with red color and "Subject" subhead - exact match
      sortedDepartments.forEach((dept) => {
        // Draw department header cell with border and gray background
        pdf.setFillColor(240, 240, 240);
        pdf.rect(xPos, headerStartY, deptColWidth, headerHeight, 'FD');
        
        // Department name in red, bold, centered
        pdf.setTextColor(220, 0, 0); // Red color (darker red)
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text(dept, xPos + deptColWidth / 2, headerStartY + 4, { align: 'center' });
        
        // "Subject" subhead in black, bold, centered
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'bold');
        pdf.text('Subject', xPos + deptColWidth / 2, headerStartY + 8, { align: 'center' });
        
        xPos += deptColWidth;
      });
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      yPos = headerStartY + headerHeight;

      // Table rows - exact match to preview structure
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(9);
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      
      sortedDates.forEach((dateKey, index) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = 20;
          // Redraw headers on new page
          xPos = margin;
          pdf.setFillColor(240, 240, 240);
          pdf.rect(xPos, yPos, snoColWidth, headerHeight, 'FD');
          pdf.text('S.No', xPos + 3, yPos + 6, { align: 'left' });
          xPos += snoColWidth;
          pdf.rect(xPos, yPos, dateColWidth, headerHeight, 'FD');
          pdf.text('Date', xPos + 3, yPos + 6, { align: 'left' });
          xPos += dateColWidth;
          pdf.rect(xPos, yPos, dayColWidth, headerHeight, 'FD');
          pdf.text('Day', xPos + 3, yPos + 6, { align: 'left' });
          xPos += dayColWidth;
          pdf.rect(xPos, yPos, timeColWidth, headerHeight, 'FD');
          pdf.text('Time', xPos + 3, yPos + 6, { align: 'left' });
          xPos += timeColWidth;
          sortedDepartments.forEach((dept) => {
            pdf.rect(xPos, yPos, deptColWidth, headerHeight, 'FD');
            pdf.setTextColor(220, 0, 0);
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'bold');
            pdf.text(dept, xPos + deptColWidth / 2, yPos + 4, { align: 'center' });
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'bold');
            pdf.text('Subject', xPos + deptColWidth / 2, yPos + 8, { align: 'center' });
            xPos += deptColWidth;
          });
          yPos += headerHeight;
        }

        const dateGroup = dateGroups[dateKey];
        const dateStr = new Date(dateKey).toLocaleDateString('en-GB');
        const dayStr = dateGroup.day;

        // Calculate row height - need space for subject + code/paper (2 lines minimum)
        const currentRowHeight = 12; // Fixed height matching preview

        xPos = margin;
        const rowTopY = yPos;

        // S.No cell with border - white background
        pdf.setFillColor(255, 255, 255);
        pdf.rect(xPos, rowTopY, snoColWidth, currentRowHeight, 'FD');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pdf.text((index + 1).toString(), xPos + 3, rowTopY + 8, { align: 'left' });
        xPos += snoColWidth;

        // Date cell with border
        pdf.setFillColor(255, 255, 255);
        pdf.rect(xPos, rowTopY, dateColWidth, currentRowHeight, 'FD');
        pdf.text(dateStr, xPos + 3, rowTopY + 8, { align: 'left' });
        xPos += dateColWidth;

        // Day cell with border
        pdf.setFillColor(255, 255, 255);
        pdf.rect(xPos, rowTopY, dayColWidth, currentRowHeight, 'FD');
        pdf.text(dayStr, xPos + 3, rowTopY + 8, { align: 'left' });
        xPos += dayColWidth;

        // Time cell with border
        const timeText = (dateGroup.from || "") + (dateGroup.to ? ` – ${dateGroup.to}` : "");
        pdf.setFillColor(255, 255, 255);
        pdf.rect(xPos, rowTopY, timeColWidth, currentRowHeight, 'FD');
        pdf.text(timeText, xPos + 3, rowTopY + 8, { align: 'left' });
        xPos += timeColWidth;

        // Department subjects - exact preview format: Subject name, then (code) - paper
        sortedDepartments.forEach((dept) => {
          const deptData = dateGroup.departments[dept];
          
          // Draw cell border with white background
          pdf.setFillColor(255, 255, 255);
          pdf.rect(xPos, rowTopY, deptColWidth, currentRowHeight, 'FD');
          
          if (deptData) {
            let textY = rowTopY + 4;
            
            // Subject name on first line
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'normal');
            const subjectText = deptData.subject || '-';
            pdf.text(subjectText, xPos + 3, textY, { align: 'left' });
            textY += 5;
            
            // Code and paper on second line: (code) - paper
            if (deptData.code || deptData.paper) {
              pdf.setFontSize(9);
              pdf.setFont(undefined, 'bold'); // font-semibold in preview
              
              let codePaperText = '';
              if (deptData.code) {
                codePaperText = `(${deptData.code})`;
              }
              
              // Extract paper number
              let paperNum = deptData.paper || '';
              if (paperNum) {
                const paperMatch = paperNum.match(/(\d+)/);
                if (paperMatch) {
                  paperNum = paperMatch[1];
                }
              }
              
              if (paperNum) {
                if (codePaperText) {
                  codePaperText += ` - ${paperNum}`;
                } else {
                  codePaperText = paperNum;
                }
              }
              
              if (codePaperText) {
                pdf.text(codePaperText, xPos + 3, textY, { align: 'left' });
              }
              pdf.setFont(undefined, 'normal');
            }
          } else {
            pdf.text('-', xPos + 3, rowTopY + 6, { align: 'left' });
          }
          xPos += deptColWidth;
        });

        yPos = rowTopY + currentRowHeight;
      });

      // Save PDF
      const fileName = `Timetable_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      showSuccessMessage("Timetable PDF downloaded successfully");
    } catch (err) {
      console.error("Error generating PDF:", err);
      showErrorMessage("Failed to generate PDF");
    }
  };

  const sanitizeEntry = (data) => ({
    ...data,


    subjectId: data.subjectId || "",
    subjectName: data.subjectName?.trim() || "",
    subjectCode: data.subjectCode || "",
    paperType: data.paperType || "",
    streamId: data.streamId || "",
    streamName: data.streamName || "",
    streamCode: data.streamCode || "",
    examDate: data.examDate || "",


    examTime: data.examTime || data.startTime || "",
    startTime: data.startTime || data.examTime || "",
    endTime: data.endTime || "",
    duration: data.duration || "",
    notes: data.notes?.trim() || "",
  });

  const handleFormSubmit = async (formData) => {
    try {
      // Normalize IDs helper function
      const normalizeId = (id) => {
        return typeof id === 'object' && id?._id ? id._id : id;
      };

      // Check if formData contains entries array (new format)
      if (formData.entries && Array.isArray(formData.entries)) {
        // Handle multiple entries
        const createdEntries = [];
        const skippedEntries = [];

        for (const entry of formData.entries) {
          const cleanData = sanitizeEntry({
            ...entry,
            startTime: entry.examTime || entry.startTime || "",
            endTime: entry.endTime || "",
          });

          // Normalize IDs and get denormalized data
          const normalizeEntryData = (entry) => {
            const courseId = normalizeId(entry.courseId);
            const academicYearId = normalizeId(entry.academicYearId);
            const subjectId = normalizeId(entry.subjectId);
            const streamId = normalizeId(entry.streamId);

            const course = typeof entry.courseId === 'object' && entry.courseId?.name
              ? entry.courseId
              : courses.find(c => c._id === courseId);
            const year = typeof entry.academicYearId === 'object' && entry.academicYearId?.name
              ? entry.academicYearId
              : academicYears.find(y => y._id === academicYearId);
            const subject = typeof entry.subjectId === 'object' && entry.subjectId?.name
              ? entry.subjectId
              : subjects.find(s => s._id === subjectId);
            const stream = typeof entry.streamId === 'object' && entry.streamId?.name
              ? entry.streamId
              : streams.find(s => s._id === streamId);

            return {
              examinationType: entry.examinationType || "",
              semester: entry.semester || "",
              courseId: courseId,
              courseName: course?.name || entry.courseName || "",
              courseCode: course?.code || entry.courseCode || "",
              academicYearId: academicYearId,
              academicYearName: year?.name || entry.academicYearName || "",
              academicYearCode: year?.code || entry.academicYearCode || "",
              subjectId: subjectId,
              subjectName: subject?.name || entry.subjectName || "",
              subjectCode: subject?.code || entry.subjectCode || "",
              streamId: streamId,
              streamName: stream?.name || entry.streamName || "",
              streamCode: stream?.code || entry.streamCode || "",
              paperType: entry.paperType?.trim() || "",
              examDate: entry.examDate || "",
              examTime: entry.examTime?.trim() || "",
              duration: entry.duration?.trim() || "",
              notes: entry.notes?.trim() || "",
            };
          };

          try {
            const payload = normalizeEntryData(cleanData);
            await timetableEntriesApi.create(payload);
            createdEntries.push(payload);
          } catch (err) {
            // Check if it's a duplicate error
            if (err.message && err.message.includes('duplicate')) {
              skippedEntries.push(cleanData);
          } else {
              throw err; // Re-throw if it's a different error
            }
          }
        }

        if (createdEntries.length === 0 && skippedEntries.length > 0) {
          throw new Error("All entries already exist in the timetable. Duplicate entries are not allowed.");
        }

        const message = `${createdEntries.length} timetable entr${createdEntries.length > 1 ? 'ies' : 'y'} created successfully${skippedEntries.length > 0 ? `. ${skippedEntries.length} duplicate entr${skippedEntries.length > 1 ? 'ies were' : 'y was'} skipped.` : ''}`;
        showSuccessMessage(message);
        await fetchData(); // Refresh the list
      } else {
        // Handle single entry (for editing)
      const cleanData = sanitizeEntry(formData);

        // Normalize IDs and get denormalized data
        const normalizeEntryData = (entry) => {
          const courseId = normalizeId(entry.courseId);
          const academicYearId = normalizeId(entry.academicYearId);
          const subjectId = normalizeId(entry.subjectId);
          const streamId = normalizeId(entry.streamId);

          const course = typeof entry.courseId === 'object' && entry.courseId?.name
            ? entry.courseId
            : courses.find(c => c._id === courseId);
          const year = typeof entry.academicYearId === 'object' && entry.academicYearId?.name
            ? entry.academicYearId
            : academicYears.find(y => y._id === academicYearId);
          const subject = typeof entry.subjectId === 'object' && entry.subjectId?.name
            ? entry.subjectId
            : subjects.find(s => s._id === subjectId);
          const stream = typeof entry.streamId === 'object' && entry.streamId?.name
            ? entry.streamId
            : streams.find(s => s._id === streamId);

          return {
            examinationType: entry.examinationType || "",
            semester: entry.semester || "",
            courseId: courseId,
            courseName: course?.name || entry.courseName || "",
            courseCode: course?.code || entry.courseCode || "",
            academicYearId: academicYearId,
            academicYearName: year?.name || entry.academicYearName || "",
            academicYearCode: year?.code || entry.academicYearCode || "",
            subjectId: subjectId,
            subjectName: subject?.name || entry.subjectName || "",
            subjectCode: subject?.code || entry.subjectCode || "",
            streamId: streamId,
            streamName: stream?.name || entry.streamName || "",
            streamCode: stream?.code || entry.streamCode || "",
            paperType: entry.paperType?.trim() || "",
            examDate: entry.examDate || "",
            examTime: entry.examTime?.trim() || "",
            duration: entry.duration?.trim() || "",
            notes: entry.notes?.trim() || "",
          };
        };

        const payload = normalizeEntryData(cleanData);

      if (editingItem) {
          await timetableEntriesApi.update(editingItem._id, payload);
        showSuccessMessage("Timetable entry updated successfully");
      } else {
          await timetableEntriesApi.create(payload);
        showSuccessMessage("Timetable entry created successfully");
        }
        await fetchData(); // Refresh the list
      }
      setShowAddForm(false);
      setEditingItem(null);
    } catch (err) {
      const errorMessage = err.message || "Failed to save timetable entry";
      showErrorMessage(errorMessage);
    }
  };



  // Group entries by Examination Type, Semester, Course, Academic Year
  const groupedEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();


    let filtered = entries;
    
    if (query) {
      filtered = entries.filter((entry) => {
        const subject = entry.subjectName ? entry.subjectName.toLowerCase() : "";
        const subjectCode = entry.subjectCode ? entry.subjectCode.toLowerCase() : "";
        const paper = entry.paperType ? entry.paperType.toLowerCase() : "";
        const stream = entry.streamName ? entry.streamName.toLowerCase() : "";
        const streamCode = entry.streamCode ? entry.streamCode.toLowerCase() : "";
        const notes = entry.notes ? entry.notes.toLowerCase() : "";
        const examType = entry.examinationType ? entry.examinationType.toLowerCase() : "";
        const semester = entry.semester ? entry.semester.toLowerCase() : "";
        const course = entry.courseName ? entry.courseName.toLowerCase() : "";
        const year = entry.academicYearName ? entry.academicYearName.toLowerCase() : "";
        return (
          subject.includes(query) ||
          subjectCode.includes(query) ||
          paper.includes(query) ||
          stream.includes(query) ||
          streamCode.includes(query) ||
          notes.includes(query) ||
          examType.includes(query) ||
          semester.includes(query) ||
          course.includes(query) ||
          year.includes(query)
        );
    });
    }
    
    // Separate empty rows from saved entries
    const emptyRowsAll = filtered.filter(e => e._id && e._id.includes("new"));
    const savedEntries = filtered.filter(e => !(e._id && e._id.includes("new")));
    
    // Group saved entries by examinationType, semester, courseId, academicYearId
    const groups = {};
    savedEntries.forEach(entry => {
      const groupKey = `${entry.examinationType || 'Unknown'}_${entry.semester || 'Unknown'}_${entry.courseId || 'Unknown'}_${entry.academicYearId || 'Unknown'}`;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          examinationType: entry.examinationType || '',
          semester: entry.semester || '',
          courseId: entry.courseId || '',
          courseName: entry.courseName || entry.course || '',
          courseCode: entry.courseCode || '',
          academicYearId: entry.academicYearId || '',
          academicYearName: entry.academicYearName || '',
          academicYearCode: entry.academicYearCode || '',
          entries: [],
          newRows: []
        };
      }
      groups[groupKey].entries.push(entry);
    });

    // Attach empty rows to their groups if they have full section metadata AND are at step 2
    // Rows at step 1 stay in emptyRows section, rows at step 2 move to groups
    emptyRowsAll.forEach((row) => {
      if (!row || !row._id) return;
      const hasMeta =
        row.examinationType && row.semester && row.courseId && row.academicYearId;
      const isStep2 = emptyRowSteps[row._id] === 2;
      // Only attach to groups if they have metadata AND are at step 2 (user clicked Next)
      if (hasMeta && isStep2) {
        const key = `${row.examinationType}_${row.semester}_${row.courseId}_${row.academicYearId}`;
        if (!groups[key]) {
          groups[key] = {
            key,
            examinationType: row.examinationType || '',
            semester: row.semester || '',
            courseId: row.courseId || '',
            courseName: row.courseName || row.course || '',
            courseCode: row.courseCode || '',
            academicYearId: row.academicYearId || '',
            academicYearName: row.academicYearName || '',
            academicYearCode: row.academicYearCode || '',
            entries: [],
            newRows: []
          };
        }
        groups[key].newRows.push(row);
      }
    });
    
    return {
      // Keep empty rows that DON'T have full section metadata OR are at step 1
      // This ensures rows at step 1 stay in emptyRows section even if they have section data
      emptyRows: emptyRowsAll.filter(
        (r) => {
          const hasMeta = r.examinationType && r.semester && r.courseId && r.academicYearId;
          const isStep2 = emptyRowSteps[r._id] === 2;
          // Show in emptyRows if: no metadata OR (has metadata but step 1)
          return !hasMeta || !isStep2;
        }
      ),
      groups: Object.values(groups)
    };
  }, [entries, searchQuery, emptyRowSteps]);



  // Filter visible groups by selected section filters
  const filteredGroups = useMemo(() => {
    return groupedEntries.groups.filter((group) => {
      if (filterExamType && (group.examinationType || "") !== filterExamType) return false;
      if (filterSemester && (group.semester || "").toLowerCase() !== filterSemester.toLowerCase()) return false;
      if (filterCourseId && (group.courseId || "") !== filterCourseId) return false;
      if (filterAcademicYearId && (group.academicYearId || "") !== filterAcademicYearId) return false;
      return true;
    });
  }, [groupedEntries, filterExamType, filterSemester, filterCourseId, filterAcademicYearId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Examination Timetable</h3>
          <p className="text-sm text-gray-500 mt-1">
            Maintain subject-wise examination schedule with date and time slots
          </p>
        </div>
        {/* <div className="flex gap-2">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all timetable entries? This action cannot be undone.")) {
                localStorage.removeItem(STORAGE_KEY);
                setEntries([]);
                // Create a new empty row
                const emptyEntry = {
                  _id: emptyRowId,
                  subjectId: "",
                  subjectName: "",
                  subjectCode: "",
                  paperType: "",
                  streamId: "",
                  streamName: "",
                  streamCode: "",
                  examDate: "",
                  examTime: "",
                  duration: "",
                  notes: "",
                  examinationType: "",
                  semester: "",
                  courseId: "",
                  courseName: "",
                  courseCode: "",
                  academicYearId: "",
                  academicYearName: "",
                  academicYearCode: "",
                };
                setEntries([emptyEntry]);
                setEmptyRowSteps({});
                showSuccessMessage("All timetable entries cleared successfully");
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            title="Clear All Data"
          >
            Clear All Data
          </button>
        </div> */}
      </div>



      {/* Empty Row for Adding New Entries - Show at top if no search */}
      {groupedEntries.emptyRows.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Add New Timetable Entry</h4>
          <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Examination Type*
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Semester*
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Course*
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Academic Year*
              </th>
                  {/* Step 2 fields - shown conditionally */}
                  {groupedEntries.emptyRows.some(row => emptyRowSteps[row._id] === 2) && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Department (Stream)*
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Subject*
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Paper*
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Start Date*
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Day
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Time*
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Duration*
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Notes
              </th>
                    </>
                  )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
                  </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Add New Entry Row - Always at the top */}
            {groupedEntries.emptyRows.map((emptyRow) => {
                const currentEntry = entries.find(e => e._id === emptyRow._id) || emptyRow;
                  const currentStep = emptyRowSteps[emptyRow._id] || 1;
                  
                return (
                <tr key={emptyRow._id} className="bg-blue-50">
                      {/* Step 1: Section Fields */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[200px]">
                    <select
                      value={currentEntry.examinationType || ""}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setEntries(prevEntries => {
                          return prevEntries.map(entry => {
                            if (entry._id === currentEntry._id) {
                              return { ...entry, examinationType: newValue };
                            }
                            return entry;
                          });
                        });
                      }}
                      className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      required
                          disabled={currentStep === 2}
                    >
                      <option value="">Select Type</option>
                      <option value="Regular">Regular</option>
                      <option value="Supplementary">Supplementary</option>
                      <option value="Revaluation">Revaluation</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <input
                      type="text"
                      value={currentEntry.semester || ""}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setEntries(prevEntries => {
                          return prevEntries.map(entry => {
                            if (entry._id === currentEntry._id) {
                              return { ...entry, semester: newValue };
                            }
                            return entry;
                          });
                        });
                      }}
                      className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      placeholder="e.g., I Semester, II Semester"
                      required
                          disabled={currentStep === 2}
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[200px]">
                    <select
                      value={currentEntry.courseId || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEntries(prevEntries => {
                          return prevEntries.map(entry => {
                            if (entry._id === currentEntry._id) {
                              if (value) {
                                    const course = courses.find(c => (c._id || c.id) === value);
                                if (course) {
                                  return {
                                    ...entry,
                                        courseId: course._id || course.id,
                                    courseName: course.name || "",
                                    courseCode: course.code || ""
                                  };
                                }
                              }
                              return {
                                ...entry,
                                courseId: "",
                                courseName: "",
                                courseCode: ""
                              };
                            }
                            return entry;
                          });
                        });
                      }}
                      className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      required
                          disabled={currentStep === 2}
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course._id || course.id} value={course._id || course.id}>
                          {course.name} {course.code ? `(${course.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[200px]">
                    <select
                      value={currentEntry.academicYearId || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEntries(prevEntries => {
                          return prevEntries.map(entry => {
                            if (entry._id === currentEntry._id) {
                              if (value) {
                                    const year = academicYears.find(y => (y._id || y.id) === value);
                                if (year) {
                                  return {
                                    ...entry,
                                        academicYearId: year._id || year.id,
                                    academicYearName: year.name || "",
                                    academicYearCode: year.code || ""
                                  };
                                }
                              }
                              return {
                                ...entry,
                                academicYearId: "",
                                academicYearName: "",
                                academicYearCode: ""
                              };
                            }
                            return entry;
                          });
                        });
                      }}
                      className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      required
                          disabled={currentStep === 2}
                    >
                      <option value="">Select Academic Year</option>
                      {academicYears.map((year) => (
                        <option key={year._id || year.id} value={year._id || year.id}>
                          {year.code || year.name} {year.name && year.code ? `(${year.name})` : ""}
                        </option>
                      ))}
                    </select>
                  </td>

                      {/* Step 2: Entry Fields - Only show if step 2 */}
                      {currentStep === 2 && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[200px]">
                            <select
                              value={currentEntry.streamId || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setEntries(prevEntries => {
                                  return prevEntries.map(entry => {
                                    if (entry._id === currentEntry._id) {
                                      if (value) {
                                        const stream = streams.find(s => (s._id || s.id) === value);
                                        if (stream) {
                                          return {
                                            ...entry,
                                            streamId: stream._id || stream.id,
                                            streamName: stream.name || "",
                                            streamCode: stream.code || ""
                                          };
                                        }
                                      }
                                      return {
                                        ...entry,
                                        streamId: "",
                                        streamName: "",
                                        streamCode: ""
                                      };
                                    }
                                    return entry;
                                  });
                                });
                              }}
                              className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              required
                            >
                              <option value="">Select Department/Stream</option>
                              {streams.map((stream) => (
                                <option key={stream._id || stream.id} value={stream._id || stream.id}>
                                  {stream.name} {stream.code ? `(${stream.code})` : ""}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[200px]">
                            <select
                              value={currentEntry.subjectId || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setEntries(prevEntries => {
                                  return prevEntries.map(entry => {
                                    if (entry._id === currentEntry._id) {
                                      if (value) {
                                        const subject = subjects.find(s => (s._id || s.id) === value);
                                        if (subject) {
                                          return {
                                            ...entry,
                                            subjectId: subject._id || subject.id,
                                            subjectName: subject.name || "",
                                            subjectCode: subject.code || ""
                                          };
                                        }
                                      }
                                      return {
                                        ...entry,
                                        subjectId: "",
                                        subjectName: "",
                                        subjectCode: ""
                                      };
                                    }
                                    return entry;
                                  });
                                });
                              }}
                              className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              required
                            >
                              <option value="">Select Subject</option>
                              {subjects.map((subject) => (
                                <option key={subject._id || subject.id} value={subject._id || subject.id}>
                                  {subject.name} ({subject.code})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="text"
                              value={currentEntry.paperType || ""}
                              onChange={(e) => {
                                setEntries(prevEntries => prevEntries.map(ent => ent._id === currentEntry._id ? { ...ent, paperType: e.target.value } : ent));
                              }}
                              className="w-full min-w-[160px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              placeholder="e.g., Paper 1"
                              required
                            />
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="date"
                              value={currentEntry.examDate || ""}
                              onChange={(e) => {
                                setEntries(prevEntries => prevEntries.map(ent => ent._id === currentEntry._id ? { ...ent, examDate: e.target.value } : ent));
                              }}
                              className="w-full min-w-[160px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              required
                            />
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="text"
                              value={currentEntry.examDate ? getDayName(currentEntry.examDate) : ""}
                              readOnly
                              className="w-full min-w-[120px] px-4 py-2.5 border border-gray-300 rounded bg-gray-50 text-sm"
                              placeholder="Auto"
                            />
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="time"
                              value={currentEntry.examTime || ""}
                              onChange={(e) => {
                                setEntries(prevEntries => prevEntries.map(ent => ent._id === currentEntry._id ? { ...ent, examTime: e.target.value } : ent));
                              }}
                              className="w-full min-w-[140px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              required
                            />
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="text"
                              value={currentEntry.duration || ""}
                              onChange={(e) => {
                                setEntries(prevEntries => prevEntries.map(ent => ent._id === currentEntry._id ? { ...ent, duration: e.target.value } : ent));
                              }}
                              className="w-full min-w-[140px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              placeholder="e.g., 3 hours"
                              required
                            />
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="text"
                              value={currentEntry.notes || ""}
                              onChange={(e) => {
                                setEntries(prevEntries => prevEntries.map(ent => ent._id === currentEntry._id ? { ...ent, notes: e.target.value } : ent));
                              }}
                              className="w-full min-w-[180px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              placeholder="Notes (optional)"
                            />
                          </td>
                        </>
                      )}

                      {/* Actions Column */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {currentStep === 1 ? (
                          <button
                            onClick={() => {
                              // Validate section fields
                              if (!currentEntry.examinationType || !currentEntry.semester || !currentEntry.courseId || !currentEntry.academicYearId) {
                                showErrorMessage("Please fill all section fields (Examination Type, Semester, Course, Academic Year)");
                                return;
                              }
                              
                              // Create a new empty row at step 1 with the same section fields pre-filled FIRST
                              // so user can add another entry to the same section
                              const newRowId = `timetable_new_${Date.now()}_${Math.random()}`;
                              const newEmptyEntry = {
                                _id: newRowId,
                                subjectId: "",
                                subjectName: "",
                                subjectCode: "",
                                paperType: "",
                                streamId: "",
                                streamName: "",
                                streamCode: "",
                                examDate: "",
                                examTime: "",
                                duration: "",
                                notes: "",
                                examinationType: currentEntry.examinationType || "",
                                semester: currentEntry.semester || "",
                                courseId: currentEntry.courseId || "",
                                courseName: currentEntry.courseName || "",
                                courseCode: currentEntry.courseCode || "",
                                academicYearId: currentEntry.academicYearId || "",
                                academicYearName: currentEntry.academicYearName || "",
                                academicYearCode: currentEntry.academicYearCode || "",
                              };
                              
                              // Update entries first - add new row and keep current row
                              setEntries(prev => {
                                // Add new row at the beginning (top of empty rows section)
                                return [newEmptyEntry, ...prev.filter(e => e._id !== newRowId)];
                              });
                              
                              // Update steps: move current row to step 2, ensure new row is at step 1
                              setEmptyRowSteps(prev => {
                                const newSteps = { ...prev };
                                newSteps[emptyRow._id] = 2; // Move current row to step 2
                                delete newSteps[newRowId]; // Ensure new row is at step 1
                                return newSteps;
                              });
                              
                              // Scroll to the green section after a short delay to allow state update
                              setTimeout(() => {
                                const groupKey = `${currentEntry.examinationType}_${currentEntry.semester}_${currentEntry.courseId}_${currentEntry.academicYearId}`;
                                const groupElement = document.getElementById(`timetable-group-${groupKey}`);
                                if (groupElement) {
                                  groupElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  // Highlight the section briefly
                                  groupElement.style.transition = 'box-shadow 0.3s';
                                  groupElement.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
                                  setTimeout(() => {
                                    groupElement.style.boxShadow = '';
                                  }, 2000);
                                }
                              }, 100);
                            }}
                            className="text-emerald-600 hover:text-emerald-900 px-3 py-2 rounded hover:bg-emerald-50 transition-colors flex items-center gap-2"
                            title="Next"
                          >
                            <span>Next</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                // Validate all required fields
                                if (!currentEntry.subjectId || !currentEntry.paperType || !currentEntry.streamId || !currentEntry.examDate || !currentEntry.examTime || !currentEntry.duration) {
                                  showErrorMessage("Please fill all required entry fields (Department, Subject, Paper, Date, Time, Duration)");
                                  return;
                                }
                                // Check for duplicates
                                if (checkDuplicate(currentEntry, currentEntry._id)) {
                                  showErrorMessage("This timetable entry already exists. A unique combination of Subject, Department (Stream), and Paper is required.");
                                  return;
                                }
                                // Save the entry
                                handleInlineSave(currentEntry._id);
                                // Reset step
                                setEmptyRowSteps(prev => {
                                  const newSteps = { ...prev };
                                  delete newSteps[emptyRow._id];
                                  return newSteps;
                                });
                              }}
                              className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                              title="Create Entry"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                // Go back to step 1
                                setEmptyRowSteps(prev => {
                                  const newSteps = { ...prev };
                                  delete newSteps[emptyRow._id];
                                  return newSteps;
                                });
                              }}
                              className="text-gray-600 hover:text-gray-900 p-1.5 rounded hover:bg-gray-50 transition-colors"
                              title="Back"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Grouped Timetable Sections */}
      {groupedEntries.groups.map((group) => (
        <div key={group.key} id={`timetable-group-${group.key}`} className="mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Group Header with Preview/Download */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-xl font-bold text-white mb-2">
                  {group.semester} - {group.examinationType} Examinations
                </h4>
                <div className="text-emerald-100 text-sm">
                  <span className="font-semibold">Course:</span> {group.courseName} {group.courseCode && `(${group.courseCode})`}
                  {group.academicYearCode && (
                    <> | <span className="font-semibold">Academic Year:</span> {group.academicYearCode} {group.academicYearName && `(${group.academicYearName})`}</>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAddRowForGroup(group)}
                  className="px-4 py-2 bg-white text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2 font-semibold"
                  title="Add a new timetable row in this section"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                  </svg>
                  Add Row
                </button>
                    <button
                      onClick={() => {


                    if (group.entries.length === 0) {
                      showErrorMessage("No entries to preview in this group.");
                      return;
                    }
                    setShowPreview(true);
                    window.currentPreviewGroup = group;
                  }}
                  className="px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                    </button>
                    <button
                  onClick={() => {
                    if (group.entries.length === 0) {
                      showErrorMessage("No entries to download in this group.");
                      return;
                    }
                    handleDownloadPDF(group.entries);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => handleDeleteSection(group)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-semibold"
                  title="Delete entire section"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Section
                </button>
              </div>
            </div>

            {/* Group Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Department (Stream)*</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subject*</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paper*</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Start Date*</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Time*</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Duration*</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Inline new rows for this section */}
                  {group.newRows && group.newRows.map((emptyRow) => {
                    const currentEntry = entries.find(e => e._id === emptyRow._id) || emptyRow;
                    return (
                      <tr key={emptyRow._id} className="bg-blue-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[200px]">
                          <select
                            value={currentEntry.streamId || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEntries(prevEntries => prevEntries.map(ent => {
                                if (ent._id === currentEntry._id) {
                                  if (value) {
                                    const stream = streams.find(s => s._id === value);
                                    if (stream) {
                                      return { ...ent, streamId: stream._id, streamName: stream.name || "", streamCode: stream.code || "" };
                                    }
                                  }
                                  return { ...ent, streamId: "", streamName: "", streamCode: "" };
                                }
                                return ent;
                              }));
                            }}
                            className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            required
                          >
                            <option value="">Select Department/Stream</option>
                            {streams.map((stream) => (
                              <option key={stream._id} value={stream._id}>
                                {stream.name} {stream.code ? `(${stream.code})` : ""}
                              </option>
                            ))}
                          </select>
                  </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[200px]">
                          <select
                            value={currentEntry.subjectId || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEntries(prevEntries => prevEntries.map(ent => {
                                if (ent._id === currentEntry._id) {
                                  if (value) {
                                    const subject = subjects.find(s => s._id === value);
                                    if (subject) {
                                      return { ...ent, subjectId: subject._id, subjectName: subject.name || "", subjectCode: subject.code || "" };
                                    }
                                  }
                                  return { ...ent, subjectId: "", subjectName: "", subjectCode: "" };
                                }
                                return ent;
                              }));
                            }}
                            className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            required
                          >
                            <option value="">Select Subject</option>
                            {subjects.map((subject) => (
                              <option key={subject._id} value={subject._id}>
                                {subject.name} ({subject.code})
                              </option>
                            ))}
                          </select>
                  </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input
                            type="text"
                            value={currentEntry.paperType || ""}
                            onChange={(e) => setEntries(prevEntries => prevEntries.map(ent => ent._id === currentEntry._id ? { ...ent, paperType: e.target.value } : ent))}
                            className="w-full min-w-[160px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="e.g., Paper 1"
                            required
                          />
                  </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input
                            type="date"
                            value={currentEntry.examDate || ""}
                            onChange={(e) => setEntries(prevEntries => prevEntries.map(ent => ent._id === currentEntry._id ? { ...ent, examDate: e.target.value } : ent))}
                            className="w-full min-w-[160px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            required
                          />
                  </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input
                            type="text"
                            value={currentEntry.examDate ? getDayName(currentEntry.examDate) : ""}
                            readOnly
                            className="w-full min-w-[120px] px-4 py-2.5 border border-gray-300 rounded bg-gray-50 text-sm"
                            placeholder="Auto"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input
                            type="time"
                            value={currentEntry.examTime || ""}
                            onChange={(e) => setEntries(prevEntries => prevEntries.map(ent => ent._id === currentEntry._id ? { ...ent, examTime: e.target.value } : ent))}
                            className="w-full min-w-[140px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            required
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input
                            type="text"
                            value={currentEntry.duration || ""}
                            onChange={(e) => setEntries(prevEntries => prevEntries.map(ent => ent._id === currentEntry._id ? { ...ent, duration: e.target.value } : ent))}
                            className="w-full min-w-[140px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="e.g., 3 hours"
                            required
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input
                            type="text"
                            value={currentEntry.notes || ""}
                            onChange={(e) => setEntries(prevEntries => prevEntries.map(ent => ent._id === currentEntry._id ? { ...ent, notes: e.target.value } : ent))}
                            className="w-full min-w-[180px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="Notes (optional)"
                          />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                            onClick={() => handleInlineSave(currentEntry._id)}
                            className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors mr-2"
                            title="Save"
                    >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                    </button>
                    <button
                            onClick={() => setEntries(prev => prev.filter(e => e._id !== currentEntry._id))}
                            className="text-gray-600 hover:text-gray-900 p-1.5 rounded hover:bg-gray-50 transition-colors"
                            title="Cancel"
                    >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                    </button>
                  </td>
                </tr>


                    );
                  })}

                  {group.entries.map((entry) => {
                    const isEditing = editingRowId === entry._id;
                    return (
                      <tr key={entry._id} className={`hover:bg-gray-50 ${isEditing ? 'bg-yellow-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[200px]">
                          {isEditing ? (
                            <select
                              value={(typeof entry.streamId === 'object' && entry.streamId?._id) ? entry.streamId._id : (entry.streamId || "")}
                              onChange={(e) => {
                                const value = e.target.value;
                                setEntries(prevEntries => {
                                  return prevEntries.map(ent => {
                                    if (ent._id === entry._id) {
                                      if (value) {
                                        const stream = streams.find(s => (s._id || s.id) === value);
                                        if (stream) {
                                          return {
                                            ...ent,
                                            streamId: stream._id || stream.id,
                                            streamName: stream.name || "",
                                            streamCode: stream.code || ""
                                          };
                                        }
                                      }
                                      return {
                                        ...ent,
                                        streamId: "",
                                        streamName: "",
                                        streamCode: ""
                                      };
                                    }
                                    return ent;
                                  });
                                });
                              }}
                              className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              required
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">Select Department/Stream</option>
                              {streams.map((stream) => (
                                <option key={stream._id || stream.id} value={stream._id || stream.id}>
                                  {stream.name} {stream.code ? `(${stream.code})` : ""}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div>
                              <div className="font-medium text-gray-900">
                                {entry.streamName || (typeof entry.streamId === 'object' && entry.streamId?.name) || entry.stream || entry.streamCode || "-"}
                              </div>
                              {(entry.streamCode || (typeof entry.streamId === 'object' && entry.streamId?.code)) && (
                                <div className="text-xs text-gray-500">{entry.streamCode || (typeof entry.streamId === 'object' && entry.streamId?.code) || ""}</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[200px]">
                          {isEditing ? (
                            <select
                              value={(typeof entry.subjectId === 'object' && entry.subjectId?._id) ? entry.subjectId._id : (entry.subjectId || "")}
                              onChange={(e) => {
                                const value = e.target.value;
                                setEntries(prevEntries => {
                                  return prevEntries.map(ent => {
                                    if (ent._id === entry._id) {
                                      if (value) {
                                        const subject = subjects.find(s => (s._id || s.id) === value);
                                        if (subject) {
                                          return {
                                            ...ent,
                                            subjectId: subject._id || subject.id,
                                            subjectName: subject.name || "",
                                            subjectCode: subject.code || ""
                                          };
                                        }
                                      }
                                      return {
                                        ...ent,
                                        subjectId: "",
                                        subjectName: "",
                                        subjectCode: ""
                                      };
                                    }
                                    return ent;
                                  });
                                });
                              }}
                              className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              required
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">Select Subject</option>
                              {subjects.map((subject) => (
                                <option key={subject._id || subject.id} value={subject._id || subject.id}>
                                  {subject.name} ({subject.code})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div>
                              <div className="font-medium text-gray-900">
                                {entry.subjectName || entry.subject || entry.subjectCode || "-"}
                              </div>
                              {entry.subjectCode && (
                                <div className="text-xs text-gray-500">{entry.subjectCode}</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isEditing ? (
                            <input
                              type="text"
                              value={entry.paperType || ""}
                              onChange={(e) => handleInlineEdit(entry._id, "paperType", e.target.value)}
                              className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              placeholder="e.g., Paper 1, Paper 2"
                              required
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="text-gray-700">{entry.paperType || "-"}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isEditing ? (
                            <input
                              type="date"
                              value={entry.examDate || ""}
                              onChange={(e) => handleInlineEdit(entry._id, "examDate", e.target.value)}
                              className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              required
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="text-gray-500">
                              {entry.examDate ? new Date(entry.examDate).toLocaleDateString() : "-"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input
                            type="text"
                            value={entry.examDate ? getDayName(entry.examDate) : ""}
                            readOnly
                            className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded bg-gray-50 text-sm"
                            placeholder="Auto-calculated"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isEditing ? (
                            <input
                              type="time"
                              value={entry.examTime || entry.startTime || ""}
                              onChange={(e) => handleInlineEdit(entry._id, "examTime", e.target.value)}
                              className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              required
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="text-gray-500">{entry.examTime || entry.startTime || "-"}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isEditing ? (
                            <input
                              type="text"
                              value={entry.duration || ""}
                              onChange={(e) => handleInlineEdit(entry._id, "duration", e.target.value)}
                              className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              placeholder="e.g., 3 hours, 2.5 hours"
                              required
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="text-gray-500">{entry.duration || "-"}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isEditing ? (
                            <textarea
                              value={entry.notes || ""}
                              onChange={(e) => handleInlineEdit(entry._id, "notes", e.target.value)}
                              className="w-full min-w-[200px] px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                              rows={2}
                              placeholder="Optional notes"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="text-gray-500">{entry.notes || entry.remarks || "-"}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  handleInlineSave(entry._id);
                                  setEditingRowId(null);
                                }}
                                className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                                title="Save"
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
                                    d="M5 13l4 4L19 7"
                      />
                    </svg>


                              </button>
                              <button
                                onClick={async () => {
                                  setEditingRowId(null);
                                  // Reload from API to revert changes
                                  await fetchData();
                                }}
                                className="text-gray-600 hover:text-gray-900 p-1.5 rounded hover:bg-gray-50 transition-colors"
                                title="Cancel"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                  </div>


                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingRowId(entry._id)}
                                className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setViewingItem(entry)}
                                className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                                title="View"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(entry._id)}
                                className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {group.entries.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                        No entries in this group yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


          </div>
        </div>
      ))}

      {groupedEntries.groups.length === 0 && groupedEntries.emptyRows.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No timetable entries found. Add a new entry above to get started.</p>
        </div>
      )}

      {/* View Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-emerald-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">View Timetable Entry</h3>
              <button
                onClick={() => setViewingItem(null)}
                className="text-white hover:text-gray-200"
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
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-sm text-gray-900">
                    {viewingItem.subjectName || "-"} {viewingItem.subjectCode ? `(${viewingItem.subjectCode})` : ""}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paper</label>
                  <p className="text-sm text-gray-900">{viewingItem.paperType || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department (Stream)</label>
                  <p className="text-sm text-gray-900">
                    {viewingItem.streamName || "-"} {viewingItem.streamCode ? `(${viewingItem.streamCode})` : ""}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <p className="text-sm text-gray-900">
                    {viewingItem.examDate ? new Date(viewingItem.examDate).toLocaleDateString() : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <p className="text-sm text-gray-900">{viewingItem.examTime || viewingItem.startTime || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <p className="text-sm text-gray-900">{viewingItem.duration || "-"}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <p className="text-sm text-gray-900">{viewingItem.notes || viewingItem.remarks || "-"}</p>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <AddFormModal
          tabKey={"timetable"}
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingItem(null);
          }}
        />
      )}



      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-emerald-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-semibold">Timetable Preview</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const group = window.currentPreviewGroup;
                    const savedEntries = group
                      ? (group.entries || [])
                      : entries.filter(e => !e._id.includes("new") && e.subjectId && e.paperType && e.streamId);
                    handleDownloadPDF(savedEntries);
                  }}
                  className="px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="overflow-auto p-6">
              {(() => {
                // Compute preview dataset for the current group
                const dataEntries = window.currentPreviewGroup
                  ? (window.currentPreviewGroup.entries || [])
                  : entries.filter(e => !e._id.includes("new") && e.subjectId && e.paperType && e.streamId);

                // Header metadata
                const first = dataEntries[0] || {};
                const headerExamType = first.examinationType || "Regular";
                const headerSemester = first.semester || "";
                const headerCourse = first.courseName || first.course || "";
                const headerYear = first.academicYearCode || first.academicYearName || "";
                const timeText = `${first.examTime || "10.00AM"} – ${first.endTime || "01.00PM"}`;

                const parseDurationToMinutes = (durStr) => {
                  if (!durStr) return 0;
                  // examples: "3 hours", "2.5 hours", "3hrs", "180m"
                  const s = String(durStr).toLowerCase().trim();
                  const hrMatch = s.match(/(\d+(\.\d+)?)/);
                  if (!hrMatch) return 0;
                  const num = parseFloat(hrMatch[1]);
                  if (s.includes("min")) return Math.round(num);
                  return Math.round(num * 60);
                };

                const addMinutes = (timeStr, minutes) => {
                  if (!timeStr) return "";
                  // Expect "HH:MM" or "HH:MM AM/PM"
                  let t = timeStr.trim();
                  let is12 = /am|pm/i.test(t);
                  let hours = 0, mins = 0;
                  if (is12) {
                    const m = t.match(/(\d{1,2}):(\d{2})\s*([ap]m)/i);
                    if (!m) return timeStr;
                    hours = parseInt(m[1], 10) % 12;
                    if (m[3].toLowerCase() === "pm") hours += 12;
                    mins = parseInt(m[2], 10);
                  } else {
                    const m = t.match(/(\d{1,2}):(\d{2})/);
                    if (!m) return timeStr;
                    hours = parseInt(m[1], 10);
                    mins = parseInt(m[2], 10);
                  }
                  const total = hours * 60 + mins + (minutes || 0);
                  const newH = Math.floor((total % (24 * 60)) / 60);
                  const newM = Math.floor(total % 60);
                  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
                  if (is12) {
                    const ampm = newH >= 12 ? "PM" : "AM";
                    const dispH = newH % 12 === 0 ? 12 : newH % 12;
                    return `${dispH}:${pad(newM)} ${ampm}`;
                  }
                  return `${pad(newH)}:${pad(newM)}`;
                };

                // Build date groups and department list
                const dateGroups = {};
                const deptSet = new Set();
                dataEntries.forEach((e) => {
                  if (!e.examDate) return;
                  const dateKey = e.examDate;
                  const deptKey = e.streamName || e.streamCode || "Unknown";
                  deptSet.add(deptKey);
                  if (!dateGroups[dateKey]) {
                    dateGroups[dateKey] = { date: dateKey, day: getDayName(dateKey), from: "", to: "", departments: {} };
                  }
                  dateGroups[dateKey].departments[deptKey] = {
                    subject: e.subjectName || e.subjectCode || "-",
                    code: e.subjectCode || "",
                    paper: e.paperType || ""
                  };
                });

                // For each date, derive start/end time from any entry for that date
                Object.keys(dateGroups).forEach((dk) => {
                  const sameDate = dataEntries.filter((e) => e.examDate === dk);
                  const from = sameDate.find((e) => e.examTime)?.examTime || "";
                  let to = sameDate.find((e) => e.endTime)?.endTime || "";
                  if (!to && from) {
                    const durationStr = sameDate.find((e) => e.duration)?.duration || "";
                    const mins = parseDurationToMinutes(durationStr);
                    if (mins > 0) {
                      to = addMinutes(from, mins);
                    }
                  }
                  dateGroups[dk].from = from;
                  dateGroups[dk].to = to;
                });
                const sortedDates = Object.keys(dateGroups).sort();
                // Show only streams that are added in this section's entries
                const departments = Array.from(deptSet).filter(Boolean).sort();

                return (
                  <>
                    <div className="text-center mb-2">
                      <h3 className="text-2xl font-bold text-gray-800">ADIKAVI NANNAYA UNIVERSITY :: RAJAHMUNDRY</h3>
                      <p className="text-base font-semibold text-gray-700 mt-1">{headerCourse ? `${headerCourse}` : ""}</p>
                      <p className="text-base font-semibold text-gray-800 mt-1">
                        {headerSemester ? `${headerSemester} End Examinations` : "End Examinations"}
                        <span className="font-bold"> ({headerExamType})</span>
                        {headerYear ? <span className="ml-2 text-gray-700">({headerYear})</span> : null}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-gray-800">TIME TABLE</span>
                        <span className="text-sm font-semibold text-gray-800">Time: {timeText}</span>
                      </div>
                    </div>
                    <table className="min-w-full border border-gray-800">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-800">S.No</th>
                          <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-800">Date</th>
                          <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-800">Day</th>
                          <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-800">Time</th>
                          {departments.map((d) => (
                            <th key={d} className="px-2 py-2 text-center border border-gray-800">
                              <div className="text-red-600 font-bold text-sm">{d}</div>
                              <div className="text-xs font-semibold text-gray-800">Subject</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedDates.map((dateKey, idx) => {
                          const group = dateGroups[dateKey];
                          const dateStr = new Date(dateKey).toLocaleDateString("en-GB");
                          return (
                            <tr key={dateKey} className="align-top">
                              <td className="px-2 py-3 text-sm border border-gray-800">{idx + 1}</td>
                              <td className="px-2 py-3 text-sm border border-gray-800">{dateStr}</td>
                              <td className="px-2 py-3 text-sm border border-gray-800">{group.day}</td>
                              <td className="px-2 py-3 text-sm border border-gray-800">
                                {(group.from || "") + (group.to ? ` – ${group.to}` : "")}
                              </td>
                              {departments.map((d) => {
                                const cell = group.departments[d];
                                const title = cell?.subject || "-";
                                const code = cell?.code ? `(${cell.code})` : "";
                                const paper = cell?.paper || "";
                                return (
                                  <td key={d} className="px-2 py-3 text-sm border border-gray-800">
                                    <div className="whitespace-pre-line leading-snug">
                                      <div>{title}</div>
                                      {(code || paper) && (
                                        <div className="font-semibold">
                                          {code}
                                          {code && paper ? " - " : ""}
                                          {paper}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableTable;


