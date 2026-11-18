const Student = require("../../models/admission/FromStudents");

// Generate dummy email based on student name
const generateStudentEmail = (firstName, lastName, hallTicketNo) => {
    const first = (firstName || "student").toLowerCase().replace(/\s+/g, "");
    const last = (lastName || "").toLowerCase().replace(/\s+/g, "");
    const ticket = hallTicketNo || Math.random().toString(36).substring(7);

    if (last) {
        return `${first}.${last}@student.aknu.edu.in`;
    }
    return `${first}.${ticket}@student.aknu.edu.in`;
};

// Generate dummy phone number
const generatePhoneNumber = (prefix = "98765") => {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomDigits}`;
};

// Add student information to all students
exports.addStudentEmails = async (req, res) => {
    try {
        // Find all students
        const students = await Student.find({});

        console.log(`Found ${students.length} total students`);

        let updatedCount = 0;
        const updates = [];

        for (const student of students) {
            const studentUpdates = {};

            // Add email if missing
            if (!student.email || student.email.trim() === "") {
                studentUpdates.email = generateStudentEmail(
                    student.firstName,
                    student.lastName,
                    student.hallTicketNo || student.referenceNumber
                );
            }

            // Add phone if missing
            if (!student.phone || student.phone.trim() === "") {
                studentUpdates.phone = generatePhoneNumber("98765");
            }

            // Add altPhone (parent phone) if missing
            if (!student.altPhone || student.altPhone.trim() === "") {
                studentUpdates.altPhone = generatePhoneNumber("99876");
            }

            // Add father email if father name exists (force update)
            if (student.fatherName && student.fatherName.trim() !== "") {
                const fatherNameClean = student.fatherName.toLowerCase().replace(/\s+/g, "");
                studentUpdates.fatherEmail = `${fatherNameClean}.father@parent.aknu.edu.in`;
            }

            // Add mother email if mother name exists (force update)
            if (student.motherName && student.motherName.trim() !== "") {
                const motherNameClean = student.motherName.toLowerCase().replace(/\s+/g, "");
                studentUpdates.motherEmail = `${motherNameClean}.mother@parent.aknu.edu.in`;
            }

            // Update if there are changes
            if (Object.keys(studentUpdates).length > 0) {
                await Student.updateOne(
                    { _id: student._id },
                    { $set: studentUpdates }
                );

                updatedCount++;
                updates.push({
                    student: `${student.firstName} ${student.lastName}`,
                    ...studentUpdates
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Successfully updated ${updatedCount} students with missing information`,
            totalStudents: students.length,
            updatedCount,
            studentsWithCompleteInfo: students.length - updatedCount,
            updates: updates.slice(0, 10), // Show first 10 updates
            note: "Added dummy data for missing fields: email, phone, altPhone, fatherEmail, motherEmail"
        });

    } catch (error) {
        console.error("Error adding student information:", error);
        res.status(500).json({
            success: false,
            message: "Error adding student information",
            error: error.message
        });
    }
};
