import React from "react";
import { Users, CalendarDays, BadgeCheck, BookOpen } from "lucide-react";

const roles = [
  {
    title: "Network Builder",
    description:
      "Connect alumni in your region and help build a strong local network for ongoing engagement.",
    icon: <Users className="w-10 h-10 text-[#00786F]" />,
  },
  {
    title: "Event Host",
    description:
      "Organize and host local centenary events to celebrate the university's legacy in your region.",
    icon: <CalendarDays className="w-10 h-10 text-[#00786F]" />,
  },
  {
    title: "Brand Ambassador",
    description:
      "Represent and promote Adikavi Nannaya University's centenary celebrations in your professional networks.",
    icon: <BadgeCheck className="w-10 h-10 text-[#00786F]" />,
  },
  {
    title: "Story Collector",
    description:
      "Gather and document alumni stories and memories from your region for the centenary archive.",
    icon: <BookOpen className="w-10 h-10 text-[#00786F]" />,
  },
];

export default function AlumniAmbassadors() {
  return (
    <section className="py-10 bg-gradient-to-b from-white to-gray-50 px-4 sm:px-16" id="ambassadors">
      {/* Heading */}
      <div className="text-center mb-12 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-teal-800 sm:text-3xl">
          Global Alumni Ambassadors
        </h2>
        <p className="mt-4 text-xl text-gray-600 mx-auto text-[16px] max-w-2xl">
          Represent Adikavi Nannaya University
          in your city or country. Alumni ambassadors play a vital role in
          organizing local centenary celebrations and connecting regional alumni.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((role, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col items-center text-center space-y-4"
          >
            <div className="bg-[#00786F]/10 p-4 rounded-full flex items-center justify-center">
              {role.icon}
            </div>
            <h3 className="text-lg font-bold text-[#00786F]">{role.title}</h3>
            <p className="text-gray-600 text-[16px]">{role.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
