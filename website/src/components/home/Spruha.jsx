import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Users,
  BookOpen,
  Globe,
  Briefcase,
  Mic,
  Handshake,
  Shield,
  Bookmark,
  BarChart,
  Award,
  LifeBuoy,
  Download,
} from "lucide-react";

import {
  badisa,
  bharathi,
  kosuri,
  logo,
  rajeshsrinivas,
  satulu,
  spruha,
  spruha1,
  spruha2,
  spruha3,
  spruha4,
  spruha5,
  spruha6,
  spruha7,
  spruha8,
  spruha9,
  spruha10,
  spruha11,
  spruha12,
  spruha13,
  spruha14,
  spruha15,
  spruha16,
  spruha17,
  spruha18,
  spruha19,
  spruha20,
  spruha21,
  spruha22,
  spruha23,
  spruha24,
  spruha25,
  spruha26,
  spruha27,
  spruha28,
  spruha29,
  spruha30,
  spruha31,
  spruha32,
  sunkar,
} from "../../assets";
import { BackButton } from "../BackButton";

// Replace these with your actual image imports bharathi
const ChandipriyaImg = badisa;
const BharathiImg = bharathi;
const RajeshImg = rajeshsrinivas;
const RadhikaImg = satulu;
const SrinivasaraoImg = kosuri;
const SpruhaLogo = logo;

