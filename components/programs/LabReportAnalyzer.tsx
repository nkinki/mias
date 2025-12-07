import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { analyzeLabReport } from '../../services/geminiService';
import { fileToBase64, extractTextFromFile } from '../../utils/fileUtils';
import { HeartPulse, FileUp, AlertTriangle, Download, CheckCircle2, AlertCircle, ArrowDownCircle, ArrowUpCircle, Info } from 'lucide-react';
import type { LabReportAnalysis, LabResultItem } from '../../types';

// This global is loaded from a CDN in index.html
declare const saveAs: any;

const getStatusVisuals = (status: LabResultItem['status']) => {
    switch (status) {
        case 'normal':
            return { icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, color: 'text-green-700', bg: 'bg-green-50 border-green-200' };
        case 'high':
            return { icon: <ArrowUpCircle className="w-5 h-5 text-red-600" />, color: 'text-red-700', bg: 'bg-red-50 border-red-200' };
        case 'low':
            return { icon: <ArrowDownCircle className="w-5 h-5 text-red-600" />, color: 'text-red-700', bg: 'bg-red-50 border-red-200' };
        case 'abnormal':
            return { icon: <AlertCircle className="w-5 h-5 text-yellow-600" />, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' };
        case 'information':
        default:
            return { icon: <Info className="w-5 h-5 text-blue-600" />, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
    }
};

const formatAnalysisForDownload = (analysis: LabReportAnalysis): string => {
    let content = `${analysis.disclaimer}\n\n`;
    content += `--- ÖSSZEFOGLALÓ ---\n${analysis.summary}\n\n`;
    
    content += `--- RÉSZLETES EREDMÉNYEK ---\n`;
    analysis.results.forEach(item => {
        content += `\nVizsgálat: ${item.testName}\n`;
        content += `Eredmény: ${item.value} (Referencia: ${item.referenceRange})\n`;
        content += `Státusz: ${item.status}\n`;
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


export const LabReportAnalyzer: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [question, setQuestion] = useState('');
    const [analysis, setAnalysis] = useState<LabReportAnalysis | null>(null);
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
            let fileData;
            if (file.type.startsWith('image/')) {
                setStatus('Kép feldolgozása...');
                const base64 = await fileToBase64(file);
                fileData = { base64, mimeType: file.type };
            } else if (file.type === 'application/pdf') {
                setStatus('PDF tartalmának kinyerése...');
                const text = await extractTextFromFile(file);
                if (!text.trim()) {
                    throw new Error("A PDF dokumentum üres vagy nem sikerült szöveget kinyerni belőle.");
                }
                fileData = { text };
            } else {
                throw new Error("Nem támogatott fájltípus. Kérjük, képet (JPG, PNG) vagy PDF fájlt töltsön fel.");
            }

            setStatus('Laborlelet elemzése MI-vel...');
            const result = await analyzeLabReport(fileData, question);
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
        const newFilename = `${originalName}_elemzes.txt`;
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
                 <div className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                    <AlertTriangle className="w-8 h-8 mr-3 flex-shrink-0 text-yellow-500" />
                    <div>
                        <h4 className="font-bold">Fontos Figyelmeztetés</h4>
                        <p className="text-sm">Ez az eszköz mesterséges intelligenciát használ a laborleletek értelmezéséhez, ami kizárólag tájékoztató jellegű. **Nem minősül orvosi tanácsadásnak.** Az eredményekért és bármilyen egészségügyi döntésért mindig konzultáljon kezelőorvosával!</p>
                    </div>
                </div>
                <FileUploader 
                    onFileUpload={handleFileUpload}
                    acceptedFileTypes="image/*,.pdf"
                    label="Töltsön fel egy laborleletet (kép vagy PDF)"
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
                    placeholder="pl., Mit jelent a magas koleszterinszintem?"
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
                        <HeartPulse size={20}/>
                        <span>Lelet Elemzése</span>
                    </>
                )}
            </button>

            {error && <div className="text-red-500 text-center p-2 bg-red-50 border border-red-200 rounded">{error}</div>}

            {analysis && (
                <div className="space-y-6">
                    <div className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                        <AlertTriangle className="w-6 h-6 mr-3 mt-1 flex-shrink-0 text-yellow-500" />
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
                        <h4 className="font-bold text-lg mb-2 text-dark">Összefoglaló</h4>
                        <p className="text-muted leading-relaxed">{analysis.summary}</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-3 text-dark">Részletes Eredmények</h4>
                        <div className="space-y-3">
                            {analysis.results.map((item, index) => {
                                const { icon, color, bg } = getStatusVisuals(item.status);
                                return (
                                    <div key={index} className={`p-4 border rounded-lg ${bg}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">{icon}</div>
                                            <div className="flex-grow">
                                                <h5 className={`font-bold ${color}`}>{item.testName}</h5>
                                                <p className="text-sm text-dark font-mono">
                                                    Eredmény: <strong>{item.value}</strong> 
                                                    <span className="text-muted ml-2">(Ref: {item.referenceRange})</span>
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