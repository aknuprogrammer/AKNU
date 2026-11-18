import { useState, useEffect } from "react";
import { routeMappingsApi, transportRoutesApi, vehiclesApi } from "../../services/apiService";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";

const RouteMapping = () => {
    const [mappings, setMappings] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingMapping, setEditingMapping] = useState(null);
    const [formData, setFormData] = useState({
        routeId: "",
        vehicleId: "",
        status: "active"
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [mappingsData, routesData, vehiclesData] = await Promise.all([
                routeMappingsApi.getAll(),
                transportRoutesApi.getAll(),
                vehiclesApi.getAll()
            ]);
            setMappings(Array.isArray(mappingsData) ? mappingsData : []);
            setRoutes(Array.isArray(routesData) ? routesData : []);
            setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
            setError(null);
        } catch (err) {
            setError("Failed to load route mapping data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMapping) {
                await routeMappingsApi.update(editingMapping._id, formData);
                showSuccessMessage("Route mapping updated successfully");
            } else {
                await routeMappingsApi.create(formData);
                showSuccessMessage("Route mapping created successfully");
            }
            fetchData();
            handleCloseForm();
        } catch (err) {
            showErrorMessage("Failed to save route mapping");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this route mapping?")) {
            try {
                await routeMappingsApi.delete(id);
                showSuccessMessage("Route mapping deleted successfully");
                fetchData();
            } catch (err) {
                showErrorMessage("Failed to delete route mapping");
            }
        }
    };

    const handleEdit = (mapping) => {
        setEditingMapping(mapping);
        setFormData({
            routeId: typeof mapping.routeId === 'object' ? mapping.routeId._id : mapping.routeId,
            vehicleId: typeof mapping.vehicleId === 'object' ? mapping.vehicleId._id : mapping.vehicleId,
            status: mapping.status
        });
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingMapping(null);
        setFormData({
            routeId: "",
            vehicleId: "",
            status: "active"
        });
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Route-Vehicle Mapping</h2>
                    <p className="text-sm text-gray-500">Assign specific vehicles to defined routes</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add Route Mapping
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mappings.map((mapping) => (
                            <tr key={mapping._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                    {typeof mapping.routeId === 'object' ? mapping.routeId.routeName : (routes.find(r => r._id === mapping.routeId)?.routeName || mapping.routeId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {typeof mapping.vehicleId === 'object' ? mapping.vehicleId.vehicleNumber : (vehicles.find(v => v._id === mapping.vehicleId)?.vehicleNumber || mapping.vehicleId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${mapping.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {mapping.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(mapping)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                                    <button onClick={() => handleDelete(mapping._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">{editingMapping ? "Edit Route Mapping" : "Add Route Mapping"}</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Route *</label>
                                <select
                                    value={formData.routeId}
                                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                >
                                    <option value="">Select Route</option>
                                    {routes.map(r => (
                                        <option key={r._id} value={r._id}>{r.routeName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
                                <select
                                    value={formData.vehicleId}
                                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                >
                                    <option value="">Select Vehicle</option>
                                    {vehicles.map(v => (
                                        <option key={v._id} value={v._id}>{v.vehicleNumber}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
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
                            <div className="flex justify-end gap-3 pt-4 border-t">
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

export default RouteMapping;
