import React, { useState, useEffect } from "react";
import { Plus, BookOpen } from "lucide-react";
import AddFormModal from "../AddFormModal";
import { showSuccessMessage, showAxiosError } from "../../../config/Toast";
import {
  bookCategoriesApi,
  authorsApi,
  publishersApi,
  racksApi,
} from "../../../services/apiService";

const AddBook = () => {
  const [showModal, setShowModal] = useState(false);
  const [masterData, setMasterData] = useState({
    categories: [],
    authors: [],
    publishers: [],
    racks: [],
  });
  const [loading, setLoading] = useState(false);

  // Fetch master data from APIs - EXACT same approach as BookCategories component
  const fetchMasterData = async () => {
    try {
      setLoading(true);
      
      console.log("🔄 Starting to fetch master data from APIs...");
      console.log("API Endpoints being called:");
      console.log("  - Categories: library/book-categories");
      console.log("  - Authors: library/authors");
      console.log("  - Publishers: library/publishers");
      console.log("  - Racks: library/racks");
      
      // Fetch categories - same as BookCategories.jsx line 42
      const categoriesParams = {}; // Empty params = fetch all (like BookCategories)
      console.log("📡 Calling bookCategoriesApi.getAll()...");
      const categories = await bookCategoriesApi.getAll(categoriesParams);
      console.log("✅ Categories response:", categories);
      
      // Fetch authors - same pattern
      const authorsParams = {}; // Empty params = fetch all
      console.log("📡 Calling authorsApi.getAll()...");
      const authors = await authorsApi.getAll(authorsParams);
      console.log("✅ Authors response:", authors);
      
      // Fetch publishers - same pattern
      const publishersParams = {}; // Empty params = fetch all
      console.log("📡 Calling publishersApi.getAll()...");
      const publishers = await publishersApi.getAll(publishersParams);
      console.log("✅ Publishers response:", publishers);
      
      // Fetch racks - same pattern
      const racksParams = {}; // Empty params = fetch all
      console.log("📡 Calling racksApi.getAll()...");
      const racks = await racksApi.getAll(racksParams);
      console.log("✅ Racks response:", racks);

      console.log("✅ Fetched master data from APIs:", {
        categories: Array.isArray(categories) ? categories.length : 0,
        authors: Array.isArray(authors) ? authors.length : 0,
        publishers: Array.isArray(publishers) ? publishers.length : 0,
        racks: Array.isArray(racks) ? racks.length : 0,
        sampleCategory: Array.isArray(categories) ? categories[0] : null,
        sampleAuthor: Array.isArray(authors) ? authors[0] : null,
        samplePublisher: Array.isArray(publishers) ? publishers[0] : null,
        sampleRack: Array.isArray(racks) ? racks[0] : null,
      });

      // Same as BookCategories.jsx line 43: Array.isArray(data) ? data : []
      setMasterData({
        categories: Array.isArray(categories) ? categories : [],
        authors: Array.isArray(authors) ? authors : [],
        publishers: Array.isArray(publishers) ? publishers : [],
        racks: Array.isArray(racks) ? racks : [],
      });
    } catch (err) {
      console.error("❌ Error fetching master data:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.status,
        response: err.response,
      });
      showAxiosError(err);
      // Set empty arrays on error
      setMasterData({
        categories: [],
        authors: [],
        publishers: [],
        racks: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch fresh data on mount
    fetchMasterData();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      // TODO: Call book API when backend is ready
      console.log("New book data:", formData);
      showSuccessMessage("Book added successfully!");
      setShowModal(false);
      // Refresh master data after adding
      fetchMasterData();
    } catch (err) {
      console.error("Error adding book:", err);
      showAxiosError(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Add New Book
        </h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-[#525b88] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Add a New Book to Library
          </h3>
          <p className="text-gray-600 mb-6">
            Fill in the book details to add it to the library inventory
          </p>
          <button
            onClick={async () => {
              // Always refresh data before opening modal to ensure fresh data
              await fetchMasterData();
              setShowModal(true);
            }}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 mr-2" />
            {loading ? "Loading..." : "Add New Book"}
          </button>
          {loading && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Loading master data...
            </p>
          )}
        </div>
      </div>

      {showModal && (
        <AddFormModal
          formType="libraryInventory"
          initialData={null}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            // Refresh data when modal closes
            fetchMasterData();
          }}
          masterData={masterData}
        />
      )}
    </div>
  );
};

export default AddBook;

