import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { extractTextFromImage } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/fileUtils';
import { Clipboard } from 'lucide-react';

export const ImageToText: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setIsLoading(true);
        setError('');
        setExtractedText('');
        setCopySuccess('');

        try {
            const base64 = await fileToBase64(uploadedFile);
            const text = await extractTextFromImage(base64, uploadedFile.type);
            setExtractedText(text);
        } catch (err) {
            setError('A kép feldolgozása sikertelen. Kérjük, próbáljon meg egy másik fájlt.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(extractedText).then(() => {
            setCopySuccess('A szöveg a vágólapra másolva!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('A szöveg másolása sikertelen.');
        });
    };

    return (
        <div className="space-y-4">
            {!file && (
                <FileUploader 
                    onFileUpload={handleFileUpload}
                    acceptedFileTypes="image/*"
                    label="Töltsön fel egy képet a szöveg kinyeréséhez"
                />
            )}
            {isLoading && <div className="text-center p-8">Feldolgozás folyamatban, kérem várjon...</div>}
            {error && <div className="text-red-500 text-center">{error}</div>}
            {extractedText && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg text-dark">Kinyert Szöveg</h3>
                        <button onClick={handleCopy} className="flex items-center gap-2 bg-accent px-3 py-1 rounded text-white hover:bg-accent-hover transition-colors">
                            <Clipboard size={16}/> Másolás
                        </button>
                    </div>
                    {copySuccess && <p className="text-green-600 text-sm mb-2">{copySuccess}</p>}
                    <textarea
                        readOnly
                        value={extractedText}
                        className="w-full h-64 p-2 bg-surface text-dark rounded border border-medium font-mono"
                    />
                </div>
            )}
        </div>
    );
};