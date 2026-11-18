import { useState, useEffect } from "react";
import { initializeDummyData } from "./dummyData";
import ExaminationTypesTable from "./ExaminationTypesTable";
import CourseAcademicYearMapping from "./CourseAcademicYearMapping";
import AcademicYearSemesterMapping from "./AcademicYearSemesterMapping";
import SubjectCourseMapping from "./SubjectCourseMapping";
import ExaminationCentersTable from "./ExaminationCentersTable";
import CollegesTable from "./CollegesTable";
import CoursesTable from "./CoursesTable";
import CollegeCourseMappingTable from "./CollegeCourseMappingTable";
import TimetableTable from "./TimetableTable";
import QuestionPaperTable from "./QuestionPaperTable";
import QuestionPaperAdminView from "./QuestionPaperAdminView";
import SubjectProfessorMapping from "./SubjectProfessorMapping";
import ExaminationSettings from "./ExaminationSettings";
import AddFormModal from "./AddFormModal";
import ExamCenterMappings from "./ExamCenterMappings";
import ExamCenterQuestionPaperMapping from "./ExamCenterQuestionPaperMapping";
import StudentsTable from "./StudentsTable";
import InvigilatorsTable from "./InvigilatorsTable";
import MasterMapping from "./MasterMapping";
import CategoryTypesTable from "./CategoryTypesTable";

const ExaminationMasterData = () => {
  const [activeTab, setActiveTab] = useState("colleges");
  const [showAddForm, setShowAddForm] = useState(false);

  // Initialize dummy data on component mount if not already initialized
  useEffect(() => {
    initializeDummyData();
  }, []);
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
    { id: "courseAcademicYearMapping", name: "Course-Academic Year Mapping" },


    // { id: "examinationTypes", name: "Examination Types" },
    // { id: "subjectCourseMapping", name: "Subject-Course Mapping" },
    { id: "examinationCenters", name: "Examination Centers" },
    { id: "examCenterMappings", name: "Exam Center- College Mappings" },
    { id: "questionPaper", name: "Question Papers" },
    { id: "examCenterQuestionPaperMapping", name: "Exam Center-Question Paper Mapping" },
    // { id: "students", name: "Students" },
    { id: "timetable", name: "Examination Timetable" },
    // { id: "subjectProfessorMapping", name: "Subject-Professor Assignment" },
    { id: "questionPaperAdmin", name: "Question Papers View" },
    { id: "invigilators", name: "Invigilators" },
    // { id: "masterMapping", name: "Master Mapping" },
    { id: "categoryTypes", name: "Configuration" },
    { id: "settings", name: "Settings" },
  ];

  const renderActiveTab = () => {
    const commonProps = {
      tabKey: activeTab,
    };

    switch (activeTab) {
      case "colleges":
        return <CollegesTable {...commonProps} />;
      case "courses":
        return <CoursesTable {...commonProps} />;
      case "courseAcademicYearMapping":
        return <CourseAcademicYearMapping {...commonProps} />;
      case "academicYearSemesterMapping":
        return <AcademicYearSemesterMapping {...commonProps} />;
      case "collegeCourseMapping":
        return <CollegeCourseMappingTable {...commonProps} />;
      case "examinationTypes":
        return <ExaminationTypesTable {...commonProps} />;
      case "students":
        return <StudentsTable {...commonProps} />;
      case "subjectCourseMapping":
        return <SubjectCourseMapping {...commonProps} />;
      case "examinationCenters":
        return <ExaminationCentersTable {...commonProps} />;
      case "examCenterMappings":
        return <ExamCenterMappings {...commonProps} />;
      case "examCenterQuestionPaperMapping":
        return <ExamCenterQuestionPaperMapping {...commonProps} />;
      case "timetable":
        return <TimetableTable {...commonProps} />;
      case "questionPaper":
        return <QuestionPaperTable {...commonProps} />;
      case "questionPaperAdmin":
        return <QuestionPaperAdminView {...commonProps} />;
      case "subjectProfessorMapping":
        return <SubjectProfessorMapping {...commonProps} />;
      case "invigilators":
        return <InvigilatorsTable {...commonProps} />;
      case "masterMapping":
        return <MasterMapping {...commonProps} />;
      case "categoryTypes":
        return <CategoryTypesTable {...commonProps} />;
      case "settings":
        return <ExaminationSettings {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Examination Master Data Console
      </h1>

      <div className="flex space-x-4 border-b overflow-x-auto pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === tab.id
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

export default ExaminationMasterData;

