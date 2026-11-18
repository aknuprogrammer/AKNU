const OutPass = require("../../models/hostel/OutPass");
const { HostelFee } = require("../../models/certificationFee/FormModels");
const { sendEmail } = require("../../utils/emailService");

exports.getOutPasses = async (req, res) => {
    try {
        const { hostelId } = req.query;
        let query = {};
        if (hostelId) query.hostelId = hostelId;

        const outPasses = await OutPass.find(query)
            .populate("applicationId", "studentName registrationNumber employeeName employeeId roomNumber email")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: outPasses });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.createOutPass = async (req, res) => {
    try {
        const outPass = await OutPass.create({
            ...req.body,
            generatedBy: req.user?._id
        });
        res.status(201).json({ success: true, data: outPass });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.approveOutPass = async (req, res) => {
    try {
        const { id } = req.params;

        const outPass = await OutPass.findById(id).populate("applicationId", "studentName registrationNumber email");

        if (!outPass) {
            return res.status(404).json({ success: false, message: "Outpass not found" });
        }

        if (outPass.status === "approved") {
            return res.status(400).json({ success: false, message: "Outpass already approved" });
        }

        // Update outpass status
        outPass.status = "approved";
        outPass.actionBy = req.user?._id;
        outPass.actionDate = new Date();
        await outPass.save();

        // Send email notification to student
        const student = outPass.applicationId;
        if (student && student.email) {
            const emailSubject = "Outpass Approved - AKNU Hostel";
            const emailBody = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #525b88 0%, #3a4377 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #525b88; }
                        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                        .detail-label { font-weight: bold; color: #525b88; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Outpass Approved!</h1>
                        </div>
                        <div class="content">
                            <p>Dear <strong>${student.studentName}</strong>,</p>
                            <p>Your outpass request has been <span class="success-badge">APPROVED</span> by the hostel administration.</p>
                            
                            <div class="details">
                                <h3 style="color: #525b88; margin-top: 0;">Outpass Details</h3>
                                <div class="detail-row">
                                    <span class="detail-label">Registration Number:</span>
                                    <span>${student.registrationNumber}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Out Date:</span>
                                    <span>${outPass.outDate}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Out Time:</span>
                                    <span>${outPass.outTime}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Expected Return:</span>
                                    <span>${outPass.expectedReturnDate || outPass.outDate} at ${outPass.expectedReturnTime}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Purpose:</span>
                                    <span>${outPass.purpose}</span>
                                </div>
                            </div>

                            <p><strong>Important Instructions:</strong></p>
                            <ul>
                                <li>Please carry your ID card and this approval with you</li>
                                <li>Return to the hostel by the expected return time</li>
                                <li>Inform the security guard while leaving and returning</li>
                                <li>Contact hostel administration in case of any delay</li>
                            </ul>

                            <p>Have a safe journey!</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email from AKNU Hostel Management System</p>
                            <p>© ${new Date().getFullYear()} Adikavi Nannaya University</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            await sendEmail(student.email, emailSubject, emailBody);
        }

        res.status(200).json({
            success: true,
            message: "Outpass approved and email sent to student",
            data: outPass
        });
    } catch (error) {
        console.error("Error approving outpass:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
