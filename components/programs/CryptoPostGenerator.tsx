
import React, { useState } from 'react';
import { generateCryptoPost } from '../../services/geminiService';
import { Rocket, Copy, RefreshCw, Check } from 'lucide-react';

export const CryptoPostGenerator: React.FC = () => {
    const [amount, setAmount] = useState('');
    const [generatedPost, setGeneratedPost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    const handleGenerate = async () => {
        if (!amount.trim()) {
            setError('Kérjük, írjon be egy összeget!');
            return;
        }

        setIsLoading(true);
        setError('');
        setGeneratedPost('');
        setCopySuccess(false);

        try {
            const result = await generateCryptoPost(amount);
            setGeneratedPost(result);
        } catch (err: any) {
            setError(err.message || 'Hiba történt a generálás során.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedPost) return;
        navigator.clipboard.writeText(generatedPost).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
                <Rocket className="w-12 h-12 text-accent mx-auto mb-2" />
                <h3 className="text-xl font-bold text-dark">Lambo Lotto Poszt Generátor</h3>
                <p className="text-muted">Generálj hype posztokat a $CHESS és @base.base.eth tagekkel!</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-dark mb-1">
                        Összeg (pl. 0.1 ETH, $500, 1M)
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="amount"
                            type="text"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Írd be az összeget..."
                            className="flex-grow bg-surface text-dark placeholder-muted rounded-md px-4 py-3 border border-medium focus:outline-none focus:ring-2 focus:ring-accent font-mono text-lg"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !amount.trim()}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-3 px-6 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center"
                        >
                            {isLoading ? (
                                <RefreshCw className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Generálás</span>
                                    <Rocket size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm text-center">
                        {error}
                    </div>
                )}

                {generatedPost && (
                    <div className="mt-8 animate-fade-in">
                        <label className="block text-sm font-medium text-muted mb-2">Generált Poszt:</label>
                        <div className="relative group">
                            <div className="p-6 bg-surface border border-medium rounded-lg shadow-sm text-lg font-medium text-dark font-sans leading-relaxed break-words">
                                {generatedPost}
                            </div>
                            <button
                                onClick={handleCopy}
                                className="absolute top-3 right-3 p-2 bg-light/80 hover:bg-light rounded-md text-dark transition-all border border-medium shadow-sm"
                                title="Másolás vágólapra"
                            >
                                {copySuccess ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                            </button>
                        </div>
                        {copySuccess && (
                            <p className="text-green-600 text-sm mt-2 text-center animate-fade-in">
                                A szöveg a vágólapra másolva! 📋
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
