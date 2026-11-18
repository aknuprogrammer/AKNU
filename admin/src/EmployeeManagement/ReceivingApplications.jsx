import SectionCard from "../common/SectionCard";

const ReceivingApplications = () => {
  return (
    <SectionCard
      title="Receiving Applications"
      description="View all applications submitted for hiring notifications."
    >
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Candidate</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Experience</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3">Rahul Sharma</td>
              <td className="p-3">Frontend Developer</td>
              <td className="p-3">3 Years</td>
              <td className="p-3 text-blue-600">Submitted</td>
            </tr>
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};

export default ReceivingApplications;
