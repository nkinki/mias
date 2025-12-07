
import React, { useState } from 'react';
import { generateChessAd } from '../../services/geminiService';
import { Swords, Copy, RefreshCw, Check, MessageSquare, Repeat, Heart, Share } from 'lucide-react';

export const ChessAdGenerator: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [generatedAd, setGeneratedAd] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    // Base Blue color constant - used for icon bg only
    const baseBlue = '#0052FF';

    const handleGenerate = async () => {
        if (!inputText.trim()) {
            setError('Kérjük, adja meg a részleteket a Cast-hoz!');
            return;
        }

        setIsLoading(true);
        setError('');
        setGeneratedAd('');
        setCopySuccess(false);

        try {
            const result = await generateChessAd(inputText);
            setGeneratedAd(result);
        } catch (err: any) {
            setError(err.message || 'Hiba történt a generálás során.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedAd) return;
        navigator.clipboard.writeText(generatedAd).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    return (
        <div className="max-w-xl mx-auto font-sans">
            {/* Header Base stílusban */}
            <div className="flex items-center gap-3 mb-6 p-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: baseBlue }}>
                    <Swords size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-dark leading-none">FarChess Caster</h3>
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">on Base</span>
                </div>
            </div>

            {/* Composer Area */}
            <div className="bg-surface border border-medium rounded-xl p-4 shadow-sm mb-6">
                <textarea
                    id="input-text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Miről szóljon a Cast? (pl. Winter Trophy, 15M $CHESS, új szabályok...)"
                    rows={4}
                    className="w-full bg-transparent text-dark placeholder-muted focus:outline-none text-base resize-y min-h-[100px]"
                />
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-medium">
                    <span className="text-xs text-muted font-medium">AI powered</span>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !inputText.trim()}
                        className="font-bold text-white px-6 py-2 rounded-full transition-opacity disabled:opacity-50 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700"
                    >
                        {isLoading ? (
                            <RefreshCw className="animate-spin" size={16} />
                        ) : (
                            <span>Cast Generálása</span>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            {/* Farcaster / Warpcast Preview Card */}
            {generatedAd && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Előnézet</label>
                        {copySuccess && <span className="text-xs font-bold text-green-600">Másolva!</span>}
                    </div>

                    <div className="bg-surface border border-medium rounded-xl overflow-hidden hover:border-accent transition-colors duration-300 relative group">
                        {/* Copy Button (Floating) */}
                        <button
                            onClick={handleCopy}
                            className="absolute top-4 right-4 p-2 bg-light hover:bg-white text-muted hover:text-dark rounded-full border border-medium shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-all"
                            title="Másolás"
                        >
                            {copySuccess ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        </button>

                        {/* Cast Content */}
                        <div className="p-4 flex gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm border-2 border-surface">
                                    FC
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="font-bold text-dark text-base">FarChess</span>
                                    <span className="text-muted text-sm">@farchess</span>
                                    <span className="text-muted text-xs mx-1">·</span>
                                    <span className="text-muted text-sm">most</span>
                                </div>
                                
                                <div className="text-dark text-base leading-normal whitespace-pre-wrap font-sans break-words">
                                    {generatedAd}
                                </div>

                                {/* Fake Engagement Icons */}
                                <div className="flex items-center gap-6 mt-3 text-muted">
                                    <div className="flex items-center gap-1.5 text-xs hover:text-dark cursor-pointer transition-colors">
                                        <MessageSquare size={16} />
                                        <span>12</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs hover:text-green-600 cursor-pointer transition-colors">
                                        <Repeat size={16} />
                                        <span>5</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs hover:text-red-500 cursor-pointer transition-colors">
                                        <Heart size={16} />
                                        <span>42</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs hover:text-dark cursor-pointer transition-colors">
                                        <Share size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
