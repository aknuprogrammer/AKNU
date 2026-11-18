# GlobalTable Component - Complete Documentation

## 📋 Overview

GlobalTable is a highly customizable, reusable table component for React that supports various data types, cell formats, and actions with consistent styling.

## 🚀 Installation & Basic Usage

```jsx
import React from 'react';
import GlobalTable from './components/GlobalTable';

const MyComponent = () => {
  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' }
  ];

  const columns = [
    { key: 'id', title: 'ID', cellType: 'text' },
    { key: 'name', title: 'Name', cellType: 'text' },
    { key: 'email', title: 'Email', cellType: 'text' },
    { 
      key: 'status', 
      title: 'Status', 
      cellType: 'status',
      statusColors: {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800'
      }
    }
  ];

  return (
    <GlobalTable
      data={data}
      columns={columns}
      striped={true}
      hoverable={true}
    />
  );
};
```

## ⚙️ Props Reference

### Main Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | Array | `[]` | Array of objects to display (required) |
| `columns` | Array | `[]` | Column configuration (required) |
| `actions` | Array | `[]` | Action buttons configuration |
| `emptyState` | Object | `{title: "No records found", message: "No data available..."}` | Empty state configuration |
| `className` | String | `""` | Additional CSS classes for table container |
| `striped` | Boolean | `true` | Alternate row background colors |
| `hoverable` | Boolean | `true` | Show hover effect on rows |
| `fixedActions` | Boolean | `false` | Fix actions column to the right |
| `loading` | Boolean | `false` | Show loading skeleton |
| `onActionClick` | Function | `() => {}` | Callback when action is clicked |
| `onCellClick` | Function | `() => {}` | Callback when cell/row is clicked |

## 📊 Column Configuration

### Column Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `key` | String | - | **Required** - Data property key |
| `title` | String | - | **Required** - Column header text |
| `cellType` | String | `'text'` | Cell rendering type |
| `placeholder` | String | `'-'` | Placeholder for empty values |
| `badgeColor` | String | `'bg-gray-100 text-gray-800'` | Tailwind classes for badge background/text |
| `statusColors` | Object | `{}` | Color mapping for status values |
| `trueText` | String | `'Yes'` | Text for boolean true values |
| `falseText` | String | `'No'` | Text for boolean false values |
| `currency` | String | `'INR'` | Currency code for currency formatting |
| `avatarFallback` | String | `'NA'` | Fallback text for avatar |
| `format` | Function | - | Custom formatting function |
| `render` | Function | - | Custom render function (overrides cellType) |
| `headerClassName` | String | `''` | Additional CSS classes for header |
| `cellClassName` | String | `''` | Additional CSS classes for cells |
| `fixed` | Boolean | `false` | Fix column to the right |

## 🎨 Cell Types

### 1. Text (`cellType: 'text'`)
Basic text display with placeholder for empty values.

```jsx
{
  key: 'name',
  title: 'Name',
  cellType: 'text',
  placeholder: 'Unknown' // Optional
}
```

### 2. Badge (`cellType: 'badge'`)
Colored badge with customizable colors.

```jsx
{
  key: 'role',
  title: 'Role',
  cellType: 'badge',
  badgeColor: 'bg-purple-100 text-purple-800',
  placeholder: 'No role'
}
```

### 3. Status (`cellType: 'status'`)
Status indicators with color coding.

```jsx
{
  key: 'status',
  title: 'Status',
  cellType: 'status',
  statusColors: {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800'
  }
}
```

### 4. Boolean (`cellType: 'boolean'`)
Yes/No indicators with colors.

```jsx
{
  key: 'isActive',
  title: 'Active',
  cellType: 'boolean',
  trueText: 'Enabled',  // Optional
  falseText: 'Disabled' // Optional
}
```

### 5. Number (`cellType: 'number'`)
Number formatting with custom formatter.

```jsx
{
  key: 'quantity',
  title: 'Quantity',
  cellType: 'number',
  format: (value) => value.toLocaleString() // Optional
}
```

### 6. Currency (`cellType: 'currency'`)
Currency formatting.

```jsx
{
  key: 'price',
  title: 'Price',
  cellType: 'currency',
  currency: 'USD' // Optional, defaults to INR
}
```

### 7. Percentage (`cellType: 'percentage'`)
Percentage display.

```jsx
{
  key: 'completion',
  title: 'Completion',
  cellType: 'percentage'
}
// Displays: 75%
```

### 8. Date (`cellType: 'date'`)
Date formatting.

```jsx
{
  key: 'createdAt',
  title: 'Created Date',
  cellType: 'date',
  placeholder: 'Not set'
}
// Displays: 1/15/2024
```

