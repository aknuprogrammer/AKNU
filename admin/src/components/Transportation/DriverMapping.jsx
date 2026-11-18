import { useState, useEffect } from "react";
import { driverMappingsApi, driversApi, vehiclesApi } from "../../services/apiService";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";

const DriverMapping = () => {
    const [mappings, setMappings] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingMapping, setEditingMapping] = useState(null);
    const [formData, setFormData] = useState({
        driverId: "",
        vehicleId: "",
        shift: "Morning",
        status: "active"
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [mappingsData, driversData, vehiclesData] = await Promise.all([
                driverMappingsApi.getAll(),
                driversApi.getAll(),
                vehiclesApi.getAll()
            ]);
            setMappings(Array.isArray(mappingsData) ? mappingsData : []);
            setDrivers(Array.isArray(driversData) ? driversData : []);
            setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
            setError(null);
        } catch (err) {
            setError("Failed to load mapping data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMapping) {
                await driverMappingsApi.update(editingMapping._id, formData);
                showSuccessMessage("Mapping updated successfully");
            } else {
                await driverMappingsApi.create(formData);
                showSuccessMessage("Mapping created successfully");
            }
            fetchData();
            handleCloseForm();
        } catch (err) {
            showErrorMessage("Failed to save mapping");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this mapping?")) {
            try {
                await driverMappingsApi.delete(id);
                showSuccessMessage("Mapping deleted successfully");
                fetchData();
            } catch (err) {
                showErrorMessage("Failed to delete mapping");
            }
        }
    };

    const handleEdit = (mapping) => {
        setEditingMapping(mapping);
        setFormData({
            driverId: typeof mapping.driverId === 'object' ? mapping.driverId._id : mapping.driverId,
            vehicleId: typeof mapping.vehicleId === 'object' ? mapping.vehicleId._id : mapping.vehicleId,
            shift: mapping.shift || "Morning",
            status: mapping.status
        });
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingMapping(null);
        setFormData({
            driverId: "",
            vehicleId: "",
            shift: "Morning",
            status: "active"
        });
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Driver Assignments</h2>
                    <p className="text-sm text-gray-500">Assign drivers to vehicles and shifts</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Assign Driver
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mappings.map((mapping) => (
                            <tr key={mapping._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                    {typeof mapping.driverId === 'object' ? mapping.driverId.driverName : (drivers.find(d => d._id === mapping.driverId)?.driverName || mapping.driverId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {typeof mapping.vehicleId === 'object' ? mapping.vehicleId.vehicleNumber : (vehicles.find(v => v._id === mapping.vehicleId)?.vehicleNumber || mapping.vehicleId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mapping.shift}</td>
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
                            <h3 className="text-lg font-bold text-gray-900">{editingMapping ? "Edit Assignment" : "Assign Driver"}</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Driver *</label>
                                <select
                                    value={formData.driverId}
                                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                >
                                    <option value="">Select Driver</option>
                                    {drivers.map(d => (
                                        <option key={d._id} value={d._id}>{d.driverName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
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
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shift *</label>
                                <select
                                    value={formData.shift}
                                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                >
                                    <option value="Morning">Morning</option>
                                    <option value="Afternoon">Afternoon</option>
                                    <option value="Full Day">Full Day</option>
                                </select>
                            </div>
                            <div className="col-span-2 md:col-span-1">
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

export default DriverMapping;
