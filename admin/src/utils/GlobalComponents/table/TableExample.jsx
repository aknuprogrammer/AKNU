// components/ExampleUsage.jsx
import React, { useState, useEffect } from "react";
import UserTable from "./UserTable";

const ExampleUsage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setUsers([
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            role: "admin",
            status: "active",
            lastLogin: "2024-01-15T10:30:00",
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            role: "user",
            status: "inactive",
            lastLogin: "2024-01-10T14:20:00",
          },
          {
            id: 3,
            name: "Mike Johnson",
            email: "mike@example.com",
            role: "moderator",
            status: "pending",
            lastLogin: null,
          },
        ]);
        setLoading(false);
      }, 1500);
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>

        <UserTable users={users} loading={loading} />
      </div>
    </div>
  );
};

export default ExampleUsage;
