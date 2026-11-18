import React, { useState, useMemo, useEffect } from "react";
import {
    Plus,
    Download,
    Eye,
    Search,
    Filter,
    BookOpen,
    Video,
    FileText,
    ExternalLink,
    TrendingUp,
    Clock,
    X
} from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { digitalResourcesApi, authorsApi, bookCategoriesApi, libraryInfoApi } from "../../services/apiService";
import { toast } from "react-hot-toast";

const ResourceCard = ({ resource, onView, onDownload, onEdit, onDelete }) => {
    const getTypeIcon = (type) => {
        switch (type) {
            case "ebook":
                return <BookOpen className="w-5 h-5" />;
            case "video":
            case "course":
                return <Video className="w-5 h-5" />;
            case "document":
                return <FileText className="w-5 h-5" />;
            default:
                return <BookOpen className="w-5 h-5" />;
        }
    };

    const getAccessBadge = (accessType) => {
        const badges = {
            free: "bg-green-100 text-green-800",
            premium: "bg-purple-100 text-purple-800",
            restricted: "bg-red-100 text-red-800"
        };
        return badges[accessType] || "bg-gray-100 text-gray-800";
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "N/A";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1048576).toFixed(1) + " MB";
    };

    const formatDuration = (minutes) => {
        if (!minutes) return null;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const authorName = typeof resource.author === 'object' ? resource.author?.name : resource.author;
    const categoryName = typeof resource.category === 'object' ? resource.category?.name : resource.category;

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            {/* Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-[#525b88] to-[#3a4377] flex items-center justify-center">
                <div className="text-white text-6xl opacity-20">
                    {getTypeIcon(resource.resourceType)}
                </div>
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getAccessBadge(resource.accessType)}`}>
                        {resource.accessType}
                    </span>
                </div>
                <div className="absolute top-2 left-2 bg-white rounded-full p-2">
                    {getTypeIcon(resource.resourceType)}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 h-12">
                    {resource.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">by {authorName || "Unknown"}</p>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {resource.description || "No description available"}
                </p>

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {resource.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {resource.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {resource.downloads || 0}
                        </span>
                    </div>
                    {resource.duration && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(resource.duration)}
                        </span>
                    )}
                </div>

                {/* File Info */}
                <div className="text-xs text-gray-500 mb-3">
                    {resource.fileFormat && <span className="uppercase">{resource.fileFormat}</span>}
                    {resource.fileSize && <span> • {formatFileSize(resource.fileSize)}</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onView(resource)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                    </button>
                    <button
                        onClick={() => onDownload(resource)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                    </button>
                    {resource.externalLink && (
                        <button
                            onClick={() => window.open(resource.externalLink, "_blank")}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Admin Actions */}
                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                    <button
                        onClick={() => onEdit(resource)}
                        className="flex-1 text-[#525b88] hover:text-[#3a4166] text-sm flex items-center justify-center"
                    >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(resource._id)}
                        className="flex-1 text-red-500 hover:text-red-700 text-sm flex items-center justify-center"
                    >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddEditModal = ({ isOpen, onClose, onSubmit, editData, authors, categories, libraries = [] }) => {
    const [formData, setFormData] = useState({
        resourceType: "ebook",
        title: "",
        author: "",
        category: "",
        description: "",
        fileUrl: "",
        fileSize: 0,
        fileFormat: "pdf",
        thumbnail: "",
        accessType: "free",
        tags: "",
        status: "active",
        externalLink: "",
        duration: 0,
        language: "English",
        library: ""
    });

    useEffect(() => {
        if (editData) {
            setFormData({
                ...editData,
                author: typeof editData.author === 'object' ? editData.author._id : editData.author,
                category: typeof editData.category === 'object' ? editData.category._id : editData.category,
                tags: Array.isArray(editData.tags) ? editData.tags.join(", ") : "",
                library: typeof editData.library === 'object' ? editData.library?._id : (editData.library || "")
            });
        } else {
            setFormData({
                resourceType: "ebook",
                title: "",
                author: "",
                category: "",
                description: "",
                fileUrl: "",
                fileSize: 0,
                fileFormat: "pdf",
                thumbnail: "",
                accessType: "free",
                tags: "",
                status: "active",
                externalLink: "",
                duration: 0,
                language: "English",
                library: ""
            });
        }
    }, [editData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
        };
        onSubmit(submitData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-[#525b88] to-[#3a4377] px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">
                        {editData ? "Edit Resource" : "Upload New Resource"}
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Library *</label>
                            <select
                                value={formData.library}
                                onChange={(e) => setFormData({ ...formData, library: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            >
                                <option value="">Select Library</option>
                                {libraries.map((lib) => (
                                    <option key={lib._id} value={lib._id}>
                                        {lib.name} ({lib.libraryCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type *</label>
                            <select
                                value={formData.resourceType}
                                onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            >
                                <option value="ebook">E-Book</option>
                                <option value="course">Course</option>
                                <option value="video">Video</option>
                                <option value="document">Document</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                            <select
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            >
                                <option value="">Select Author</option>
                                {authors.map((author) => (
                                    <option key={author._id} value={author._id}>
                                        {author.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
                            <input
                                type="url"
                                value={formData.fileUrl}
                                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                placeholder="https://example.com/file.pdf"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">File Format</label>
                            <select
                                value={formData.fileFormat}
                                onChange={(e) => setFormData({ ...formData, fileFormat: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                            >
                                <option value="pdf">PDF</option>
                                <option value="epub">EPUB</option>
                                <option value="mobi">MOBI</option>
                                <option value="mp4">MP4</option>
                                <option value="avi">AVI</option>
                                <option value="mkv">MKV</option>
                                <option value="zip">ZIP</option>
                                <option value="rar">RAR</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">File Size (bytes)</label>
                            <input
                                type="number"
                                value={formData.fileSize}
                                onChange={(e) => setFormData({ ...formData, fileSize: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Access Type *</label>
                            <select
                                value={formData.accessType}
                                onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            >
                                <option value="free">Free</option>
                                <option value="premium">Premium</option>
                                <option value="restricted">Restricted</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">External Link</label>
                            <input
                                type="url"
                                value={formData.externalLink}
                                onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                placeholder="https://coursera.org/course"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                            <input
                                type="text"
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            >
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                                <option value="pending_review">Pending Review</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                placeholder="programming, python, tutorial"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166]"
                        >
                            {editData ? "Update" : "Upload"} Resource
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DigitalLibrary = () => {
    const [resources, setResources] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [libraries, setLibraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        resourceType: "",
        category: "",
        accessType: "",
        fileFormat: ""
    });
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        fetchResources();
        fetchMasterData();
    }, [filters]);

    const fetchMasterData = async () => {
        try {
            const [authorsData, categoriesData, librariesData] = await Promise.all([
                authorsApi.getAll(),
                bookCategoriesApi.getAll(),
                libraryInfoApi.getAll()
            ]);
            setAuthors(Array.isArray(authorsData) ? authorsData : []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            setLibraries(Array.isArray(librariesData) ? librariesData : []);
        } catch (error) {
            console.error("Error fetching master data:", error);
        }
    };

    const fetchResources = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (filters.resourceType) params.resourceType = filters.resourceType;
            if (filters.category) params.category = filters.category;
            if (filters.accessType) params.accessType = filters.accessType;
            if (filters.fileFormat) params.fileFormat = filters.fileFormat;

            const data = await digitalResourcesApi.getAll(params);
            setResources(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching resources:", error);
            toast.error("Failed to load resources");
            setResources([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchResources();
    };

    const handleView = async (resource) => {
        try {
            await digitalResourcesApi.incrementView(resource._id);
            if (resource.fileUrl) {
                window.open(resource.fileUrl, "_blank");
            } else if (resource.externalLink) {
                window.open(resource.externalLink, "_blank");
            } else {
                toast.error("No file URL available");
            }
            fetchResources(); // Refresh to show updated view count
        } catch (error) {
            console.error("Error viewing resource:", error);
            toast.error("Failed to open resource");
        }
    };

    const handleDownload = async (resource) => {
        try {
            await digitalResourcesApi.incrementDownload(resource._id);
            if (resource.fileUrl) {
                window.open(resource.fileUrl, "_blank");
                toast.success("Download started");
            } else {
                toast.error("No file URL available");
            }
            fetchResources(); // Refresh to show updated download count
        } catch (error) {
            console.error("Error downloading resource:", error);
            toast.error("Failed to download resource");
        }
    };

    const handleEdit = (resource) => {
        setEditData(resource);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this resource?")) {
            try {
                await digitalResourcesApi.delete(id);
                toast.success("Resource deleted successfully!");
                fetchResources();
            } catch (error) {
                console.error("Error deleting resource:", error);
                toast.error("Failed to delete resource");
            }
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editData) {
                await digitalResourcesApi.update(editData._id, formData);
                toast.success("Resource updated successfully!");
            } else {
                await digitalResourcesApi.create(formData);
                toast.success("Resource uploaded successfully!");
            }
            setShowModal(false);
            fetchResources();
        } catch (error) {
            console.error("Error saving resource:", error);
            toast.error(error.response?.data?.message || "Failed to save resource");
        }
    };

    const summaryStats = useMemo(() => {
        return {
            totalResources: resources.length,
            ebooks: resources.filter(r => r.resourceType === "ebook").length,
            courses: resources.filter(r => r.resourceType === "course").length,
            videos: resources.filter(r => r.resourceType === "video").length,
            totalDownloads: resources.reduce((sum, r) => sum + (r.downloads || 0), 0),
            totalViews: resources.reduce((sum, r) => sum + (r.views || 0), 0)
        };
    }, [resources]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Loading resources...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex flex-row justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
                    Digital Library
                </h2>
                <button
                    onClick={() => { setEditData(null); setShowModal(true); }}
                    className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Resource
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Resources</p>
                            <p className="text-2xl font-bold text-[#525b88]">{summaryStats.totalResources}</p>
                        </div>
                        <BookOpen className="w-8 h-8 text-[#525b88]" />
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">E-Books</p>
                            <p className="text-2xl font-bold text-blue-600">{summaryStats.ebooks}</p>
                        </div>
                        <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Courses & Videos</p>
                            <p className="text-2xl font-bold text-purple-600">{summaryStats.courses + summaryStats.videos}</p>
                        </div>
                        <Video className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Downloads</p>
                            <p className="text-2xl font-bold text-green-600">{summaryStats.totalDownloads}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border border-[#525b88] shadow-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by title, author, or tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            />
                        </div>
                    </div>

                    {/* Type Filter */}
                    <select
                        value={filters.resourceType}
                        onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                    >
                        <option value="">All Types</option>
                        <option value="ebook">E-Books</option>
                        <option value="course">Courses</option>
                        <option value="video">Videos</option>
                        <option value="document">Documents</option>
                    </select>

                    {/* Access Type Filter */}
                    <select
                        value={filters.accessType}
                        onChange={(e) => setFilters({ ...filters, accessType: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                    >
                        <option value="">All Access</option>
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="restricted">Restricted</option>
                    </select>

                    {/* Format Filter */}
                    <select
                        value={filters.fileFormat}
                        onChange={(e) => setFilters({ ...filters, fileFormat: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                    >
                        <option value="">All Formats</option>
                        <option value="pdf">PDF</option>
                        <option value="epub">EPUB</option>
                        <option value="mp4">MP4</option>
                        <option value="zip">ZIP</option>
                    </select>
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {resources.map((resource) => (
                    <ResourceCard
                        key={resource._id}
                        resource={resource}
                        onView={handleView}
                        onDownload={handleDownload}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {resources.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No resources found matching your search criteria
                </div>
            )}

            {/* Add/Edit Modal */}
            <AddEditModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                editData={editData}
                authors={authors}
                categories={categories}
                libraries={libraries}
            />
        </div>
    );
};

export default DigitalLibrary;
