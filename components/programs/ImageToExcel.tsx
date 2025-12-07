import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { extractTableFromImageAsJson } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/fileUtils';

// These globals are loaded from CDNs in index.html
declare const XLSX: any;
declare const saveAs: any;

export const ImageToExcel: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setStatus('Kép feldolgozása táblázat adatokért...');
        setError('');

        try {
            const base64 = await fileToBase64(uploadedFile);
            setStatus('Táblázat szerkezetének elemzése MI-vel...');
            const jsonString = await extractTableFromImageAsJson(base64, uploadedFile.type);
            
            setStatus('Excel táblázat generálása...');
            let data;
            try {
                // Sanitize the JSON string from Gemini
                const cleanedJson = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
                data = JSON.parse(cleanedJson);
            } catch (jsonError) {
                console.error("JSON feldolgozási hiba:", jsonError);
                throw new Error("Az MI érvénytelen JSON-t adott vissza. Nem sikerült létrehozni az Excel fájlt.");
            }

            if (!Array.isArray(data) || data.length === 0) {
                 throw new Error("Nem található érvényes táblázat adat, vagy az MI nem adott vissza ilyet.");
            }

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

            saveAs(blob, `${uploadedFile.name.split('.')[0]}_table.xlsx`);
            setStatus(`Siker! A táblázat letöltve.`);

        } catch (err: any) {
            setStatus('');
            setError(err.message || 'Ismeretlen hiba történt.');
            console.error(err);
        }
    };

    return (
        <div className="space-y-4">
            <FileUploader 
                onFileUpload={handleFileUpload}
                acceptedFileTypes="image/*"
                label="Töltsön fel egy képet egy táblázatról"
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