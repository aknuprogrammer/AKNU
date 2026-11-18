import React, { useState, useEffect } from 'react';
import { Users, Globe, Award } from 'lucide-react';

const Stats = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      number: "12K+",
      label: "Alumni Members",
      color: "from-emerald-400 to-green-500",
      icon: Users,
      delay: 0
    },
    {
      number: "15",
      label: "Countries Represented",
      color: "from-teal-400 to-cyan-500",
      icon: Globe,
      delay: 150
    },
    {
      number: "18+",
      label: "Years of Legacy",
      color: "from-lime-400 to-emerald-500",
      icon: Award,
      delay: 300
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`transform transition-all duration-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${stat.delay}ms` }}
            >
              <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 h-full border border-green-100">
                {/* Green accent bar */}
                <div className={`h-2 w-full bg-gradient-to-r ${stat.color}`}></div>
                
                <div className="p-8 text-center">
                  {/* Icon with green background */}
                  <div className="relative inline-flex">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${stat.color} blur-md group-hover:blur-lg transition-all duration-300 opacity-30`}></div>
                    <div className="relative flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-green-50 text-green-700 shadow-sm z-10 group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="w-10 h-10" />
                    </div>
                  </div>

                  {/* Number with green text */}
                  <h3 className="mt-6 text-4xl md:text-5xl font-bold text-green-800">
                    {stat.number}
                  </h3>

                  {/* Label */}
                  <p className="mt-2 text-lg font-medium text-green-600 group-hover:text-green-800 transition-colors duration-300">
                    {stat.label}
                  </p>
                </div>
                
                {/* Leaf decoration in corner */}
                <div className="absolute bottom-2 right-2 text-green-100 group-hover:text-green-200 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;