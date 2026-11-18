import SectionCard from "../common/SectionCard";

const FollowUpShortlisting = () => {
  return (
    <SectionCard
      title="Follow-Up & Shortlisting"
      description="Review applications and shortlist required candidates."
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center border p-4 rounded-lg">
          <div>
            <p className="font-medium">Anita Verma</p>
            <p className="text-sm text-gray-500">Backend Developer | 4 Years</p>
          </div>

          <div className="space-x-2">
            <button className="px-3 py-1 bg-green-100 text-green-700 rounded">
              Shortlist
            </button>
            <button className="px-3 py-1 bg-red-100 text-red-700 rounded">
              Reject
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default FollowUpShortlisting;
