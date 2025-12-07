import React, { useState, useRef, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { extractTextFromFile } from '../../utils/fileUtils';
import { answerFromText } from '../../services/geminiService';
import type { ChatMessage } from '../../types';
import { Bot, User, Send, FileUp } from 'lucide-react';

export const PdfQA: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [pdfText, setPdfText] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [question, setQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setIsLoading(true);
        setError('');
        setPdfText('');
        setMessages([]);
        setStatus('Dokumentum elemzése...');

        try {
            const textContent = await extractTextFromFile(uploadedFile);
            if (!textContent.trim()) {
                throw new Error("Nem sikerült szöveget kinyerni a fájlból, vagy a dokumentum üres.");
            }
            setPdfText(textContent);
            setMessages([{
                role: 'model',
                text: `A(z) "${uploadedFile.name}" dokumentum sikeresen beolvasva. Miben segíthetek a tartalmával kapcsolatban?`
            }]);
        } catch (err: any) {
            setError(err.message || 'A fájl feldolgozása sikertelen.');
            setFile(null);
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };

    const handleAskQuestion = async () => {
        if (!question.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: question };
        setMessages(prev => [...prev, userMessage]);
        setQuestion('');
        setIsLoading(true);

        try {
            const answer = await answerFromText(pdfText, userMessage.text);
            const modelMessage: ChatMessage = { role: 'model', text: answer };
            setMessages(prev => [...prev, modelMessage]);
        } catch (err) {
            const errorMessage: ChatMessage = { role: 'model', text: "Sajnálom, hiba történt a válaszadás során." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setFile(null);
        setPdfText('');
        setMessages([]);
        setQuestion('');
        setIsLoading(false);
        setStatus('');
        setError('');
    };

    if (!pdfText) {
        return (
            <div className="space-y-4">
                <FileUploader
                    onFileUpload={handleFileUpload}
                    acceptedFileTypes=".pdf"
                    label="Töltsön fel egy PDF dokumentumot"
                />
                {isLoading && <div className="text-center p-8">{status}</div>}
                {error && <div className="text-red-500 text-center">{error}</div>}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[70vh] space-y-4">
            <div className="flex justify-between items-center p-3 bg-light border border-medium rounded-lg">
                <p className="font-semibold text-dark truncate">Fájl: <span className="font-normal text-muted">{file?.name}</span></p>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded text-dark hover:bg-gray-300 transition-colors text-sm"
                >
                    <FileUp size={16} /> Másik fájl
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 p-2 bg-light border border-medium rounded-lg">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-accent" /></div>}
                        <div className={`max-w-[85%] p-3 rounded-lg text-base whitespace-pre-wrap ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-surface text-dark'}`}>
                            {msg.text}
                        </div>
                        {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-muted" /></div>}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-2.5 justify-start">
                        <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-accent" /></div>
                        <div className="p-3 rounded-lg bg-surface text-dark">
                            <span className="animate-pulse">Gondolkodom...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                    placeholder="Tegyen fel egy kérdést a dokumentumról..."
                    className="flex-grow bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={isLoading}
                />
                <button
                    onClick={handleAskQuestion}
                    disabled={isLoading || !question.trim()}
                    className="bg-accent hover:bg-accent-hover text-white p-2 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center w-12 h-12"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};
