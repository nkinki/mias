import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploaderProps {
    onFileUpload: (file: File) => void;
    acceptedFileTypes: string;
    label: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, acceptedFileTypes, label }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
        }
    };
    
    const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileUpload(e.dataTransfer.files[0]);
        }
    }, [onFileUpload]);


    return (
        <div 
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`
                relative border-2 border-dashed border-medium rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-300
                ${isDragging ? 'bg-accent-light border-accent' : 'hover:bg-gray-100'}
            `}
        >
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept={acceptedFileTypes}
            />
            <div className="flex flex-col items-center justify-center text-muted pointer-events-none">
                <UploadCloud className="w-16 h-16 mb-4" />
                <p className="font-semibold text-dark">{label}</p>
                <p className="text-sm">vagy húzza ide a fájlt</p>
            </div>
        </div>
    );
};