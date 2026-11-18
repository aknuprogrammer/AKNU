import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { performanceApi } from '../../services/performanceService';

const FileUpload = ({ onUpload, label = "Upload Proof" }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const uploadPromises = files.map(async (file) => {
             // Validate size
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`File ${file.name} exceeds 5MB limit`);
                return null;
            }
            // Validate type
            if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                toast.error(`File ${file.name} type not supported`);
                return null;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const data = await performanceApi.uploadProof(formData);
                return { url: data.url, name: data.originalname }; 
            } catch (error) {
                console.error(error);
                toast.error(`Failed to upload ${file.name}`);
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter(r => r !== null);
        
        if (successfulUploads.length > 0) {
            onUpload(successfulUploads);
        }
        setUploading(false);
        // Reset input
        e.target.value = null;
    };

    return (
        <div className="mt-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors border border-gray-300">
                <span>{uploading ? "Uploading..." : `📎 ${label}`}</span>
                <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
            </label>
        </div>
    );
};

export default FileUpload;
