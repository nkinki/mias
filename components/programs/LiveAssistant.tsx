import React, { useEffect, useRef } from 'react';
import { useLiveChat } from '../../hooks/useLiveChat';
import { Bot, User, Mic, MicOff, AlertTriangle } from 'lucide-react';

const statusMap = {
    idle: { text: "Kattintson a mikrofonra a kezdéshez", color: "text-muted" },
    connecting: { text: "Csatlakozás...", color: "text-accent" },
    listening: { text: "Hallgatom...", color: "text-green-500" },
    thinking: { text: "Gondolkodom...", color: "text-yellow-500" },
    speaking: { text: "Beszélek...", color: "text-blue-500" },
};

export const LiveAssistant: React.FC = () => {
    const systemInstruction = 'Ön egy segítőkész és barátságos MI asszisztens. A magyar nyelvre koncentráljon. Válaszai legyenek rövidek és lényegretörőek.';
    const { transcript, status, error, startSession, closeSession } = useLiveChat(systemInstruction);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [transcript]);
    
    const isSessionActive = status !== 'idle';

    const handleToggleSession = () => {
        if (isSessionActive) {
            closeSession();
        } else {
            startSession();
        }
    };

    return (
        <div className="flex flex-col h-[70vh] space-y-4">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 p-2 bg-light border border-medium rounded-lg">
                {transcript.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role !== 'user' && <div className={`w-8 h-8 rounded-full ${msg.role === 'model' ? 'bg-accent-light' : 'bg-gray-200'} flex items-center justify-center flex-shrink-0`}><Bot className={`w-5 h-5 ${msg.role === 'model' ? 'text-accent' : 'text-muted'}`} /></div>}
                        <div className={`max-w-[85%] p-3 rounded-lg text-base whitespace-pre-wrap ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-surface text-dark'} ${!msg.isFinal ? 'opacity-70' : ''}`}>
                            {msg.text || '...'}
                        </div>
                        {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-muted" /></div>}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex flex-col items-center gap-3">
                 {error && (
                    <div className="text-red-500 text-sm flex items-center gap-2" role="alert">
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}
                <div className={`font-semibold ${statusMap[status].color}`}>
                    {statusMap[status].text}
                </div>
                <button
                    onClick={handleToggleSession}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg
                        ${isSessionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-accent hover:bg-accent-hover'}
                        ${status === 'connecting' ? 'animate-pulse' : ''}`}
                    aria-label={isSessionActive ? 'Beszélgetés leállítása' : 'Beszélgetés indítása'}
                >
                    {isSessionActive ? <MicOff size={36} /> : <Mic size={36} />}
                </button>
            </div>
        </div>
    );
};
