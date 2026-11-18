import React from 'react';
import FileUpload from './FileUpload';

const DynamicSection = ({ 
    title, 
    items = [], 
    onUpdate, 
    fieldConfig = [],
    description
}) => {
    
    const handleFieldChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        onUpdate(newItems);
    };

    const handleFilesUploaded = (index, uploadedFiles) => {
        const newItems = [...items];
        const currentProofs = newItems[index].proofs || [];
        newItems[index] = { 
            ...newItems[index], 
            proofs: [...currentProofs, ...uploadedFiles] 
        };
        onUpdate(newItems);
    };

    const removeFile = (itemIndex, fileIndex) => {
         const newItems = [...items];
         const newProofs = newItems[itemIndex].proofs.filter((_, i) => i !== fileIndex);
         newItems[itemIndex].proofs = newProofs;
         onUpdate(newItems);
    };

    const addItem = () => {
        // Create initial object based on fields
        const newItem = fieldConfig.reduce((acc, field) => {
            acc[field.name] = "";
            return acc;
        }, { proofs: [] });
        onUpdate([...items, newItem]);
    };

    const removeItem = (index) => {
        onUpdate(items.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
            {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}

            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="p-4 bg-white rounded border border-gray-200 shadow-sm relative animate-in fade-in slide-in-from-bottom-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fieldConfig.map((field) => (
                                <div key={field.name} className={field.type === 'textarea' ? 'col-span-1 md:col-span-2' : ''}>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            className="w-full p-2 border rounded focus:ring-1 focus:ring-[#525b88] outline-none text-sm"
                                            rows="2"
                                            value={item[field.name] || ""}
                                            onChange={(e) => handleFieldChange(index, field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                        />
                                    ) : (
                                        <input
                                            type={field.type || 'text'}
                                            className="w-full p-2 border rounded focus:ring-1 focus:ring-[#525b88] outline-none text-sm"
                                            value={item[field.name] || ""}
                                            onChange={(e) => handleFieldChange(index, field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* File Uploads for this item */}
                        <div className="mt-4 border-t pt-3">
                             <div className="flex flex-wrap gap-2 mb-2">
                                {(item.proofs || []).map((file, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[150px]">
                                            {file.name}
                                        </a>
                                        <button 
                                            type="button" 
                                            onClick={() => removeFile(index, fIdx)}
                                            className="text-blue-400 hover:text-red-500 font-bold"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                             </div>
                             <FileUpload onUpload={(files) => handleFilesUploaded(index, files)} />
                        </div>

                        <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1"
                            title="Remove Item"
                        >
                            <span className="text-lg">×</span>
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addItem}
                className="mt-4 text-sm font-semibold text-[#525b88] hover:bg-blue-50 px-3 py-1.5 rounded transition-colors border border-transparent hover:border-blue-100 inline-flex items-center gap-1"
            >
                <span>+</span> Add {title}
            </button>
        </div>
    );
};

export default DynamicSection;
