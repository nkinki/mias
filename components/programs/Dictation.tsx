import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from "@google/genai";
import { createBlob } from '../../utils/audioUtils';
import { Mic, MicOff, Download, Trash2, AlertTriangle } from 'lucide-react';

// saveAs is global
declare const saveAs: any;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const Dictation: React.FC = () => {
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const streamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const cleanup = useCallback(() => {
        scriptProcessorRef.current?.disconnect();
        streamSourceRef.current?.disconnect();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close().catch(console.error);
        }

        scriptProcessorRef.current = null;
        streamSourceRef.current = null;
        mediaStreamRef.current = null;
        inputAudioContextRef.current = null;
        sessionPromiseRef.current = null;
    }, []);

    const stopDictation = useCallback(async () => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session, it might have failed to initialize.", e);
            }
        }
        cleanup();
        setStatus('idle');
    }, [cleanup]);

    const startDictation = useCallback(async () => {
        if (status !== 'idle') return;

        setStatus('connecting');
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('listening');
                        streamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            }).catch(() => {});
                        };
                        streamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            // FIX: Concatenate text chunks directly. The previous logic added extra spaces, which split words.
                            setTranscript(prev => prev + text);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(`Hiba a kapcsolat során: ${e.message}`);
                        stopDictation();
                    },
                    onclose: () => {
                        // The session is automatically closed by the hook logic when stopped.
                        // Setting status to 'idle' will be handled by stopDictation.
                        // We check the status to avoid calling stopDictation if it's already idle.
                        if (status !== 'idle') {
                            stopDictation();
                        }
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    systemInstruction: 'Ön egy rendkívül pontos magyar nyelvű gépíró szolgáltatás. Feladata, hogy a felhasználó beszédét szöveggé alakítsa, helyes magyar nyelvtan és írásjelek használatával. Csak a szöveget adja vissza, hangalapú választ ne generáljon.',
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                },
            });
            await sessionPromiseRef.current;
        } catch (e: any) {
            let errorMessage = 'Ismeretlen hiba történt.';
            if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                errorMessage = 'A mikrofon hozzáférés le van tiltva. Kérjük, engedélyezze a böngésző címsorában, majd frissítse az oldalt.';
            } else if (e.name === 'NotFoundError') {
                 errorMessage = 'Nem található mikrofon eszköz. Kérjük, ellenőrizze, hogy csatlakoztatva van-e.';
            } else if (e.name === 'NotReadableError') {
                errorMessage = 'A mikrofont egy másik alkalmazás használja, vagy hardverhiba lépett fel.';
            }
            setError(errorMessage);
            setStatus('error');
            cleanup();
        }
    }, [status, stopDictation, cleanup]);


    useEffect(() => {
        return () => {
            stopDictation();
        };
    }, [stopDictation]);

    const handleClear = () => {
        setTranscript('');
    };

    const handleSave = () => {
        if (!transcript) return;
        const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'gepirat.txt');
    };
    
    const statusTextMap = {
        idle: 'Kattintson a mikrofonra a diktálás megkezdéséhez.',
        connecting: 'Csatlakozás...',
        listening: 'Hallgatom...',
        error: 'Hiba történt.',
    };

    return (
        <div className="flex flex-col h-[70vh] space-y-4">
            <div className="flex-grow relative">
                <textarea
                    readOnly
                    value={transcript}
                    placeholder="A leírt szöveg itt fog megjelenni..."
                    className="w-full h-full p-3 bg-surface text-dark placeholder-muted rounded-md border border-medium resize-none"
                    aria-label="Átirat"
                />
            </div>

            <div className="flex flex-col items-center gap-4">
                <div className="h-6 text-center">
                    {error ? (
                        <p className="text-red-500 flex items-center gap-2"><AlertTriangle size={16} /> {error}</p>
                    ) : (
                        <p className="text-muted">{statusTextMap[status]}</p>
                    )}
                </div>
                
                <div className="flex items-center gap-6">
                     <button
                        onClick={handleClear}
                        disabled={!transcript || status === 'listening'}
                        className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-200 text-dark hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Törlés"
                    >
                        <Trash2 size={24} />
                    </button>
                    
                    <button
                        onClick={status === 'listening' ? stopDictation : startDictation}
                        disabled={status === 'connecting'}
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg
                            ${status === 'listening' ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-accent hover:bg-accent-hover'}
                            ${status === 'connecting' ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                        aria-label={status === 'listening' ? 'Diktálás leállítása' : 'Diktálás indítása'}
                    >
                        {status === 'listening' ? <MicOff size={36} /> : <Mic size={36} />}
                    </button>
                    
                    <button
                        onClick={handleSave}
                        disabled={!transcript}
                        className="flex items-center justify-center w-14 h-14 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mentés .txt fájlként"
                    >
                        <Download size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};