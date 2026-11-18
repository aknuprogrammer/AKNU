import { useState } from "react";
import VehicleTypes from "./VehicleTypes";
import Vehicles from "./Vehicles";
import Drivers from "./Drivers";
import Routes from "./Routes";
import DriverMapping from "./DriverMapping";
import RouteMapping from "./RouteMapping";
import Assignments from "./Assignments";

const TransportationTabs = () => {
    const [activeTab, setActiveTab] = useState("vehicle-types");

    const tabs = [
        { id: "vehicle-types", name: "Vehicle Types" },
        { id: "drivers", name: "Drivers" },
        { id: "vehicles", name: "Vehicles" },
        { id: "driver-mapping", name: "Driver Assignments" },
        { id: "routes", name: "Routes" },
        { id: "route-mapping", name: "Route Mapping" },
        { id: "student-mapping", name: "Student Boarding" },
    ];

    const renderActiveTab = () => {
        switch (activeTab) {
            case "vehicle-types":
                return <VehicleTypes />;
            case "drivers":
                return <Drivers />;
            case "vehicles":
                return <Vehicles />;
            case "driver-mapping":
                return <DriverMapping />;
            case "routes":
                return <Routes />;
            case "route-mapping":
                return <RouteMapping />;
            case "student-mapping":
                return <Assignments />;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
                Transportation Master Data Console
            </h1>

            <div className="flex space-x-4 border-b overflow-x-auto pb-3">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {renderActiveTab()}
            </div>
        </div>
    );
};

export default TransportationTabs;
