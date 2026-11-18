const Attendance = require("../../models/hostel/Attendance");
const { HostelFee } = require("../../models/certificationFee/FormModels");

/**
 * @desc Get attendance by hostel and date
 * @route GET /api/hostel/attendance
 * @access Private
 */
exports.getAttendance = async (req, res) => {
    try {
        const { hostelId, date, includeUnmarked } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Please provide a date"
            });
        }

        const isFormMode = includeUnmarked === 'true';

        // MODE 1: Form Mode (For Mark Attendance Modal)
        // Returns ALL active students, merged with existing attendance if any.
        if (isFormMode) {
            // Build query filters
            const studentFilter = { status: "active" };
            const attendanceFilter = { date };

            if (hostelId) {
                studentFilter.hostelId = hostelId;
                attendanceFilter.hostelId = hostelId;
            }

            // Get all students
            const applications = await HostelFee.find(studentFilter)
                .select("studentName registrationNumber employeeName employeeId roomNumber bedNumber applicationType");

            // Get existing attendance
            const attendanceRecords = await Attendance.find(attendanceFilter);

            // Merge
            const data = applications.map(app => {
                const record = attendanceRecords.find(r => r.applicationId.toString() === app._id.toString());
                return {
                    applicationId: app._id,
                    name: app.studentName || app.employeeName,
                    registrationNumber: app.registrationNumber || app.employeeId,
                    roomNumber: app.roomNumber,
                    bedNumber: app.bedNumber,
                    applicationType: app.applicationType,
                    status: record ? record.status : "not_marked", // Default to not_marked for correct logic
                    date: record ? record.date : date, // Make sure date is always returned
                    checkInTime: record ? record.checkInTime : "",
                    checkOutTime: record ? record.checkOutTime : "",
                    remarks: record ? record.remarks : "",
                    isMarked: !!record
                };
            });

            return res.status(200).json({
                success: true,
                data,
                count: data.length
            });
        }

        // MODE 2: Strict/View Mode (For Attendance Grid)
        // Returns ONLY existing attendance records.
        const attendanceFilter = { date };
        if (hostelId) attendanceFilter.hostelId = hostelId;

        const attendanceRecords = await Attendance.find(attendanceFilter)
            .populate('applicationId', 'studentName registrationNumber employeeName employeeId roomNumber bedNumber applicationType status');

        // Filter out records where student might have been deleted (applicationId is null) 
        // OR where the linked student is no longer active (optional, depending on requirement)
        const validRecords = attendanceRecords.filter(r => r.applicationId);

        const data = validRecords.map(record => {
            const app = record.applicationId;
            return {
                applicationId: app._id,
                name: app.studentName || app.employeeName,
                registrationNumber: app.registrationNumber || app.employeeId,
                roomNumber: app.roomNumber,
                bedNumber: app.bedNumber,
                applicationType: app.applicationType,
                status: record.status,
                date: record.date, // Include date
                checkInTime: record.checkInTime,
                checkOutTime: record.checkOutTime,
                remarks: record.remarks,
                isMarked: true
            };
        });

        return res.status(200).json({
            success: true,
            data,
            count: data.length
        });

    } catch (error) {
        console.error("Error in getAttendance:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

/**
 * @desc Save bulk attendance
 * @route POST /api/hostel/attendance/bulk
 * @access Private
 */
exports.saveBulkAttendance = async (req, res) => {
    try {
        const { hostelId, date, attendanceData } = req.body;

        if (!hostelId || !date || !Array.isArray(attendanceData)) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const operations = attendanceData.map(item => ({
            updateOne: {
                filter: { applicationId: item.applicationId, date: date },
                update: {
                    $set: {
                        hostelId,
                        status: item.status,
                        checkInTime: item.checkInTime,
                        checkOutTime: item.checkOutTime,
                        remarks: item.remarks,
                        recordedBy: req.user?._id // Assuming auth middleware provides req.user
                    }
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(operations);

        res.status(200).json({
            success: true,
            message: "Attendance recorded successfully"
        });
    } catch (error) {
        console.error("Error in saveBulkAttendance:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

/**
 * @desc Get attendance statistics
 * @route GET /api/hostel/attendance/stats
 * @access Private
 */
exports.getAttendanceStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        // Total students active
        const totalActive = await HostelFee.countDocuments({ status: "active" });

        // Today's attendance
        const todayAttendance = await Attendance.find({ date: today });
        const presentCount = todayAttendance.filter(a => a.status === "present").length;
        const absentCount = todayAttendance.filter(a => a.status === "absent").length;

        res.status(200).json({
            success: true,
            data: {
                totalActive,
                presentCount,
                absentCount,
                notMarked: totalActive - todayAttendance.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
