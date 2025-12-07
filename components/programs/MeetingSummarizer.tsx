import React, { useState } from 'react';
import { processText } from '../../services/geminiService';
import { Clipboard, Download, BookCheck } from 'lucide-react';

// This global is loaded from a CDN in index.html
declare const saveAs: any;

export const MeetingSummarizer: React.FC = () => {
    const [transcript, setTranscript] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    const handleGenerate = async () => {
        if (!transcript.trim()) {
            setError('Az átirat nem lehet üres.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSummary('');
        setCopySuccess('');

        try {
            const promptInstructions = `Készíts egy tömör, strukturált összefoglalót a következő megbeszélés átiratáról. A kimenetnek a következő részeket kell tartalmaznia:
1.  **Összefoglaló:** A megbeszélés legfontosabb pontjai, döntései és következtetései 2-4 mondatban.
2.  **Teendők:** Egyértelmű, pontokba szedett lista a kiosztott feladatokról (action items). Ha lehetséges, nevezd meg a felelős személyt minden feladatnál.`;
            
            const result = await processText(transcript, promptInstructions);
            setSummary(result);
        } catch (err: any) {
            setError('Hiba történt az összefoglaló generálása közben.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (!summary) return;
        navigator.clipboard.writeText(summary).then(() => {
            setCopySuccess('Az összefoglaló a vágólapra másolva!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('A másolás sikertelen.');
        });
    };
    
    const handleDownload = () => {
        if (!summary) return;
        const filename = `meeting_osszefoglalo.txt`;
        const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, filename);
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="transcript-input" className="block mb-2 font-semibold text-dark">Megbeszélés Átirata</label>
                <textarea
                    id="transcript-input"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Illessze be ide a megbeszélés szöveges átiratát..."
                    rows={10}
                    className="w-full bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent font-sans"
                    aria-label="Megbeszélés Átirata"
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading || !transcript.trim()}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Generálás...' : (
                    <>
                        <BookCheck size={20}/>
                        <span>Összefoglaló Létrehozása</span>
                    </>
                )}
            </button>
            
            {error && <div className="text-red-500 text-center" role="alert">{error}</div>}

            {summary && (
                <div>
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-xl text-dark">Elkészült Összefoglaló</h3>
                        <div className="flex gap-2">
                            <button onClick={handleCopy} title="Másolás vágólapra" className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded text-dark hover:bg-gray-300 transition-colors">
                                <Clipboard size={16}/>
                            </button>
                             <button onClick={handleDownload} title="Letöltés .txt fájlként" className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded text-dark hover:bg-gray-300 transition-colors">
                                <Download size={16}/>
                            </button>
                        </div>
                    </div>
                    {copySuccess && <p className="text-green-600 text-sm mb-2" role="status">{copySuccess}</p>}
                    <div
                        className="w-full min-h-[20rem] p-4 bg-surface text-dark rounded-md border border-medium font-sans whitespace-pre-wrap"
                        aria-label="Generált összefoglaló"
                    >
                        {summary}
                    </div>
                </div>
            )}
        </div>
    );
};