import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { extractTextFromFile } from '../../utils/fileUtils';
import { processText } from '../../services/geminiService';
import { Download } from 'lucide-react';

// This global is loaded from a CDN in index.html
declare const saveAs: any;

type Mode = 'translate-hu' | 'translate-en' | 'summarize';

interface TextProcessorProps {
    mode: Mode;
}

const MODE_CONFIG = {
    'translate-hu': {
        label: 'Fordítás magyarra',
        prompt: 'Fordítsd le a következő szöveget magyarra.',
        fileLabel: 'Töltsön fel dokumentumot magyarra fordításhoz',
        suffix: '_forditas_hu',
    },
    'translate-en': {
        label: 'Fordítás angolra',
        prompt: 'Fordítsd le a következő szöveget angolra.',
        fileLabel: 'Töltsön fel dokumentumot angolra fordításhoz',
        suffix: '_forditas_en',
    },
    'summarize': {
        label: 'Dokumentum Összefoglalása',
        prompt: 'Készíts egy tömör összefoglalót a következő dokumentumról.',
        fileLabel: 'Töltsön fel dokumentumot összefoglaláshoz',
        suffix: '_osszefoglalo',
    }
};

export const TextProcessor: React.FC<TextProcessorProps> = ({ mode }) => {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const config = MODE_CONFIG[mode];

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setIsLoading(true);
        setError('');
        setResult('');

        try {
            const textContent = await extractTextFromFile(uploadedFile);
            if (!textContent) {
                throw new Error("Nem sikerült szöveget kinyerni a fájlból.");
            }
            const processedResult = await processText(textContent, config.prompt);
            setResult(processedResult);
        } catch (err: any) {
            setError(err.message || 'A fájl feldolgozása sikertelen. Kérjük, próbáljon meg egy másik fájlt.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!result || !file) return;

        const originalName = file.name.split('.').slice(0, -1).join('.') || file.name;
        const newFilename = `${originalName}${config.suffix}.txt`;
        
        const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, newFilename);
    };

    return (
        <div className="space-y-4">
            {!file && (
                <FileUploader 
                    onFileUpload={handleFileUpload}
                    acceptedFileTypes=".pdf,.docx,.txt"
                    label={config.fileLabel}
                />
            )}
            {isLoading && <div className="text-center p-8">Dokumentum feldolgozása... Ez nagyobb fájlok esetén eltarthat egy ideig.</div>}
            {error && <div className="text-red-500 text-center">{error}</div>}
            {result && (
                <div>
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-xl text-dark">Eredmény</h3>
                        <button 
                            onClick={handleDownload} 
                            className="flex items-center gap-2 bg-accent px-3 py-1 rounded-md text-white hover:bg-accent-hover transition-colors"
                            title="Eredmény letöltése .txt fájlként"
                        >
                            <Download size={16}/> Letöltés
                        </button>
                    </div>
                    <textarea
                        readOnly
                        value={result}
                        className="w-full h-80 p-2 bg-surface text-dark rounded-md border border-medium font-sans"
                    />
                </div>
            )}
        </div>
    );
};