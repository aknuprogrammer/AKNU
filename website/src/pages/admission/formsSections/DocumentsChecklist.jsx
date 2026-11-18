import React, { useState, useEffect } from "react";

const DocumentsChecklist = ({
  formData,
  handleInputChange,
  handleFileUpload,
  documentsList,
}) => {
  const [fileNames, setFileNames] = useState({});
  const [submittedStatus, setSubmittedStatus] = useState({}); // NEW STATE

  // Convert documents object to array for iteration
  const documentsArray = formData.documents
    ? Object.keys(formData.documents).map((key) => ({
        docId: key,
        ...formData.documents[key],
      }))
    : [];

  // Initialize submittedStatus from formData on mount
  useEffect(() => {
    const initialStatus = {};
    documentsArray.forEach((doc) => {
      initialStatus[doc.docId] =
        doc.submitted === "yes" || doc.submitted === true;
    });
    setSubmittedStatus(initialStatus);
  }, []);

  const handleFileChange = (documentId, file, index, title) => {
    if (!file) return;

    // Allowed file types
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, JPG, and JPEG files are allowed.");
      return;
    }

    // Check file size (200 KB max)
    if (file.size > 200 * 1024) {
      alert("File size must not exceed 200 KB.");
      return;
    }

    // Update local file name for display
    setFileNames((prev) => ({
      ...prev,
      [documentId]: file.name,
    }));

    // Send file, docId, and title to parent form data
    handleFileUpload(documentId, file, title);

    // Automatically mark as submitted
    const fakeEvent = {
      target: {
        name: `documents.${documentId}.submitted`,
        type: "checkbox",
        checked: true,
      },
    };
    handleInputChange(fakeEvent);

    // Update local submitted status state
    setSubmittedStatus((prev) => ({
      ...prev,
      [documentId]: true,
    }));
  };

  if (!documentsList || documentsList.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
          Document Checklist
        </h3>
        <div className="text-center py-4 text-gray-500">
          No documents required at this time.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
        Upload documents (pdf/jpeg/jpg) -{" "}
        <span className="text-sm italic">
          Document size must be less than 200kb
        </span>
      </h3>

      {/* Table layout for larger screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-4 py-2 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document Title
              </th>
              {/* <th className="px-4 py-2 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Upload Document
              </th> */}
              <th className="px-4 py-2 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documentsList.map((document, index) => {
              const documentId = document._id || index;
              const docData =
                documentsArray.find((d) => d.docId === String(documentId)) ||
                {};

              return (
                <tr key={documentId}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-[550px] break-words">
                    {document.title || document.name}
                    {document.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </td>
                  {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span className="px-3 py-1 border border-blue-600 rounded text-sm">
                          Choose file
                        </span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) =>
                            handleFileChange(
                              documentId,
                              e.target.files[0],
                              index,
                              document.title || document.name
                            )
                          }
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                      <span className="ml-2 text-sm text-gray-500 truncate max-w-xs">
                        {fileNames[documentId] ||
                          (docData.file && docData.file.name) ||
                          "No file chosen"}
                      </span>
                    </div>
                  </td> */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-emarald-900">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`document-${documentId}`}
                        name={`documents.${documentId}.submitted`}
                        checked={submittedStatus[documentId] || false}
                        onChange={(e) => {
                          const checked = e.target.checked;

                          // Update local state
                          setSubmittedStatus((prev) => ({
                            ...prev,
                            [documentId]: {
                              checked: checked,
                              title: document.title || document.name,
                            },
                          }));

                          // Update parent form data
                          const fakeEvent = {
                            target: {
                              name: `documents.${documentId}.submitted`,
                              type: "checkbox",
                              checked,
                              title: document.title || document.name,
                            },
                          };
                          handleInputChange(fakeEvent);
                        }}
                        // disabled
                        className="h-4 w-4 text-emerald-600 rounded"
                      />
                      {/* <label
                        htmlFor={`document-${documentId}`}
                        className="ml-2 text-gray-700"
                      >
                        {docData.submitted === "yes" ? "Yes" : "No"}
                      </label> */}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Card layout for small screens */}
      <div className="md:hidden space-y-4">
        {documentsList.map((document, index) => {
          const documentId = document._id || index;
          const docData =
            documentsArray.find((d) => d.docId === String(documentId)) || {};

          return (
            <div
              key={documentId}
              className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {index + 1}. {document.title || document.name}
                  {document.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </span>
              </div>

              {/* <div className="mb-2">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span className="px-3 py-1 border border-blue-600 rounded text-sm">
                    Choose file
                  </span>
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(e) =>
                      handleFileChange(
                        documentId,
                        e.target.files[0],
                        index,
                        document.title || document.name
                      )
                    }
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </label>
                <span className="ml-2 text-sm text-gray-500 truncate block">
                  {fileNames[documentId] ||
                    (docData.file && docData.file.name) ||
                    "No file chosen"}
                </span>
              </div> */}


              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`document-${documentId}`}
                  name={`documents.${documentId}.submitted`}
                  checked={submittedStatus[documentId] || false}
                  onChange={(e) => {
                    const checked = e.target.checked;
console.log("__checked",checked)
                    // Update local state
                    setSubmittedStatus((prev) => ({
                      ...prev,
                      [documentId]: {
                        checked: checked,
                        title: document.title || document.name,
                      },
                    }));

                    // Update parent form data
                    const fakeEvent = {
                      target: {
                        name: `documents.${documentId}.submitted`,
                        type: "checkbox",
                        checked,
                        title: document.title || document.name,
                      },
                    };
                    handleInputChange(fakeEvent);
                  }}
                  // disabled
                  className="h-4 w-4 text-emerald-600 rounded"
                />
                {/* <label
                  htmlFor={`document-${documentId}`}
                  className="ml-2 text-gray-700"
                >
                  {docData.submitted === "yes" ? "Yes" : "No"}
                </label> */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsChecklist;
