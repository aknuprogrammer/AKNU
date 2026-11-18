import { useState, useEffect } from "react";
import { transportRoutesApi } from "../../services/apiService";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";

const Routes = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [formData, setFormData] = useState({
        routeName: "",
        distance: "",
        estimatedTime: "",
        status: "active",
        stops: []
    });
    const [newStop, setNewStop] = useState("");

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const data = await transportRoutesApi.getAll();
            setRoutes(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError("Failed to load routes");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRoute) {
                await transportRoutesApi.update(editingRoute._id, formData);
                showSuccessMessage("Route updated successfully");
            } else {
                await transportRoutesApi.create(formData);
                showSuccessMessage("Route created successfully");
            }
            fetchRoutes();
            handleCloseForm();
        } catch (err) {
            showErrorMessage("Failed to save route");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this route?")) {
            try {
                await transportRoutesApi.delete(id);
                showSuccessMessage("Route deleted successfully");
                fetchRoutes();
            } catch (err) {
                showErrorMessage("Failed to delete route");
            }
        }
    };

    const handleEdit = (route) => {
        setEditingRoute(route);
        setFormData({
            routeName: route.routeName,
            distance: route.distance || "",
            estimatedTime: route.estimatedTime || "",
            status: route.status,
            stops: route.stops || []
        });
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingRoute(null);
        setFormData({
            routeName: "",
            distance: "",
            estimatedTime: "",
            status: "active",
            stops: []
        });
        setNewStop("");
    };

    const addStop = () => {
        if (newStop.trim()) {
            setFormData({
                ...formData,
                stops: [...formData.stops, newStop.trim()]
            });
            setNewStop("");
        }
    };

    const removeStop = (index) => {
        setFormData({
            ...formData,
            stops: formData.stops.filter((_, i) => i !== index)
        });
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Routes</h2>
                    <p className="text-sm text-gray-500">Manage transport pathways and schedules</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add Route
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stops</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance (KM)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {routes.map((route) => (
                            <tr key={route._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{route.routeName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="max-w-xs overflow-hidden text-ellipsis">
                                        <span className="font-semibold text-blue-600 mr-2">{route.stops?.length || 0} stops:</span>
                                        <span title={route.stops?.join(", ")}>{route.stops?.join(", ") || "No stops added"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.distance}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.estimatedTime}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${route.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {route.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(route)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                                    <button onClick={() => handleDelete(route._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">{editingRoute ? "Edit Route" : "Add Route"}</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Route Name *</label>
                                <input
                                    type="text"
                                    value={formData.routeName}
                                    onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stops</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newStop}
                                        onChange={(e) => setNewStop(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStop())}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="Add a stop name..."
                                    />
                                    <button
                                        type="button"
                                        onClick={addStop}
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                                    {formData.stops.length === 0 && <span className="text-gray-400 text-sm">No stops added yet</span>}
                                    {formData.stops.map((stop, index) => (
                                        <span key={index} className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm border border-blue-100">
                                            {stop}
                                            <button
                                                type="button"
                                                onClick={() => removeStop(index)}
                                                className="ml-2 text-blue-400 hover:text-blue-600 font-bold"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Distance (KM) *</label>
                                <input
                                    type="number"
                                    value={formData.distance}
                                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Est. Time *</label>
                                <input
                                    type="text"
                                    value={formData.estimatedTime}
                                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="e.g., 45 mins"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="col-span-2 flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={handleCloseForm} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Routes;
