import React from 'react';
import { 
  Users,
  Scale,
  UserCheck,
  ClipboardList,
  Mail,
  Phone,
  Gavel,
  Bookmark,
  Award
} from 'lucide-react';
import { BackButton } from '../BackButton';
import { jyothirmai } from '../../assets';

export default function EqualOpportunityCell() {
  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mx-4 sm:mx-16 mt-6 bg-gradient-to-r from-teal-800 to-teal-900 p-6 text-center rounded-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Equal Opportunity Cell
        </h1>
        <p className="text-teal-100">
          Promoting equality and inclusive practices across the university community
        </p>
      </div>


      <div className="flex flex-col md:flex-row mt-4 sm:mt-6 px-4 sm:px-16">
              <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
                <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
                  <img
                    src={jyothirmai}
                    alt="Dr. V Persis"
                    className="w-full h-full object-cover "
                  />
                </div>
                <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
                  Prof. D. Jyothirmai
                </div>
                <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
                  Co-Ordinator
                </div>
                <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
                  9440787333
                </div>
                <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
                  directoriqac@aknu.edu.in
                </div>
              </div>
      
              <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
                <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
                  About Equal Opportunity Cell
                </h3>
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
                  <p className="text-justify">
                 The Equal Opportunity Cell of Adikavi Nannaya University is established to promote equality, inclusiveness, and social justice within the university community. The Cell works to ensure that students, faculty, and staff members from diverse social, economic, and educational backgrounds receive equal access to opportunities and institutional support without discrimination.

The Cell functions in accordance with the guidelines of the University Grants Commission (UGC) and aims to uphold the constitutional values of equality, dignity, and human rights in higher education. It focuses particularly on supporting students belonging to socially and economically disadvantaged groups, including Scheduled Castes, Scheduled Tribes, Other Backward Classes, minorities, women, and persons with disabilities.

The Equal Opportunity Cell undertakes activities related to academic support, counselling, awareness programmes, career guidance, skill development, and grievance redressal to help students overcome social and educational barriers. It also works to create awareness regarding rights, welfare schemes, scholarships, and institutional facilities available for marginalized and underrepresented communities.
                  </p>
                </div>
              </div>
            </div>

      <div className="px-4 sm:px-16 py-12">

      {/* Committee Members */}
      <section className="mb-16">
        <div className="flex items-center mb-8">
          <div className="bg-teal-700 p-3 rounded-full mr-4">
            <Users className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-teal-700">Committee Members</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-teal-700 text-white">
                <th className="p-3 text-left w-12">S.No</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Designation in SGRC</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-teal-100 hover:bg-teal-50">
                <td className="p-3">1</td>
                <td className="p-3 font-medium">Prof. D. Jyothirmai</td>
                <td className="p-3">Dept. of English, UCAC - Chairperson</td>
              </tr>
              <tr className="border-b border-teal-100 hover:bg-teal-50">
                <td className="p-3">2</td>
                <td className="p-3 font-medium">Prof. N. Udaya Bhaskar</td>
                <td className="p-3">Dept. of CMS, UCAC - Member</td>
              </tr>
              <tr className="border-b border-teal-100 hover:bg-teal-50">
                <td className="p-3">3</td>
                <td className="p-3 font-medium">Dr. K. Nooka Ratnam</td>
                <td className="p-3">Assoc. Prof., Dept. of Geosciences, UCST - Member & Liaison Officer</td>
              </tr>
              <tr className="border-b border-teal-100 hover:bg-teal-50">
                <td className="p-3">4</td>
                <td className="p-3 font-medium">Dr. P. Vijaya Nirmala</td>
                <td className="p-3">Assoc. Prof, Dept. of Zoology, UCST - Member & In-charge of Internal Complaints Committee</td>
              </tr>
              <tr className="border-b border-teal-100 hover:bg-teal-50">
                <td className="p-3">5</td>
                <td className="p-3 font-medium">Dr. V. Persis</td>
                <td className="p-3">Director, IQAC - Member</td>
              </tr>
              <tr className="border-b border-teal-100 hover:bg-teal-50">
                <td className="p-3">6</td>
                <td className="p-3 font-medium">Dr. D. Latha</td>
                <td className="p-3">Assoc. Prof. Dept. of CSE, UCOE - Member & Women Representative</td>
              </tr>
              <tr className="border-b border-teal-100 hover:bg-teal-50">
                <td className="p-3">7</td>
                <td className="p-3 font-medium">Ms. Kuppali Bhavana</td>
                <td className="p-3">I M.Sc. Zoology, UCST - Member & Student Representative</td>
              </tr>
              <tr className="border-b border-teal-100 hover:bg-teal-50">
                <td className="p-3">8</td>
                <td className="p-3 font-medium">Dr. G. Chandra Kala</td>
                <td className="p-3">Asst. Registrar, Establishment - Member Secretary</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Key Functions */}
      <section className="mb-16">
        <div className="flex items-center mb-8">
          <div className="bg-teal-700 p-3 rounded-full mr-4">
            <Scale className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-teal-700">Key Functions</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {icon: <UserCheck size={20} />, text: "Ensure equal opportunities for all members of the university community"},
            {icon: <Gavel size={20} />, text: "Address grievances related to discrimination or unequal treatment"},
            {icon: <Bookmark size={20} />, text: "Monitor implementation of inclusive policies and practices"},
            {icon: <Award size={20} />, text: "Promote diversity and inclusion through awareness programs"},
            {icon: <ClipboardList size={20} />, text: "Maintain records of complaints and resolutions"},
            {icon: <Mail size={20} />, text: "Liaise between different university departments on equality matters"}
          ].map((item, index) => (
            <div key={index} className="flex items-start bg-teal-50 p-5 rounded-lg border border-teal-100">
              <div className="text-teal-700 mr-4 mt-0.5">{item.icon}</div>
              <p className="text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}