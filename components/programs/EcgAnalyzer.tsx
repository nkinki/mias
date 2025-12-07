import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { analyzeEcg } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/fileUtils';
import { Activity, FileUp, AlertTriangle, Download, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import type { EcgAnalysis, EcgFinding } from '../../types';

// This global is loaded from a CDN in index.html
declare const saveAs: any;

const getFindingVisuals = (finding: EcgFinding['finding']) => {
    switch (finding) {
        case 'normal':
            return { icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, color: 'text-green-700', bg: 'bg-green-50 border-green-200' };
        case 'borderline':
            return { icon: <AlertCircle className="w-5 h-5 text-yellow-600" />, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' };
        case 'abnormal':
            return { icon: <AlertTriangle className="w-5 h-5 text-red-600" />, color: 'text-red-700', bg: 'bg-red-50 border-red-200' };
        case 'unclear':
        default:
            return { icon: <HelpCircle className="w-5 h-5 text-blue-600" />, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
    }
};

const formatAnalysisForDownload = (analysis: EcgAnalysis): string => {
    let content = `${analysis.disclaimer}\n\n`;
    content += `--- ÁLTALÁNOS BENYOMÁS ---\n${analysis.overallImpression}\n\n`;
    
    content += `--- RÉSZLETES MEGÁLLAPÍTÁSOK ---\n`;
    analysis.findings.forEach(item => {
        content += `\nParaméter: ${item.parameter}\n`;
        content += `Érték: ${item.value}\n`;
        content += `Megállapítás: ${item.finding}\n`;
        content += `Magyarázat: ${item.explanation}\n`;
        content += `---------------------------------\n`;
    });

    if (analysis.recommendations) {
        content += `\n--- JAVASLATOK ---\n${analysis.recommendations}\n`;
    }

    if (analysis.userQuestionAnswer) {
        content += `\n--- VÁLASZ A KÉRDÉSRE ---\n${analysis.userQuestionAnswer}\n`;
    }
    
    return content;
};

export const EcgAnalyzer: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [question, setQuestion] = useState('');
    const [analysis, setAnalysis] = useState<EcgAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    const handleFileUpload = (uploadedFile: File) => {
        setFile(uploadedFile);
        setAnalysis(null);
        setError('');
        setStatus('');
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsLoading(true);
        setError('');
        setAnalysis(null);

        try {
            if (!file.type.startsWith('image/')) {
                 throw new Error("Nem támogatott fájltípus. Kérjük, képet (JPG, PNG, stb.) töltsön fel.");
            }
            setStatus('EKG kép feldolgozása...');
            const base64 = await fileToBase64(file);

            setStatus('EKG elemzése MI-vel...');
            const result = await analyzeEcg(base64, file.type, question);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || 'Az elemzés sikertelen. Kérjük, próbálja újra.');
            console.error(err);
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };
    
    const handleDownload = () => {
        if (!analysis || !file) return;

        const originalName = file.name.split('.').slice(0, -1).join('.') || file.name;
        const newFilename = `${originalName}_ekg_elemzes.txt`;
        const fileContent = formatAnalysisForDownload(analysis);
        
        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, newFilename);
    };

    const handleReset = () => {
        setFile(null);
        setAnalysis(null);
        setError('');
        setQuestion('');
        setStatus('');
    };

    if (!file) {
        return (
            <div className="space-y-4">
                 <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <AlertTriangle className="w-10 h-10 mr-3 flex-shrink-0 text-red-500" />
                    <div>
                        <h4 className="font-bold">Kiemelten Fontos Figyelmeztetés</h4>
                        <p className="text-sm">Ez az eszköz mesterséges intelligenciát használ az EKG-görbék oktatási célú értelmezéséhez. **NEM MINŐSÜL ORVOSI DIAGNÓZISNAK.** Az EKG komplex vizsgálat, amelynek szakszerű kiértékelése kizárólag kardiológus szakorvos feladata. **NE hozzon egészségügyi döntéseket az itt kapott információk alapján! Mindig konzultáljon orvosával!**</p>
                    </div>
                </div>
                <FileUploader 
                    onFileUpload={handleFileUpload}
                    acceptedFileTypes="image/*"
                    label="Töltsön fel egy EKG képet"
                />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center p-3 bg-light border border-medium rounded-lg">
                <p className="font-semibold text-dark truncate">Fájl: <span className="font-normal text-muted">{file.name}</span></p>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded text-dark hover:bg-gray-300 transition-colors text-sm"
                >
                    <FileUp size={16} /> Másik fájl
                </button>
            </div>

            <div>
                <label htmlFor="question" className="block mb-2 font-semibold text-dark">Konkrét kérdés (opcionális)</label>
                <input
                    id="question"
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="pl., Látható bármilyen ritmuszavar?"
                    className="w-full bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent"
                />
            </div>

            <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span>{status || 'Elemzés...'}</span>
                ) : (
                    <>
                        <Activity size={20}/>
                        <span>EKG Elemzése</span>
                    </>
                )}
            </button>

            {error && <div className="text-red-500 text-center p-2 bg-red-50 border border-red-200 rounded">{error}</div>}

            {analysis && (
                <div className="space-y-6">
                    <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        <AlertTriangle className="w-6 h-6 mr-3 mt-1 flex-shrink-0 text-red-500" />
                        <p className="text-sm"><strong className="font-bold">FIGYELEM:</strong> {analysis.disclaimer.replace(/\*/g, '')}</p>
                    </div>

                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-2xl text-dark">MI Elemzés</h3>
                        <button 
                            onClick={handleDownload}
                            className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-md text-dark hover:bg-gray-300 transition-colors"
                            title="Elemzés letöltése .txt fájlként"
                        >
                            <Download size={16}/> Letöltés
                        </button>
                    </div>

                    <div className="p-4 bg-surface rounded-md border border-medium">
                        <h4 className="font-bold text-lg mb-2 text-dark">Általános Benyomás</h4>
                        <p className="text-muted leading-relaxed">{analysis.overallImpression}</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-3 text-dark">Részletes Megállapítások</h4>
                        <div className="space-y-3">
                            {analysis.findings.map((item, index) => {
                                const { icon, color, bg } = getFindingVisuals(item.finding);
                                return (
                                    <div key={index} className={`p-4 border rounded-lg ${bg}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">{icon}</div>
                                            <div className="flex-grow">
                                                <h5 className={`font-bold ${color}`}>{item.parameter}</h5>
                                                <p className="text-sm text-dark font-mono">
                                                    Érték: <strong>{item.value}</strong> 
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm text-dark leading-normal pl-8">{item.explanation}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {analysis.recommendations && (
                        <div className="p-4 bg-surface rounded-md border border-medium">
                            <h4 className="font-bold text-lg mb-2 text-dark">Javaslatok</h4>
                            <p className="text-muted whitespace-pre-wrap">{analysis.recommendations}</p>
                        </div>
                    )}
                    
                    {analysis.userQuestionAnswer && (
                         <div className="p-4 bg-accent-light rounded-md border border-accent">
                            <h4 className="font-bold text-lg mb-2 text-accent">Válasz a kérdésére</h4>
                            <p className="text-accent-hover whitespace-pre-wrap">{analysis.userQuestionAnswer}</p>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};
