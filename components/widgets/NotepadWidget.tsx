import React, { useState, useEffect } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { Save, Trash2, Copy, Check } from 'lucide-react';

export const NotepadWidget: React.FC = () => {
    const [text, setText] = useState('');
    const [status, setStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
    const [copySuccess, setCopySuccess] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const savedNotes = localStorage.getItem('mi_assistant_notes');
        if (savedNotes) {
            setText(savedNotes);
        }
    }, []);

    const handleSave = () => {
        setStatus('saving');
        localStorage.setItem('mi_assistant_notes', text);
        setTimeout(() => setStatus('saved'), 500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setStatus('unsaved');
    };

    const handleClear = () => {
        if (confirm('Biztosan törölni szeretné a jegyzetet?')) {
            setText('');
            localStorage.removeItem('mi_assistant_notes');
            setStatus('saved');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    // Header controls for the widget frame
    const controls = (
        <div className="flex items-center gap-1">
            <button 
                onClick={handleCopy} 
                className="p-1.5 text-muted hover:text-accent transition-colors"
                title="Másolás"
            >
                {copySuccess ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </button>
            <button 
                onClick={handleClear} 
                className="p-1.5 text-muted hover:text-red-500 transition-colors"
                title="Törlés"
            >
                <Trash2 size={16} />
            </button>
            <button 
                onClick={handleSave} 
                className={`p-1.5 transition-colors ${status === 'unsaved' ? 'text-accent animate-pulse' : 'text-muted hover:text-dark'}`}
                title="Mentés"
            >
                <Save size={16} />
            </button>
        </div>
    );

    return (
        <WidgetFrame title="Gyorsjegyzet" headerControls={controls}>
            <div className="w-full h-40 bg-light rounded-md border border-medium relative">
                <textarea
                    value={text}
                    onChange={handleChange}
                    onBlur={handleSave} // Auto-save on focus lost
                    placeholder="Írjon ide fontos emlékeztetőket, linkeket..."
                    className="w-full h-full p-3 bg-transparent text-dark placeholder-muted resize-none focus:outline-none text-sm font-sans"
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted pointer-events-none">
                    {status === 'saved' ? 'Mentve' : status === 'saving' ? 'Mentés...' : 'Nem mentett'}
                </div>
            </div>
        </WidgetFrame>
    );
};