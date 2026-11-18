const MessMenu = require("../../models/hostel/MessMenu");
const MessAttendance = require("../../models/hostel/MessAttendance");
const { HostelFee } = require("../../models/certificationFee/FormModels");

/**
 * @desc Get mess menu summary (unique hostels with menus) or full menu for a hostel
 * @route GET /api/hostel/mess/menu
 */
exports.getAllMenus = async (req, res) => {
    try {
        const { hostelId, summary } = req.query;

        if (summary === "true") {
            // Return only unique hostels that have menus
            const hostelIdsWithMenus = await MessMenu.distinct("hostelId");
            const Hostel = require("../../models/hostel/Hostel"); // Fix: direct require
            const hostels = await Hostel.find({ _id: { $in: hostelIdsWithMenus } }).select("name");
            return res.status(200).json({ success: true, data: hostels });
        }

        let query = {};
        if (hostelId) query.hostelId = hostelId;

        const menus = await MessMenu.find(query)
            .populate("hostelId", "name")
            .sort({ dayOfWeek: 1 });

        res.status(200).json({ success: true, data: menus });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Delete all menu entries for a hostel
 * @route DELETE /api/hostel/mess/menu/hostel/:hostelId
 */
exports.deleteWeeklyMenu = async (req, res) => {
    try {
        const { hostelId } = req.params;
        await MessMenu.deleteMany({ hostelId });
        res.status(200).json({ success: true, message: "Weekly menu deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Save/Update a mess menu for a day
 * @route POST /api/hostel/mess/menu
 */
exports.createMenu = async (req, res) => {
    try {
        const { hostelId, dayOfWeek, breakfast, lunch, snacks, dinner } = req.body;
        const actionBy = req.user._id;

        const menu = await MessMenu.findOneAndUpdate(
            { hostelId, dayOfWeek },
            {
                breakfast: breakfast || { veg: "N/A", nonVeg: "N/A" },
                lunch: lunch || { veg: "N/A", nonVeg: "N/A" },
                snacks: snacks || { veg: "N/A", nonVeg: "N/A" },
                dinner: dinner || { veg: "N/A", nonVeg: "N/A" },
                actionBy
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, data: menu });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Bulk Save/Update weekly mess menu
 * @route POST /api/hostel/mess/menu/bulk
 */
exports.bulkCreateMenu = async (req, res) => {
    try {
        const { hostelId, weeklyMenu } = req.body;
        const actionBy = req.user._id;

        if (!hostelId || !Array.isArray(weeklyMenu)) {
            return res.status(400).json({ success: false, message: "Invalid data provided" });
        }

        const promises = weeklyMenu.map(dayMenu => {
            return MessMenu.findOneAndUpdate(
                { hostelId, dayOfWeek: dayMenu.dayOfWeek },
                {
                    breakfast: dayMenu.breakfast || { veg: "N/A", nonVeg: "N/A" },
                    lunch: dayMenu.lunch || { veg: "N/A", nonVeg: "N/A" },
                    snacks: dayMenu.snacks || { veg: "N/A", nonVeg: "N/A" },
                    dinner: dayMenu.dinner || { veg: "N/A", nonVeg: "N/A" },
                    actionBy
                },
                { upsert: true, new: true }
            );
        });

        const results = await Promise.all(promises);
        res.status(200).json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Get today's menu for a hostel
 * @route GET /api/hostel/mess/menu/today/:hostelId
 */
exports.getTodayMenu = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];

        const menu = await MessMenu.findOne({ hostelId, dayOfWeek: today });
        res.status(200).json({ success: true, data: menu });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Mark mess attendance
 * @route POST /api/hostel/mess/attendance
 */
exports.markAttendance = async (req, res) => {
    try {
        const { registrationNumber, date, mealType, guestMeals, remarks } = req.body;
        const actionBy = req.user._id;

        const allocation = await HostelFee.findOne({
            registrationNumber: { $regex: new RegExp(`^${registrationNumber}$`, "i") },
            status: "active"
        });

        if (!allocation) {
            return res.status(404).json({ success: false, message: "No active hostel allocation found" });
        }

        const existingAttendance = await MessAttendance.findOne({
            registrationNumber,
            date: new Date(date),
            mealType
        });

        if (existingAttendance) {
            return res.status(400).json({ success: false, message: "Attendance already marked" });
        }

        const newAttendance = new MessAttendance({
            registrationNumber,
            name: allocation.studentName,
            applicationId: allocation._id,
            date: new Date(date),
            mealType,
            guestMeals: guestMeals || 0,
            remarks,
            actionBy
        });

        await newAttendance.save();
        res.status(201).json({ success: true, data: newAttendance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Get all mess attendance records
 * @route GET /api/hostel/mess/attendance
 */
exports.getAllAttendance = async (req, res) => {
    try {
        const { registrationNumber, date, mealType } = req.query;
        let matchQuery = {};
        if (registrationNumber) matchQuery.registrationNumber = registrationNumber;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);
            matchQuery.date = { $gte: startOfDay, $lte: endOfDay };
        }
        if (mealType) matchQuery.mealType = mealType;

        const records = await MessAttendance.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        registrationNumber: "$registrationNumber",
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
                    },
                    name: { $first: "$name" },
                    meals: {
                        $push: {
                            mealType: "$mealType",
                            attended: "$attended",
                            guestMeals: "$guestMeals",
                            remarks: "$remarks"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    registrationNumber: "$_id.registrationNumber",
                    date: "$_id.date",
                    name: 1,
                    breakfast: {
                        $filter: {
                            input: "$meals",
                            as: "m",
                            cond: { $eq: ["$$m.mealType", "Breakfast"] }
                        }
                    },
                    lunch: {
                        $filter: {
                            input: "$meals",
                            as: "m",
                            cond: { $eq: ["$$m.mealType", "Lunch"] }
                        }
                    },
                    snacks: {
                        $filter: {
                            input: "$meals",
                            as: "m",
                            cond: { $eq: ["$$m.mealType", "Snacks"] }
                        }
                    },
                    dinner: {
                        $filter: {
                            input: "$meals",
                            as: "m",
                            cond: { $eq: ["$$m.mealType", "Dinner"] }
                        }
                    }
                }
            },
            {
                $project: {
                    registrationNumber: 1,
                    date: 1,
                    name: 1,
                    breakfast: { $arrayElemAt: ["$breakfast", 0] },
                    lunch: { $arrayElemAt: ["$lunch", 0] },
                    snacks: { $arrayElemAt: ["$snacks", 0] },
                    dinner: { $arrayElemAt: ["$dinner", 0] }
                }
            },
            { $sort: { date: -1, registrationNumber: 1 } }
        ]);

        res.status(200).json({ success: true, data: records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
/**
 * @desc Get all residents of a hostel with their mess attendance status for a meal
 * @route GET /api/hostel/mess/attendance/status
 */
exports.getMessAttendanceStatus = async (req, res) => {
    try {
        const { hostelId, date, mealType } = req.query;

        if (!hostelId || !date || !mealType) {
            return res.status(400).json({ success: false, message: "Missing required parameters" });
        }

        // 1. Get all active residents for the hostel
        const residents = await HostelFee.find({
            hostelId,
            status: "active"
        }).select("registrationNumber studentName roomNumber bedNumber");

        // 2. Get existing mess attendance for the meal
        const attendanceRecords = await MessAttendance.find({
            date: new Date(date),
            mealType
        });

        // 3. Map attendance to residents
        const data = residents.map(resident => {
            const attendance = attendanceRecords.find(a => a.registrationNumber === resident.registrationNumber);
            return {
                applicationId: resident._id,
                registrationNumber: resident.registrationNumber,
                name: resident.studentName,
                roomNumber: resident.roomNumber,
                bedNumber: resident.bedNumber,
                attended: attendance ? attendance.attended : false, // Default to false if not marked
                guestMeals: attendance ? attendance.guestMeals : 0,
                remarks: attendance ? attendance.remarks : "",
                isExisting: !!attendance
            };
        });

        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Bulk mark mess attendance
 * @route POST /api/hostel/mess/attendance/bulk
 */
exports.bulkMarkAttendance = async (req, res) => {
    try {
        const { date, mealType, attendanceData } = req.body;
        const actionBy = req.user._id;

        if (!date || !mealType || !attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({ success: false, message: "Invalid payload" });
        }

        const formattedDate = new Date(date);

        const operations = attendanceData.map(record => ({
            updateOne: {
                filter: {
                    registrationNumber: record.registrationNumber,
                    date: formattedDate,
                    mealType
                },
                update: {
                    $set: {
                        registrationNumber: record.registrationNumber,
                        name: record.name,
                        applicationId: record.applicationId,
                        date: formattedDate,
                        mealType,
                        attended: record.attended,
                        guestMeals: record.guestMeals || 0,
                        remarks: record.remarks,
                        actionBy
                    }
                },
                upsert: true
            }
        }));

        await MessAttendance.bulkWrite(operations);

        res.status(200).json({ success: true, message: "Attendance saved successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
