import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { editImage } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/fileUtils';
import { Download, Wand2, ArrowRight } from 'lucide-react';

// This global is loaded from a CDN in index.html
declare const saveAs: any;

export const ImageEditor: React.FC = () => {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalUrl, setOriginalUrl] = useState('');
    const [editedUrl, setEditedUrl] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileUpload = (uploadedFile: File) => {
        setOriginalFile(uploadedFile);
        setOriginalUrl(URL.createObjectURL(uploadedFile));
        setEditedUrl('');
        setError('');
    };

    const handleGenerate = async () => {
        if (!originalFile || !prompt.trim()) {
            setError('Kérjük, töltsön fel egy képet és adjon meg egy szerkesztési utasítást.');
            return;
        }

        setIsLoading(true);
        setError('');
        setEditedUrl('');

        try {
            const base64 = await fileToBase64(originalFile);
            const editedBase64 = await editImage(base64, originalFile.type, prompt);
            const url = `data:image/png;base64,${editedBase64}`;
            setEditedUrl(url);
        } catch (err: any) {
            setError(err.message || 'Ismeretlen hiba történt a kép szerkesztése közben.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!editedUrl || !originalFile) return;
        const originalName = originalFile.name.split('.').slice(0, -1).join('.') || originalFile.name;
        saveAs(editedUrl, `${originalName}_edited.png`);
    };

    if (!originalFile) {
        return (
             <FileUploader 
                onFileUpload={handleFileUpload}
                acceptedFileTypes="image/png,image/jpeg,image/webp"
                label="Töltsön fel egy képet a szerkesztéshez"
            />
        );
    }

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center p-3 bg-light border border-medium rounded-lg">
                <p className="font-semibold text-dark truncate">Fájl: <span className="font-normal text-muted">{originalFile.name}</span></p>
                <button
                    onClick={() => setOriginalFile(null)}
                    className="text-sm text-accent hover:underline"
                >
                    Másik fájl
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                 <div className="w-full aspect-square bg-light border border-medium rounded-lg flex items-center justify-center relative">
                    <img src={originalUrl} alt="Eredeti kép" className="w-full h-full object-contain rounded-md" />
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Eredeti</div>
                 </div>
                 <div className="w-full aspect-square bg-light border-2 border-dashed border-medium rounded-lg flex items-center justify-center relative">
                    {isLoading && <div className="animate-pulse text-muted">Szerkesztés...</div>}
                    {editedUrl && !isLoading && (
                        <>
                            <img src={editedUrl} alt="Szerkesztett kép" className="w-full h-full object-contain rounded-md" />
                            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Szerkesztett</div>
                             <button
                                onClick={handleDownload}
                                className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-md text-white hover:bg-black/70 transition-colors"
                                title="Szerkesztett kép letöltése"
                            >
                                <Download size={16}/>
                            </button>
                        </>
                    )}
                    {!editedUrl && !isLoading && <div className="text-muted p-4 text-center">A szerkesztett kép itt fog megjelenni.</div>}
                 </div>
            </div>

            <div>
                <label htmlFor="prompt-input" className="block mb-2 font-semibold text-dark">Szerkesztési Utasítás</label>
                <textarea
                    id="prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="pl., Adj a kutyára egy vicces kalapot, és változtasd a hátteret egy tengerpartra."
                    rows={3}
                    className="w-full bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent font-sans"
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Generálás...' : (
                    <>
                        <Wand2 size={20}/>
                        <span>Kép Szerkesztése</span>
                    </>
                )}
            </button>
            
            {error && <div className="text-red-500 text-center" role="alert">{error}</div>}
        </div>
    );
};
