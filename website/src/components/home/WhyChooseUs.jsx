import { whyChooseUs } from "../../siteData/homeData";

export default function WhyChooseGITAM() {
  return (
    <section
      className="bg-white px-4 sm:px-16 pt-10 md:pt-16"
      id="why-choose-us"
    >
      <div className=" ">
        <div className="mb-10 inline-block">
          <h2 className="text-3xl font-bold text-teal-800">
            Why choose Adikavi Nannaya University?
          </h2>
          <div className="border-t border-yellow-300 h-[0.5px] mb-2 w-full" />
        </div>

        <div className=" w-full grid grid-cols-1 md:grid-cols-4 gap-8">
          {whyChooseUs.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center px-4"
            >
              <feature.icon className="w-12 h-12 text-teal-800 mb-4" />
              <h3 className="font-semibold text-xl text-teal-800">
                {feature.title}
              </h3>
              <p className="text-[16px] mt-3">{feature.description}</p>
              {/* <hr className="border w-full h-[0.1px] bg-red-500" /> */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
