import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { transcribeAudio } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/fileUtils';
import { Clipboard } from 'lucide-react';

export const AudioTranscriber: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [transcribedText, setTranscribedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setIsLoading(true);
        setError('');
        setTranscribedText('');
        setCopySuccess('');

        try {
            const base64 = await fileToBase64(uploadedFile);
            const text = await transcribeAudio(base64, uploadedFile.type);
            setTranscribedText(text);
        } catch (err) {
            setError('Az audiofájl feldolgozása sikertelen. Kérjük, próbáljon meg egy másik fájlt.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(transcribedText).then(() => {
            setCopySuccess('Az átirat a vágólapra másolva!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Az átirat másolása sikertelen.');
        });
    };

    return (
        <div className="space-y-4">
            {!file && (
                <FileUploader 
                    onFileUpload={handleFileUpload}
                    acceptedFileTypes="audio/*"
                    label="Töltsön fel egy audiofájlt átíráshoz"
                />
            )}
            {isLoading && <div className="text-center p-8">Átírás folyamatban, ez több percig is eltarthat...</div>}
            {error && <div className="text-red-500 text-center">{error}</div>}
            {transcribedText && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg text-dark">A Hangfelvétel Átirata</h3>
                        <button onClick={handleCopy} className="flex items-center gap-2 bg-accent px-3 py-1 rounded text-white hover:bg-accent-hover transition-colors">
                            <Clipboard size={16}/> Másolás
                        </button>
                    </div>
                    {copySuccess && <p className="text-green-600 text-sm mb-2">{copySuccess}</p>}
                    <textarea
                        readOnly
                        value={transcribedText}
                        className="w-full p-2 bg-surface text-dark rounded border border-medium font-sans"
                        rows={15}
                    />
                </div>
            )}
        </div>
    );
};