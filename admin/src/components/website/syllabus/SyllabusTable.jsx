import { 
  TrashIcon, 
  DocumentTextIcon 
} from "@heroicons/react/24/outline";
import { syllabusApi } from "../../../services/apiService";

const SyllabusTable = ({ syllabuses, loading, activeTab, onDelete, onEdit }) => {
  return (
    <div className="bg-white shadow-md border border-gray-100 rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-left">
        <thead className="bg-[#525B88]">
          <tr>
            <th className="px-6 py-4 whitespace-nowrap text-xs font-bold text-white uppercase tracking-wider w-16">S. No</th>
            <th className="px-6 py-4 whitespace-nowrap text-xs font-bold text-white uppercase tracking-wider">Education</th>
            <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider min-w-[160px]">Program Name</th>
            <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider min-w-[200px]">Course Name</th>
            <th className="px-6 py-4 whitespace-nowrap text-xs font-bold text-white uppercase tracking-wider">Effective Year</th>
            <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider min-w-[160px]">Document</th>
            <th className="sticky right-0 z-10 bg-[#525B88] px-6 py-4 whitespace-nowrap text-right text-xs font-bold text-white uppercase tracking-wider shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.2)]">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {loading ? (
            <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400">Loading syllabuses...</td></tr>
          ) : syllabuses.length > 0 ? (
            syllabuses.map((item, index) => (
              <tr key={item._id} className="group hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{item.category}</td>
                <td className="px-6 py-4 text-sm text-gray-800 break-words">{item.department}</td>
                <td className="px-6 py-4 text-sm text-gray-700 break-words font-medium">{item.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-100 uppercase">
                    W.E.F {item.effectiveYear}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex flex-col space-y-1">
                    {item.files && item.files.map((file) => (
                      <a 
                        key={file._id}
                        href={syllabusApi.getFileUrl(item._id, file._id)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-[11px] group/file"
                        title={file.fileName}
                      >
                        <DocumentTextIcon className="w-3.5 h-3.5 mr-1 text-gray-400 group-hover/file:text-blue-600 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">{file.title}</span>
                      </a>
                    ))}
                  </div>
                </td>
                <td className="sticky right-0 z-10 bg-white group-hover:bg-gray-50 px-6 py-4 whitespace-nowrap text-right text-sm font-medium shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] transition-colors">
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => onEdit(item)}
                      title="Edit Syllabus"
                      className="p-1.5 cursor-pointer text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 hover:border-blue-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onDelete(item._id)}
                      title="Delete Syllabus"
                      className="p-1.5 cursor-pointer text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100 hover:border-red-300"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 italic">No syllabuses found for {activeTab}.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SyllabusTable;