### 9. DateTime (`cellType: 'datetime'`)
Date and time formatting.

```jsx
{
  key: 'lastLogin',
  title: 'Last Login',
  cellType: 'datetime'
}
// Displays: 1/15/2024, 10:30:00 AM
```

### 10. Avatar (`cellType: 'avatar'`)
Image avatars with fallback.

```jsx
{
  key: 'avatar',
  title: 'Avatar',
  cellType: 'avatar',
  avatarFallback: 'User' // Optional
}
```

### 11. Custom (`cellType: 'custom'` or `render` function)
Fully custom cell rendering.

```jsx
{
  key: 'progress',
  title: 'Progress',
  cellType: 'custom',
  render: (value, row) => (
    <div className="flex items-center gap-2">
      <div className="w-20 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-600 h-2 rounded-full" 
          style={{ width: `${value}%` }}
        ></div>
      </div>
      <span>{value}%</span>
    </div>
  )
}
```

## 🔧 Actions Configuration

### Action Properties

| Property | Type | Description |
|----------|------|-------------|
| `type` | String | Action identifier |
| `icon` | ReactNode | Icon component or emoji |
| `text` | String | Optional button text |
| `title` | String | Tooltip text |
| `className` | String | CSS classes for styling |
| `disabled` | Function | Function that returns boolean to disable action |

### Actions Example

```jsx
const actions = [
  {
    type: 'edit',
    icon: '✏️',
    title: 'Edit Item',
    className: 'text-blue-600 hover:text-blue-900'
  },
  {
    type: 'delete',
    icon: '🗑️',
    title: 'Delete Item',
    className: 'text-red-600 hover:text-red-900',
    disabled: (row) => row.status === 'completed'
  },
  {
    type: 'view',
    icon: '👁️',
    text: 'View', // Shows text alongside icon
    title: 'View Details',
    className: 'text-green-600 hover:text-green-900'
  }
];
```

## 📝 Complete Examples

### Example 1: User Management Table

```jsx
import React from 'react';
import GlobalTable from './GlobalTable';

const UserTable = ({ users, onEdit, onDelete }) => {
  const columns = [
    {
      key: 'id',
      title: 'ID',
      cellType: 'text',
      cellClassName: 'font-mono text-gray-600'
    },
    {
      key: 'name',
      title: 'Full Name',
      cellType: 'text',
      cellClassName: 'font-medium text-gray-900'
    },
    {
      key: 'email',
      title: 'Email Address',
      cellType: 'text'
    },
    {
      key: 'role',
      title: 'Role',
      cellType: 'badge',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      key: 'status',
      title: 'Status',
      cellType: 'status',
      statusColors: {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800'
      }
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      cellType: 'datetime',
      placeholder: 'Never logged in'
    },
    {
      key: 'loginCount',
      title: 'Logins',
      cellType: 'number'
    }
  ];

  const actions = [
    {
      type: 'edit',
      icon: '✏️',
      title: 'Edit User',
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      type: 'delete',
      icon: '🗑️',
      title: 'Delete User',
      className: 'text-red-600 hover:text-red-900',
      disabled: (user) => user.status === 'active'
    }
  ];

  const handleAction = (actionType, user) => {
    if (actionType === 'edit') onEdit(user);
    if (actionType === 'delete') onDelete(user);
  };

  return (
    <GlobalTable
      data={users}
      columns={columns}
      actions={actions}
      onActionClick={handleAction}
      striped={true}
      hoverable={true}
      fixedActions={true}
    />
  );
};
```

### Example 2: Product Inventory

```jsx
const ProductTable = ({ products }) => {
  const columns = [
    {
      key: 'sku',
      title: 'SKU',
      cellType: 'text',
      cellClassName: 'font-mono'
    },
    {
      key: 'name',
      title: 'Product Name',
      cellType: 'text'
    },
    {
      key: 'category',
      title: 'Category',
      cellType: 'badge',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      key: 'price',
      title: 'Price',
      cellType: 'currency',
      currency: 'USD'
    },
    {
      key: 'stock',
      title: 'Stock',
      cellType: 'number',
      render: (value, product) => (
        <span className={value === 0 ? 'text-red-600 font-medium' : ''}>
          {value} units
        </span>
      )
    },
    {
      key: 'inStock',
      title: 'In Stock',
      cellType: 'boolean',
      trueText: 'Available',
      falseText: 'Out of Stock'
    },
    {
      key: 'rating',
      title: 'Rating',
      cellType: 'percentage',
      render: (value) => (
        <div className="flex items-center">
          <span className="text-yellow-500">⭐</span>
          <span className="ml-1">{value}/5</span>
        </div>
      )
    }
  ];

  return (
    <GlobalTable
      data={products}
      columns={columns}
      striped={true}
      hoverable={true}
    />
  );
};
```

