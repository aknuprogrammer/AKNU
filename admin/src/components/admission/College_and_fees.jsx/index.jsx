import { useState } from "react";
import CollegeSelectorTable from "./CollegeSelectorTable";
import CourseSelectorTable from "./CourseSelectorTable";
import CollegeCourseMapping from "./CollegeCourseMapping";

import AdmissionFees from "./AdmissionFees";
import OtherFees from "./OtherFees";
import AddFormModal from "./AddFormModal";
import CertificateCheckList from "./CertificatesCheckList";
import ApscheAllotments from "./ApscheAllotments";
import DatePicker from "./DatePicker";

const AdmissionTabs = () => {
  const [activeTab, setActiveTab] = useState("colleges");
  const [showAddForm, setShowAddForm] = useState(false);

  // Data state for each tab
  const [data, setData] = useState({
    colleges: [
      {
        id: 1,
        name: "Engineering College",
        location: "City A",
        established: 1990,
        type: "Public",
        programs: 12,
      },
      {
        id: 2,
        name: "Medical Institute",
        location: "City B",
        established: 1985,
        type: "Private",
        programs: 8,
      },
    ],
    courses: [
      {
        id: 1,
        code: "CS101",
        title: "Computer Science",
        duration: "4 years",
        credits: 120,
        type: "Undergraduate",
      },
      {
        id: 2,
        code: "ME201",
        title: "Mechanical Engineering",
        duration: "4 years",
        credits: 125,
        type: "Undergraduate",
      },
    ],
    collegeCourseMapping: [
      {
        id: 1,
        college: "Engineering College",
        course: "Computer Science",
        seats: 60,
        available: 45,
      },
      {
        id: 2,
        name: "Engineering College",
        course: "Mechanical Engineering",
        seats: 50,
        available: 30,
      },
    ],
    apscheAllotments: [
      {
        id: 1,
        college: "Engineering College",
        course: "Computer Science",
        allotted: 40,
        reserved: 5,
        general: 35,
      },
      {
        id: 2,
        college: "Medical Institute",
        course: "Medicine",
        allotted: 30,
        reserved: 4,
        general: 26,
      },
    ],
    admissionFees: [
      {
        id: 1,
        college: "Engineering College",
        course: "Computer Science",
        amount: 50000,
        dueDate: "2023-08-31",
      },
      {
        id: 2,
        college: "Engineering College",
        course: "Mechanical Engineering",
        amount: 48000,
        dueDate: "2023-08-31",
      },
    ],
    otherFees: [
      {
        id: 1,
        college: "Engineering College",
        type: "Library",
        amount: 5000,
        frequency: "Annual",
      },
      {
        id: 2,
        college: "Engineering College",
        type: "Laboratory",
        amount: 7000,
        frequency: "Annual",
      },
    ],
  });

  const addNewItem = (tab, newItem) => {
    setData((prev) => ({
      ...prev,
      [tab]: [...prev[tab], { ...newItem, id: prev[tab].length + 1 }],
    }));
  };

  const tabs = [
    { id: "colleges", name: "Colleges" },
    { id: "courses", name: "Courses" },
    { id: "collegeCourseMapping", name: "College-Course Mapping" },
    { id: "certificateCheckList", name: "Certificate Checklist" },
    { id: "admissionFees", name: "Admission Fees" },
    { id: "apscheAllotments", name: "Load Apsche Data" },
    { id: "otherFees", name: "Other Fees" },
     { id: "datePicker", name: "Settings" },
  ];

  const renderActiveTab = () => {
    const commonProps = {
      data: data[activeTab],
      onAddClick: () => setShowAddForm(true),
      tabKey: activeTab,
    };

    switch (activeTab) {
      case "colleges":
        return <CollegeSelectorTable {...commonProps} />;
      case "courses":
        return <CourseSelectorTable {...commonProps} />;
      case "collegeCourseMapping":
        return <CollegeCourseMapping {...commonProps} />;
      case "apscheAllotments":
        return <ApscheAllotments {...commonProps} />;
      case "certificateCheckList":
        return <CertificateCheckList {...commonProps} />;
      case "admissionFees":
        return <AdmissionFees {...commonProps} />;
      case "otherFees":
        return <OtherFees {...commonProps} />;
      case "datePicker":
        return <DatePicker {...commonProps} />;

        DatePicker;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Admission Console
      </h1>

      <div className="flex space-x-4 border-b overflow-x-auto pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="mt-6">{renderActiveTab()}</div>

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

export default AdmissionTabs;
