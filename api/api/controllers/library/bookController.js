const Book = require("../../models/library/Book");

// @desc Get all books
// @route GET /api/library/books
exports.getBooks = async (req, res) => {
  try {
    const { status, search, author, publisher, category, isbn } = req.query;
    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by author
    if (author) {
      query.author = author;
    }

    // Filter by publisher
    if (publisher) {
      query.publisher = publisher;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by ISBN
    if (isbn) {
      query.isbn = { $regex: isbn, $options: "i" };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { bookTitle: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } },
        { edition: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const books = await Book.find(query)
      .populate("author", "name authorCode")
      .populate("publisher", "name publisherCode")
      .populate("category", "name code")
      .populate({
        path: "shelfLocation",
        select: "rackNumber rackName location library",
        populate: {
          path: "library",
          select: "name libraryCode _id",
        },
      })
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get book by ID
// @route GET /api/library/books/:id
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id)
      .populate("author", "name authorCode alternativeNames nationality bio website specialization")
      .populate("publisher", "name publisherCode description establishedYear")
      .populate("category", "name code description")
      .populate({
        path: "shelfLocation",
        select: "rackNumber rackName location floor section capacity library",
        populate: {
          path: "library",
          select: "name libraryCode _id",
        },
      });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create new book
// @route POST /api/library/books
exports.createBook = async (req, res) => {
  try {
    console.log("📥 Received book data:", JSON.stringify(req.body, null, 2));
    
    const {
      bookTitle,
      author,
      publisher,
      category,
      isbn,
      edition,
      shelfLocation,
      publicationYear,
      bookImage,
      price,
      totalCopies,
      availableCopies,
      status,
      description,
    } = req.body;

    // Validate required fields
    if (!bookTitle || !author || !publisher || !category || !isbn || !shelfLocation) {
      const missingFields = [];
      if (!bookTitle) missingFields.push("bookTitle");
      if (!author) missingFields.push("author");
      if (!publisher) missingFields.push("publisher");
      if (!category) missingFields.push("category");
      if (!isbn) missingFields.push("isbn");
      if (!shelfLocation) missingFields.push("shelfLocation");
      
      return res.status(400).json({
        message: "Missing required fields",
        missingFields: missingFields,
        received: {
          bookTitle: !!bookTitle,
          author: !!author,
          publisher: !!publisher,
          category: !!category,
          isbn: !!isbn,
          shelfLocation: !!shelfLocation,
        },
      });
    }

    // Validate ObjectIds are valid MongoDB ObjectIds
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(author)) {
      return res.status(400).json({
        message: "Invalid author ID format",
        received: author,
      });
    }
    if (!mongoose.Types.ObjectId.isValid(publisher)) {
      return res.status(400).json({
        message: "Invalid publisher ID format",
        received: publisher,
      });
    }
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        message: "Invalid category ID format",
        received: category,
      });
    }
    if (!mongoose.Types.ObjectId.isValid(shelfLocation)) {
      return res.status(400).json({
        message: "Invalid shelfLocation ID format",
        received: shelfLocation,
      });
    }

    // Check if ISBN already exists
    const existingBook = await Book.findOne({ isbn: isbn.toUpperCase() });
    if (existingBook) {
      return res.status(400).json({
        message: "Book with this ISBN already exists",
      });
    }

    // Set default values and convert to numbers
    const defaultTotalCopies = parseInt(totalCopies) || 0;
    const defaultAvailableCopies = availableCopies !== undefined && availableCopies !== null 
      ? parseInt(availableCopies) 
      : defaultTotalCopies;

    // Validate availableCopies doesn't exceed totalCopies
    if (defaultAvailableCopies > defaultTotalCopies) {
      return res.status(400).json({
        message: "Available copies cannot exceed total copies",
        totalCopies: defaultTotalCopies,
        availableCopies: defaultAvailableCopies,
      });
    }

    // Validate totalCopies is at least 0
    if (defaultTotalCopies < 0) {
      return res.status(400).json({
        message: "Total copies cannot be negative",
        received: totalCopies,
      });
    }

    // Convert to proper types - Mongoose will handle ObjectId conversion automatically if strings are valid
    const bookData = {
      bookTitle: bookTitle.trim(),
      author: author, // Mongoose will convert valid ObjectId string automatically
      publisher: publisher, // Mongoose will convert valid ObjectId string automatically
      category: category, // Mongoose will convert valid ObjectId string automatically
      isbn: isbn.trim().toUpperCase(),
      edition: edition ? edition.trim() : "",
      shelfLocation: shelfLocation, // Mongoose will convert valid ObjectId string automatically
      publicationYear: publicationYear ? parseInt(publicationYear) : null,
      bookImage: bookImage ? bookImage.trim() : "",
      price: price ? parseFloat(price) : 0,
      totalCopies: parseInt(defaultTotalCopies),
      availableCopies: parseInt(defaultAvailableCopies),
      status: status || "available",
      description: description ? description.trim() : "",
    };

    const book = new Book(bookData);

    const savedBook = await book.save();
    const populatedBook = await Book.findById(savedBook._id)
      .populate("author", "name authorCode")
      .populate("publisher", "name publisherCode")
      .populate("category", "name code")
      .populate("shelfLocation", "rackNumber rackName location");

    res.status(201).json(populatedBook);
  } catch (error) {
    console.error("Error creating book:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      errors: error.errors,
    });
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Book with this ISBN already exists",
      });
    }

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

