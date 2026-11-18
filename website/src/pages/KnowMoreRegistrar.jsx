import React from "react";
import { BackButton } from "../components/BackButton";
import { successiveRegistrars, adminitrativeRoles } from "../siteData/departmentsData";
import { sudhakar, tashok, ashok, sreeramesh15 } from "../assets";
import { FaUniversity, FaEnvelope, FaPhone } from "react-icons/fa";

export default function KnowMoreRegistrar() {
    const imageByName = {
        "Prof. G Sudhakar": sudhakar,
        "Prof. T Ashok": tashok || ashok,
        "Prof. K Sree Ramesh": sreeramesh15,
    };

    const registrarInfo = adminitrativeRoles?.find(
        (p) => p?.designation?.toLowerCase()?.includes("registrar")
    ) || {
        name: "Prof. K V Swamy",
        designation: "Registrar",
        img: null,
        email: "registrar@aknu.edu.in",
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 pt-6 px-3 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto pb-4">
                <BackButton />
            </div>

            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Registrar Hero */}
                <div className="bg-[#418079] p-4 sm:p-6 md:p-8 text-white">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="md:flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                            <div className="relative h-58 w-58 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-xl overflow-hidden group transition-all duration-300 hover:border-indigo-200 hover:scale-105">
                                {registrarInfo?.img ? (
                                    <img
                                        src={registrarInfo.img}
                                        alt={registrarInfo?.name || "Registrar"}
                                        className="h-full w-full object-cover object-center rounded-full border-4 border-white transition-all duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-white/20" />
                                )}
                                <div className="absolute inset-0 bg-indigo-900 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
                                <div className="absolute inset-0 overflow-hidden rounded-full">
                                    <div className="absolute top-0 left-0 w-20 h-32 bg-white opacity-0 group-hover:opacity-30 transform -rotate-45 group-hover:translate-x-60 transition-all duration-700"></div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 leading-tight">
                                {registrarInfo?.name}
                            </h1>
                            <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 leading-snug">
                                {registrarInfo?.designation || "Registrar"}
                            </h2>
                            <h3 className="text-base sm:text-lg md:text-xl font-medium mb-4">Adikavi Nannaya University</h3>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center">
                                    <FaUniversity className="mr-2" />
                                    <span>
                                        Raja Raja Narendra Nagar, Rajamahendravaram – 533296
                                    </span>
                                </div>

                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center">
                                    <FaEnvelope className="mr-2" />
                                    <span>{registrarInfo?.email}</span>
                                </div>
                                <div className="flex items-center">
                                    <FaPhone className="mr-2" />
                                    <span>{registrarInfo?.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Heading */}
                <div className="bg-white px-4 sm:px-6 pt-5">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#21605A] leading-tight">Successive Registrars</h2>
                </div>

                <div className="p-4 sm:p-6 overflow-x-auto">
                    <table className="min-w-full text-left border border-[#ccc]">
                        <thead className="bg-teal-700 text-white">
                            <tr>
                                <th className="px-4 py-2">S.No</th>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">From</th>
                                <th className="px-4 py-2">To</th>
                                <th className="px-4 py-2">Image</th>
                            </tr>
                        </thead>
                        <tbody>
                            {successiveRegistrars.map((row, idx) => (
                                <tr key={`${row.name}-${idx}`} className="border-t border-[#ccc]">
                                    <td className="px-4 py-2">{row.srNo || idx + 1}</td>
                                    <td className="px-4 py-2">{row.name}</td>
                                    <td className="px-4 py-2">{row.from}</td>
                                    <td className="px-4 py-2">{row.to}</td>
                                    <td className="px-4 py-2">
                                        {(() => {
                                            const src = row.image || imageByName[row.name];
                                            return src ? (
                                                <img src={src} alt={row.name} className="h-12 w-12 object-cover rounded" />
                                            ) : (
                                                <span className="text-gray-500">—</span>
                                            );
                                        })()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
