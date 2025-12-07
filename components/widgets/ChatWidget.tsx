import React, { useState, useRef, useEffect } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import type { ChatMessage } from '../../types';
import { sendChatMessage, resetChat } from '../../services/geminiService';
import { Bot, User, Send, Trash2 } from 'lucide-react';

export const ChatWidget: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const responseText = await sendChatMessage(input);
        
        const modelMessage: ChatMessage = { role: 'model', text: responseText };
        setMessages(prev => [...prev, modelMessage]);
        setIsLoading(false);
    };

    const handleClearChat = () => {
        setMessages([]);
        resetChat();
    };

    const clearButton = (
        <button
            onClick={handleClearChat}
            className="text-muted hover:text-dark transition-colors disabled:opacity-50"
            title="Beszélgetés törlése"
            disabled={messages.length === 0}
        >
            <Trash2 size={16} />
        </button>
    );

    return (
        <WidgetFrame title="Chat" className="h-[28rem]" headerControls={clearButton}>
            <div className="w-full h-full flex flex-col p-2 bg-light rounded-md border border-medium">
                <div className="flex-grow overflow-y-auto pr-2 space-y-3">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-accent" /></div>}
                            <div className={`max-w-[80%] p-3 rounded-lg text-base ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-surface text-dark border border-medium'}`}>
                                {msg.text}
                            </div>
                            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-muted" /></div>}
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex items-start gap-2.5 justify-start">
                            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-accent" /></div>
                            <div className="p-3 rounded-lg bg-surface text-dark border border-medium">
                                <span className="animate-pulse">...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="mt-2 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Kérdezzen valamit..."
                        className="flex-grow bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className="bg-accent hover:bg-accent-hover text-white p-2 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center w-10 h-10">
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </WidgetFrame>
    );
};