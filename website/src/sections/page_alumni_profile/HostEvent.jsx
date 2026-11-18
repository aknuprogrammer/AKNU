import React from "react";
import { Users, BookOpen, Music, Laptop } from "lucide-react";

const HostEventSection = () => {
  const items = [
    {
      icon: <Users className="w-5 h-5 text-white" />,
      title: "Reunion Gatherings",
      desc: "Celebrate with your classmates in your city",
    },
    {
      icon: <BookOpen className="w-5 h-5 text-white" />,
      title: "Workshops",
      desc: "Academic or professional workshops hosted by alumni",
    },
    {
      icon: <Music className="w-5 h-5 text-white" />,
      title: "Cultural Showcases",
      desc: "Highlight alumni talent through cultural programs",
    },
    {
      icon: <Laptop className="w-5 h-5 text-white" />,
      title: "Virtual Events",
      desc: "Connect alumni globally with virtual celebrations",
    },
  ];

  return (
    <div className="w-full bg-gradient-to-b from-emerald-50 to-white py-12 px-4 sm:px-16" id="host-event">
      <div className="mx-auto bg-white rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row-reverse ">
        {/* Right Image */}
        <div className="md:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Alumni networking event with people socializing"
            className="w-full h-full object-cover min-h-[400px]"
          />
          {/* Gradient overlay for better text contrast if needed */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 md:opacity-100"></div>
        </div>

        {/* Left Content */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-teal-800 sm:text-3xl mb-4">
            Host Your Alumni Event
          </h2>
          <p className="text-gray-600 mb-8 text-[16px] leading-relaxed text-justify">
            Are you an alumni group interested in organizing a centenary
            celebration event? We invite alumni chapters worldwide to be part of
            this historic milestone by hosting their own events.
          </p>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12  bg-[#00786F] text-white">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-teal-900 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-tight">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Button → Opens Alumni Login modal */}
          <a
            href="#alumni/login"
            className="bg-[#00786F] text-white font-semibold px-7 py-3 shadow-lg hover:bg-teal-900 transition-all duration-300 inline-block text-center hover:shadow-xl transform hover:-translate-y-1"
          >
            PROPOSE YOUR EVENT
          </a>
        </div>
      </div>
    </div>
  );
};

export default HostEventSection;
