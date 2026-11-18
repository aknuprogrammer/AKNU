import { useState } from 'react';
import ApplicationTypeCalculator from './ApplicationTypeCaculation';
import ApplicationPurpose from './ApplPurposeSelector';
import CollegeSelectorTable from './CollegeSelector';
import AddFormModal from './AddFormModal';
import CourseSelectorTable from './CourseSelector';

const ApplicationTabs = () => {
  const [activeTab, setActiveTab] = useState('applicationPurpose');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Data state for each tab
  const [data, setData] = useState({
    applicationTypeCalculator: [
      { id: 1, name: 'Type A', description: 'Standard application', formula: 'x + y' },
    ],
    applicationPurpose: [
      { id: 1, purpose: 'Research', description: 'Academic projects', duration: '1 year' },
    ],
    collegeSelector: [
      { id: 1, college: 'Engineering', location: 'Building A', programs: 12 },
    ],
    courseSelector: [
      { id: 1, code: 'CS101', title: 'Intro to Programming', credits: 3 },
    ],
  });

  const addNewItem = (tab, newItem) => {
    setData(prev => ({
      ...prev,
      [tab]: [...prev[tab], { ...newItem, id: prev[tab].length + 1 }]
    }));
  };

  const tabs = [
    // { id: 'applicationTypeCalculator', name: 'Type Calculator' },
    { id: 'applicationPurpose', name: 'Application Purpose' },
    { id: 'collegeSelector', name: 'College Selector' },
    { id: 'courseSelector', name: 'Course Selector' },
  ];

  const renderActiveTab = () => {
    const commonProps = {
      data: data[activeTab],
      onAddClick: () => setShowAddForm(true),
      tabKey: activeTab
    };

    switch(activeTab) {
      // case 'applicationTypeCalculator':
      //   return <ApplicationTypeCalculator {...commonProps} />;
      case 'applicationPurpose':
        return <ApplicationPurpose {...commonProps} />;
      case 'collegeSelector':
        return <CollegeSelectorTable {...commonProps} />;
      case 'courseSelector':
        return <CourseSelectorTable {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex space-x-4 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab.id 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
      
      {renderActiveTab()}
      
      {showAddForm && (
        <AddFormModal
          tabKey={activeTab}
          onClose={() => setShowAddForm(false)}
          onSubmit={(newItem) => {
            addNewItem(activeTab, newItem);
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
};

export default ApplicationTabs;