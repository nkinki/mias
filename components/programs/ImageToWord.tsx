import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { extractTextFromImage } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/fileUtils';

// This global is loaded from a CDN in index.html
declare const saveAs: any;

export const ImageToWord: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState('');

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setStatus('Kép feldolgozása...');

        try {
            const base64 = await fileToBase64(uploadedFile);
            setStatus('Szöveg kinyerése a képből...');
            const text = await extractTextFromImage(base64, uploadedFile.type);
            
            setStatus('Word dokumentum generálása...');
            
            // Note: This creates a simple text-only Word file.
            // For a full client-side library, 'docx' would be used, but it's complex.
            // This method creates a basic .doc file compatible with Word.
            const blob = new Blob([text], { type: 'application/msword' });
            saveAs(blob, `${uploadedFile.name.split('.')[0]}_extracted.doc`);
            
            setStatus(`Siker! A dokumentum letöltve.`);

        } catch (err) {
            setStatus('Hiba: Nem sikerült feldolgozni a képet és létrehozni a dokumentumot.');
            console.error(err);
        }
    };

    return (
        <div className="space-y-4">
            <FileUploader 
                onFileUpload={handleFileUpload}
                acceptedFileTypes="image/*"
                label="Töltsön fel egy képet Word-be konvertáláshoz"
            />
            {status && (
                <div className="text-center p-4 bg-light border border-medium rounded">
                    <p className="font-semibold text-dark">{status}</p>
                    {file && <p className="text-sm text-muted mt-2">Fájl: {file.name}</p>}
                </div>
            )}
        </div>
    );
};