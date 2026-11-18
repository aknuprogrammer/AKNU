const Visitor = require("../../models/hostel/Visitor");
const { HostelFee } = require("../../models/certificationFee/FormModels");

/**
 * @desc Get all visitors with filters
 * @route GET /api/hostel/visitors
 */
exports.getAllVisitors = async (req, res) => {
    try {
        const { status, date, registrationNumber } = req.query;
        let query = {};

        if (status) query.status = status;
        if (registrationNumber) query.studentRegNo = registrationNumber;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);
            query.entryTime = { $gte: startOfDay, $lte: endOfDay };
        }

        const visitors = await Visitor.find(query)
            .populate("hostelId", "name")
            .populate({
                path: "studentId",
                select: "studentName registrationNumber roomNumber bedNumber"
            })
            .sort({ entryTime: -1 });

        res.status(200).json({ success: true, data: visitors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Register a new visitor
 * @route POST /api/hostel/visitors
 */
exports.registerVisitor = async (req, res) => {
    try {
        const {
            visitorName,
            visitorPhone,
            visitorIdProof,
            registrationNumber, // Host student registration number
            relationship,
            purpose
        } = req.body;

        // Find the host student
        const student = await HostelFee.findOne({ registrationNumber, status: "active" });
        if (!student) {
            return res.status(404).json({ success: false, message: "Active resident not found with this registration number" });
        }

        const visitor = new Visitor({
            visitorName,
            visitorPhone,
            visitorIdProof,
            hostelId: student.hostelId,
            studentId: student._id,
            studentRegNo: student.registrationNumber,
            relationship,
            purpose,
            actionBy: req.user?._id
        });

        await visitor.save();
        res.status(201).json({ success: true, data: visitor });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Checkout a visitor
 * @route PATCH /api/hostel/visitors/:id/checkout
 */
exports.checkoutVisitor = async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id);
        if (!visitor) {
            return res.status(404).json({ success: false, message: "Visitor record not found" });
        }

        if (visitor.status === "completed") {
            return res.status(400).json({ success: false, message: "Visitor has already checked out" });
        }

        visitor.exitTime = new Date();
        visitor.status = "completed";
        await visitor.save();

        res.status(200).json({ success: true, data: visitor });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Lookup student by registration number for visitor registration
 * @route GET /api/hostel/visitors/lookup/:registrationNumber
 */
exports.lookupStudent = async (req, res) => {
    try {
        const { registrationNumber } = req.params;

        const student = await HostelFee.findOne({
            registrationNumber,
            status: "active"
        })
            .populate("hostelId", "name")
            .select("studentName registrationNumber hostelName roomNumber bedNumber");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "No active hostel resident found with this registration number"
            });
        }

        res.status(200).json({ success: true, data: student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
