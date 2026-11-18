import React from "react";
import {
  Backpack,
  HeartHandshake,
  Scale,
  Speech,
  Droplets,
  PartyPopper,
  ShieldAlert,
  Users,
  HeartPulse,
  BookOpenCheck,
  HandHeart,
  Megaphone,
  AlertCircle,
} from "lucide-react";
import { BackButton } from "../BackButton";
import { uday9 } from "../../assets";

export default function Studentaffairs() {
  return (
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      {/* Header Section */}
       <div className=" mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-teal-800 mb-4 ">
          {/* <Backpack className="mr-3" size={40} /> */}
          Student Affairs Division
        </h1>
        <p className="text-lg text-gray-600  text-[16px]">
          Youth is the backbone of a country" - Swami Vivekananda. We nurture
          our students through various services and resources to help them grow
          into responsible citizens.
        </p>
      </div>
 

      {/* Profile Section */}
      <div className="flex flex-col md:flex-row mt-4 sm:mt-6 mb-12">
        <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
          <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
            <img
              src={uday9}
              alt="Prof. N Udaya Bhaskar"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
            Prof. N Udaya Bhaskar
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            Dean Student Affairs
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
            {/* deanstudentaffairs@aknu.edu.in */}
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            {/* +91 7093008476 */}
          </div>
        </div>

        <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
          <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
            About Student Affairs
          </h3>
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
            <p>
              The Office of the Dean, Student Affairs at Adikavi Nannaya University functions as a central administrative body responsible for student welfare, campus discipline, extracurricular development, grievance redressal, and coordination of student-oriented activities within the university. The office acts as a liaison between the university administration and students, ensuring the effective implementation of academic support services, cultural programmes, sports activities, counselling initiatives, and student welfare schemes.
            </p>
            <p>
              The Dean, Student Affairs oversees various student-related committees and facilitates programmes that contribute to the holistic development of students. The office also coordinates activities related to student unions, anti-ragging measures, mentoring systems, community engagement, and institutional events. It plays a significant role in maintaining a conducive academic environment and promoting leadership, inclusivity, and ethical conduct among students.
            </p>
          </div>
        </div>
      </div>
    
      {/* About Section */}
      <section className="mb-12">
        <h2  className="text-3xl w-[50vw] flex font-bold text-left text-teal-800 mb-4 mt-16">
          <HeartHandshake className="mr-2" />
          Our Mission
        </h2>
        <p className="text-gray-700 mb-6 text-[16px] text-justify">
          The Student Affairs Division encourages student involvement in
          diversified activities like youth festivals, blood donation, Swachh
          Bharat, and more. We strive for the smooth running of the university
          while fostering holistic development.
        </p>
      </section>

      {/* Objectives Section */}
      <section className="mb-12">
        <h2  className="text-3xl w-[50vw] flex font-bold text-left text-teal-800 mb-4 mt-16">
          <Scale className="mr-2" />
          Objectives
        </h2>
        <ul className="grid md:grid-cols-2 gap-4">
          <li className="flex items-start mb-3">
            <span className="bg-teal-100 text-teal-700 rounded-full p-1 mr-3">
              <BookOpenCheck size={18} />
            </span>
            <span>
              Conduct programs that enhance students' confidence and justified
              thinking
            </span>
          </li>
          <li className="flex items-start mb-3">
            <span className="bg-teal-100 text-teal-700 rounded-full p-1 mr-3">
              <Users size={18} />
            </span>
            <span>
              Encourage youth's efforts for achieving high levels of purity in
              thoughts, words, and deeds
            </span>
          </li>
          <li className="flex items-start mb-3">
            <span className="bg-teal-100 text-teal-700 rounded-full p-1 mr-3">
              <HandHeart size={18} />
            </span>
            <span>
              Facilitate attitudes of brotherhood, tolerance, and non-violence
              for personality development
            </span>
          </li>
          <li className="flex items-start mb-3">
            <span className="bg-teal-100 text-teal-700 rounded-full p-1 mr-3">
              <HeartPulse size={18} />
            </span>
            <span>
              Impart moral values to prepare students for balanced and contented
              lives
            </span>
          </li>
          <li className="flex items-start mb-3">
            <span className="bg-teal-100 text-teal-700 rounded-full p-1 mr-3">
              <ShieldAlert size={18} />
            </span>
            <span>
              Protect students from drugs, alcohol, smoking, violence, and
              destructive tendencies
            </span>
          </li>
          <li className="flex items-start mb-3">
            <span className="bg-teal-100 text-teal-700 rounded-full p-1 mr-3">
              <Megaphone size={18} />
            </span>
            <span>
              Promote students' spirit of service and sacrifice through
              community welfare
            </span>
          </li>
        </ul>
      </section>

      {/* Duties Section */}
      <section className="mb-12">
        <h2  className="text-3xl w-[50vw] flex font-bold text-left text-teal-800 mb-4 mt-16">
          <Speech className="mr-2" />
          Duties
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-teal-50 p-6 rounded-lg border border-teal-100">
            <div className="flex items-center mb-3">
              <ShieldAlert className="text-teal-700 mr-2" />
              <h3 className="font-medium text-teal-700">
                Anti-Ragging Activities
              </h3>
            </div>
            <p className="text-gray-600">
              Ensuring a safe and welcoming environment for all students.
            </p>
          </div>
          <div className="bg-teal-50 p-6 rounded-lg border border-teal-100">
            <div className="flex items-center mb-3">
              <Users className="text-teal-700 mr-2" />
              <h3 className="font-medium text-teal-700">Student Counseling</h3>
            </div>
            <p className="text-gray-600">
              Providing guidance and support for personal and academic
              challenges.
            </p>
          </div>
          <div className="bg-teal-50 p-6 rounded-lg border border-teal-100">
            <div className="flex items-center mb-3">
              <Megaphone className="text-teal-700 mr-2" />
              <h3 className="font-medium text-teal-700">
                Communication Skills
              </h3>
            </div>
            <p className="text-gray-600">
              Developing effective communication abilities for personal and
              professional growth.
            </p>
          </div>
          <div className="bg-teal-50 p-6 rounded-lg border border-teal-100">
            <div className="flex items-center mb-3">
              <Droplets className="text-teal-700 mr-2" />
              <h3 className="font-medium text-teal-700">Medical Camps</h3>
            </div>
            <p className="text-gray-600">
              Organizing health check-ups and blood donation drives for
              community welfare.
            </p>
          </div>
          <div className="bg-teal-50 p-6 rounded-lg border border-teal-100">
            <div className="flex items-center mb-3">
              <PartyPopper className="text-teal-700 mr-2" />
              <h3 className="font-medium text-teal-700">Youth Festivals</h3>
            </div>
            <p className="text-gray-600">
              Celebrating talent and fostering creativity through cultural
              events.
            </p>
          </div>
        </div>
      </section>

      {/* Anti-Ragging Measures */}
      <section className="mb-12">
        <h2  className="text-3xl w-[50vw] font-bold text-left flex text-teal-800 mb-4 mt-16">
          <AlertCircle className="mr-2" />
          Anti-Ragging Measures
        </h2>
        <div className="bg-red-50 border border-red-100 rounded-lg p-6">
          <h3 className="text-xl font-medium text-red-700 mb-4">
            Our Comprehensive Approach to Prevent Ragging
          </h3>
          <ul className="grid md:grid-cols-2 gap-4">
            {[
              "Undertaking letters from students and parents at admission",
              "Anti-Ragging committees at University, College, Department, and Hostel levels",
              "Anti-Ragging helpline numbers displayed across campus",
              "Anti-Ragging squads for surprise visits to hostels",
              "Classroom notices about Anti-Ragging policies",
              "Banners displaying punishments for ragging activities",
              "Complaint boxes at hostels and classroom buildings",
              "Counselors appointed for small groups of students",
              "Maintained Anti-Ragging registers at all levels",
              "Anti-ragging posters displayed throughout campus",
              "Regular awareness programs conducted",
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="bg-red-100 text-red-700 rounded-full p-1 mr-3">
                  <ShieldAlert size={16} />
                </span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final Note */}
    </div>
  );
}
