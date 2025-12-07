import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { analyzeImage } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/fileUtils';

export const ImageAnalysis: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [question, setQuestion] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileUpload = (uploadedFile: File) => {
        setFile(uploadedFile);
        setAnalysis('');
        setError('');
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsLoading(true);
        setError('');
        setAnalysis('');

        try {
            const base64 = await fileToBase64(file);
            const prompt = question.trim() === '' 
                ? 'Írja le ezt a képet részletesen. Térjen ki minden aspektusra, beleértve a tárgyakat, a környezetet, a hangulatot, a színeket és a lehetséges kontextust.' 
                : question;
            const result = await analyzeImage(base64, file.type, prompt);
            setAnalysis(result);
        } catch (err) {
            setError('A kép elemzése sikertelen. Kérjük, próbálja újra.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {!file && (
                <FileUploader 
                    onFileUpload={handleFileUpload}
                    acceptedFileTypes="image/*"
                    label="Töltsön fel egy képet elemzésre"
                />
            )}
            
            {file && (
                 <div className="text-center p-4 bg-light border border-medium rounded">
                    <p className="font-semibold text-dark">Kiválasztott fájl: {file.name}</p>
                    <button onClick={() => setFile(null)} className="text-sm text-accent hover:underline mt-1">Fájl cseréje</button>
                </div>
            )}

            {file && (
                <div>
                    <label htmlFor="question" className="block mb-2 font-semibold text-dark">Konkrét kérdés (opcionális)</label>
                    <input
                        id="question"
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="pl., Milyen évszak van a képen?"
                        className="w-full bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="mt-4 w-full bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Elemzés...' : 'Kép elemzése'}
                    </button>
                </div>
            )}

            {error && <div className="text-red-500 text-center">{error}</div>}

            {analysis && (
                <div>
                    <h3 className="font-semibold text-xl text-dark mb-2">Elemzés Eredménye</h3>
                    <div className="p-4 bg-surface text-dark rounded-md border border-medium whitespace-pre-wrap">
                        {analysis}
                    </div>
                </div>
            )}
        </div>
    );
};