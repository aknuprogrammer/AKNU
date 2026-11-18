import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const ConnectWithUs = () => {
  const hashtags = [
    {
      tag: "#AKNU18Years",
      desc: "Our official centenary hashtag for all celebrations and events.",
    },
    {
      tag: "#AKNUAlumni",
      desc: "Connect with fellow alumni across generations and departments.",
    },
    {
      tag: "#MyAKNUStory",
      desc: "Share your personal memories and experiences from your time at AKNU.",
    },
  ];

  return (
    <div className="relative text-center py-16 px-4 sm:px-16" id="connect">
      <div className="relative text-center py-10 px-4 sm:px-12 shadow-md rounded-md teal-css-gradient">
        {/* Background Pattern Overlay */}
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Heading */}
          <h2 className="text-3xl font-bold text-white sm:text-3xl">
            Connect With Us
          </h2>
          <p className="max-w-3xl mx-auto mb-5 text-[16px] text-white">
            Help spread the word about our centenary celebrations through your
            social media channels. Use our official hashtags to share your
            memories and connect with fellow alumni.
          </p>

          {/* Hashtag Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-5">
            {hashtags.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/90 rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  {item.tag}
                </h3>
                <p className="text-gray-700 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Social Icons */}
          <p className="text-white font-medium mb-4">
            Follow us and share your AKNU memories :
          </p>
          <div className="flex justify-center gap-6">
            <a
              href="https://www.youtube.com/channel/UCWk6lIyf9JGKx84fZCWmDyQ"
              target="_blank"
              className="p-3 rounded-full bg-white hover:bg-white shadow transition"
            >
              <Youtube className="w-5 h-5 text-red-600" />
            </a>
            <a
              href="https://www.facebook.com/people/Adikavi-Nannaya-University/100064032637610/"
              target="_blank"
              className="p-3 rounded-full bg-white hover:bg-white shadow transition"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
            </a>
            {/* <a
              href="#"
              className="p-3 rounded-full bg-white hover:bg-white shadow transition"
              target="_blank"
            >
              <Twitter className="w-5 h-5 text-sky-500" />
            </a> */}
            <a
              href="https://www.instagram.com/aknu_rjy/"
              className="p-3 rounded-full bg-white hover:bg-white shadow transition"
              target="_blank"
            >
              <Instagram className="w-5 h-5 text-pink-600" />
            </a>
            <a
              href="https://www.linkedin.com/school/s.k.v.t.degree-college/"
              className="p-3 rounded-full bg-white hover:bg-white shadow transition"
              target="_blank"
            >
              <Linkedin className="w-5 h-5 text-blue-700" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWithUs;
