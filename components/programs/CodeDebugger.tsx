import React, { useState } from 'react';
import { generateOrDebugCode } from '../../services/geminiService';
import { Clipboard, Code, Bug, Wand2 } from 'lucide-react';

type Mode = 'generate' | 'debug';

const LANGUAGES = [
    'Python',
    'JavaScript',
    'TypeScript',
    'HTML',
    'CSS',
    'Java',
    'C++',
    'C#',
    'Go',
    'SQL',
    'Shell',
    'VBA (Excel)',
    'Excel Függvények',
    'Arduino'
];

const PLACEHOLDERS = {
    generate: {
        'Python': 'pl., Írj egy Python függvényt, ami egy szövegből megszámolja a szavak gyakoriságát.',
        'JavaScript': 'pl., Írj egy JavaScript függvényt, ami lekér adatokat egy API-ról.',
        'Excel Függvények': 'pl., Add össze az A1:A10 tartományban lévő számokat, de csak azokat, amelyek nagyobbak mint 50.',
        'VBA (Excel)': 'pl., Írj egy makrót, ami az aktív munkalap "A" oszlopát pirosra színezi.',
        'SQL': 'pl., Válaszd ki az összes felhasználót a "users" táblából, akik az elmúlt 30 napban regisztráltak.',
        'Arduino': 'pl., Írj egy Arduino kódot, ami egy LED-et villogtat a 13-as kimeneten.',
        'default': 'Írja le a feladatot, amit a kóddal szeretne megoldani...'
    },
    debug: {
        'Excel Függvények': 'pl., =HA(A1>10; "Nagy"; "Kicsi")',
        'default': 'Illessze be ide a hibás kódrészletet vagy a megmagyarázandó kódot...'
    }
};


export const CodeDebugger: React.FC = () => {
    const [mode, setMode] = useState<Mode>('generate');
    const [language, setLanguage] = useState('Python');
    const [userInput, setUserInput] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    const config = {
        generate: {
            title: 'Kód Generálása',
            label: 'Feladat leírása',
            buttonText: 'Kód Generálása',
            icon: <Wand2 size={20} />,
        },
        debug: {
            title: 'Hibakeresés',
            label: 'Kód a hibakereséshez',
            buttonText: 'Hibakeresés',
            icon: <Bug size={20} />,
        }
    };
    
    const activeConfig = config[mode];
    const placeholder = (PLACEHOLDERS[mode] as any)[language] || (PLACEHOLDERS[mode] as any)['default'];
    
    const handleGenerate = async () => {
        if (!userInput.trim()) {
            setError('A beviteli mező nem lehet üres.');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult('');
        setCopySuccess('');

        try {
            const response = await generateOrDebugCode(mode, language, userInput);
            setResult(response);
        } catch (err: any) {
            setError(err.message || `Hiba történt a(z) ${mode === 'generate' ? 'generálás' : 'hibakeresés'} során.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result).then(() => {
            setCopySuccess('A vágólapra másolva!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('A másolás sikertelen.');
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-3 bg-light border border-medium rounded-lg">
                <div className="flex bg-gray-200 rounded-lg p-1" role="radiogroup">
                    <button
                        onClick={() => { setMode('generate'); setResult(''); setUserInput(''); }}
                        className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${mode === 'generate' ? 'bg-accent text-white shadow-sm' : 'text-dark hover:bg-gray-300'}`}
                        role="radio"
                        aria-checked={mode === 'generate'}
                    >
                        Kód Generálása
                    </button>
                    <button
                        onClick={() => { setMode('debug'); setResult(''); setUserInput(''); }}
                        className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${mode === 'debug' ? 'bg-accent text-white shadow-sm' : 'text-dark hover:bg-gray-300'}`}
                        role="radio"
                        aria-checked={mode === 'debug'}
                    >
                        Hibakeresés
                    </button>
                </div>
                 <div>
                    <label htmlFor="language-select" className="sr-only">Programozási nyelv</label>
                    <select
                        id="language-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-surface text-dark rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="user-input" className="block mb-2 font-semibold text-dark">{activeConfig.label}</label>
                <textarea
                    id="user-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={placeholder}
                    rows={10}
                    className="w-full bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
                />
            </div>

             <button
                onClick={handleGenerate}
                disabled={isLoading || !userInput.trim()}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Feldolgozás...' : (
                    <>
                        {activeConfig.icon}
                        <span>{activeConfig.buttonText}</span>
                    </>
                )}
            </button>
            
            {error && <div className="text-red-500 text-center" role="alert">{error}</div>}
            
            {isLoading && <div className="text-center p-8">MI dolgozik a feladaton...</div>}

            {result && (
                <div>
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-xl text-dark">Eredmény</h3>
                         <button onClick={handleCopy} className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded text-dark hover:bg-gray-300 transition-colors">
                            <Clipboard size={16}/> Másolás
                        </button>
                    </div>
                    {copySuccess && <p className="text-green-600 text-sm mb-2" role="status">{copySuccess}</p>}
                    <pre className="w-full p-4 bg-dark text-light rounded-md border border-medium overflow-x-auto">
                        <code className={`language-${language.toLowerCase()}`}>{result}</code>
                    </pre>
                </div>
            )}
        </div>
    );
};