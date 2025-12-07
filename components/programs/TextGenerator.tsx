import React, { useState } from 'react';
import { processText } from '../../services/geminiService';
import { Clipboard, Download, Wand2 } from 'lucide-react';

// This global is loaded from a CDN in index.html
declare const saveAs: any;

type Mode = 'email-writer' | 'email-rewriter' | 'facebook-ad' | 'twitter-ad' | 'instagram-ad';

interface TextGeneratorProps {
    mode: Mode;
}

const MODE_CONFIG = {
    'email-writer': {
        label: 'E-mail Író',
        promptBuilder: (input: string) => `Írj egy professzionális e-mailt a következő utasítások alapján. Az e-mail legyen világos, tömör és megfelelő hangvételű.\n\nUtasítások:\n${input}`,
        inputLabel: 'Utasítások az e-mailhez',
        placeholder: 'pl., Írj egy e-mailt Kovács úrnak, hogy megkaptuk a jelentését, és jövő hét elején válaszolunk rá.',
        styles: null,
        suffix: '_email',
    },
    'email-rewriter': {
        label: 'E-mail Átíró',
        promptBuilder: (input: string, style?: string) => `Írd át a következő e-mailt ${style || 'professzionális'} stílusban. A tartalom maradjon ugyanaz, de a hangvételt, a megszólítást és az elköszönést igazítsd a kiválasztott stílushoz.\n\nEredeti e-mail:\n${input}`,
        inputLabel: 'Eredeti e-mail szövege',
        placeholder: 'Illessze be ide az átírandó e-mailt...',
        styles: ['professzionális', 'barátságos', 'udvarias', 'elutasító'],
        suffix: '_atirt_email',
    },
    'facebook-ad': {
        label: 'Facebook Hirdetés',
        promptBuilder: (input: string) => `Készíts egy hatásos Facebook reklámszöveget a következő termékhez vagy szolgáltatáshoz. A szöveg legyen figyelemfelkeltő, tartalmazzon egyértelmű cselekvésre ösztönzést (CTA) és használjon releváns hashtageket.\n\nTermék/Szolgáltatás leírása:\n${input}`,
        inputLabel: 'Termék/Szolgáltatás leírása',
        placeholder: 'pl., Kézzel készített egyedi tervezésű bőr táskák, online rendeléssel.',
        styles: null,
        suffix: '_facebook_hirdetes',
    },
    'twitter-ad': {
        label: 'Twitter Poszt',
        promptBuilder: (input: string) => `Írj egy rövid, ütős Twitter posztot (tweetet) a következő termék vagy szolgáltatás reklámozására. Maradj a karakterkorláton belül, használj hashtageket és cselekvésre ösztönzést.\n\nTermék/Szolgáltatás leírása:\n${input}`,
        inputLabel: 'Termék/Szolgáltatás leírása',
        placeholder: 'pl., Új MI-alapú projektmenedzsment szoftver, ami automatizálja a feladatokat.',
        styles: null,
        suffix: '_twitter_hirdetes',
    },
    'instagram-ad': {
        label: 'Instagram Poszt',
        promptBuilder: (input: string) => `Írj egy lebilincselő Instagram poszt leírást a következő termékhez. A szöveg legyen vizuálisan is vonzó (használj emojikat), tartalmazzon releváns hashtageket és egy erős cselekvésre ösztönzést.\n\nTermék/Szolgáltatás leírása:\n${input}`,
        inputLabel: 'Termék/Szolgáltatás leírása',
        placeholder: 'pl., Kézműves ékszerek kollekciója, újrahasznosított anyagokból.',
        styles: null,
        suffix: '_instagram_hirdetes',
    }
};

export const TextGenerator: React.FC<TextGeneratorProps> = ({ mode }) => {
    const [input, setInput] = useState('');
    const [style, setStyle] = useState(MODE_CONFIG[mode].styles?.[0] || '');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    const config = MODE_CONFIG[mode];

    const handleGenerate = async () => {
        if (!input.trim()) {
            setError('A beviteli mező nem lehet üres.');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult('');
        setCopySuccess('');

        try {
            const fullPrompt = config.promptBuilder(input, style);
            const finalResult = await processText(fullPrompt, ""); 

            setResult(finalResult);
        } catch (err: any) {
            setError(err.message || 'A feldolgozás sikertelen. Kérjük, próbálja újra.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result).then(() => {
            setCopySuccess('A szöveg a vágólapra másolva!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('A másolás sikertelen.');
        });
    };
    
    const handleDownload = () => {
        if (!result) return;
        const filename = `${config.label.replace(/[\s\(\)]/g, '_')}${config.suffix}.txt`;
        const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, filename);
    };


    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="input-textarea" className="block mb-2 font-semibold text-dark">{config.inputLabel}</label>
                <textarea
                    id="input-textarea"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={config.placeholder}
                    rows={8}
                    className="w-full bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent font-sans"
                    aria-label={config.inputLabel}
                />
            </div>

            {config.styles && (
                <div>
                    <h4 className="block mb-2 font-semibold text-dark">Stílus</h4>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Stílus kiválasztása">
                        {config.styles.map(s => (
                            <button
                                key={s}
                                onClick={() => setStyle(s)}
                                className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors
                                    ${style === s ? 'bg-accent text-white' : 'bg-surface text-dark hover:bg-gray-100 border border-medium'}
                                `}
                                role="radio"
                                aria-checked={style === s}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            <button
                onClick={handleGenerate}
                disabled={isLoading || !input.trim()}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Generálás...' : (
                    <>
                        <Wand2 size={20}/>
                        <span>Szöveg Létrehozása</span>
                    </>
                )}
            </button>
            
            {error && <div className="text-red-500 text-center" role="alert">{error}</div>}

            {result && (
                <div>
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-xl text-dark">Generált Szöveg</h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleCopy} 
                                className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded text-dark hover:bg-gray-300 transition-colors"
                                title="Másolás vágólapra"
                                aria-label="Generált szöveg másolása"
                            >
                                <Clipboard size={16}/>
                            </button>
                             <button 
                                onClick={handleDownload} 
                                className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded text-dark hover:bg-gray-300 transition-colors"
                                title="Letöltés .txt fájlként"
                                aria-label="Generált szöveg letöltése"
                            >
                                <Download size={16}/>
                            </button>
                        </div>
                    </div>
                    {copySuccess && <p className="text-green-600 text-sm mb-2" role="status">{copySuccess}</p>}
                    <textarea
                        readOnly
                        value={result}
                        rows={12}
                        className="w-full p-2 bg-surface text-dark rounded-md border border-medium font-sans"
                        aria-label="Generált szöveg"
                    />
                </div>
            )}
        </div>
    );
};