/**
 * Script to add default documents/certificates to all existing students
 * Run: node api/scripts/addDocumentsToStudents.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../models/admission/FromStudents");
const PDFDocument = require("pdfkit");

mongoose
  .connect(process.env.MONGO_DB)
  .then(async () => {
    console.log("✅ Connected to MongoDB\n");

    // Get all students with registration numbers
    const students = await Student.find({
      registrationNumber: { $exists: true, $ne: null, $ne: "" }
    });

    console.log(`📊 Found ${students.length} students with registration numbers\n`);

    if (students.length === 0) {
      console.log("❌ No students found. Exiting...");
      process.exit(0);
    }

    let updated = 0;
    let skipped = 0;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Helper function to generate a simple PDF certificate
    const generateCertificatePDF = (studentName, documentName, registrationNumber) => {
      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({ size: "A4", margin: 50 });
          const buffers = [];

          doc.on("data", buffers.push.bind(buffers));
          doc.on("end", () => {
            const pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
          });
          doc.on("error", reject);

          // Header
          doc.fontSize(20).font("Helvetica-Bold").text("ADIKAVI NANNAYA UNIVERSITY", { align: "center" });
          doc.moveDown(0.5);
          doc.fontSize(12).font("Helvetica").text("Rajamahendravaram, Andhra Pradesh - 533296", { align: "center" });
          doc.moveDown(1);

          // Title
          doc.fontSize(18).font("Helvetica-Bold").text(documentName, { align: "center" });
          doc.moveDown(1.5);

          // Content
          doc.fontSize(12).font("Helvetica");
          doc.text(`This is to certify that`, { align: "left" });
          doc.moveDown(0.5);
          doc.fontSize(14).font("Helvetica-Bold").text(studentName, { align: "left" });
          doc.moveDown(0.5);
          doc.fontSize(12).font("Helvetica");
          doc.text(`Registration Number: ${registrationNumber}`, { align: "left" });
          doc.moveDown(1);
          doc.text(`has been issued this ${documentName} by the University.`, { align: "left" });
          doc.moveDown(2);

          // Date
          doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, { align: "right" });
          doc.moveDown(3);

          // Signature line
          doc.text("_________________________", { align: "right" });
          doc.fontSize(10).text("Authorized Signatory", { align: "right" });

          doc.end();
        } catch (error) {
          reject(error);
        }
      });
    };

    for (const student of students) {
      try {
        // Check if student already has documents
        const hasDocuments = student.documents && 
                            Array.isArray(student.documents) && 
                            student.documents.length > 0;

        if (hasDocuments) {
          console.log(`⏭️  Skipping ${student.registrationNumber} - already has ${student.documents.length} documents`);
          skipped++;
          continue;
        }

        // Generate student name
        const studentName = `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`.trim() || "Student";
        
        // Create default documents with PDF files
        const defaultDocuments = [];

        // 1. Admission Certificate
        const admissionPdf = await generateCertificatePDF(
          studentName,
          "Admission Certificate",
          student.registrationNumber
        );
        defaultDocuments.push({
          docId: `cert-admission-${student._id}`,
          name: "Admission Certificate",
          file: admissionPdf,
          fileType: "application/pdf",
          submitted: "true",
          verified: "verified",
          comment: "Certificate of admission to the university"
        });

        // 2. Identity Card
        const idCardPdf = await generateCertificatePDF(
          studentName,
          "Identity Card",
          student.registrationNumber
        );
        defaultDocuments.push({
          docId: `cert-id-${student._id}`,
          name: "Identity Card",
          file: idCardPdf,
          fileType: "application/pdf",
          submitted: "true",
          verified: "verified",
          comment: "Student identity card"
        });

        // 3. Library Card
        const libraryPdf = await generateCertificatePDF(
          studentName,
          "Library Card",
          student.registrationNumber
        );
        defaultDocuments.push({
          docId: `cert-library-${student._id}`,
          name: "Library Card",
          file: libraryPdf,
          fileType: "application/pdf",
          submitted: "true",
          verified: "verified",
          comment: "Library membership card"
        });

        // 4. Hostel Allotment Letter (only if student requires hostel)
        if (student.requiresHostel === "yes") {
          const hostelPdf = await generateCertificatePDF(
            studentName,
            "Hostel Allotment Letter",
            student.registrationNumber
          );
          defaultDocuments.push({
            docId: `cert-hostel-${student._id}`,
            name: "Hostel Allotment Letter",
            file: hostelPdf,
            fileType: "application/pdf",
            submitted: "true",
            verified: "verified",
            comment: "Hostel room allotment letter"
          });
        }

        // Add documents to student
        student.documents = defaultDocuments;
        await student.save();

        updated++;
        if (updated % 10 === 0) {
          console.log(`✅ Updated ${updated} students...`);
        }
      } catch (error) {
        console.error(`❌ Error updating student ${student.registrationNumber}:`, error.message);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Updated: ${updated} students`);
    console.log(`   ⏭️  Skipped: ${skipped} students (already had documents)`);
    console.log(`   📄 Total documents added: ${updated * 3 + (updated * 1)} (3-4 per student)\n`);

    // Verify the update - check if documents array exists and has at least one element
    const allStudents = await Student.find({
      registrationNumber: { $exists: true, $ne: null, $ne: "" }
    }).select("documents");
    
    const studentsWithDocs = allStudents.filter(s => 
      s.documents && Array.isArray(s.documents) && s.documents.length > 0
    ).length;

    console.log(`✅ Verification: ${studentsWithDocs} students now have documents\n`);

    // Show sample - find a student with documents
    const allStudentsWithDocs = await Student.find({
      registrationNumber: { $exists: true, $ne: null, $ne: "" }
    }).select("registrationNumber firstName lastName documents");
    
    const sample = allStudentsWithDocs.find(s => 
      s.documents && Array.isArray(s.documents) && s.documents.length > 0
    );

    if (sample) {
      console.log("📋 Sample student with documents:");
      console.log(`   Registration: ${sample.registrationNumber}`);
      console.log(`   Name: ${sample.firstName} ${sample.lastName}`);
      console.log(`   Documents: ${sample.documents.length}`);
      sample.documents.forEach((doc, index) => {
        console.log(`      ${index + 1}. ${doc.name} (${doc.fileType}) - ${doc.verified}`);
      });
      console.log();
    }

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection error:", err);
    process.exit(1);
  });

