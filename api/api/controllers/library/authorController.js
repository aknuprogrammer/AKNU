const Author = require("../../models/library/Author");

// @desc Get all authors
// @route GET /api/library/authors
exports.getAuthors = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { authorCode: { $regex: search, $options: "i" } },
        { alternativeNames: { $regex: search, $options: "i" } },
        { nationality: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }

    const authors = await Author.find(query)
      .sort({ createdAt: -1 });

    res.json(authors);
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get author by ID
// @route GET /api/library/authors/:id
exports.getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;
    const author = await Author.findById(id);

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    res.json(author);
  } catch (error) {
    console.error("Error fetching author:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create an author
// @route POST /api/library/authors
exports.createAuthor = async (req, res) => {
  try {
    const {
      authorCode,
      name,
      alternativeNames,
      nationality,
      bio,
      website,
      specialization,
      status,
    } = req.body;

    // Validate required fields
    if (!authorCode || !name) {
      return res.status(400).json({
        message: "Author code and name are required",
      });
    }

    // Check if author with same code already exists
    const existingAuthor = await Author.findOne({
      authorCode: authorCode.toUpperCase(),
    });
    if (existingAuthor) {
      return res.status(400).json({
        message: "Author with this code already exists",
      });
    }

    const author = new Author({
      authorCode: authorCode.toUpperCase(),
      name,
      alternativeNames: alternativeNames || [],
      nationality: nationality || "",
      bio: bio || "",
      website: website || "",
      specialization: specialization || "",
      status: status || "active",
    });

    await author.save();

    res.status(201).json(author);
  } catch (error) {
    console.error("Error creating author:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Author with this code already exists",
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        error: error.message,
      });
    }

    res.status(400).json({
      message: "Invalid Data",
      error: error.message,
    });
  }
};

// @desc Update an author
// @route PUT /api/library/authors/:id
exports.updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      authorCode,
      name,
      alternativeNames,
      nationality,
      bio,
      website,
      specialization,
      status,
    } = req.body;

    const updateData = {};
    if (authorCode !== undefined) updateData.authorCode = authorCode.toUpperCase();
    if (name !== undefined) updateData.name = name;
    if (alternativeNames !== undefined) updateData.alternativeNames = alternativeNames;
    if (nationality !== undefined) updateData.nationality = nationality;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (status !== undefined) updateData.status = status;

    // Check if authorCode is being updated and if it conflicts with existing author
    if (authorCode) {
      const existingAuthor = await Author.findOne({
        authorCode: authorCode.toUpperCase(),
        _id: { $ne: id },
      });
      if (existingAuthor) {
        return res.status(400).json({
          message: "Author with this code already exists",
        });
      }
    }

    const author = await Author.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    res.json(author);
  } catch (error) {
    console.error("Error updating author:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Author with this code already exists",
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        error: error.message,
      });
    }

    res.status(400).json({
      message: "Update failed",
      error: error.message,
    });
  }
};

// @desc Delete an author
// @route DELETE /api/library/authors/:id
exports.deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const author = await Author.findByIdAndDelete(id);

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    res.json({
      message: "Author deleted successfully",
      data: author,
    });
  } catch (error) {
    console.error("Error deleting author:", error);
    res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};

