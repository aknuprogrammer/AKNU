const IssuedBook = require("../../models/library/IssuedBook");
const Book = require("../../models/library/Book");
const LibraryRules = require("../../models/library/LibraryRules");
const LibraryRack = require("../../models/library/LibraryRack");

// Helper function to get library ID from a book
const getLibraryFromBook = async (bookId) => {
  try {
    const book = await Book.findById(bookId).populate("shelfLocation", "library");
    if (!book || !book.shelfLocation) {
      return null;
    }
    return book.shelfLocation.library ? book.shelfLocation.library.toString() : null;
  } catch (error) {
    console.error("Error getting library from book:", error);
    return null;
  }
};

// Helper function to get active rules for a library
const getActiveRules = async (libraryId) => {
  try {
    if (!libraryId) {
      return null;
    }
    const rules = await LibraryRules.findOne({
      library: libraryId,
      status: "active",
    });
    
    // Return default rules if no active rules found
    if (!rules) {
      return {
        issueDuration: { student: 14, faculty: 30 },
        finePerDay: { student: 5, faculty: 2 },
        maxRenewals: { student: 2, faculty: 3 },
        maxBooksLimit: { student: 3, faculty: 5 },
        gracePeriod: 3,
        fineCap: 500,
        isDefault: true,
      };
    }
    
    return rules;
  } catch (error) {
    console.error("Error getting active rules:", error);
    return null;
  }
};

// Helper function to calculate fine based on rules
const calculateFine = (dueDate, returnDate, borrowerType, rules) => {
  if (!rules) return 0;
  
  const due = new Date(dueDate);
  const returned = returnDate ? new Date(returnDate) : new Date();
  
  // Calculate days after due date (excluding grace period)
  const daysDiff = Math.ceil((returned - due) / (1000 * 60 * 60 * 24));
  const daysAfterGrace = daysDiff - (rules.gracePeriod || 0);
  
  // If returned within grace period, no fine
  if (daysAfterGrace <= 0) {
    return 0;
  }
  
  // Calculate fine
  const finePerDay = rules.finePerDay?.[borrowerType] || (borrowerType === "student" ? 5 : 2);
  let fine = daysAfterGrace * finePerDay;
  
  // Apply fine cap
  const fineCap = rules.fineCap || 500;
  if (fine > fineCap) {
    fine = fineCap;
  }
  
  return Math.round(fine * 100) / 100; // Round to 2 decimal places
};

