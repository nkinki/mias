import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';

// This global is loaded from a CDN in index.html
declare const saveAs: any;

type ConversionMode = 'to_webp' | 'to_png' | 'to_jpeg';

const MODE_CONFIG = {
    'to_webp': {
        label: "Kép → WebP",
        accepted: "image/jpeg,image/png,image/gif",
        uploaderLabel: "Töltsön fel egy képet (JPG, PNG, GIF) WebP-be konvertáláshoz",
        outputMime: 'image/webp',
        outputExt: 'webp',
        quality: 0.9,
    },
    'to_png': {
        label: "WebP → PNG",
        accepted: "image/webp",
        uploaderLabel: "Töltsön fel egy WebP képet PNG-be konvertáláshoz",
        outputMime: 'image/png',
        outputExt: 'png',
        quality: undefined,
    },
    'to_jpeg': {
        label: "WebP → JPEG",
        accepted: "image/webp",
        uploaderLabel: "Töltsön fel egy WebP képet JPEG-be konvertáláshoz",
        outputMime: 'image/jpeg',
        outputExt: 'jpeg',
        quality: 0.9,
    }
};


export const ImageToWebP: React.FC = () => {
    const [mode, setMode] = useState<ConversionMode>('to_webp');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    const resetState = () => {
        setFile(null);
        setStatus('');
        setError('');
    };

    const handleModeChange = (newMode: ConversionMode) => {
        setMode(newMode);
        resetState();
    };

    const handleFileUpload = (uploadedFile: File) => {
        resetState();
        setFile(uploadedFile);
        
        const currentConfig = MODE_CONFIG[mode];
        setStatus(`Konvertálás folyamatban: ${uploadedFile.name} → .${currentConfig.outputExt}...`);

        const reader = new FileReader();
        reader.readAsDataURL(uploadedFile);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        throw new Error('Nem sikerült a vászon kontextusát létrehozni.');
                    }
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const originalName = uploadedFile.name.split('.').slice(0, -1).join('.') || uploadedFile.name;
                            saveAs(blob, `${originalName}.${currentConfig.outputExt}`);
                            setStatus(`Siker! A(z) ${currentConfig.outputExt.toUpperCase()} kép letöltve.`);
                        } else {
                            throw new Error(`Nem sikerült a(z) ${currentConfig.outputExt.toUpperCase()} blob létrehozása.`);
                        }
                    }, currentConfig.outputMime, currentConfig.quality);
                } catch (e: any) {
                    setError(e.message || 'Hiba történt a konvertálás során.');
                    setStatus('');
                }
            };

            img.onerror = () => {
                setError('Hiba a képfájl betöltésekor. Lehet, hogy sérült vagy nem támogatott formátumú.');
                setStatus('');
            };
        };

        reader.onerror = () => {
            setError('Hiba a fájl olvasása közben.');
            setStatus('');
        };
    };

    const activeConfig = MODE_CONFIG[mode];

    return (
        <div className="space-y-6">
            <div>
                <h4 className="block mb-3 font-semibold text-dark">Konverzió Iránya</h4>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Konverzió módjának kiválasztása">
                    {(Object.keys(MODE_CONFIG) as ConversionMode[]).map(key => (
                        <button
                            key={key}
                            onClick={() => handleModeChange(key)}
                            className={`px-4 py-2 rounded-md font-semibold transition-colors border
                                ${mode === key 
                                    ? 'bg-accent text-white border-accent' 
                                    : 'bg-surface text-dark border-medium hover:bg-gray-100'}
                            `}
                            role="radio"
                            aria-checked={mode === key}
                        >
                            {MODE_CONFIG[key].label}
                        </button>
                    ))}
                </div>
            </div>

            <FileUploader 
                onFileUpload={handleFileUpload}
                acceptedFileTypes={activeConfig.accepted}
                label={activeConfig.uploaderLabel}
            />

            {status && (
                <div className="text-center p-4 bg-light border border-medium rounded">
                    <p className="font-semibold text-dark">{status}</p>
                    {file && <p className="text-sm text-muted mt-2">Fájl: {file.name}</p>}
                </div>
            )}
            {error && (
                 <div className="text-center p-4 bg-red-100 border border-red-300 rounded">
                    <p className="font-bold text-red-700">Hiba</p>
                    <p className="text-sm text-red-600 mt-2">{error}</p>
                </div>
            )}
        </div>
    );
};