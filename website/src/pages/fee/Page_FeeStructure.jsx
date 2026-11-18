import { ClipboardList, X } from "lucide-react";
import { BackButton } from "../../components/BackButton";
import { BTechStructure, EducationStructure, MBAStructure, MCAStructure, PGStructure, UGStructure } from "./Data"
export default function Page_FeeStructrure() {
    const activeCategory = {
        name: "Fee Structures",
        icon: <ClipboardList size={24} />,
        number: 22,
        children: [
            {
                name: "UG (B.Sc, B.A, B.Com, BBA, BCA, etc.)",
                link: UGStructure,
            },
            {
                name: "PG (M.Sc, M.A, M.Com)",
                link: PGStructure,
            },
            {
                name: "MBA",
                link: MBAStructure,
            },
            {
                name: "MCA",
                link: MCAStructure,
            },
            {
                name: "B.Tech",
                link: BTechStructure,
            },
            {
                name: "Education (B.Ed, B.P.Ed, D.P.Ed, M.Ed, etc.)",
                link: EducationStructure,
            },
        ],
    };
    const themeColor = "#007367";
    const lightColor = "#f0f7f4";
    return (
        <div className="px-4 sm:px-16 py-8">
            <BackButton />
            {/* <h1 className="text-3xl text-center font-bold mb-6 text-teal-800">
                Fee Structures
            </h1> */}
            <div className="bg-white rounded-xl w-full overflow-hidden shadow-2xl">
                <div className="p-5 sm:p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-2xl sm:text-3xl font-semibold flex items-center">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                            style={{
                                backgroundColor: lightColor,
                                color: themeColor,
                            }}
                        >
                            {activeCategory.icon}
                        </div>
                        {activeCategory.name}
                    </h3>
                </div>

                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeCategory.children.map((item, i) => (
                            <a
                                key={i}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors group"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-gray-800 group-hover:text-teal-700 transition-colors">
                                            {item.name}
                                        </h4>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
