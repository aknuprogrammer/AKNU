const Student = require("../../models/admission/FromStudents");
const IssuedBook = require("../../models/library/IssuedBook");
const FeesForm = require("../../models/fees/feesForm");
const Result = require("../../models/results/resultSchema");

exports.getNoDueStatus = async (req, res) => {
    try {
        const { id } = req.params; // Can be Registration Number or Hall Ticket

        // 1. Find Student
        const student = await Student.findOne({
            $or: [{ registrationNumber: id }, { hallTicketNo: id }]
        })
        .populate({
            path: "courseStreamMappingId",
            populate: [
                {
                    path: "courseId",
                    model: "Course_data",
                    select: "name code"
                },
                {
                    path: "streamId",
                    model: "Stream",
                    select: "name code"
                }
            ]
        })
        .populate({
            path: "batch",
            model: "AcademicYear",
            select: "code name startDate endDate description"
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const regNo = student.registrationNumber;

        // 2. Check Library Dues
        // Assuming 'returned' status means cleared. Any other status implies holding the book.
        const pendingBooks = await IssuedBook.find({
            borrower: student._id,
            status: { $ne: "returned" }
        }).populate("book");

        const libraryStatus = {
            hasDues: pendingBooks.length > 0,
            pendingBooks: pendingBooks.map(b => ({
                title: b.book?.title || "Unknown Book",
                dueDate: b.dueDate
            })),
            isCleared: pendingBooks.length === 0
        };

        // 3. Check Finance Dues
        // Check for any fee record that is not 'Paid'
        const pendingFees = await FeesForm.find({
            registrationNumber: regNo,
            status: { $ne: "Paid" }
        });

        const financeStatus = {
            hasDues: pendingFees.length > 0,
            pendingFees: pendingFees.map(f => ({
                type: f.feeType,
                amount: f.totalFee
            })),
            isCleared: pendingFees.length === 0
        };

        // 4. Check Academic Status
        // Check for any 'F' or 'Fail' grade in results
        const failedResults = await Result.find({
            RegisterNumber: regNo,
            grade: { $in: ["F", "Fail", "Absent"] } // Adjust based on actual grade schema
        });

        const academicStatus = {
            status: failedResults.length === 0 ? "Pass" : "Fail",
            failedSubjects: failedResults.map(r => r.SubjectName),
            isCleared: failedResults.length === 0
        };

        // 5. Hostel Status
        // If student requires hostel, check for specific hostel dues (placeholder logic if no separate model)
        // For now, assuming if they require hostel, and have no "Hostel Fee" pending in finance, they are clear.
        // Or if there is a specific Hostel Logic, add here.
        // We will default to Cleared unless we find specific "Hostel Fee" in pendingFees.
        const hostelPending = pendingFees.some(f => f.feeType?.toLowerCase().includes("hostel"));

        const hostelStatus = {
            hasDues: hostelPending,
            isCleared: !hostelPending
        };

        // Construct Response
        const courseName = student.courseStreamMappingId?.courseId?.name || 
                         student.courseStreamMappingId?.courseName || 
                         "N/A";
        const streamName = student.courseStreamMappingId?.streamId?.name || 
                          student.courseStreamMappingId?.streamName || 
                          "N/A";
        const batchCode = student.batch?.code || 
                         student.batch?.name || 
                         student.batchYear || 
                         "N/A";

        // Get student documents or generate default certificates
        let studentDocuments = [];
        if (student.documents && Array.isArray(student.documents) && student.documents.length > 0) {
            // Use existing documents
            studentDocuments = student.documents.map(doc => {
                // Clean comment field - remove acknowledgment timestamps
                let cleanComment = doc.comment || "";
                if (cleanComment) {
                    // Remove all "Acknowledged: {timestamp}" patterns
                    cleanComment = cleanComment.replace(/\s*\|\s*Acknowledged:\s*[^\|]*/gi, "");
                    cleanComment = cleanComment.replace(/Acknowledged:\s*[^\|]*/gi, "");
                    cleanComment = cleanComment.trim();
                }
                
                // Use description if available, otherwise use cleaned comment, or default description
                const description = doc.description || cleanComment || "";
                
                return {
                    _id: doc._id || doc.docId || `doc-${Date.now()}-${Math.random()}`,
                    name: doc.name || "Document",
                    documentName: doc.name || "Document",
                    type: doc.fileType || "certificate",
                    description: description,
                    receivedDate: doc.createdAt || new Date().toISOString(),
                    verified: doc.verified || "not_verified",
                    submitted: doc.submitted || "no"
                };
            });
        } else {
            // Generate default certificates for existing students
            const currentDate = new Date();
            const defaultCertificates = [
                {
                    _id: `cert-${student._id}-1`,
                    name: "Admission Certificate",
                    documentName: "Admission Certificate",
                    type: "certificate",
                    description: "Certificate of admission to the university",
                    receivedDate: new Date(currentDate.getFullYear(), 0, 15).toISOString(), // January 15 of admission year
                    verified: "verified",
                    submitted: "true"
                },
                {
                    _id: `cert-${student._id}-2`,
                    name: "Identity Card",
                    documentName: "Identity Card",
                    type: "id_card",
                    description: "Student identity card",
                    receivedDate: new Date(currentDate.getFullYear(), 0, 20).toISOString(),
                    verified: "verified",
                    submitted: "true"
                },
                {
                    _id: `cert-${student._id}-3`,
                    name: "Library Card",
                    documentName: "Library Card",
                    type: "library_card",
                    description: "Library membership card",
                    receivedDate: new Date(currentDate.getFullYear(), 1, 1).toISOString(), // February 1
                    verified: "verified",
                    submitted: "true"
                },
                {
                    _id: `cert-${student._id}-4`,
                    name: "Hostel Allotment Letter",
                    documentName: "Hostel Allotment Letter",
                    type: "hostel",
                    description: student.requiresHostel === "yes" ? "Hostel room allotment letter" : "Not applicable",
                    receivedDate: student.requiresHostel === "yes" ? new Date(currentDate.getFullYear(), 2, 1).toISOString() : null,
                    verified: student.requiresHostel === "yes" ? "verified" : "not_verified",
                    submitted: student.requiresHostel === "yes" ? "true" : "no"
                }
            ];

            // Filter out documents that are not applicable
            studentDocuments = defaultCertificates.filter(doc => doc.receivedDate !== null);
        }

        const responseData = {
            name: `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`.trim() || "N/A",
            regNo: student.registrationNumber || "N/A",
            course: courseName,
            stream: streamName,
            batch: batchCode,
            photo: "https://via.placeholder.com/150",
            documents: studentDocuments, // Include documents in response
            _id: student._id, // Include student ID for document acknowledgment
            // In real app, serve from student.documents or static path if available
            academics: academicStatus,
            library: libraryStatus,
            finance: financeStatus,
            hostel: hostelStatus,
            sports: { isCleared: true } // Default clear for now
        };

        res.json(responseData);

    } catch (error) {
        console.error("Error fetching No-Due status:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
