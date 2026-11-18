import SectionCard from "../common/SectionCard";

const HiringNotification = () => {
  return (
    <SectionCard
      title="Create Hiring Notification"
      description="Create and publish job notifications for candidates to apply."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="input" placeholder="Job Title" />
        <input className="input" placeholder="Department" />
        <input className="input" placeholder="Required Experience" />
        <input className="input" placeholder="No. of Openings" />
      </div>

      <textarea
        className="input mt-4"
        rows={4}
        placeholder="Job Description"
      />

      <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Publish Notification
      </button>
    </SectionCard>
  );
};

export default HiringNotification;
