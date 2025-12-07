import React, { useState } from 'react';
import { generateImageFromText, processText } from '../../services/geminiService';
import { Download, Image as ImageIcon, Wand2 } from 'lucide-react';

// This global is loaded from a CDN in index.html
declare const saveAs: any;

export const TextToImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('A leírás nem lehet üres.');
            return;
        }

        setIsLoading(true);
        setError('');
        setImageUrl('');
        setStatus('');

        try {
            setStatus('Leírás fordítása angolra...');
            const translationPrompt = "Fordítsd le a következő szöveget angolra. Csak a lefordított szöveget add vissza, semmi más extra szöveget vagy magyarázatot ne fűzz hozzá.";
            const englishPrompt = await processText(prompt, translationPrompt);
            
            setStatus('Kép generálása az MI segítségével...');
            const themedPrompt = `${englishPrompt.trim()}, photorealistic, cinematic lighting, 4k, high detail`;
            const base64Image = await generateImageFromText(themedPrompt);
            const url = `data:image/png;base64,${base64Image}`;
            setImageUrl(url);
        } catch (err: any) {
            setError(err.message || 'Ismeretlen hiba történt a kép generálása közben.');
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };

    const handleDownload = () => {
        if (!imageUrl) return;
        const safeFilename = prompt.substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        saveAs(imageUrl, `${safeFilename || 'generalt_kep'}.png`);
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="prompt-input" className="block mb-2 font-semibold text-dark">Kép Leírása</label>
                <textarea
                    id="prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="pl., Egy modern üvegépület homlokzata tükrözi a naplementét egy nyüzsgő városban."
                    rows={4}
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
                        <span>Kép Létrehozása</span>
                    </>
                )}
            </button>

            {error && <div className="text-red-500 text-center" role="alert">{error}</div>}
            
            <div className="w-full aspect-square bg-light border-2 border-dashed border-medium rounded-lg flex items-center justify-center relative">
                {isLoading && (
                    <div className="text-center text-muted">
                        <ImageIcon className="w-16 h-16 mx-auto animate-pulse" />
                        <p className="mt-2">{status || 'Képalkotás folyamatban...'}</p>
                    </div>
                )}
                {imageUrl && !isLoading && (
                    <>
                        <img src={imageUrl} alt={prompt} className="w-full h-full object-contain rounded-md" />
                        <button
                            onClick={handleDownload}
                            className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-md text-white hover:bg-black/70 transition-colors"
                            title="Kép letöltése"
                        >
                            <Download size={16}/>
                            <span>Letöltés</span>
                        </button>
                    </>
                )}
                {!imageUrl && !isLoading && (
                    <div className="text-center text-muted">
                        <ImageIcon className="w-16 h-16 mx-auto opacity-50" />
                        <p className="mt-2">A generált kép itt fog megjelenni.</p>
                    </div>
                )}
            </div>
        </div>
    );
};