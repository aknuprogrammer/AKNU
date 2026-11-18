import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

const ResultUpload = () => {
  const [uploadStatus, setUploadStatus] = useState('idle');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Result Upload & Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bulk Upload */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Bulk Result Upload</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-4xl mb-2">📤</div>
            <p className="text-gray-600 mb-4">Upload CSV file with results data</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Select CSV File
            </button>
            <p className="text-xs text-gray-500 mt-2">Download template format</p>
          </div>
        </div>

        {/* Manual Entry */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Manual Result Entry</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Roll No</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option>Advanced Algorithms</option>
                <option>Database Systems</option>
                <option>Software Engineering</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
              <input type="number" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <button type="button" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
              Add Result
            </button>
          </form>
        </div>
      </div>

      {/* Result Approval Workflow */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Result Approval Workflow</h3>
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">📊</div>
            <div>
              <p className="font-medium">Computer Science - Semester 6 Results</p>
              <p className="text-sm text-gray-600">125 students • Uploaded on 2024-01-15</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Review Results
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Approve & Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultDeclaration = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Result Declaration</h2>
      
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Ready for Publication</h3>
        </div>
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Semester</th>
                <th className="px-4 py-3 text-left">Students</th>
                <th className="px-4 py-3 text-left">Approval Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { department: 'Computer Science', semester: '6', students: 125, status: 'Approved' },
                { department: 'Electronics', semester: '4', students: 89, status: 'Pending' },
                { department: 'Mechanical', semester: '8', students: 67, status: 'Approved' },
              ].map((result, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-4 py-3">{result.department}</td>
                  <td className="px-4 py-3">Semester {result.semester}</td>
                  <td className="px-4 py-3">{result.students} students</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Preview</button>
                      <button className="text-green-600 hover:text-green-800 text-sm">Publish</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">Hold</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publication Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Publication Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date & Time</label>
            <input type="datetime-local" className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMS Notification</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>Send to all students</option>
              <option>Send only to failed students</option>
              <option>Do not send SMS</option>
            </select>
          </div>
        </div>
        <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
          Schedule Publication
        </button>
      </div>
    </div>
  );
};

const Results = () => {
  const location = useLocation();
  const tabs = [
    { path: '', label: 'Upload Results', component: <ResultUpload /> },
    { path: '/declaration', label: 'Result Declaration', component: <ResultDeclaration /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Results Management</h1>
        <span className="text-sm text-gray-500">Admin Control Panel</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab, index) => (
            <Link
              key={index}
              to={`/results${tab.path}`}
              className={`flex-1 min-w-max px-6 py-4 text-center border-b-2 font-medium transition-colors ${
                location.pathname === `/results${tab.path}`
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        
        <div className="p-6">
          <Routes>
            <Route path="/" element={<ResultUpload />} />
            <Route path="/declaration" element={<ResultDeclaration />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Results;