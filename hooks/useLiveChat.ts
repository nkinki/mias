import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from "@google/genai";
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import type { TranscriptMessage } from '../types';

export const useLiveChat = (systemInstruction: string) => {
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'thinking'>('idle');
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY! }));
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const streamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    const turnCounter = useRef(0);
    const statusRef = useRef(status);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    const cleanup = useCallback(() => {
        scriptProcessorRef.current?.disconnect();
        streamSourceRef.current?.disconnect();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close().catch(console.error);
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(console.error);
        }
        
        sourcesRef.current.forEach(source => source.stop());

        scriptProcessorRef.current = null;
        streamSourceRef.current = null;
        mediaStreamRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        sessionPromiseRef.current = null;
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
    }, []);

    const handleClose = useCallback(() => {
        cleanup();
        setStatus('idle');
    }, [cleanup]);
    
    const handleError = useCallback((errorMessage: string, errorObj?: any) => {
        setError(errorMessage);
        if (errorObj) {
            console.error(errorMessage, errorObj);
        }
        handleClose();
    }, [handleClose]);


    const startSession = useCallback(async () => {
        if (statusRef.current !== 'idle' || sessionPromiseRef.current) {
            return;
        }

        setStatus('connecting');
        setError(null);
        setTranscript([{ id: Date.now(), role: 'system', text: 'Csatlakozás...', isFinal: true }]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = aiRef.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('listening');
                        setTranscript([{ id: Date.now(), role: 'system', text: 'Hallgatom...', isFinal: true }]);
                        
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
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setStatus('thinking');
                            const text = message.serverContent.inputTranscription.text;
                            currentInputTranscriptionRef.current += text;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.role === 'user' && !last.isFinal) {
                                    last.text = currentInputTranscriptionRef.current;
                                    return [...prev];
                                }
                                return [...prev, { id: Date.now() + turnCounter.current, role: 'user', text: currentInputTranscriptionRef.current, isFinal: false }];
                            });
                        }

                        if (message.serverContent?.outputTranscription) {
                            setStatus('speaking');
                            const text = message.serverContent.outputTranscription.text;
                            currentOutputTranscriptionRef.current += text;
                             setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.role === 'model' && !last.isFinal) {
                                    last.text = currentOutputTranscriptionRef.current;
                                    return [...prev];
                                }
                                return [...prev, { id: Date.now() + turnCounter.current + 1, role: 'model', text: currentOutputTranscriptionRef.current, isFinal: false }];
                            });
                        }
                        
                        if (message.serverContent?.turnComplete) {
                            turnCounter.current++;
                            const finalInput = currentInputTranscriptionRef.current;
                            const finalOutput = currentOutputTranscriptionRef.current;
                            
                            setTranscript(prev => {
                                const newTranscript = [...prev];
                                for (let i = newTranscript.length - 1; i >= 0; i--) {
                                    if (newTranscript[i].role === 'user' && !newTranscript[i].isFinal) {
                                        newTranscript[i] = { ...newTranscript[i], text: finalInput, isFinal: true };
                                        break;
                                    }
                                }
                                for (let i = newTranscript.length - 1; i >= 0; i--) {
                                     if (newTranscript[i].role === 'model' && !newTranscript[i].isFinal) {
                                        newTranscript[i] = { ...newTranscript[i], text: finalOutput, isFinal: true };
                                        break;
                                    }
                                }
                                return newTranscript;
                            });

                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                            setStatus('listening');
                        }

                        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64EncodedAudioString) {
                            const outputCtx = outputAudioContextRef.current!;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        handleError(`Hiba történt a kapcsolat során: ${e.message}`, e);
                    },
                    onclose: (e: CloseEvent) => {
                        handleClose();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction,
                },
            });
            await sessionPromiseRef.current;
        } catch (e: any) {
            let errorMessage = `Nem sikerült elindítani a munkamenetet: ${e.message}`;
            if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                errorMessage = 'A mikrofon hozzáférés le van tiltva. Kérjük, engedélyezze a böngésző címsorában, majd frissítse az oldalt.';
            } else if (e.name === 'NotFoundError') {
                errorMessage = 'Nem található mikrofon eszköz. Kérjük, ellenőrizze, hogy a mikrofon csatlakoztatva van-e.';
            } else if (e.name === 'NotReadableError') {
                errorMessage = 'A mikrofont egy másik alkalmazás használja, vagy hardverhiba lépett fel.';
            }
            handleError(errorMessage, e);
        }
    }, [systemInstruction, handleClose, handleError]);

    const closeSession = useCallback(async () => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                handleError("A bezárás sikertelen volt, mert a munkamenet nem jött létre.", e);
            }
        } else {
             handleClose();
        }
    }, [handleError, handleClose]);
    
    useEffect(() => {
      return () => {
        if (sessionPromiseRef.current) {
            closeSession();
        }
      }
    }, [closeSession]);

    return { transcript, status, error, startSession, closeSession };
};
