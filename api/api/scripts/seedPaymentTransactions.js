require("dotenv").config();
const mongoose = require("mongoose");
const ExaminationPaymentTransaction = require("../models/examination/ExaminationPaymentTransaction");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Function to generate dummy payment transactions
async function generatePaymentTransactions(startNumber = 1, count = 100) {
  try {
    console.log(`🔍 Generating ${count} payment transactions...`);

    // Check for existing transaction IDs to avoid duplicates
    const existingTransactions = await ExaminationPaymentTransaction.find(
      {},
      { transaction_id: 1 }
    ).lean();
    const existingTransactionIds = new Set(
      existingTransactions.map((t) => t.transaction_id)
    );
    console.log(
      `📋 Found ${existingTransactionIds.size} existing transaction IDs`
    );

    // Check for existing registration numbers to avoid duplicates
    const existingRegNumbers = await ExaminationPaymentTransaction.find(
      {},
      { registration_number: 1 }
    ).lean();
    const existingRegSet = new Set(
      existingRegNumbers.map((t) => t.registration_number)
    );
    console.log(
      `📋 Found ${existingRegSet.size} existing registration numbers`
    );

    const firstNames = [
      "Rajesh",
      "Priya",
      "Amit",
      "Sneha",
      "Rahul",
      "Kavya",
      "Vikram",
      "Anjali",
      "Mohit",
      "Divya",
      "Arjun",
      "Meera",
      "Siddharth",
      "Pooja",
      "Rohan",
      "Neha",
      "Aditya",
      "Isha",
      "Karan",
      "Riya",
      "Varun",
      "Shreya",
      "Nikhil",
      "Tanvi",
      "Yashvardhan",
      "Aarav",
      "Ishita",
    ];
    const lastNames = [
      "Kumar",
      "Sharma",
      "Patel",
      "Reddy",
      "Verma",
      "Nair",
      "Singh",
      "Desai",
      "Agarwal",
      "Iyer",
      "Menon",
      "Joshi",
      "Rao",
      "Gupta",
      "Kapoor",
      "Bhatt",
      "Malhotra",
      "Trivedi",
      "Shah",
      "Mehta",
      "Chawla",
      "Dubey",
      "Nanda",
    ];

    const courses = [
      "B.Tech Computer Science",
      "B.Tech Electronics",
      "B.Tech Mechanical",
      "B.Tech Civil",
      "B.Sc Mathematics",
      "B.Sc Physics",
      "B.Com",
      "BBA",
      "MBA",
    ];

    const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

    const paymentModes = ["UPI", "Net Banking", "Debit Card", "Credit Card"];

    const dummyTransactions = [];

    for (let i = 0; i < count; i++) {
      const regNumber = startNumber + i;
      const registrationNumber = `REG2025${String(regNumber).padStart(5, "0")}`;

      // Skip if registration number already exists
      if (existingRegSet.has(registrationNumber)) {
        console.log(
          `⚠️  Skipping ${registrationNumber} - already exists`
        );
        continue;
      }

      // Generate unique transaction ID
      let transactionId;
      let attempts = 0;
      do {
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000000);
        transactionId = `TXN${2025}${String(regNumber).padStart(5, "0")}${String(randomSuffix).padStart(6, "0")}`;
        attempts++;
        if (attempts > 10) {
          transactionId = `TXN${timestamp}${regNumber}`;
          break;
        }
      } while (existingTransactionIds.has(transactionId));

      existingTransactionIds.add(transactionId);
      existingRegSet.add(registrationNumber);

      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const studentName = `${firstName} ${lastName}`;
      const course = courses[Math.floor(Math.random() * courses.length)];
      const semester = semesters[Math.floor(Math.random() * semesters.length)];
      const amount = 500 + Math.floor(Math.random() * 4500); // Amount between 500 and 5000
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${regNumber}@example.com`;
      const phone = `9${Math.floor(Math.random() * 900000000) + 100000000}`;
      const paymentMode =
        paymentModes[Math.floor(Math.random() * paymentModes.length)];
      const bankRefNumber = `BANK${String(Math.floor(Math.random() * 1000000000)).padStart(10, "0")}`;

      const transaction = {
        transaction_id: transactionId,
        registration_number: registrationNumber,
        student_name: studentName,
        course: course,
        semester: semester,
        email: email,
        phone: phone,
        amount: amount,
        payment_gateway: "Easebuzz",
        payment_status: "SUCCESS", // Only SUCCESS status as requested
        regular_subjects: [
          `Subject ${Math.floor(Math.random() * 5) + 1}`,
          `Subject ${Math.floor(Math.random() * 5) + 1}`,
        ].filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
        supplementary_subjects:
          Math.random() > 0.7
            ? [`Subject ${Math.floor(Math.random() * 5) + 6}`]
            : [],
        regular_subject_count: Math.floor(Math.random() * 3) + 2,
        supplementary_subject_count: Math.random() > 0.7 ? 1 : 0,
        bank_reference_number: bankRefNumber,
        payment_mode: paymentMode,
        payment_completed_at: new Date(
          Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
        ), // Random date within last 30 days
        easebuzz_transaction_data: {
          txnid: transactionId,
          amount: amount.toString(),
          status: "success",
          payment_mode: paymentMode,
          bank_ref_num: bankRefNumber,
          email: email,
          phone: phone,
        },
      };

      dummyTransactions.push(transaction);
    }

    return dummyTransactions;
  } catch (error) {
    console.error("❌ Error generating payment transactions:", error);
    throw error;
  }
}

// Function to seed the database
async function seedPaymentTransactions() {
  try {
    console.log("🌱 Starting to seed payment transactions...");

    // Check for existing records
    const existingCount = await ExaminationPaymentTransaction.countDocuments();
    console.log(
      `📊 Existing payment transactions in database: ${existingCount}`
    );

    // Get the highest registration number to continue from there
    const lastTransaction = await ExaminationPaymentTransaction.findOne(
      { registration_number: /^REG2025/ },
      { registration_number: 1 }
    )
      .sort({ registration_number: -1 })
      .lean();

    let startNumber = 1;
    if (lastTransaction && lastTransaction.registration_number) {
      const match = lastTransaction.registration_number.match(/REG2025(\d+)/);
      if (match) {
        startNumber = parseInt(match[1], 10) + 1;
        console.log(
          `📋 Found last registration number: ${lastTransaction.registration_number}, starting from: REG2025${String(startNumber).padStart(5, "0")}`
        );
      }
    }

    // Generate 100 transactions by default (can be adjusted)
    const count = 100;
    const dummyTransactions = await generatePaymentTransactions(
      startNumber,
      count
    );

    if (dummyTransactions.length === 0) {
      console.log("⚠️  No new transactions to insert (all may already exist)");
      process.exit(0);
    }

    // Insert dummy data
    const inserted = await ExaminationPaymentTransaction.insertMany(
      dummyTransactions,
      { ordered: false } // Continue inserting even if some fail
    );
    console.log(
      `✅ Successfully inserted ${inserted.length} payment transaction records!`
    );

    // Display summary
    const totalCount = await ExaminationPaymentTransaction.countDocuments();
    const successCount = await ExaminationPaymentTransaction.countDocuments({
      payment_status: "SUCCESS",
    });
    const pendingCount = await ExaminationPaymentTransaction.countDocuments({
      payment_status: "PENDING",
    });
    const failedCount = await ExaminationPaymentTransaction.countDocuments({
      payment_status: "FAILED",
    });

    console.log("\n📈 Summary:");
    console.log(`   Total Transactions: ${totalCount}`);
    console.log(`   SUCCESS: ${successCount}`);
    console.log(`   PENDING: ${pendingCount}`);
    console.log(`   FAILED: ${failedCount}`);

    // Display sample transactions
    console.log("\n📋 Sample Payment Transactions:");
    const sampleTransactions = await ExaminationPaymentTransaction.find({
      payment_status: "SUCCESS",
    })
      .limit(5)
      .select(
        "transaction_id registration_number student_name course semester amount payment_status payment_completed_at"
      )
      .sort({ createdAt: -1 });

    sampleTransactions.forEach((transaction, index) => {
      console.log(`\n   ${index + 1}. ${transaction.student_name}`);
      console.log(`      Registration: ${transaction.registration_number}`);
      console.log(`      Transaction ID: ${transaction.transaction_id}`);
      console.log(`      Course: ${transaction.course || "N/A"}`);
      console.log(`      Semester: ${transaction.semester || "N/A"}`);
      console.log(`      Amount: ₹${transaction.amount}`);
      console.log(`      Status: ${transaction.payment_status}`);
      console.log(
        `      Completed: ${transaction.payment_completed_at ? transaction.payment_completed_at.toLocaleString() : "N/A"}`
      );
    });

    console.log("\n✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding payment transactions:", error);
    if (error.code === 11000) {
      console.error(
        "   Duplicate key error - some transactions may already exist"
      );
    }
    process.exit(1);
  }
}

// Run the seed function
seedPaymentTransactions();

