import React from "react";
import {
  Users,
  Shield,
  HeartPulse,
  Gavel,
  Bookmark,
  Award,
  Megaphone,
  Target,
  Phone,
  ClipboardList,
  Mail,
  TrendingUp,
} from "lucide-react";
import { vijaya } from "../../assets";
import { BackButton } from "../BackButton";

export default function STCell() {
  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mx-4 sm:mx-16 mt-6 bg-gradient-to-r from-teal-800 to-teal-900 p-6 text-center rounded-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          SC/ST Cell
        </h1>
        <p className="text-teal-100">
          Committed to ensuring equality, safety, and academic success for SC/ST
          students
        </p>
      </div>

      <div className="px-4 sm:px-16 py-6">
        <div className="flex flex-col md:flex-row w-full min-h-[260px] overflow-hidden  mb-12">
          <div className="bg-teal-700 flex flex-col items-center justify-center pt-10 px-3 sm:px-4 md:px-6 lg:px-5 pb-4 md:w-1/3 lg:w-1/4 w-full">
            <img
              src={vijaya}
              alt="Dr. P Vijaya Nirmala"
              className="w-40 h-48 sm:w-52 sm:h-50 object-fill bg-white border-4 border-white mb-4 shadow-md"
            />
            <p className="text-white font-bold text-base mt-4 mb-1 text-center w-[90%]">
              Dr. P Vijaya Nirmala
            </p>
            <p className="text-white text-sm text-center w-[90%]">Coordinator</p>
            <p className="text-white text-sm text-center w-[90%]">9441140857</p>
            <p className="text-white text-sm text-center w-[90%]">
              scstcell@aknu.edu.in
            </p>
          </div>

          <div className="bg-[#f4e4c9] md:flex-1 w-full px-4 sm:px-8 py-6 flex flex-col justify-center">
           <h2 className="text-2xl font-bold text-teal-700">About SC/ST Cell</h2>
            <p className="text-gray-700 mb-3 text-[16px]">
              The SC/ST Cell of Adikavi Nannaya University has been established to safeguard the interests, rights, and welfare of students, teaching faculty, and non-teaching staff belonging to Scheduled Castes (SC) and Scheduled Tribes (ST). The Cell functions in accordance with the guidelines and policies of the Government of India and the University Grants Commission (UGC).

The primary objective of the Cell is to ensure an inclusive, equitable, and discrimination-free academic environment within the university campus. It works to address issues related to social justice, equal opportunity, and the implementation of reservation policies in admissions, recruitment, scholarships, and other institutional provisions meant for SC/ST communities.

The Cell also receives and addresses grievances concerning discrimination, harassment, or denial of rights faced by SC/ST students and employees. It ensures that complaints are examined with fairness, confidentiality, and sensitivity while coordinating with university authorities for appropriate action and redressal.

In addition, the SC/ST Cell organizes awareness programmes, counselling sessions, academic support initiatives, and welfare activities to promote educational advancement, empowerment, and social inclusion among students from marginalized communities. The Cell plays an important role in fostering dignity, equality, and constitutional values within the university system.
            </p>
          </div>
        </div>

        {/* Aims and Objectives */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <div className="bg-teal-700 p-3 rounded-full mr-4">
              <Target className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-teal-700">
              Aims & Objectives
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <HeartPulse size={20} />,
                text: "To counsel and guide SC/ST students and help them to manage academic and personal issues of college life effectively.",
              },
              {
                icon: <Shield size={20} />,
                text: "To ensure provisions of an environment where all SC/ST students feel safe and secure.",
              },
              {
                icon: <Users size={20} />,
                text: "To provide prompt counselling for any emotional emergencies arising on account of any event happening in the campus.",
              },
              {
                icon: <Gavel size={20} />,
                text: "To provide the mechanism to redress the grievance of SC/ST students, if any.",
              },
              {
                icon: <Shield size={20} />,
                text: "To ensure protection and reservation as provided in the constitution of India.",
              },
              {
                icon: <TrendingUp size={20} />,
                text: "To arrange for special opportunities to enhance the career growth.",
              },
              {
                icon: <Bookmark size={20} />,
                text: "To create awareness, among the SC/ST students regarding various scholarships program of State Govt. and UGC.",
              },
              {
                icon: <Megaphone size={20} />,
                text: "To take such follow up measures to achieve the objectives and targets laid down by the Govt. of India and the UGC.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start bg-teal-50 p-5 rounded-lg border border-teal-200"
              >
                <div className="text-teal-700 mr-4 mt-0.5">{item.icon}</div>
                <p className="text-gray-700 text-[16px]">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Committee Members */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <div className="bg-teal-700 p-3 rounded-full mr-4">
              <ClipboardList className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-teal-700">
              SC/ST Cell Committee
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left border border-[#ccc]">
              <thead className="bg-teal-700 text-white">
                <tr>
                  <th className="px-4 py-2">S.No</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Designation</th>
                  <th className="px-4 py-2">Contact</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[#ccc]">
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2 font-medium">Dr P Vijaya Nirmala</td>
                  <td className="px-4 py-2">Coordinator</td>
                  <td className="px-4 py-2 flex items-center">
                    <Phone className="text-teal-700 mr-2" size={16} />
                    9441140857
                  </td>
                </tr>
                <tr className="border-t border-[#ccc]">
                  <td className="px-4 py-2">2</td>
                  <td className="px-4 py-2 font-medium">
                    Dr P Venkateswara Rao
                  </td>
                  <td className="px-4 py-2">Member</td>
                  <td className="px-4 py-2 flex items-center">
                    <Phone className="text-teal-700 mr-2" size={16} />
                    9441447037
                  </td>
                </tr>
                <tr className="border-t border-[#ccc]">
                  <td className="px-4 py-2">3</td>
                  <td className="px-4 py-2 font-medium">Dr D Kalyani</td>
                  <td className="px-4 py-2">Member</td>
                  <td className="px-4 py-2 flex items-center">
                    <Phone className="text-teal-700 mr-2" size={16} />
                    9849419160
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Activities */}
        <section>
          <div className="flex items-center mb-6">
            <div className="bg-teal-700 p-3 rounded-full mr-4">
              <Megaphone className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-teal-700">Key Activities</h2>
          </div>

          <div className="bg-teal-50 rounded-lg p-6 sm:p-8 border border-teal-200">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-teal-100 text-teal-700 rounded-full p-1 mr-3 mt-1">
                  <ClipboardList size={16} />
                </div>
                <p className="text-gray-700 text-[16px]">
                  To collect reports and information of State Govt. and UGC's
                  orders on various aspects of education, employment of SC/ST
                </p>
              </li>
              <li className="flex items-start">
                <div className="bg-teal-100 text-teal-700 rounded-full p-1 mr-3 mt-1">
                  <Mail size={16} />
                </div>
                <p className="text-gray-700 text-[16px]">
                  To circulate State Govt. and UGC's decisions about different
                  scholarship programs.
                </p>
              </li>
              <li className="flex items-start">
                <div className="bg-teal-100 text-teal-700 rounded-full p-1 mr-3 mt-1">
                  <Users size={16} />
                </div>
                <p className="text-gray-700 text-[16px]">
                  To communicate with the students and motivate them for better
                  future planning.
                </p>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
