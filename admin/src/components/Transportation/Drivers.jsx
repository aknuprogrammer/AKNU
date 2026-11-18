import { useState, useEffect } from "react";
import { driversApi } from "../../services/apiService";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [formData, setFormData] = useState({
        driverName: "",
        licenseNumber: "",
        phone: "",
        experience: "",
        email: "",
        address: "",
        status: "active"
    });

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const data = await driversApi.getAll();
            setDrivers(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError("Failed to load drivers");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDriver) {
                await driversApi.update(editingDriver._id, formData);
                showSuccessMessage("Driver updated successfully");
            } else {
                await driversApi.create(formData);
                showSuccessMessage("Driver created successfully");
            }
            fetchDrivers();
            handleCloseForm();
        } catch (err) {
            showErrorMessage("Failed to save driver");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this driver?")) {
            try {
                await driversApi.delete(id);
                showSuccessMessage("Driver deleted successfully");
                fetchDrivers();
            } catch (err) {
                showErrorMessage("Failed to delete driver");
            }
        }
    };

    const handleEdit = (driver) => {
        setEditingDriver(driver);
        setFormData({
            driverName: driver.driverName,
            licenseNumber: driver.licenseNumber,
            phone: driver.phone,
            experience: driver.experience || "",
            email: driver.email || "",
            address: driver.address || "",
            status: driver.status
        });
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingDriver(null);
        setFormData({
            driverName: "",
            licenseNumber: "",
            phone: "",
            experience: "",
            email: "",
            address: "",
            status: "active"
        });
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Drivers</h2>
                    <p className="text-sm text-gray-500">Manage transport personnel and licenses</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add Driver
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {drivers.map((driver) => (
                            <tr key={driver._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{driver.driverName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.licenseNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {driver.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(driver)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                                    <button onClick={() => handleDelete(driver._id)} className="text-red-600 hover:text-red-900">Delete</button>
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
                            <h3 className="text-lg font-bold text-gray-900">{editingDriver ? "Edit Driver" : "Add Driver"}</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name *</label>
                                <input
                                    type="text"
                                    value={formData.driverName}
                                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                                <input
                                    type="text"
                                    value={formData.licenseNumber}
                                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
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

export default Drivers;
