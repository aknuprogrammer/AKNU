const BookCategory = require("../../models/library/BookCategory");

// @desc Get all book categories
// @route GET /api/library/book-categories
exports.getBookCategories = async (req, res) => {
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
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const categories = await BookCategory.find(query)
      .sort({ createdAt: -1 });

    res.json(categories);
  } catch (error) {
    console.error("Error fetching book categories:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get book category by ID
// @route GET /api/library/book-categories/:id
exports.getBookCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await BookCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Book category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error fetching book category:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create a book category
// @route POST /api/library/book-categories
exports.createBookCategory = async (req, res) => {
  try {
    const { code, name, description, status } = req.body;

    // Validate required fields
    if (!code || !name) {
      return res.status(400).json({
        message: "Code and name are required",
      });
    }

    // Check if category with same code already exists
    const existingCategory = await BookCategory.findOne({ code: code.toUpperCase() });
    if (existingCategory) {
      return res.status(400).json({
        message: "Category with this code already exists",
      });
    }

    const category = new BookCategory({
      code: code.toUpperCase(),
      name,
      description: description || "",
      status: status || "active",
    });

    await category.save();

    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating book category:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Category with this code already exists",
        error: error.message,
      });
    }

    res.status(400).json({
      message: "Invalid Data",
      error: error.message,
    });
  }
};

// @desc Update a book category
// @route PUT /api/library/book-categories/:id
exports.updateBookCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, status } = req.body;

    const updateData = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    // Check if code is being updated and if it conflicts with existing category
    if (code) {
      const existingCategory = await BookCategory.findOne({
        code: code.toUpperCase(),
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res.status(400).json({
          message: "Category with this code already exists",
        });
      }
    }

    const category = await BookCategory.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({ message: "Book category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error updating book category:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Category with this code already exists",
        error: error.message,
      });
    }

    res.status(400).json({
      message: "Update failed",
      error: error.message,
    });
  }
};

// @desc Delete a book category
// @route DELETE /api/library/book-categories/:id
exports.deleteBookCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await BookCategory.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Book category not found" });
    }

    res.json({
      message: "Book category deleted successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error deleting book category:", error);
    res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};

