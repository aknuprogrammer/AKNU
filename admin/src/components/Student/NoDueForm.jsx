import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
    User,
    BookOpen,
    CreditCard,
    Building,
    CheckCircle,
    AlertCircle,
    Printer,
    Download,
    Search,
    FileText
} from "lucide-react";
import { apiRequest } from "../../services/apiService";
import iumsLogo from "../../assets/iumsLogo/iumsLogo.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const NoDueForm = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const printRef = useRef();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        setStudentData(null);

        try {
            const data = await apiRequest(`student/no-due/${searchQuery.trim()}`);
            setStudentData(data);
        } catch (err) {
            console.error(err);
            setError(err.message || "Student not found or error fetching data");
            setStudentData(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `No_Due_Form_${studentData?.regNo || 'Student'}`,
    });

    const handleDownloadPDF = async () => {
        const element = printRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: true,
                onclone: (clonedDoc) => {
                    // Optional: You can manipulate the cloned document here if needed
                    // For example, force all text to be black to ensure contrast
                    const element = clonedDoc.body.querySelector('[data-print-container]');
                    if (element) {
                        element.style.color = '#000000';
                    }
                }
            });
            const imgData = canvas.toDataURL("image/png");

            // A4 size: 210mm x 297mm
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`No_Due_Form_${studentData?.regNo || 'Student'}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please use the Print option as a workaround.");
        }
    };

    const StatusBadge = ({ isCleared, label }) => (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isCleared ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isCleared ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {label || (isCleared ? "Cleared" : "Pending")}
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2a3563]">No-Due Certificate</h1>
                        <p className="text-gray-500 mt-1">Generate and print no-due forms for students</p>
                    </div>
                </div>

                {/* Search Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Enter Student Registration Number / Hall Ticket No"
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#525b88] focus:border-transparent outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-[#525b88] text-white rounded-lg hover:bg-[#3a4166] transition-colors font-medium flex items-center gap-2 disabled:opacity-70"
                        >
                            {loading ? "Searching..." : "Get Status"}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <p>{error}</p>
                    </div>
                )}

                {studentData && (
                    <div className="space-y-6">

                        {/* Student Info Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <img
                                    src={studentData.photo}
                                    alt="Student"
                                    className="w-24 h-24 rounded-lg object-cover border-2 border-gray-100"
                                />
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Student Name</p>
                                        <p className="text-lg font-semibold text-gray-900">{studentData.name || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Registration Number</p>
                                        <p className="text-lg font-semibold text-gray-900">{studentData.regNo || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Course</p>
                                        <p className="text-lg font-semibold text-gray-900">{studentData.course || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Stream</p>
                                        <p className="text-lg font-semibold text-gray-900">{studentData.stream || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Batch</p>
                                        <p className="text-lg font-semibold text-gray-900">{studentData.batch || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handlePrint}
                                        className="px-4 py-2 bg-white border border-[#525b88] text-[#525b88] rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print No-Due Form
                                    </button>
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="px-4 py-2 bg-[#525b88] text-white rounded-lg hover:bg-[#3a4166] transition-colors flex items-center gap-2 font-medium shadow-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                            {/* Academics */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <BookOpen className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <StatusBadge isCleared={studentData.academics.isCleared} />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Academics</h3>
                                <p className="text-sm text-gray-500 mb-3">All Subjects Status</p>
                                <div className="text-sm bg-gray-50 p-2 rounded text-center font-medium">
                                    {studentData.academics.status === "Pass" ? "All Pass" : `${studentData.academics.failedSubjects.length} Failed Subjects`}
                                </div>
                            </div>

                            {/* Library */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <BookOpen className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <StatusBadge isCleared={studentData.library?.isCleared} label={studentData.library?.isCleared ? "No Dues" : "Dues Pending"} />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Library</h3>
                                <p className="text-sm text-gray-500 mb-3">Books Return Status</p>
                                {studentData.library?.hasDues && (
                                    <div className="text-xs bg-red-50 text-red-700 p-2 rounded">
                                        {studentData.library.pendingBooks.length} Books Pending Return
                                    </div>
                                )}
                            </div>

                            {/* Finance */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <CreditCard className="w-6 h-6 text-green-600" />
                                    </div>
                                    <StatusBadge isCleared={studentData.finance?.isCleared} label={studentData.finance?.isCleared ? "Paid" : "Pending"} />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Finance</h3>
                                <p className="text-sm text-gray-500 mb-3">Fee Payment Status</p>
                            </div>

                            {/* Hostel */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <Building className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <StatusBadge isCleared={studentData.hostel?.isCleared} />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Hostel</h3>
                                <p className="text-sm text-gray-500 mb-3">Room Vacating Status</p>
                            </div>

                        </div>

                    </div>
                )}
            </div>

            {/* Hidden Print Component - positioned off-screen for html2canvas */}
            <div style={{ position: "absolute", top: "-10000px", left: "-10000px" }}>
                <PrintableNoDueForm ref={printRef} student={studentData} />
            </div>

        </div>
    );
};

// Component to be printed
const PrintableNoDueForm = React.forwardRef(({ student }, ref) => {
    // Shared styles
    const styles = {
        container: {
            width: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '40px',
            fontFamily: 'serif',
            boxSizing: 'border-box'
        },
        header: {
            textAlign: 'center',
            borderBottom: '2px solid #000000',
            paddingBottom: '16px',
            marginBottom: '24px'
        },
        logoContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '8px'
        },
        logo: {
            height: '80px',
            width: 'auto'
        },
        universityName: {
            fontSize: '24px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0
        },
        address: {
            fontSize: '14px',
            fontWeight: '600',
            margin: 0
        },
        title: {
            fontSize: '20px',
            fontWeight: 'bold',
            marginTop: '16px',
            textDecoration: 'underline',
            margin: '16px 0 0 0'
        },
        date: {
            textAlign: 'right',
            fontSize: '14px',
            marginTop: '16px',
            fontWeight: '600',
            margin: '16px 0 0 0'
        },
        studentInfo: {
            marginBottom: '24px',
            lineHeight: '2',
            fontSize: '18px'
        },
        boldDashed: {
            fontWeight: 'bold',
            borderBottom: '1px dashed #000000',
            padding: '0 8px',
            display: 'inline-block'
        },
        tableContainer: {
            marginBottom: '32px'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #000000'
        },
        th: {
            border: '1px solid #000000',
            padding: '12px',
            textAlign: 'left',
            backgroundColor: '#f3f4f6',
            color: '#000000'
        },
        td: {
            border: '1px solid #000000',
            padding: '12px',
            color: '#000000'
        },
        tdCenter: {
            border: '1px solid #000000',
            padding: '12px',
            textAlign: 'center',
            color: '#000000'
        },
        finalStatement: {
            marginBottom: '48px',
            fontSize: '18px'
        },
        signatureSection: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: '80px',
            padding: '0 32px'
        },
        signatureBlock: {
            textAlign: 'center'
        },
        signatureLine: {
            fontWeight: 'bold',
            borderTop: '1px solid #000000',
            paddingTop: '8px',
            paddingLeft: '32px',
            paddingRight: '32px',
            margin: 0
        },
        footer: {
            marginTop: '48px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#9ca3af'
        }
    };

    return (
        <div ref={ref} style={styles.container}>
            {student ? (
                <>
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.logoContainer}>
                            <img src={iumsLogo} alt="University Logo" style={styles.logo} />
                            <div>
                                <h1 style={styles.universityName}>Adikavi Nannaya University</h1>
                                <p style={styles.address}>Rajamahendravaram, Andhra Pradesh, India - 533296</p>
                            </div>
                        </div>
                        <h2 style={styles.title}>NO DUES CERTIFICATE</h2>
                        <p style={styles.date}>Date: {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* Student Info */}
                    <div style={styles.studentInfo}>
                        <p style={{ margin: 0 }}>
                            This is to certify that Mr./Ms. <span style={styles.boldDashed}>{student.name || "N/A"}</span>,
                            bearing Registration No. <span style={styles.boldDashed}>{student.regNo || "N/A"}</span>,
                            a student of <span style={styles.boldDashed}>{student.course || "N/A"}</span>
                            {student.stream && student.stream !== "N/A" ? (
                                <> (<span style={styles.boldDashed}>{student.stream}</span>)</>
                            ) : null}
                            (Batch <span style={styles.boldDashed}>{student.batch || "N/A"}</span>)
                            has cleared all dues as detailed below:
                        </p>
                    </div>

                    {/* Departments Table */}
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ ...styles.th, width: '60px' }}>S.No</th>
                                    <th style={styles.th}>Department / Section</th>
                                    <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                                    <th style={{ ...styles.th, textAlign: 'center', width: '160px' }}>Signature of Authority</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={styles.tdCenter}>1</td>
                                    <td style={{ ...styles.td, fontWeight: '600' }}>Library</td>
                                    <td style={styles.tdCenter}>
                                        {student.library.isCleared ? "No Dues" : "Dues Pending"}
                                    </td>
                                    <td style={styles.td}></td>
                                </tr>
                                <tr>
                                    <td style={styles.tdCenter}>2</td>
                                    <td style={{ ...styles.td, fontWeight: '600' }}>Hostel</td>
                                    <td style={styles.tdCenter}>
                                        {student.hostel.isCleared ? "No Dues" : "Dues Pending"}
                                    </td>
                                    <td style={styles.td}></td>
                                </tr>
                                <tr>
                                    <td style={styles.tdCenter}>3</td>
                                    <td style={{ ...styles.td, fontWeight: '600' }}>Sports Department</td>
                                    <td style={{ ...styles.tdCenter, fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                                        (To be filled manually)
                                    </td>
                                    <td style={styles.td}></td>
                                </tr>
                                <tr>
                                    <td style={styles.tdCenter}>4</td>
                                    <td style={{ ...styles.td, fontWeight: '600' }}>Department Laboratory</td>
                                    <td style={{ ...styles.tdCenter, fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                                        (To be filled manually)
                                    </td>
                                    <td style={styles.td}></td>
                                </tr>
                                <tr>
                                    <td style={styles.tdCenter}>5</td>
                                    <td style={{ ...styles.td, fontWeight: '600' }}>Finance / Fee Section</td>
                                    <td style={styles.tdCenter}>
                                        {student.finance.isCleared ? "Paid" : "Pending"}
                                    </td>
                                    <td style={styles.td}></td>
                                </tr>
                                <tr>
                                    <td style={styles.tdCenter}>6</td>
                                    <td style={{ ...styles.td, fontWeight: '600' }}>Examination Section</td>
                                    <td style={styles.tdCenter}>
                                        {student.academics.isCleared ? "Pass" : "Fail"}
                                    </td>
                                    <td style={styles.td}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Final Statement */}
                    <div style={styles.finalStatement}>
                        <p style={{ margin: 0 }}>
                            The original certificates of the above student may be returned.
                        </p>
                    </div>

                    {/* Signatures */}
                    <div style={styles.signatureSection}>
                        <div style={styles.signatureBlock}>
                            <p style={styles.signatureLine}>Student Signature</p>
                        </div>
                        <div style={styles.signatureBlock}>
                            <p style={styles.signatureLine}>Head of Department</p>
                        </div>
                        <div style={styles.signatureBlock}>
                            <p style={styles.signatureLine}>Process Owner / Registrar</p>
                        </div>
                    </div>

                    <div style={styles.footer}>
                        Generated via AKNU iUMS on {new Date().toLocaleString()}
                    </div>
                </>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <p>No student data available to print.</p>
                </div>
            )}
        </div>
    );
});

export default NoDueForm;
