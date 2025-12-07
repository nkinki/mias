import React, { useState } from 'react';
import { generateSpeech } from '../../services/geminiService';
import { decode } from '../../utils/audioUtils';
import { FileUploader } from '../FileUploader';
import { Download, Speaker, Trash2 } from 'lucide-react';

// These globals are loaded from CDNs in index.html
declare const saveAs: any;
declare const lamejs: any;

type Voice = 'Zephyr' | 'Kore' | 'Puck' | 'Charon' | 'Fenrir';

const playCompletionSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) {
        console.warn("A Web Audio API nem támogatott ebben a böngészőben.");
        return;
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'triangle'; // Lágyabb hang
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 hang
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Hangerő

    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
};


export const TextToSpeech: React.FC = () => {
    const [text, setText] = useState('');
    const [voice, setVoice] = useState<Voice>('Zephyr');
    const [audioUrl, setAudioUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileUpload = async (file: File) => {
        if (file.type !== 'text/plain') {
            setError('Kérjük, csak .txt fájlt töltsön fel.');
            return;
        }
        setError('');
        const content = await file.text();
        setText(content);
    };
    
    const handleReset = () => {
        setText('');
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl('');
        setError('');
    };

    const pcmToMp3 = (base64AudioData: string): string => {
        const pcmBytes = decode(base64AudioData);
        const pcmSamples = new Int16Array(pcmBytes.buffer);

        const sampleRate = 24000; // A TTS modell 24kHz-es mintavételezéssel dolgozik
        const numChannels = 1; // Mono
        const kbps = 128;

        const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, kbps);
        const mp3Data = [];
        const sampleBlockSize = 1152;

        for (let i = 0; i < pcmSamples.length; i += sampleBlockSize) {
            const sampleChunk = pcmSamples.subarray(i, i + sampleBlockSize);
            const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
            if (mp3buf.length > 0) {
                mp3Data.push(new Uint8Array(mp3buf));
            }
        }
        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(new Uint8Array(mp3buf));
        }

        const blob = new Blob(mp3Data, { type: 'audio/mpeg' });
        return URL.createObjectURL(blob);
    };


    const handleGenerate = async () => {
        if (!text.trim()) {
            setError('A szövegmező nem lehet üres.');
            return;
        }

        setIsLoading(true);
        setError('');
        
        // Töröljük a korábbi blob URL-t a memóriából
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl('');

        try {
            const base64Audio = await generateSpeech(text, voice);
            const mp3Url = pcmToMp3(base64Audio);
            setAudioUrl(mp3Url);
            playCompletionSound();
        } catch (err: any) {
            setError(err.message || 'Ismeretlen hiba történt a hang generálása közben.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!audioUrl) return;
        const safeFilename = text.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        saveAs(audioUrl, `${safeFilename || 'felolvasas'}.mp3`);
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="tts-input" className="font-semibold text-dark">Felolvasandó Szöveg</label>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1 text-sm text-muted hover:text-dark transition-colors disabled:opacity-50"
                        title="Tartalom törlése"
                        disabled={!text.trim() && !audioUrl}
                    >
                        <Trash2 size={14} /> Törlés
                    </button>
                </div>
                <textarea
                    id="tts-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Írja be ide a szöveget, vagy töltsön fel egy .txt fájlt alább..."
                    rows={10}
                    className="w-full bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent font-sans"
                />
            </div>

            <div className="text-center text-muted">vagy</div>

            <FileUploader
                onFileUpload={handleFileUpload}
                acceptedFileTypes=".txt"
                label="Töltsön fel egy .txt fájlt"
            />
            
            <div>
                <label htmlFor="voice-select" className="block mb-2 font-semibold text-dark">Válasszon hangot</label>
                <select
                    id="voice-select"
                    value={voice}
                    onChange={(e) => setVoice(e.target.value as Voice)}
                    className="w-full bg-surface text-dark rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent"
                >
                    <optgroup label="Női hangok">
                        <option value="Zephyr">Magyar Női hang 1 (Zephyr)</option>
                        <option value="Kore">Magyar Női hang 2 (Kore)</option>
                    </optgroup>
                    <optgroup label="Férfi hangok">
                        <option value="Puck">Magyar Férfi hang 1 (Puck)</option>
                        <option value="Charon">Magyar Férfi hang 2 (Charon)</option>
                        <option value="Fenrir">Magyar Férfi hang 3 (Fenrir)</option>
                    </optgroup>
                </select>
            </div>


            <button
                onClick={handleGenerate}
                disabled={isLoading || !text.trim()}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Generálás...' : (
                    <>
                        <Speaker size={20}/>
                        <span>Hang Létrehozása</span>
                    </>
                )}
            </button>

            {error && <div className="text-red-500 text-center" role="alert">{error}</div>}
            
            {isLoading && <div className="text-center p-8">Hang generálása... Ez hosszabb szövegeknél több időbe telhet.</div>}
            
            {audioUrl && (
                <div className="space-y-4 p-4 bg-light border border-medium rounded-lg">
                     <h3 className="font-semibold text-xl text-dark">Eredmény</h3>
                     <audio controls src={audioUrl} className="w-full">
                        A böngészője nem támogatja a hang lejátszását.
                     </audio>
                     <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                     >
                        <Download size={18} />
                        Letöltés MP3-ként
                     </button>
                </div>
            )}
        </div>
    );
};