import SectionCard from "../common/SectionCard";

const SelectedCandidates = () => {
  return (
    <SectionCard
      title="Selected Candidates"
      description="Convert selected candidates into employees."
    >
      <div className="border p-4 rounded-lg flex justify-between items-center">
        <div>
          <p className="font-medium">Suresh Kumar</p>
          <p className="text-sm text-gray-500">UI/UX Designer</p>
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Create Employee
        </button>
      </div>
    </SectionCard>
  );
};

export default SelectedCandidates;