// @desc Get all issued books
// @route GET /api/library/issued-books
exports.getIssuedBooks = async (req, res) => {
  try {
    const { status, borrowerType, search, book, borrower } = req.query;
    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by borrower type
    if (borrowerType) {
      query.borrowerType = borrowerType;
    }

    // Filter by book
    if (book) {
      query.book = book;
    }

    // Filter by borrower
    if (borrower) {
      query.borrower = borrower;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { borrowerName: { $regex: search, $options: "i" } },
        { borrowerEmail: { $regex: search, $options: "i" } },
        { borrowerPhone: { $regex: search, $options: "i" } },
      ];
    }

    const issuedBooks = await IssuedBook.find(query)
      .populate({
        path: "book",
        select: "bookTitle isbn author publisher category shelfLocation",
        populate: {
          path: "shelfLocation",
          select: "rackNumber rackName location library",
          populate: {
            path: "library",
            select: "name libraryCode _id",
          },
        },
      })
      .sort({ issueDate: -1 });

    res.json(issuedBooks);
  } catch (error) {
    console.error("Error fetching issued books:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get issued book by ID
// @route GET /api/library/issued-books/:id
exports.getIssuedBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const issuedBook = await IssuedBook.findById(id).populate(
      "book",
      "bookTitle isbn author publisher category shelfLocation totalCopies availableCopies"
    );

    if (!issuedBook) {
      return res.status(404).json({ message: "Issued book not found" });
    }

    res.json(issuedBook);
  } catch (error) {
    console.error("Error fetching issued book:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create new issued book
// @route POST /api/library/issued-books
exports.createIssuedBook = async (req, res) => {
  try {
    console.log("📥 Received issued book data:", JSON.stringify(req.body, null, 2));

    const {
      book,
      borrowerType,
      borrower,
      borrowerName,
      borrowerEmail,
      borrowerPhone,
      issueDate,
      dueDate,
      status,
      notes,
    } = req.body;

    // Validate required fields
    if (!book || !borrowerType || !borrower || !borrowerName || !issueDate || !dueDate) {
      const missingFields = [];
      if (!book) missingFields.push("book");
      if (!borrowerType) missingFields.push("borrowerType");
      if (!borrower) missingFields.push("borrower");
      if (!borrowerName) missingFields.push("borrowerName");
      if (!issueDate) missingFields.push("issueDate");
      if (!dueDate) missingFields.push("dueDate");

      return res.status(400).json({
        message: "Missing required fields",
        missingFields: missingFields,
      });
    }

    // Validate ObjectIds
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(book)) {
      return res.status(400).json({
        message: "Invalid book ID format",
        field: "book",
        received: book,
      });
    }
    if (!mongoose.Types.ObjectId.isValid(borrower)) {
      return res.status(400).json({
        message: "Invalid borrower ID format",
        field: "borrower",
        received: borrower,
      });
    }

    // Validate borrowerType
    if (!["student", "faculty"].includes(borrowerType)) {
      return res.status(400).json({
        message: "Invalid borrowerType. Must be 'student' or 'faculty'",
        received: borrowerType,
      });
    }

    // Check if book exists and has available copies
    const bookDoc = await Book.findById(book).populate("shelfLocation", "library");
    if (!bookDoc) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    if (bookDoc.availableCopies <= 0) {
      return res.status(400).json({
        message: "No available copies of this book",
        availableCopies: bookDoc.availableCopies,
      });
    }

    // Get library from book (via shelfLocation)
    const libraryId = bookDoc.shelfLocation?.library 
      ? bookDoc.shelfLocation.library.toString() 
      : null;

    // Get active rules for the library
    const rules = await getActiveRules(libraryId);

    // Check max books limit for the borrower
    if (rules) {
      const maxBooksLimit = rules.maxBooksLimit?.[borrowerType] || (borrowerType === "student" ? 3 : 5);
      const currentIssuedCount = await IssuedBook.countDocuments({
        borrower: borrower,
        borrowerType: borrowerType,
        status: { $in: ["issued", "renewed", "overdue"] },
      });

      if (currentIssuedCount >= maxBooksLimit) {
        return res.status(400).json({
          message: `Maximum book limit reached. ${borrowerType === "student" ? "Student" : "Faculty"} can borrow maximum ${maxBooksLimit} books at a time.`,
          currentCount: currentIssuedCount,
          maxLimit: maxBooksLimit,
        });
      }
    }

    // Auto-calculate due date if not provided or if rules are available
    let calculatedDueDate = dueDate ? new Date(dueDate) : null;
    if (rules && !dueDate) {
      const issueDuration = rules.issueDuration?.[borrowerType] || (borrowerType === "student" ? 14 : 30);
      const issueDateObj = new Date(issueDate);
      calculatedDueDate = new Date(issueDateObj);
      calculatedDueDate.setDate(calculatedDueDate.getDate() + issueDuration);
    } else if (rules && dueDate) {
      // Validate that due date is reasonable based on issue duration
      const issueDuration = rules.issueDuration?.[borrowerType] || (borrowerType === "student" ? 14 : 30);
      const issueDateObj = new Date(issueDate);
      const expectedDueDate = new Date(issueDateObj);
      expectedDueDate.setDate(expectedDueDate.getDate() + issueDuration);
      const providedDueDate = new Date(dueDate);
      
      // Allow some flexibility (±2 days) but warn if too different
      const daysDiff = Math.abs((providedDueDate - expectedDueDate) / (1000 * 60 * 60 * 24));
      if (daysDiff > 2) {
        // Still allow but could log a warning
        console.warn(`Due date differs significantly from expected based on rules. Expected: ${expectedDueDate.toISOString()}, Provided: ${dueDate}`);
      }
    }

    // Set max renewals based on rules
    const maxRenewals = rules?.maxRenewals?.[borrowerType] || (borrowerType === "student" ? 2 : 3);

    // Create issued book
    const issuedBookData = {
      book,
      borrowerType,
      borrower,
      borrowerName: borrowerName.trim(),
      borrowerEmail: borrowerEmail ? borrowerEmail.trim() : "",
      borrowerPhone: borrowerPhone ? borrowerPhone.trim() : "",
      issueDate: new Date(issueDate),
      dueDate: calculatedDueDate || new Date(dueDate),
      status: status || "issued",
      notes: notes ? notes.trim() : "",
      maxRenewals: maxRenewals,
      renewals: 0,
    };

    const issuedBook = new IssuedBook(issuedBookData);
    const savedIssuedBook = await issuedBook.save();

    // Decrease available copies of the book
    bookDoc.availableCopies -= 1;
    await bookDoc.save();

    // Populate and return
    const populatedIssuedBook = await IssuedBook.findById(savedIssuedBook._id)
      .populate("book", "bookTitle isbn author publisher category");

    res.status(201).json(populatedIssuedBook);
  } catch (error) {
    console.error("Error creating issued book:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      errors: error.errors,
    });

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
        kind: err.kind,
      }));
      console.error("Validation errors details:", JSON.stringify(errors, null, 2));
      return res.status(400).json({
        message: "Validation Error",
        errors: errors,
        details: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = {
            message: error.errors[key].message,
            value: error.errors[key].value,
            kind: error.errors[key].kind,
          };
          return acc;
        }, {}),
      });
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Update issued book
// @route PUT /api/library/issued-books/:id
exports.updateIssuedBook = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      book,
      borrowerType,
      borrower,
      borrowerName,
      borrowerEmail,
      borrowerPhone,
      issueDate,
      dueDate,
      returnDate,
      status,
      fineAmount,
      notes,
    } = req.body;

    const issuedBook = await IssuedBook.findById(id);
    if (!issuedBook) {
      return res.status(404).json({ message: "Issued book not found" });
    }

    const oldStatus = issuedBook.status;
    const oldBookId = issuedBook.book.toString();

    // Update fields
    if (book !== undefined) issuedBook.book = book;
    if (borrowerType !== undefined) issuedBook.borrowerType = borrowerType;
    if (borrower !== undefined) issuedBook.borrower = borrower;
    if (borrowerName !== undefined) issuedBook.borrowerName = borrowerName.trim();
    if (borrowerEmail !== undefined) issuedBook.borrowerEmail = borrowerEmail.trim();
    if (borrowerPhone !== undefined) issuedBook.borrowerPhone = borrowerPhone.trim();
    if (issueDate !== undefined) issuedBook.issueDate = new Date(issueDate);
    if (dueDate !== undefined) issuedBook.dueDate = new Date(dueDate);
    if (returnDate !== undefined) issuedBook.returnDate = returnDate ? new Date(returnDate) : null;
    if (status !== undefined) issuedBook.status = status;
    if (fineAmount !== undefined) issuedBook.fineAmount = parseFloat(fineAmount) || 0;
    if (notes !== undefined) issuedBook.notes = notes.trim();

    // Handle book return - increase available copies
    if (oldStatus !== "returned" && status === "returned") {
      const bookDoc = await Book.findById(issuedBook.book);
      if (bookDoc) {
        bookDoc.availableCopies += 1;
        await bookDoc.save();
      }
      if (!returnDate) {
        issuedBook.returnDate = new Date();
      }
    }

    // Handle book change - adjust available copies
    if (book && book !== oldBookId) {
      // Increase old book's available copies
      const oldBookDoc = await Book.findById(oldBookId);
      if (oldBookDoc && oldStatus !== "returned") {
        oldBookDoc.availableCopies += 1;
        await oldBookDoc.save();
      }

      // Decrease new book's available copies
      const newBookDoc = await Book.findById(book);
      if (!newBookDoc) {
        return res.status(404).json({ message: "New book not found" });
      }
      if (newBookDoc.availableCopies <= 0) {
        return res.status(400).json({
          message: "No available copies of the new book",
        });
      }
      newBookDoc.availableCopies -= 1;
      await newBookDoc.save();
    }

    const updatedIssuedBook = await issuedBook.save();
    const populatedIssuedBook = await IssuedBook.findById(updatedIssuedBook._id)
      .populate("book", "bookTitle isbn author publisher category");

    res.json(populatedIssuedBook);
  } catch (error) {
    console.error("Error updating issued book:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Delete issued book
// @route DELETE /api/library/issued-books/:id
exports.deleteIssuedBook = async (req, res) => {
  try {
    const { id } = req.params;
    const issuedBook = await IssuedBook.findById(id);

    if (!issuedBook) {
      return res.status(404).json({ message: "Issued book not found" });
    }

    // If book is not returned, increase available copies
    if (issuedBook.status !== "returned") {
      const bookDoc = await Book.findById(issuedBook.book);
      if (bookDoc) {
        bookDoc.availableCopies += 1;
        await bookDoc.save();
      }
    }

    await IssuedBook.findByIdAndDelete(id);
    res.json({ message: "Issued book deleted successfully" });
  } catch (error) {
    console.error("Error deleting issued book:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Return a book
// @route PUT /api/library/issued-books/:id/return
exports.returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { returnDate, fineAmount } = req.body;

    const issuedBook = await IssuedBook.findById(id).populate({
      path: "book",
      populate: { path: "shelfLocation", select: "library" },
    });
    
    if (!issuedBook) {
      return res.status(404).json({ message: "Issued book not found" });
    }

    if (issuedBook.status === "returned") {
      return res.status(400).json({ message: "Book is already returned" });
    }

    // Get library and rules for fine calculation
    const libraryId = issuedBook.book?.shelfLocation?.library 
      ? issuedBook.book.shelfLocation.library.toString() 
      : null;
    const rules = await getActiveRules(libraryId);

    // Calculate fine if not provided
    let calculatedFine = 0;
    if (fineAmount === undefined || fineAmount === null) {
      const actualReturnDate = returnDate ? new Date(returnDate) : new Date();
      calculatedFine = calculateFine(
        issuedBook.dueDate,
        actualReturnDate,
        issuedBook.borrowerType,
        rules
      );
    } else {
      calculatedFine = parseFloat(fineAmount) || 0;
    }

    // Update status and return date
    issuedBook.status = "returned";
    issuedBook.returnDate = returnDate ? new Date(returnDate) : new Date();
    issuedBook.fineAmount = calculatedFine;

    // Increase available copies
    const bookDoc = await Book.findById(issuedBook.book._id || issuedBook.book);
    if (bookDoc) {
      bookDoc.availableCopies += 1;
      await bookDoc.save();
    }

    const updatedIssuedBook = await issuedBook.save();
    const populatedIssuedBook = await IssuedBook.findById(updatedIssuedBook._id)
      .populate("book", "bookTitle isbn author publisher category");

    res.json({
      ...populatedIssuedBook.toObject(),
      calculatedFine: calculatedFine,
      fineCalculation: {
        dueDate: issuedBook.dueDate,
        returnDate: issuedBook.returnDate,
        gracePeriod: rules?.gracePeriod || 3,
        finePerDay: rules?.finePerDay?.[issuedBook.borrowerType] || (issuedBook.borrowerType === "student" ? 5 : 2),
        fineCap: rules?.fineCap || 500,
      },
    });
  } catch (error) {
    console.error("Error returning book:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Renew a book
// @route PUT /api/library/issued-books/:id/renew
exports.renewBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDueDate } = req.body;

    const issuedBook = await IssuedBook.findById(id).populate({
      path: "book",
      populate: { path: "shelfLocation", select: "library" },
    });
    
    if (!issuedBook) {
      return res.status(404).json({ message: "Issued book not found" });
    }

    if (issuedBook.status === "returned") {
      return res.status(400).json({ message: "Cannot renew a returned book" });
    }

    // Get library and rules
    const libraryId = issuedBook.book?.shelfLocation?.library 
      ? issuedBook.book.shelfLocation.library.toString() 
      : null;
    const rules = await getActiveRules(libraryId);

    // Check max renewals limit
    const maxRenewals = rules?.maxRenewals?.[issuedBook.borrowerType] 
      || issuedBook.maxRenewals 
      || (issuedBook.borrowerType === "student" ? 2 : 3);
    
    const currentRenewals = issuedBook.renewals || 0;
    
    if (currentRenewals >= maxRenewals) {
      return res.status(400).json({
        message: `Maximum renewal limit reached. ${issuedBook.borrowerType === "student" ? "Student" : "Faculty"} can renew maximum ${maxRenewals} times.`,
        currentRenewals: currentRenewals,
        maxRenewals: maxRenewals,
      });
    }

    // Calculate new due date based on rules
    let calculatedNewDueDate;
    if (newDueDate) {
      calculatedNewDueDate = new Date(newDueDate);
    } else {
      // Use issue duration from rules
      const issueDuration = rules?.issueDuration?.[issuedBook.borrowerType] 
        || (issuedBook.borrowerType === "student" ? 14 : 30);
      calculatedNewDueDate = new Date(issuedBook.dueDate);
      calculatedNewDueDate.setDate(calculatedNewDueDate.getDate() + issueDuration);
    }

    // Update due date and increment renewals
    issuedBook.dueDate = calculatedNewDueDate;
    issuedBook.renewals = (issuedBook.renewals || 0) + 1;
    issuedBook.status = "renewed";

    const updatedIssuedBook = await issuedBook.save();
    const populatedIssuedBook = await IssuedBook.findById(updatedIssuedBook._id)
      .populate("book", "bookTitle isbn author publisher category");

    res.json(populatedIssuedBook);
  } catch (error) {
    console.error("Error renewing book:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

