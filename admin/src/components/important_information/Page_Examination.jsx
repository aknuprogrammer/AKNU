import { useState } from "react";
import Template_FormPage from "./Template_FormPage";

export default function Page_Examination() {
  const tabList = {
    Notifications: (
      <Template_FormPage
        title={"Notifications"}
        itemName="Notification"
        resourceName="exam_notifications"
      />
    ),
    Applications: (
      <Template_FormPage
        title={"Applications"}
        itemName="Application"
        resourceName="exam_applications"
      />
    ),
    "Time table": (
      <Template_FormPage
        title={"Timetable"}
        itemName="Event"
        resourceName="exam_timetable"
      />
    ),
    "Jumbling Centers": (
      <Template_FormPage
        title={"Jumbling Centers"}
        itemName="Jumbling Center"
        resourceName="exam_jumblingcenters"
      />
    ),
  };
  const [activeTab, setActiveTab] = useState(Object.keys(tabList)[0]);

  return (
    <>
      <div className="flex space-x-2 border-b border-gray-200 mb-4">
        {Object.keys(tabList).map((ele, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(ele)}
            className={`px-4 py-2 rounded-t-md border-b-2 transition ${
              activeTab === ele
                ? "border-black font-semibold"
                : "border-transparent text-gray-500"
            }`}
          >
            {ele}
          </button>
        ))}
      </div>
      {tabList[activeTab]}
    </>
  );
}
