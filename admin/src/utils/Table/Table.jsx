export default function Table({ headings, children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
      <table className="min-w-full border-collapse text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {headings?.map((head, i) => (
              <th
                key={i}
                className="px-4 py-3 text-sm font-semibold border-b border-gray-200"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children, index, className }) {
  // alternate row colors
  const bgColor = index % 2 === 0 ? "bg-white" : "bg-gray-50";

  return (
    <tr className={`${bgColor} hover:bg-blue-50 transition ${className}`}>
      {children}
    </tr>
  );
}

export function Cell({ children, align = "left", className }) {
  return (
    <td
      className={`px-4 py-3 text-sm text-gray-700 border-b text-${align} ${className}`}
    >
      {children}
    </td>
  );
}
