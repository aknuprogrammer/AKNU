import { img_T_Hymavathi, K_Ramaneswari, sreeramesh15 } from "../../../assets";
export function Section_Mens_Warden() {
  return (
    <div className="flex flex-col md:flex-row w-full min-h-[260px]">
      <div className="bg-teal-700 md:w-1/4 flex flex-col items-center justify-start pt-10 pb-6">
        <img
          className="w-[210px] h-[210px] object-fill bg-white border-4 border-white mb-4 shadow-md m-0 p-0"
          src={sreeramesh15}
          alt="Prof. K S Ramesh"
        />
        <div className="text-white font-bold text-xl mt-4 mb-1 text-center w-[90%]">
          Prof. K S Ramesh
        </div>
        <div className="text-white text-lg text-center w-[90%] mt-2.5">
          Chief Warden, University Men's Hostel
        </div>
        <div className="text-white text-base mb-1 text-center w-[90%] mt-4">
          Phone: +70 93 00 84 80
        </div>
        <div className="text-white text-base text-center w-[90%]">
          Email: warden.mens.hostel@university.edu
        </div>
      </div>

      <div className="bg-white md:w-3/4 p-10 flex flex-col justify-center">
        <div className="font-bold text-teal-700 text-lg mb-4">
          About The Warden
        </div>
        <div className="text-[#374151] text-base leading-relaxed text-justify">
          Prof. K S Ramesh serves as the Chief Warden of the University Men's
          Hostel at Adikavi Nannaya University. With a deep commitment to
          student welfare and campus life, Prof. Ramesh ensures the smooth
          administration of the hostel while upholding discipline and fostering
          a sense of community among residents. He plays a pivotal role in
          creating a secure, inclusive, and academically supportive environment
          where students can thrive. Under his leadership, the Men's Hostel
          continues to serve as a home that nurtures personal growth,
          responsibility, and camaraderie.
        </div>
      </div>
    </div>
  );
}

export function Section_Womens_Warden() {
  return (
    <div className="flex flex-col md:flex-row w-full min-h-[260px]">
      <div className="bg-teal-700 md:w-1/4 flex flex-col items-center justify-start pt-10 pb-6">
        <img
          className="w-[210px] h-[210px] object-fill bg-white border-4 border-white mb-4 shadow-md"
          src={img_T_Hymavathi}
          alt="Prof. T. Hymavathi"
        />
        <div className="text-white font-bold text-xl mt-4 mb-1 text-center w-[90%]">
          Prof. T. Hymavathi
        </div>
        <div className="text-white text-lg text-center w-[90%] mt-2.5">
          Chief Warden, University Women's Hostel
        </div>
        <div className="text-white text-base mb-1 text-center w-[90%] mt-4">
          7093008481
        </div>
        <div className="text-white text-base text-center w-[90%]">
          hrw@aknu.edu.in
        </div>
      </div>

      <div className="bg-white md:w-3/4 p-10 flex flex-col justify-center">
        <div className="font-bold text-teal-700 text-lg mb-4">
          About The Warden
        </div>
        <div className="text-[#374151] text-base leading-relaxed text-justify">
      Dr. T. Hymavathi serves as the Chief Warden of the University Women’s Hostel at Adikavi Nannaya University, playing a key role in ensuring the well-being and welfare of resident students. She supervises the effective administration and day-to-day operations of the hostel, maintaining a safe, supportive, and inclusive living environment.

Committed to student empowerment and holistic development, she promotes a culture of discipline, mutual respect, and academic motivation within the hostel community. Through her dedicated leadership, the hostel provides a nurturing atmosphere that supports students in achieving both personal growth and academic success.
        </div>
      </div>
    </div>
  );
}

export function Section_Space() {
  return (
    <div className="bg-white rounded-xl overflow-hidden ">
      <div className="">
        <p className="text-gray-700 leading-relaxed text-lg mb-6">
          Take a look at a few glimpses of the Men’s Hostel space – designed to
          provide comfortable living, vibrant common areas, and focused study
          environments for residents.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            "https://media.istockphoto.com/id/182498079/photo/youth-hostel-dorm-room.jpg?s=1024x1024&w=is&k=20&c=gd5XwYE8KZ5mqBVrX8IoGWsKCwdx53BcgYTB9tp5rnw=",
            "https://media.gettyimages.com/id/929432194/photo/the-barn-sutton-bonington-campus-nottingham-united-kingdom-architect-make-ltd-2015.jpg?s=1024x1024&w=gi&k=20&c=W7GW71jnBV24VEBxfqU-hv2G5tfVdC72CDfzJ3XtK8I=",
            "https://chennai.vit.ac.in/wp-content/uploads/2020/01/hostel-banner-1536x695.jpg",
            // "https://www.stanzaliving.com/_next/image?url=https%3A%2F%2Fasset-cdn.stanzaliving.com%2Fstanza-living%2Fimage%2Fupload%2Ff_auto%2Cq_auto%2Fe_improve%2Fe_sharpen%3A10%2Fe_saturation%3A10%2Ff_auto%2Cq_auto%2Fv1662989502%2FWebsite%2FCMS-Uploads%2Fnq3qxi2skq3tyuxcwh4x.jpg&w=1920&q=75",
            // "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1974&auto=format&fit=crop",
            // "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1974&auto=format&fit=crop",
          ].map((src, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl shadow-md"
            >
              <img
                src={src}
                alt={`Hostel space ${idx + 1}`}
                className="w-full h-56 object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FandA() {
  return (
    <div className="bg-white rounded-xl overflow-hidden ">
      <div className="">
        <ul className="space-y-4 list-disc pl-5 text-gray-700 text-[16px]">
          <li>Fully furnished rooms (single & shared occupancy)</li>
          <li>Nutritious meals served daily in the dining hall</li>
          <li>Wi-Fi-enabled study areas and reading rooms</li>
          <li>Common room with TV, newspapers, and indoor games</li>
          <li>Round-the-clock security and resident wardens</li>
          <li>Clean drinking water and regular housekeeping</li>
        </ul>
      </div>
    </div>
  );
}

// Girls/Women's hostel "Space" section with image grid
export function Section_Womens_Space() {
  return (
    <div className="bg-white rounded-xl overflow-hidden ">
      <div className="">
        <p className="text-gray-700 leading-relaxed text-lg mb-6">
          Explore a glimpse of the Women’s Hostel spaces – crafted for comfort,
          learning, and well‑being.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1469&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1593136573819-c3b57b8caf29?q=80&w=1470&auto=format&fit=crop",
            "https://media.gettyimages.com/id/509114480/photo/beautiful-young-woman-working-at-home.jpg?s=1024x1024&w=gi&k=20&c=a0JXjDNcMQuvOfYQeP6CeOVKzPf2z-0G-iNbr4U3i3s=",
            // "https://media.istockphoto.com/id/1421420537/photo/peace-relax-and-happy-mindset-of-a-woman-from-indonesia-taking-a-mind-and-meditation-home.jpg?s=1024x1024&w=is&k=20&c=RkED6EynXPa-gRYwo906T5J__Bx6NkH-F-9WIIABFRg=",
            // "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1974&auto=format&fit=crop",
            // "https://images.unsplash.com/photo-1593820910501-cd18f7b9b75f?q=80&w=1974&auto=format&fit=crop",
          ].map((src, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl shadow-md"
            >
              <img
                src={src}
                alt={`Women hostel space ${idx + 1}`}
                className="w-full h-56 object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
