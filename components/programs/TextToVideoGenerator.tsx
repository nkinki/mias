import React, { useState, useRef, useEffect } from 'react';
import { generateVideo, getVideosOperationStatus, processText } from '../../services/geminiService';
import { Download, Video, Wand2 } from 'lucide-react';

// This global is loaded from a CDN in index.html
declare const saveAs: any;

const STATUS_MESSAGES = [
    "MI gondolkodik a jeleneten...",
    "Koncepció kidolgozása...",
    "Kockák renderelése...",
    "Mozgás generálása...",
    "Videó összeállítása...",
    "Utolsó simítások..."
];

export const TextToVideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const pollingIntervalRef = useRef<number | null>(null);
    const statusIntervalRef = useRef<number | null>(null);

    const cleanupIntervals = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        if (statusIntervalRef.current) {
            clearInterval(statusIntervalRef.current);
            statusIntervalRef.current = null;
        }
    };

    useEffect(() => {
        // Cleanup on component unmount
        return () => cleanupIntervals();
    }, []);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('A leírás nem lehet üres.');
            return;
        }

        setIsLoading(true);
        setError('');
        setVideoUrl('');
        setStatus('Leírás fordítása angolra...');
        cleanupIntervals();
        
        // Start cycling through status messages
        let statusIndex = 0;
        statusIntervalRef.current = window.setInterval(() => {
            setStatus(STATUS_MESSAGES[statusIndex]);
            statusIndex = (statusIndex + 1) % STATUS_MESSAGES.length;
        }, 4000);


        try {
            const translationPrompt = "Fordítsd le a következő videó leírást angolra. Csak a lefordított szöveget add vissza, semmi más extra szöveget vagy magyarázatot ne fűzz hozzá. A leírás legyen élénk és részletes a legjobb eredmény érdekében.";
            const englishPrompt = await processText(prompt, translationPrompt);
            
            let operation = await generateVideo(englishPrompt.trim());
            
            pollingIntervalRef.current = window.setInterval(async () => {
                try {
                    operation = await getVideosOperationStatus(operation);
                    if (operation.done) {
                        cleanupIntervals();
                        setStatus("Videó feldolgozása...");
                        if (operation.response?.generatedVideos?.[0]?.video?.uri) {
                            const downloadLink = operation.response.generatedVideos[0].video.uri;
                            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                            if (!videoResponse.ok) {
                                throw new Error("A videófájl letöltése sikertelen.");
                            }
                            const videoBlob = await videoResponse.blob();
                            const url = URL.createObjectURL(videoBlob);
                            setVideoUrl(url);
                            setIsLoading(false);
                            setStatus('');
                        } else {
                             throw new Error("A generálási művelet befejeződött, de nem található videó URL.");
                        }
                    }
                } catch (pollError) {
                    setError("Hiba a videó állapotának lekérdezése közben. A folyamat leállt.");
                    cleanupIntervals();
                    setIsLoading(false);
                }
            }, 10000); // Poll every 10 seconds

        } catch (err: any) {
            setError(err.message || 'Ismeretlen hiba történt a videó generálása közben.');
            cleanupIntervals();
            setIsLoading(false);
            setStatus('');
        }
    };

    const handleDownload = () => {
        if (!videoUrl) return;
        const safeFilename = prompt.substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        saveAs(videoUrl, `${safeFilename || 'generalt_video'}.mp4`);
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="prompt-input" className="block mb-2 font-semibold text-dark">Videó Leírása</label>
                <textarea
                    id="prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="pl., Egy aranyos Corgi kutya szörfözik egy hatalmas óceáni hullámon, napsütésben."
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
                        <span>Videó Létrehozása</span>
                    </>
                )}
            </button>

            {error && <div className="text-red-500 text-center" role="alert">{error}</div>}
            
            <div className="w-full aspect-video bg-light border-2 border-dashed border-medium rounded-lg flex items-center justify-center relative overflow-hidden">
                {isLoading && (
                    <div className="text-center text-muted p-4">
                        <Video className="w-16 h-16 mx-auto animate-pulse" />
                        <p className="mt-4 font-semibold text-lg">{status || 'Videókészítés folyamatban...'}</p>
                        <p className="text-sm mt-1">Ez több percig is eltarthat. Kérjük, ne zárja be az ablakot.</p>
                    </div>
                )}
                {videoUrl && !isLoading && (
                    <>
                        <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
                        <button
                            onClick={handleDownload}
                            className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-md text-white hover:bg-black/70 transition-colors"
                            title="Videó letöltése"
                        >
                            <Download size={16}/>
                            <span>Letöltés</span>
                        </button>
                    </>
                )}
                {!videoUrl && !isLoading && (
                    <div className="text-center text-muted">
                        <Video className="w-16 h-16 mx-auto opacity-50" />
                        <p className="mt-2">A generált videó itt fog megjelenni.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
