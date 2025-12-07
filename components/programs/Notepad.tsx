
import React, { useState, useEffect, useRef } from 'react';
import { Save, Copy, Check, StickyNote, Download, FolderInput, Plus, X, FileText } from 'lucide-react';

// This global is loaded from a CDN in index.html
declare const saveAs: any;

interface Note {
    id: string;
    title: string;
    content: string;
}

export const Notepad: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [status, setStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
    const [copySuccess, setCopySuccess] = useState(false);
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null);

    // Betöltés a localStorage-ből
    useEffect(() => {
        const savedData = localStorage.getItem('mi_assistant_notes_v2');
        if (savedData) {
            try {
                const parsedNotes = JSON.parse(savedData);
                if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
                    setNotes(parsedNotes);
                    setActiveNoteId(parsedNotes[0].id);
                    return;
                }
            } catch (e) {
                console.error("Hiba a mentett jegyzetek betöltésekor", e);
            }
        }

        // Visszamenőleges kompatibilitás: régi jegyzet betöltése
        const oldNote = localStorage.getItem('mi_assistant_notes');
        const initialNote = {
            id: Date.now().toString(),
            title: 'Jegyzet 1',
            content: oldNote || ''
        };
        setNotes([initialNote]);
        setActiveNoteId(initialNote.id);
    }, []);

    // Aktív jegyzet keresése
    const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

    // Helyi mentés (LocalStorage) - teljes állapot mentése
    const handleLocalSave = () => {
        if (notes.length === 0) return;
        setStatus('saving');
        localStorage.setItem('mi_assistant_notes_v2', JSON.stringify(notes));
        // Backward compatibility for widget
        if (activeNote) {
             localStorage.setItem('mi_assistant_notes', activeNote.content);
        }
        setTimeout(() => setStatus('saved'), 500);
    };

    // Szöveg változása
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!activeNoteId) return;
        
        const newContent = e.target.value;
        setNotes(prev => prev.map(note => 
            note.id === activeNoteId ? { ...note, content: newContent } : note
        ));
        setStatus('unsaved');
    };

    // Új fül
    const handleAddTab = () => {
        const newNote: Note = {
            id: Date.now().toString(),
            title: `Jegyzet ${notes.length + 1}`,
            content: ''
        };
        setNotes([...notes, newNote]);
        setActiveNoteId(newNote.id);
        setStatus('unsaved');
    };

    // Fül bezárása
    const handleCloseTab = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (notes.length === 1) {
            // Ha ez az utolsó, csak ürítjük
            setNotes([{ ...notes[0], content: '', title: 'Jegyzet 1' }]);
            return;
        }

        const newNotes = notes.filter(n => n.id !== id);
        setNotes(newNotes);
        
        if (activeNoteId === id) {
            setActiveNoteId(newNotes[newNotes.length - 1].id);
        }
        handleLocalSave();
    };

    // Mappa feltöltés kezelése
    const handleFolderUploadTrigger = () => {
        folderInputRef.current?.click();
    };

    const handleFolderLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newNotes: Note[] = [];
        setStatus('saving');
        setUploadProgress({ current: 0, total: files.length });

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadProgress({ current: i + 1, total: files.length });
            
            // Fájltípus ellenőrzés (szöveges fájlok)
            // Kiterjesztés vagy MIME típus alapján engedékeny ellenőrzés
            const isText = file.type.startsWith('text/') || 
                           file.name.match(/\.(txt|md|js|ts|jsx|tsx|html|css|json|xml|csv|py|java|c|cpp|h|sql|log)$/i);

            if (!isText && file.size > 2000000) continue; // Skip large binary-looking files

            try {
                // Wait a tiny bit to allow UI update
                await new Promise(resolve => setTimeout(resolve, 5));
                
                const text = await file.text();
                // Basic check to avoid binary files that slipped through
                if (text.includes('\0')) continue; 

                newNotes.push({
                    id: Date.now().toString() + i,
                    title: file.name,
                    content: text
                });
            } catch (err) {
                console.warn(`Nem sikerült beolvasni: ${file.name}`);
            }
        }

        if (newNotes.length > 0) {
            setNotes(prev => [...prev, ...newNotes]);
            setActiveNoteId(newNotes[0].id); // Ugrás az első új fájlra
            setStatus('unsaved');
        }
        
        setUploadProgress(null);
        // Input reset
        e.target.value = '';
    };

    // Aktív fül letöltése
    const handleDownload = () => {
        if (!activeNote) return;
        const blob = new Blob([activeNote.content], { type: 'text/plain;charset=utf-8' });
        // Ha van kiterjesztése a címnek, használjuk, ha nincs, adjunk hozzá .txt-t
        const filename = activeNote.title.includes('.') ? activeNote.title : `${activeNote.title}.txt`;
        saveAs(blob, filename);
        handleLocalSave(); 
    };

    const handleCopy = () => {
        if (!activeNote) return;
        navigator.clipboard.writeText(activeNote.content).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const buttonBaseClass = "flex items-center gap-2 px-4 py-2 rounded-md text-white transition-all shadow-sm font-medium text-sm border border-slate-600";
    const darkButtonStyle = "bg-slate-800 hover:bg-slate-700";

    return (
        <div className="space-y-4 h-full flex flex-col relative">
            {/* Overlay Progress Bar */}
            {uploadProgress && (
                <div className="absolute inset-0 z-50 bg-black/60 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
                    <div className="bg-surface p-6 rounded-lg border border-medium shadow-xl w-80 text-center">
                        <h3 className="text-lg font-bold text-dark mb-2">Fájlok betöltése...</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 dark:bg-gray-700">
                            <div 
                                className="bg-accent h-2.5 rounded-full transition-all duration-100" 
                                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-muted">{uploadProgress.current} / {uploadProgress.total} fájl</p>
                    </div>
                </div>
            )}

            {/* Fejléc és Vezérlők */}
            <div className="flex flex-wrap justify-between items-center bg-light p-3 rounded-lg border border-medium gap-2">
                <div className="flex items-center gap-2 text-dark font-semibold">
                    <StickyNote className="text-accent" size={20} />
                    <h3>Jegyzetfüzet</h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                     <span className={`text-xs mr-2 ${status === 'unsaved' ? 'text-accent font-bold' : 'text-muted'}`}>
                        {status === 'saved' ? 'Mentve' : status === 'saving' ? 'Mentés...' : 'Nem mentett'}
                    </span>
                    
                    {/* Rejtett fájl bemenet mappákhoz */}
                    <input 
                        type="file" 
                        // @ts-ignore - webkitdirectory is standard in modern browsers but missing in React types
                        webkitdirectory="" 
                        directory="" 
                        multiple 
                        ref={folderInputRef} 
                        onChange={handleFolderLoad} 
                        className="hidden" 
                    />

                    <button 
                        onClick={handleAddTab} 
                        className={`${buttonBaseClass} ${darkButtonStyle}`}
                        title="Új üres fül"
                    >
                        <Plus size={16} />
                        Új
                    </button>

                    <button 
                        onClick={handleFolderUploadTrigger} 
                        className={`${buttonBaseClass} ${darkButtonStyle}`}
                        title="Mappa betöltése külön fülekre"
                    >
                        <FolderInput size={16} />
                        Mappa
                    </button>

                    <button 
                        onClick={handleDownload} 
                        className={`${buttonBaseClass} ${darkButtonStyle}`}
                        title="Aktuális fül letöltése"
                    >
                        <Download size={16} />
                        Letöltés
                    </button>

                    <button 
                        onClick={handleCopy} 
                        className={`${buttonBaseClass} ${darkButtonStyle}`}
                        title="Másolás vágólapra"
                    >
                        {copySuccess ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        {copySuccess ? 'Másolva' : 'Másolás'}
                    </button>
                    
                    {/* Mentés gomb - Sötét stílusban, ahogy kérted */}
                    <button 
                        onClick={handleLocalSave} 
                        className={`${buttonBaseClass} bg-slate-900 hover:bg-black border-slate-700`}
                        title="Összes fül mentése a böngészőbe"
                    >
                        <Save size={16} />
                        Mentés
                    </button>
                </div>
            </div>

            {/* Fülek (Tabs) - SÖTÉT MÓD */}
            <div className="flex bg-slate-950 border-b border-slate-700 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 rounded-t-lg">
                {notes.map(note => (
                    <div 
                        key={note.id}
                        onClick={() => setActiveNoteId(note.id)}
                        className={`
                            group flex items-center gap-2 px-4 py-2 border-r border-slate-800 cursor-pointer min-w-[120px] max-w-[200px]
                            transition-colors select-none
                            ${activeNoteId === note.id 
                                ? 'bg-slate-800 border-t-2 border-t-accent text-white font-medium shadow-sm' 
                                : 'bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-200'}
                        `}
                    >
                        <FileText size={14} className={activeNoteId === note.id ? 'text-accent' : 'text-slate-500'} />
                        <span className="truncate flex-grow text-sm">{note.title}</span>
                        <button 
                            onClick={(e) => handleCloseTab(e, note.id)}
                            className={`p-0.5 rounded-full hover:bg-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ${notes.length === 1 ? 'hidden' : ''}`}
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
                <button 
                    onClick={handleAddTab}
                    className="px-3 py-2 text-slate-500 hover:text-accent hover:bg-slate-900 transition-colors"
                    title="Új fül"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Szerkesztő */}
            <div className="flex-grow relative">
                <textarea
                    ref={textareaRef}
                    value={activeNote?.content || ''}
                    onChange={handleChange}
                    onBlur={handleLocalSave} // Autosave on blur
                    placeholder={activeNote ? "Írja ide jegyzeteit..." : "Hozzon létre egy új jegyzetet..."}
                    className="w-full h-full min-h-[50vh] p-6 bg-surface text-dark placeholder-muted rounded-b-lg border-x border-b border-medium focus:outline-none focus:ring-0 font-sans text-lg leading-relaxed resize-none shadow-inner"
                    disabled={!activeNote}
                />
            </div>
        </div>
    );
};
