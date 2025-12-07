import React, { useState, useEffect, useRef } from 'react';
import { useLiveChat } from '../../hooks/useLiveChat';
import { Bot, User, Mic, MicOff, AlertTriangle, Briefcase, Languages, Presentation, ArrowLeft } from 'lucide-react';

const statusMap = {
    idle: { text: "Kattintson a mikrofonra a kezdéshez", color: "text-muted" },
    connecting: { text: "Csatlakozás...", color: "text-accent" },
    listening: { text: "Hallgatom...", color: "text-green-500" },
    thinking: { text: "Gondolkodom...", color: "text-yellow-500" },
    speaking: { text: "Beszélek...", color: "text-blue-500" },
};

const SCENARIOS = [
    {
        id: 'job_interview',
        title: 'Állásinterjú',
        description: 'Gyakoroljon egy szoftverfejlesztői állásinterjúra. Az MI a HR-es szerepét veszi fel.',
        icon: Briefcase,
        systemInstruction: 'Ön egy barátságos, de professzionális HR menedzser egy szoftverfejlesztő cégnél. Tegyen fel a felhasználónak általános állásinterjú-kérdéseket a tapasztalatairól, a technikai készségeiről és a problémamegoldó képességeiről. Tartsa a beszélgetést 5-10 percig, majd a végén adjon rövid, konstruktív visszajelzést.'
    },
    {
        id: 'english_practice',
        title: 'Nyelvgyakorlás (angol)',
        description: 'Gyakorolja az angol nyelvet egy kötetlen beszélgetés során. Az MI egy anyanyelvi tanár szerepét játssza.',
        icon: Languages,
        systemInstruction: 'You are a friendly English language tutor. Your goal is to have a casual conversation with the user in English. Talk about hobbies, travel, or daily life. Correct their mistakes gently and encourage them to speak more. Keep your responses relatively simple.'
    },
    {
        id: 'presentation_practice',
        title: 'Prezentáció gyakorlása',
        description: 'Gyakorolja az előadását. Az MI a közönség szerepét veszi fel, és a végén kérdéseket tehet fel.',
        icon: Presentation,
        systemInstruction: 'Ön a közönség egy tagja. A felhasználó egy prezentációt fog tartani. Hallgassa végig figyelmesen. A prezentáció végén tegyen fel 2-3 releváns, értelmes kérdést a témával kapcsolatban, hogy segítse a felhasználót a felkészülésben.'
    }
];

const ScenarioSelector: React.FC<{ onSelect: (scenario: any) => void }> = ({ onSelect }) => (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center text-dark">Válasszon egy szcenáriót a gyakorláshoz</h2>
        {SCENARIOS.map(scenario => (
            <button key={scenario.id} onClick={() => onSelect(scenario)} className="w-full flex items-center gap-4 p-4 bg-surface border border-medium rounded-lg text-left transition-all hover:border-accent hover:shadow-md">
                <scenario.icon className="w-10 h-10 text-accent flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-lg text-dark">{scenario.title}</h3>
                    <p className="text-sm text-muted">{scenario.description}</p>
                </div>
            </button>
        ))}
    </div>
);

const ChatInterface: React.FC<{ scenario: any; onExit: () => void }> = ({ scenario, onExit }) => {
    const { transcript, status, error, startSession, closeSession } = useLiveChat(scenario.systemInstruction);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        startSession();
        return () => {
            closeSession();
        };
    }, [startSession, closeSession]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcript]);

    return (
        <div className="flex flex-col h-[70vh] space-y-4">
            <div className="flex items-center gap-4 p-2 bg-light border-b border-medium">
                <button onClick={onExit} className="text-muted hover:text-dark"><ArrowLeft size={20}/></button>
                <scenario.icon className="w-6 h-6 text-accent"/>
                <h2 className="font-semibold text-lg text-dark">{scenario.title}</h2>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 p-2">
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
                 <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg
                        ${status !== 'idle' ? 'bg-green-500' : 'bg-gray-400'}
                        ${status === 'listening' || status === 'speaking' || status === 'thinking' ? 'animate-pulse' : ''}`}
                    aria-label="Hang állapot jelző"
                >
                    <Mic size={36} />
                </div>
            </div>
        </div>
    );
};


export const RolePlaySimulator: React.FC = () => {
    const [activeScenario, setActiveScenario] = useState<any | null>(null);

    if (!activeScenario) {
        return <ScenarioSelector onSelect={setActiveScenario} />;
    }

    return <ChatInterface scenario={activeScenario} onExit={() => setActiveScenario(null)} />;
};
