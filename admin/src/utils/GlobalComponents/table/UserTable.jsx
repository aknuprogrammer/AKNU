// components/UserTable.jsx
import React from "react";
import GlobalTable from "./Table";

const UserTable = ({ users }) => {
  const columns = [
    {
      key: "id",
      title: "ID",
      cellType: "text",
    },
    {
      key: "name",
      title: "Name",
      cellType: "text",
    },
    {
      key: "email",
      title: "Email",
      cellType: "text",
    },
    {
      key: "role",
      title: "Role",
      cellType: "badge",
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      key: "status",
      title: "Status",
      cellType: "status",
      statusColors: {
        active: "bg-green-100 text-green-800",
        inactive: "bg-red-100 text-red-800",
        pending: "bg-yellow-100 text-yellow-800",
      },
    },
    {
      key: "lastLogin",
      title: "Last Login",
      cellType: "datetime",
      placeholder: "Never logged in",
    },
  ];

  const actions = [
    {
      type: "edit",
      icon: "Edit",
      title: "Edit User",
      className: "text-green-600 hover:text-blue-900",
    },
    {
      type: "delete",
      icon: "Delete",
      title: "Delete User",
      className: "text-red-600 hover:text-red-900",
      disabled: (user) => user.status === "active",
    },
  ];

  const handleAction = (actionType, user) => {
    console.log(`${actionType} user:`, user);
  };

  return (
    <GlobalTable
      data={users}
      columns={columns}
      actions={actions}
      onActionClick={handleAction}
      striped={true}
      hoverable={true}
    />
  );
};

export default UserTable;
