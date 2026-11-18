import React from "react";
import { Mountain, Flag, Users, Award } from "lucide-react";
import { BackButton } from "../../../components/BackButton";

const awardTableData = [
  {
    sno: 1,
    category: "University/+2 Council First Award",
    awards: 1,
    value: "Rs. 5,00,000/-",
  },
  {
    sno: 2,
    category: "Upcoming University Second Award",
    awards: 1,
    value: "Rs. 3,00,000/-",
  },
  {
    sno: 3,
    category: "Programme Officer",
    awards: 10,
    value: "Rs. 1,50,000/-",
  },
  { sno: 4, category: "NSS Unit", awards: 10, value: "Rs. 2,00,000/-" },
  { sno: 5, category: "NSS Volunteer", awards: 30, value: "Rs. 1,00,000/-" },
];

const MajorActivities = () => {
  return (
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6 text-teal-800">MAJOR ACTIVITIES</h1>
      <section className="mb-8">
        <div className="flex items-center gap-2 text-xl font-semibold text-teal-700 mb-2">
          <Flag className="h-5 w-5" />
          National Integration Camp (NIC)
        </div>
        <p className="mb-2 text-[16px]">
          Organized yearly for 7 days with full boarding & lodging. Held across
          India with 200 volunteers per camp.
        </p>
        <p className="font-medium mb-2 text-[16px]">Objectives:</p>
        <ul className="list-disc pl-5 text-[16px]">
          <li>Rich cultural diversity of India</li>
          <li>History of our diversified culture</li>
          <li>National pride through knowledge about India</li>
          <li>To integrate the nation through social service</li>
        </ul>
      </section>

      {/* Adventure Program */}
      <section className="mb-8">
        <div className="flex items-center gap-2 text-xl sm:text-2xl font-semibold text-teal-700 mb-2">
          <Mountain className="h-5 w-5 " />
          Adventure Program
        </div>
        <p className="mb-2 text-[16px]">
          Camps held in Himalayan and North East regions with 1500 volunteers.
          Activities include trekking, rafting, para-sailing, skiing.
        </p>
        <p className="font-medium mb-2 text-[16px]">Objectives:</p>
        <ul className="list-disc pl-5 text-[16px]">
          <li>Promote adventure activities</li>
          <li>Infuse love for India’s regions</li>
          <li>Boost leadership, team spirit & risk-taking</li>
          <li>Improve physical & mental strength</li>
          <li>Explore new vocational paths</li>
        </ul>
      </section>

      {/* NSS Republic Day Parade Camp */}
      <section className="mb-8">
        <div className="flex items-center gap-2 text-xl sm:text-2xl font-semibold text-teal-700 mb-2">
          <Users className="h-5 w-5" />
          NSS Republic Day Parade Camp
        </div>
        <p className="mb-2 text-[16px]">
          Held annually in Delhi from Jan 1–31 with 200 selected volunteers for
          discipline, parade & culture. March at Rajpath on Jan 26.
        </p>
        <p className="font-medium mb-2 text-[16px]">Objectives:</p>
        <ul className="list-disc pl-5 text-[16px]">
          <li>Interact with peers across India</li>
          <li>Experience diverse cultures</li>
          <li>Enhance student personality</li>
          <li>Strengthen patriotism and unity</li>
        </ul>
      </section>

      {/* National Youth Festivals */}
      <section className="mb-8">
        <div className="flex items-center gap-2 text-xl sm:text-2xl font-semibold text-teal-700 mb-2">
          <Users className="h-5 w-5" />
          National Youth Festivals
        </div>
        <p className="mb-2 text-[16px]">
          Organized from Jan 12–16 every year with 1500 volunteers. Youth icons,
          speakers address cultural importance & interaction.
        </p>
        <p className="font-medium mb-2 text-[16px]">Objectives:</p>
        <ul className="list-disc pl-5 text-[16px]">
          <li>Understand Indian festivals</li>
          <li>Learn cultural importance</li>
          <li>Interact with icons and speakers</li>
        </ul>
      </section>

      {/* National Service Scheme Awards */}
      <section className="mb-8">
        <div className="flex items-center gap-2 text-xl sm:text-2xl font-semibold text-teal-700 mb-2">
          <Award className="h-5 w-5" />
          National Service Scheme Awards
        </div>
        <p className="mb-2 text-[16px]">
          Instituted in 1993-94 to recognize NSS contributions. Awards given
          annually across multiple categories.
        </p>
        <div className="overflow-x-auto mt-4 mb-4 bg-white shadow">
          <table className="min-w-full text-left border border-[#ccc]">
            <thead className="bg-teal-700 text-white">
              <tr>
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">No. of Awards</th>
                <th className="px-4 py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {awardTableData.map((row) => (
                <tr key={row.sno} className="border-t border-[#ccc]">
                  <td className="px-4 py-2">{row.sno}</td>
                  <td className="px-4 py-2">{row.category}</td>
                  <td className="px-4 py-2">{row.awards}</td>
                  <td className="px-4 py-2">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-medium mb-2 text-teal-700 text-[16px]">
          Objectives:
        </p>
        <ul className="list-disc pl-5 text-[16px]">
          <li>Recognize exceptional NSS service</li>
          <li>Encourage personality development via service</li>
          <li>Motivate NSS officers and coordinators</li>
          <li>Inspire volunteers for ongoing community service</li>
        </ul>
      </section>
    </div>
  );
};

export default MajorActivities;