export default function Spruha() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [
    spruha,
    spruha1,
    spruha2,
    spruha3,
    spruha4,
    spruha5,
    spruha6,
    spruha7,
    spruha8,
    spruha9,
    spruha10,
    spruha11,
    spruha12,
    spruha13,
    spruha14,
    spruha15,
    spruha16,
    spruha17,
    spruha18,
    spruha19,
    spruha20,
    spruha21,
    spruha22,
    spruha23,
    spruha24,
    spruha25,
    spruha26,
    spruha27,
    spruha28,
    spruha29,
    spruha30,
    spruha31,
    spruha32,
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Executive Committee Data
  const executiveCommittee = [
    {
      name: "Mr. Sunkara Nagendra Kishore",
      position: "President",
      description:
        "Asia Regional Coordinator for SCRA\nFounder director Sunkara Bhaskara Rao Sports & Games, R&D Centre",
      image: sunkar,
      bgColor: "bg-teal-700",
    },
    {
      name: "Mrs. Kosuri Chandipriya",
      position: "Vice-President",
      description: "Ex. Corporator",
      image: ChandipriyaImg,
      bgColor: "bg-teal-600",
    },
    {
      name: "Mrs. Bharathi Rathna",
      position: "Vice-President",
      description: "",
      image: BharathiImg,
      bgColor: "bg-teal-600",
    },
    {
      name: "Mr. S Rajesh Khanna",
      position: "Secretary",
      description: "Handwriting Expert",
      image: RajeshImg,
      bgColor: "bg-teal-700",
    },
    {
      name: "Mrs. Satuluri Radhika",
      position: "Treasurer",
      description: "",
      image: RadhikaImg,
      bgColor: "bg-teal-700",
    },
    {
      name: "Mr. Badisa Srinivasarao",
      position: "Joint Secretary",
      description: "",
      image: SrinivasaraoImg,
      bgColor: "bg-teal-700",
    },
  ];

  return (
    <div className="px-4 sm:px-16 pt-8 bg-white">
      <BackButton />
      {/* Header with Logo */}
      <div className="flex flex-col md:flex-row justify-between mb-16 gap-8">
        <div className="text-center md:text-left ">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-800 mb-2">SPRUHA</h1>
          <p className="text-xl text-teal-600 font-medium">
            Psychology Alumni Association
          </p>
          <p className="text-gray-600 mt-2">Adikavi Nannayya University</p>
        </div>
        <div className="w-full md:w-auto">
          <img
            src={SpruhaLogo}
            alt="SPRUHA Logo"
            className="h-40 object-contain mx-auto"
          />
        </div>
      </div>

      {/* About Section */}
      <section className="mb-20 bg-teal-50 rounded-2xl p-8 border border-teal-100">
        <div className="flex items-center mb-6">
          <div className="bg-teal-700 p-3 rounded-full mr-4">
            <GraduationCap className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-teal-700">About SPRUHA</h2>
        </div>
        <p className="text-gray-700 text-lg leading-relaxed text-[16px] text-justify">
          SPRUHA (Consciousness) is the Psychology Alumni Association of Adikavi
          Nannayya University, established to support the academic, career, and
          research development of psychology graduates through networking, skill
          development, and community engagement.
        </p>
      </section>

      {/* Objectives Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-teal-800 mb-3">
            Our Objectives
          </h2>
          <div className="w-24 h-1 bg-teal-700 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              icon: <BookOpen size={20} />,
              text: "The Association SPRUHA (Consciousness) Psychology Alumni Association of Adikavi Nannayya University is started to cater to the academic career and research development needs and activities of the past, present and future post graduate students of Adikavi Nannayya University.",
            },
            {
              icon: <Briefcase size={20} />,
              text: "To explore avenues for conducting workshops, diplomas, certificate courses, training programmes, etc., in affiliation to Adikavi Nannayya University or any other recognized hospitals or educational institutions.",
            },
            {
              icon: <BarChart size={20} />,
              text: "To take up academic project works, research works, surveys, and scientific studies (including Government and NGO's).",
            },
            {
              icon: <Users size={20} />,
              text: "The association intends to gather the support of the alumni to develop and sustain strong ties with each other and with the university.",
            },
            {
              icon: <Users size={20} />,
              text: "Promote interaction among alumni and provide newcomers with valuable social and professional contacts.",
            },
            {
              icon: <Mic size={20} />,
              text: "Organizing alumni meets, seminars, and other events.",
            },
            {
              icon: <Handshake size={20} />,
              text: "To foster a spirit of loyalty and to promote the general welfare of the University.",
            },
            {
              icon: <Handshake size={20} />,
              text: "To support the Adikavi Nannayya University goals, to strengthen the ties between alumni, the community, and the present organization.",
            },
            {
              icon: <Shield size={20} />,
              text: "To facilitate updating of latest knowledge and psychological testing/assessment in the area of psychology, to assist the people's psychological needs at qualitative and quantitative levels with guidance from faculty members and experts. Creating awareness and enhancing knowledge of psychology by publishing books, magazines, etc.",
            },
            {
              icon: <Globe size={20} />,
              text: "To maintain international standards and globalization by interacting with other psychology associations at national and international levels.",
            },
            {
              icon: <Award size={20} />,
              text: "To help psychology postgraduates appear for NET, SLET, and other competitive examinations by arranging coaching, motivational classes, and providing study material.",
            },
            {
              icon: <LifeBuoy size={20} />,
              text: "To impart motivational and counseling classes to students of municipal schools and other educational institutions along with academic and career counseling.",
            },
          ].map((item, index) => (
            <div key={index} className="flex items-start">
              <div className="bg-teal-100 p-2 rounded-lg mr-4 mt-1">
                <div className="text-teal-700">{item.icon}</div>
              </div>
              <p className="text-gray-700 flex-1 text-[16px] text-justify">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Executive Members Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-teal-800 mb-3">
            Executive Committee
          </h2>
          <div className="w-24 h-1 bg-teal-700 mx-auto"></div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {executiveCommittee.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`${member.bgColor} text-white p-5`}>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-teal-100">{member.position}</p>
              </div>
              <div className="p-6">
                {member.image ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-fill border-2 border-teal-100 mb-4"
                    />
                    {member.description && (
                      <p className="text-gray-600 text-center whitespace-pre-line text-[16px] text-justify">
                        {member.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 whitespace-pre-line text-[16px] text-justify">
                    {member.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PDF Section */}
      {/* Tall Image Container */}
      <div className="w-full max-w-6xl mx-auto mb-12 relative group">
        <div className="overflow-hidden rounded-lg">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((img, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <img
                  src={img}
                  alt={`SPRUHA Document ${index + 1}`}
                  className="w-full h-auto max-h-[1500px] object-contain mx-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
