import React, { useState } from 'react';
import { summarizeUrlWithSearch } from '../../services/geminiService';
import type { GroundedResponse } from '../../types';
import { BookText } from 'lucide-react';

export const WebSummarizer: React.FC = () => {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState<GroundedResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isValidUrl = (urlString: string) => {
        try {
            new URL(urlString);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleSummarize = async () => {
        if (!url.trim() || !isValidUrl(url.trim())) {
            setError('Kérjük, adjon meg egy érvényes URL címet.');
            return;
        }
        
        setError('');
        setIsLoading(true);
        setResult(null);

        try {
            const response = await summarizeUrlWithSearch(url.trim());
            setResult(response);
        } catch (err: any) {
            setError(err.message || 'Hiba történt az összefoglalás során.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="url-input" className="block mb-2 font-semibold text-dark">Weboldal Címe (URL)</label>
                <input
                    id="url-input"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://peldaweboldal.hu/cikk"
                    className="w-full bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent"
                />
            </div>

            <button
                onClick={handleSummarize}
                disabled={isLoading || !url.trim()}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Összefoglalás...' : (
                    <>
                        <BookText size={20}/>
                        <span>Összefoglalás Indítása</span>
                    </>
                )}
            </button>

            {error && <div className="text-red-500 text-center" role="alert">{error}</div>}
            
            {isLoading && <div className="text-center p-8">Elemzés folyamatban, ez eltarthat egy pillanatig...</div>}

            {result && (
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-2xl text-dark mb-2">Összefoglaló</h3>
                        <div className="p-4 bg-surface text-dark rounded-md border border-medium whitespace-pre-wrap font-sans leading-relaxed">
                            {result.text}
                        </div>
                    </div>
                     {result.sources && result.sources.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-xl text-dark mb-2">Felhasznált Források</h3>
                            <ul className="space-y-2">
                                {result.sources.map((source, index) => source.web && (
                                    <li key={index} className="p-3 bg-light border border-medium rounded-md">
                                        <a 
                                            href={source.web.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="font-semibold text-accent hover:underline break-words"
                                        >
                                            {source.web.title || source.web.uri}
                                        </a>
                                        <p className="text-xs text-muted mt-1 break-words">{source.web.uri}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