### Example 3: Financial Report

```jsx
const FinancialTable = ({ data }) => {
  const columns = [
    {
      key: 'account',
      title: 'Account',
      cellType: 'text'
    },
    {
      key: 'current',
      title: 'Current Period',
      cellType: 'currency'
    },
    {
      key: 'previous',
      title: 'Previous Period',
      cellType: 'currency'
    },
    {
      key: 'growth',
      title: 'Growth %',
      cellType: 'percentage',
      render: (value, row) => (
        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
          {value >= 0 ? '↗' : '↘'} {value}%
        </span>
      )
    },
    {
      key: 'trend',
      title: 'Trend',
      cellType: 'status',
      statusColors: {
        up: 'bg-green-100 text-green-800',
        down: 'bg-red-100 text-red-800',
        stable: 'bg-gray-100 text-gray-800'
      }
    }
  ];

  return (
    <GlobalTable
      data={data}
      columns={columns}
      striped={true}
      onCellClick={(type, row, index, columnKey) => {
        console.log('Clicked:', { type, row, columnKey });
      }}
    />
  );
};
```

### Example 4: With Loading & Empty States

```jsx
const DataTable = ({ data, loading }) => {
  const columns = [
    { key: 'id', title: 'ID', cellType: 'text' },
    { key: 'title', title: 'Title', cellType: 'text' },
    { key: 'status', title: 'Status', cellType: 'status' }
  ];

  const emptyState = {
    title: "No data available",
    message: "There are no records to display at the moment.",
    action: "Create New Record",
    onAction: () => console.log("Create new record")
  };

  return (
    <GlobalTable
      data={data}
      columns={columns}
      loading={loading}
      emptyState={emptyState}
      striped={true}
      hoverable={true}
    />
  );
};
```

## 🎨 Styling & Customization

### Static Styling (Never Changes)
- **Header**: `bg-[#525B88] text-white`
- **Cells**: `px-6 py-4 text-sm text-gray-900`
- **Striped Rows**: `bg-gray-50` on even rows
- **Hover**: `hover:bg-gray-50` on rows
- **Borders**: `divide-gray-200` between rows

### Custom CSS Classes
You can add custom classes to headers and cells:

```jsx
const columns = [
  {
    key: 'priority',
    title: 'Priority',
    cellType: 'text',
    headerClassName: 'text-center', // Custom header class
    cellClassName: 'text-center font-bold' // Custom cell class
  }
];
```

## 🔄 Event Handlers

### onActionClick
```jsx
const handleAction = (actionType, row, rowIndex) => {
  console.log('Action:', actionType);
  console.log('Row data:', row);
  console.log('Row index:', rowIndex);
  
  switch (actionType) {
    case 'edit':
      // Handle edit
      break;
    case 'delete':
      // Handle delete
      break;
  }
};
```

### onCellClick
```jsx
const handleCellClick = (type, row, rowIndex, columnKey) => {
  console.log('Clicked:', type); // 'cell' or 'row'
  console.log('Row data:', row);
  console.log('Row index:', rowIndex);
  console.log('Column key:', columnKey); // Only for cell clicks
};
```

## 💡 Best Practices

### 1. Always provide unique keys
```jsx
// Good
{ key: 'userId', title: 'User ID' }

// Avoid
{ key: 'id', title: 'ID' } // Might conflict with other tables
```

### 2. Use appropriate cell types
```jsx
// For status values
cellType: 'status'

// For yes/no values  
cellType: 'boolean'

// For monetary values
cellType: 'currency'
```

### 3. Handle loading states
```jsx
<GlobalTable
  data={data}
  columns={columns}
  loading={isLoading}
  emptyState={emptyState}
/>
```

### 4. Use custom rendering for complex cells
```jsx
{
  key: 'progress',
  title: 'Progress',
  render: (value, row) => (
    <div className="flex items-center gap-2">
      <ProgressBar value={value} />
      <span>{value}%</span>
    </div>
  )
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Data not displaying**: Ensure `key` in columns matches property names in data objects
2. **Actions not working**: Check that `onActionClick` prop is provided
3. **Styling issues**: Verify Tailwind CSS is properly configured
4. **Empty table**: Check if `data` array is empty and `loading` is false

### Performance Tips

1. **Memoize columns and actions** if they're created inside components
2. **Use React.memo** for the table if data doesn't change frequently
3. **Virtualize** for very large datasets (consider using react-window)

This GlobalTable component provides a consistent, reusable table solution with your exact design system while being completely customizable for any data type!