
import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { Scissors, Download, FileUp, AlertCircle, FileText } from 'lucide-react';

// Globals from CDN
declare const PDFLib: any;
declare const saveAs: any;

export const PdfSplitter: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [originalPdfBytes, setOriginalPdfBytes] = useState<ArrayBuffer | null>(null);
    const [pageCount, setPageCount] = useState(0);
    const [rangeInput, setRangeInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setError('');
        setRangeInput('');
        setIsLoading(true);
        setStatus('PDF betöltése és elemzése...');

        try {
            const arrayBuffer = await uploadedFile.arrayBuffer();
            setOriginalPdfBytes(arrayBuffer);

            // Load the PDF to count pages
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const count = pdfDoc.getPageCount();
            setPageCount(count);
            setStatus('');
        } catch (err: any) {
            console.error(err);
            setError('Hiba történt a PDF beolvasásakor. Lehet, hogy sérült vagy jelszóval védett.');
            setFile(null);
        } finally {
            setIsLoading(false);
        }
    };

    const parsePageRange = (input: string, maxPage: number): number[] => {
        const pages: Set<number> = new Set();
        const parts = input.split(',');

        for (const part of parts) {
            const trimmed = part.trim();
            if (trimmed.includes('-')) {
                const [startStr, endStr] = trimmed.split('-');
                const start = parseInt(startStr);
                const end = parseInt(endStr);

                if (!isNaN(start) && !isNaN(end)) {
                    const min = Math.min(start, end);
                    const max = Math.max(start, end);

                    for (let i = min; i <= max; i++) {
                        if (i >= 1 && i <= maxPage) {
                            pages.add(i - 1); // 0-based index
                        }
                    }
                }
            } else {
                const pageNum = parseInt(trimmed);
                if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPage) {
                    pages.add(pageNum - 1);
                }
            }
        }
        return Array.from(pages).sort((a, b) => a - b);
    };

    const handleSplit = async () => {
        if (!originalPdfBytes || !file) return;
        if (!rangeInput.trim()) {
            setError('Kérjük, adja meg a kivágandó oldalakat.');
            return;
        }

        setIsLoading(true);
        setError('');
        setStatus('Oldalak kivágása és új PDF készítése...');

        try {
            // Parse range
            const pageIndices = parsePageRange(rangeInput, pageCount);

            if (pageIndices.length === 0) {
                throw new Error(`Érvénytelen oldaltartomány. Kérjük, 1 és ${pageCount} közötti értékeket adjon meg.`);
            }

            // Create new PDF
            const pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes);
            const newPdf = await PDFLib.PDFDocument.create();

            // Copy pages
            const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach((page: any) => newPdf.addPage(page));

            // Serialize and save
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            
            const originalName = file.name.replace('.pdf', '');
            const safeRange = rangeInput.replace(/[^0-9-]/g, '_').substring(0, 20);
            saveAs(blob, `${originalName}_split_${safeRange}.pdf`);

            setStatus('Siker! A dokumentum letöltve.');

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Hiba történt a PDF darabolása közben.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setOriginalPdfBytes(null);
        setPageCount(0);
        setRangeInput('');
        setError('');
        setStatus('');
    };

    const darkButtonClass = "w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700";
    const darkSmallButtonClass = "flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded text-white hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-700";


    if (!file) {
        return (
            <div className="space-y-4">
                 <div className="text-center mb-6">
                    <Scissors className="w-12 h-12 text-accent mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-dark">PDF Daraboló</h3>
                    <p className="text-muted">Válasszon ki oldalakat egy nagy PDF-ből és mentse le őket külön.</p>
                </div>
                <FileUploader 
                    onFileUpload={handleFileUpload}
                    acceptedFileTypes=".pdf"
                    label="Töltsön fel egy PDF fájlt"
                />
                 {error && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm text-center flex items-center justify-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>}
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
             <div className="flex justify-between items-center p-4 bg-light border border-medium rounded-lg">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-white p-2 rounded-md border border-medium">
                        <FileText className="text-red-500" size={24} />
                    </div>
                    <div>
                        <p className="font-semibold text-dark truncate max-w-[200px] sm:max-w-xs" title={file.name}>{file.name}</p>
                        <p className="text-sm text-muted">{pageCount} oldal</p>
                    </div>
                </div>
                <button
                    onClick={handleReset}
                    className={darkSmallButtonClass}
                >
                    <FileUp size={16} /> Új fájl
                </button>
            </div>

            <div className="bg-surface p-6 border border-medium rounded-xl shadow-sm">
                <label className="block font-semibold text-dark mb-2">
                    Kiválasztott oldalak
                </label>
                <p className="text-xs text-muted mb-3">
                    Adja meg az oldalszámokat vesszővel elválasztva vagy kötőjellel tartományként. <br/>
                    Például: <span className="font-mono bg-light px-1 rounded">1-5, 8, 11-13</span>
                </p>
                
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={rangeInput}
                        onChange={(e) => setRangeInput(e.target.value)}
                        placeholder={`pl. 1-${Math.min(5, pageCount)}`}
                        className="flex-grow bg-light text-dark placeholder-muted rounded-md px-4 py-3 border border-medium focus:outline-none focus:ring-2 focus:ring-accent font-mono text-lg"
                    />
                </div>

                {rangeInput && (
                    <div className="mt-2 text-sm text-accent">
                        {(() => {
                            const pages = parsePageRange(rangeInput, pageCount);
                            if (pages.length === 0) return null;
                            if (pages.length > 20) return `${pages.length} oldal kiválasztva`;
                            return `Kiválasztva: ${pages.map(p => p + 1).join(', ')}`;
                        })()}
                    </div>
                )}
            </div>

            <button
                onClick={handleSplit}
                disabled={isLoading || !rangeInput.trim()}
                className={darkButtonClass}
            >
                {isLoading ? (
                    <span className="animate-pulse">{status || 'Feldolgozás...'}</span>
                ) : (
                    <>
                        <Scissors size={20} />
                        <span>Kivágás és Letöltés</span>
                    </>
                )}
            </button>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm text-center font-medium animate-fade-in flex items-center justify-center gap-2">
                    <AlertCircle size={18} /> {error}
                </div>
            )}
            
            {status && !isLoading && !error && (
                 <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm text-center font-medium animate-fade-in flex items-center justify-center gap-2">
                    <Download size={18} /> {status}
                </div>
            )}
        </div>
    );
};
