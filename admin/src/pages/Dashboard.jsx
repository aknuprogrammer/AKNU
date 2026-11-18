import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const adminStats = [
    { title: 'Pending Approvals', value: '12', color: 'bg-red-500', icon: '⏳', link: '/pre-examination' },
    { title: 'Results to Publish', value: '8', color: 'bg-orange-500', icon: '📊', link: '/results' },
    { title: 'Re-Valuation Requests', value: '23', color: 'bg-blue-500', icon: '🔍', link: '/re-valuation' },
    { title: 'Scripts to Evaluate', value: '1,245', color: 'bg-purple-500', icon: '📝', link: '/post-examination' },
  ];

  const recentActivities = [
    { action: 'Exam Schedule Created', user: 'Dr. Sharma', date: '2024-01-15', status: 'Completed' },
    { action: 'Results Uploaded', user: 'Prof. Kumar', date: '2024-01-14', status: 'Pending Approval' },
    { action: 'Re-valuation Processed', user: 'Exam Branch', date: '2024-01-13', status: 'Completed' },
  ];

  const quickActions = [
    { title: 'Create Exam Schedule', icon: '📅', link: '/pre-examination', color: 'blue' },
    { title: 'Publish Notification', icon: '📢', link: '/pre-examination', color: 'green' },
    { title: 'Upload Results', icon: '📈', link: '/results', color: 'purple' },
    { title: 'Process Re-valuation', icon: '🔍', link: '/re-valuation', color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <span className="text-sm text-gray-500">Examination Controller Panel</span>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.link}>
            <div className={`bg-gradient-to-r from-${action.color}-500 to-${action.color}-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center`}>
              <div className="text-3xl mb-2">{action.icon}</div>
              <h3 className="font-semibold">{action.title}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Recent Admin Activities</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">👤</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{activity.action}</p>
                    <p className="text-sm text-gray-600">By: {activity.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{activity.date}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    activity.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Examination Timeline</h3>
          <div className="space-y-3">
            {[
              { event: 'Pre-Exam Planning', date: 'Jan 15-30', status: 'In Progress' },
              { event: 'Student Registration', date: 'Feb 1-15', status: 'Upcoming' },
              { event: 'Exam Conduct', date: 'Mar 1-20', status: 'Upcoming' },
              { event: 'Result Declaration', date: 'Apr 10', status: 'Upcoming' },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <span className="font-medium">{item.event}</span>
                  <span className="text-sm text-gray-500 ml-2">{item.date}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  item.status === 'Upcoming' ? 'bg-gray-100 text-gray-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Pending Tasks</h3>
          <div className="space-y-3">
            {[
              { task: 'Approve Question Papers', department: 'Computer Science', priority: 'High' },
              { task: 'Verify Eligibility', department: 'All Departments', priority: 'Medium' },
              { task: 'Assign Evaluators', department: 'Mathematics', priority: 'High' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{item.task}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Department: {item.department}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;