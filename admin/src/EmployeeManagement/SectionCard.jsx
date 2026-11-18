const SectionCard = ({ title, description, children }) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default SectionCard;
