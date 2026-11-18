# Hostel Management System - Frontend Components

## Overview
This directory contains all frontend components for the Hostel Management System (HMS). The components are built using reusable, efficient, and understandable code patterns.

## Directory Structure

```
Hostel/
├── shared/              # Reusable components
│   ├── FilterBar.jsx    # Reusable filter component
│   ├── StatusBadge.jsx  # Status badge with color coding
│   ├── Modal.jsx        # Reusable modal component
│   ├── DataTable.jsx    # Enhanced data table with sorting
│   ├── SummaryCard.jsx  # Statistics summary cards
│   └── index.js         # Shared components export
│
├── MasterData/          # Hostel master data management
│   └── HostelMaster.jsx # Hostel, block, room, bed management
│
├── Applications/        # Application management
│   └── ApplicationManagement.jsx # Student/staff applications
│
├── Allocations/         # Room allocation management
│   └── RoomAllocation.jsx # Room and bed allocations
│
├── Hostels.jsx          # Existing - Enhanced hostel list
├── Inventory.jsx        # Existing - Inventory management
├── Spend.jsx            # Existing - Consumption tracking
├── AddFormModal.jsx     # Existing - Form modal
└── index.js             # Main export file
```

## Reusable Components

### FilterBar
A flexible filter component that supports multiple filter types.

**Usage:**
```jsx
import { FilterBar } from "./shared";

const filterConfig = [
  {
    name: "name",
    type: "text",
    placeholder: "Search name...",
    label: "Name",
  },
  {
    name: "status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];

<FilterBar
  filters={filters}
  onFilter={handleFilter}
  filterConfig={filterConfig}
/>
```

### StatusBadge
Displays status with appropriate color coding.

**Usage:**
```jsx
import { StatusBadge } from "./shared";

<StatusBadge status="active" size="md" />
```

### Modal
Reusable modal component with consistent styling.

**Usage:**
```jsx
import { Modal } from "./shared";

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Modal Title"
  size="lg"
  footer={<div>Footer content</div>}
>
  Modal content
</Modal>
```

### DataTable
Enhanced data table with sorting, filtering, and actions.

**Usage:**
```jsx
import { DataTable } from "./shared";

const columns = [
  { key: "name", title: "Name", cellType: "text" },
  { key: "status", title: "Status", cellType: "custom", render: (value) => <StatusBadge status={value} /> },
];

<DataTable
  data={data}
  columns={columns}
  loading={loading}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
  sortConfig={sortConfig}
  onSort={handleSort}
/>
```

### SummaryCard
Displays key metrics and statistics.

**Usage:**
```jsx
import { SummaryCard } from "./shared";
import { Users } from "lucide-react";

<SummaryCard
  title="Total Users"
  value={100}
  icon={Users}
  color="blue"
  trend={{ positive: true, value: "+10%" }}
/>
```

## Main Components

### HostelMaster
Manages hostel master data including hostels, blocks, rooms, and beds.

**Features:**
- View all hostels
- Add/Edit hostel information
- View statistics (capacity, occupancy, etc.)
- Filter and sort hostels

**Route:** `/hostel/master`

### ApplicationManagement
Manages student/staff applications for hostel accommodation.

**Features:**
- View all applications
- Filter by status (pending, approved, rejected)
- Approve/Reject applications
- View application details

**Route:** `/hostel/applications`

### RoomAllocation
Manages room and bed allocations.

**Features:**
- View all allocations
- Create new allocations
- Edit/Delete allocations
- Filter by hostel, room, status

**Route:** `/hostel/allocations`

## Code Patterns

### State Management
- Use `useState` for local component state
- Use `useMemo` for computed/derived values
- Use `useEffect` for side effects (API calls)

### API Integration
```jsx
import { API } from "../../../config/urls";

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await API.get("/hostel");
    setData(response.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Filtering and Sorting
```jsx
const filteredAndSortedData = useMemo(() => {
  let filtered = data.filter(/* filter logic */);
  
  if (sortConfig.key) {
    filtered = [...filtered].sort(/* sort logic */);
  }
  
  return filtered;
}, [data, filters, sortConfig]);
```

## Styling

All components use Tailwind CSS with the project's color scheme:
- Primary: `#525b88`
- Secondary: `#3a4166`
- Accent: Emerald (for modals)

## Best Practices

1. **Reusability**: Use shared components whenever possible
2. **Performance**: Use `useMemo` for expensive computations
3. **Error Handling**: Always handle errors gracefully
4. **Loading States**: Show loading indicators during API calls
5. **Empty States**: Provide helpful empty state messages
6. **Accessibility**: Use semantic HTML and ARIA labels
7. **Code Comments**: Add JSDoc comments for complex functions

## Future Enhancements

- [ ] Add pagination to tables
- [ ] Add export functionality (CSV, PDF)
- [ ] Add bulk operations
- [ ] Add advanced filtering
- [ ] Add real-time updates
- [ ] Add drag-and-drop for room allocation
- [ ] Add visual room/bed map

## Notes

- All components are designed to work with the existing API structure
- Mock data is used for development - replace with actual API calls
- Components follow the existing code patterns in the project
- All routes are protected with role-based access control

