import { useState } from "react";
import Template_FormPage from "./Template_FormPage";

export default function Page_Circular() {
  const tabConfig = {
    "All Ciculars": {
      title: "All Ciculars",
      itemName: "Circulars",
      resourceName: "all_circulars",
    },
    "CDC Circulars": {
      title: "CDC Circulars",
      itemName: "CDC Circulars",
      resourceName: "cdc_circulars",
    },
    "DOA Circulars": {
      title: "DOA Circulars",
      itemName: "DOA Circulars",
      resourceName: "doa_circulars",
    },
    "Academic Circulars": {
      title: "Academic Circulars",
      itemName: "Academic Circulars",
      resourceName: "academic_circulars",
    },
    "Circulars/Proceedings": {
      title: "Circulars/Proceedings",
      itemName: "Circulars/Proceedings",
      resourceName: "curcular_proceedings",
    },
    "Circulars/Applications": {
      title: "Circulars/Applications",
      itemName: "Circulars/Applications",
      resourceName: "circulars_applications",
    },
    "Academic Calendar": {
      title: "Academic Calendar",
      itemName: "Academic Calendar",
      resourceName: "academic_calendar",
    },
  };

  const [activeTab, setActiveTab] = useState(Object.keys(tabConfig)[0]);
  const activeConfig = tabConfig[activeTab];

  const renderActiveTab = () => {
    if (!activeConfig) return null;
    return (
      <Template_FormPage
        key={activeConfig.resourceName}
        title={activeConfig.title}
        itemName={activeConfig.itemName}
        resourceName={activeConfig.resourceName}
      />
    );
  };

  return (
    <>
      <div className="flex space-x-2 border-b border-gray-200 mb-4 ml-16 mt-5">
        {Object.keys(tabConfig).map((tabName) => (
          <button
            key={tabName}
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 rounded-t-md border-b-2 transition ${
              activeTab === tabName
                ? "border-black font-semibold"
                : "border-transparent text-gray-500"
            }`}
          >
            {tabName}
          </button>
        ))}
      </div>
      {renderActiveTab()}
    </>
  );
}
