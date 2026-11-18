import React from "react";
import { PlayCircle } from "lucide-react";
import { BackButton } from "../BackButton";

// Import your videos (update paths accordingly)
// import video1 from "../../assets/videos/AKNU WELCOMES YOU.mp4";
// import video2 from "../../assets/videos/Convocation New.mp4";
// import video3 from "../../assets/videos/MoU Ceremonies.mp4";
// import video4 from "../../assets/videos/SWZ Inter university weightlifting championship.mp4";

const VideoGallery = () => {
  const videos = [
    {
      id: 1,
      title: "Orientation Program 2023",
      src: "",
      description: "Welcome session for new psychology students",
    },
    {
      id: 2,
      title: "Research Methodology Workshop",
      src: "",
      description: "Hands-on training for postgraduate students",
    },
    {
      id: 3,
      title: "Alumni Interaction Session",
      src: "",
      description: "Career guidance from successful graduates",
    },
    {
      id: 4,
      title: "Mental Health Awareness",
      src: "",
      description: "Panel discussion with faculty experts",
    },
  ];

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8 pt-10">
      <div className="max-w-6xl mx-auto">
      <BackButton className="mb-10" />
        {/* Header */}
        <div className="text-left mb-12">
          <h2 className="text-3xl font-bold text-teal-800 mb-3">
            Video Gallery
          </h2>
          
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group relative bg-teal-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-teal-100"
            >
              {/* Video Thumbnail Container */}
              <div className="relative pt-[56.25%]">
                {" "}
                {/* 16:9 Aspect Ratio */}
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                >
                  <source src={video.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="text-white w-12 h-12" />
                </div>
              </div>

              {/* Video Info */}
              <div className="p-5">
                <h3 className="font-semibold text-lg text-teal-800 mb-2">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm">{video.description}</p>

                {/* Play Button for Mobile */}
                <div className="mt-4 flex items-center text-teal-700 md:hidden">
                  <PlayCircle className="mr-2 w-5 h-5" />
                  <span className="text-sm font-medium">Play Video</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoGallery;
