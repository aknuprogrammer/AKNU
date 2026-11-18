import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import RevaluationPayments from '../components/examination/postExamination/RevaluationPayments';
import Revaluation from '../components/examination/postExamination/Revaluation';
import CompletedRevaluations from '../components/examination/postExamination/CompletedRevaluations';

const RevaluationProcess = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Re-Valuation Process</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Script Retrieval */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Script Retrieval</h3>
          <div className="space-y-3">
            {[
              { requestId: 'REV-001', subject: 'Advanced Algorithms', location: 'Storage A-12', status: 'Retrieved' },
              { requestId: 'REV-002', subject: 'Database Systems', location: 'Storage B-07', status: 'Pending' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{item.requestId}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.status === 'Retrieved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm">{item.subject}</p>
                <p className="text-xs text-gray-500">Location: {item.location}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluator Assignment */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Evaluator Assignment</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Request</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option>REV-001 - Advanced Algorithms</option>
                <option>REV-002 - Database Systems</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Evaluator</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option>Dr. Sharma (Senior Professor)</option>
                <option>Prof. Kumar (Associate Professor)</option>
                <option>Dr. Patel (External Examiner)</option>
              </select>
            </div>
            <button type="button" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Assign for Re-evaluation
            </button>
          </form>
        </div>
      </div>

      {/* Marks Comparison */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Marks Comparison & Update</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left">Request ID</th>
                <th className="px-4 py-3 text-left">Original Marks</th>
                <th className="px-4 py-3 text-left">Re-evaluated Marks</th>
                <th className="px-4 py-3 text-left">Difference</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3">REV-001</td>
                <td className="px-4 py-3">75/100</td>
                <td className="px-4 py-3">
                  <input type="number" defaultValue="82" className="w-20 px-2 py-1 border rounded" />
                </td>
                <td className="px-4 py-3 text-green-600 font-semibold">+7</td>
                <td className="px-4 py-3">
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                    Update Marks
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ReValuation = () => {
  const location = useLocation();
  const tabs = [
    { path: '', label: 'Requests', component: <Revaluation /> },
    { path: '/payments', label: 'Payments', component: <RevaluationPayments /> },
    { path: '/completed', label: 'Completed', component: <CompletedRevaluations /> },
    // { path: '/process', label: 'Re-valuation Process', component: <RevaluationProcess /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Re-Valuation Management</h1>
        <span className="text-sm text-gray-500">Admin Control Panel</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab, index) => (
            <Link
              key={index}
              to={`/re-valuation${tab.path}`}
              className={`flex-1 min-w-max px-6 py-4 text-center border-b-2 font-medium transition-colors ${
                location.pathname === `/re-valuation${tab.path}`
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
            <Route path="/" element={<Revaluation />} />
            <Route path="/payments" element={<RevaluationPayments />} />
            <Route path="/completed" element={<CompletedRevaluations />} />
            <Route path="/process" element={<RevaluationProcess />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ReValuation;