// @desc Update book
// @route PUT /api/library/books/:id
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bookTitle,
      author,
      publisher,
      category,
      isbn,
      edition,
      shelfLocation,
      publicationYear,
      bookImage,
      price,
      totalCopies,
      availableCopies,
      status,
      description,
    } = req.body;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if ISBN is being changed and if new ISBN already exists
    if (isbn && isbn.toUpperCase() !== book.isbn) {
      const existingBook = await Book.findOne({ isbn: isbn.toUpperCase() });
      if (existingBook) {
        return res.status(400).json({
          message: "Book with this ISBN already exists",
        });
      }
    }

    // Update fields
    if (bookTitle !== undefined) book.bookTitle = bookTitle;
    if (author !== undefined) book.author = author;
    if (publisher !== undefined) book.publisher = publisher;
    if (category !== undefined) book.category = category;
    if (isbn !== undefined) book.isbn = isbn.toUpperCase();
    if (edition !== undefined) book.edition = edition;
    if (shelfLocation !== undefined) book.shelfLocation = shelfLocation;
    if (publicationYear !== undefined) book.publicationYear = publicationYear;
    if (bookImage !== undefined) book.bookImage = bookImage;
    if (price !== undefined) book.price = price;
    if (status !== undefined) book.status = status;
    if (description !== undefined) book.description = description;

    // Handle copies updates
    if (totalCopies !== undefined) {
      book.totalCopies = totalCopies;
      // If totalCopies is reduced, adjust availableCopies
      if (book.availableCopies > totalCopies) {
        book.availableCopies = totalCopies;
      }
    }

    if (availableCopies !== undefined) {
      if (availableCopies > book.totalCopies) {
        return res.status(400).json({
          message: "Available copies cannot exceed total copies",
        });
      }
      book.availableCopies = availableCopies;
    }

    const updatedBook = await book.save();
    const populatedBook = await Book.findById(updatedBook._id)
      .populate("author", "name authorCode")
      .populate("publisher", "name publisherCode")
      .populate("category", "name code")
      .populate("shelfLocation", "rackNumber rackName location");

    res.json(populatedBook);
  } catch (error) {
    console.error("Error updating book:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Book with this ISBN already exists",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation Error",
        errors: errors,
      });
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Delete book
// @route DELETE /api/library/books/:id
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if book has issued copies
    if (book.availableCopies < book.totalCopies) {
      return res.status(400).json({
        message: "Cannot delete book with issued copies. Please return all copies first.",
      });
    }

    await Book.findByIdAndDelete(id);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

