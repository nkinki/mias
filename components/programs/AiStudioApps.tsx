
import React, { useState, useEffect } from 'react';
import { ExternalLink, Trash2, Plus, LayoutGrid, Globe, Save, X } from 'lucide-react';

interface AppLink {
    id: string;
    name: string;
    url: string;
    description: string;
}

export const AiStudioApps: React.FC = () => {
    const [apps, setApps] = useState<AppLink[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', url: '', description: '' });

    // Betöltés indításkor
    useEffect(() => {
        const saved = localStorage.getItem('mi_assistant_ai_apps');
        if (saved) {
            try {
                setApps(JSON.parse(saved));
            } catch (e) {
                console.error("Hiba a mentett alkalmazások betöltésekor", e);
            }
        }
    }, []);

    // Mentés változáskor
    useEffect(() => {
        localStorage.setItem('mi_assistant_ai_apps', JSON.stringify(apps));
    }, [apps]);

    const handleAdd = () => {
        if (!formData.name || !formData.url) return;
        
        let formattedUrl = formData.url.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = 'https://' + formattedUrl;
        }

        const newApp: AppLink = {
            id: Date.now().toString(),
            name: formData.name,
            url: formattedUrl,
            description: formData.description
        };

        setApps([...apps, newApp]);
        setFormData({ name: '', url: '', description: '' });
        setIsAdding(false);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Biztosan törölni szeretné ezt az alkalmazást a listából?')) {
            setApps(apps.filter(a => a.id !== id));
        }
    };

    const darkButtonClass = "flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm";
    const deleteButtonClass = "p-2 rounded-full hover:bg-slate-800 hover:text-red-400 text-muted transition-colors border border-transparent hover:border-slate-700";

    return (
        <div className="space-y-6 max-w-5xl mx-auto h-full flex flex-col">
            {/* Fejléc */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-4 rounded-lg border border-medium shadow-sm">
                <div>
                    <h3 className="text-xl font-bold text-dark flex items-center gap-2">
                        <LayoutGrid className="text-accent" />
                        Saját Alkalmazások
                    </h3>
                    <p className="text-sm text-muted mt-1">
                        Gyűjtse egy helyre az AI Studio projektjeit és egyéb webes eszközeit.
                    </p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className={darkButtonClass}
                >
                    {isAdding ? <X size={18} /> : <Plus size={18} />}
                    {isAdding ? 'Mégse' : 'Új Hozzáadása'}
                </button>
            </div>

            {/* Hozzáadás Űrlap */}
            {isAdding && (
                <div className="bg-light border border-medium p-6 rounded-lg animate-fade-in shadow-md">
                    <h4 className="font-semibold text-dark mb-4 border-b border-medium pb-2">Új alkalmazás rögzítése</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-dark mb-1">Név *</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-surface text-dark border border-medium rounded px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
                                placeholder="pl. Képgenerátor App"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark mb-1">URL (Link) *</label>
                            <input 
                                type="text" 
                                value={formData.url}
                                onChange={e => setFormData({...formData, url: e.target.value})}
                                className="w-full bg-surface text-dark border border-medium rounded px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
                                placeholder="https://..."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-dark mb-1">Leírás (opcionális)</label>
                            <input 
                                type="text" 
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-surface text-dark border border-medium rounded px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
                                placeholder="Rövid leírás a projektről..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button 
                            onClick={handleAdd}
                            disabled={!formData.name || !formData.url}
                            className={`${darkButtonClass} px-6`}
                        >
                            <Save size={18} />
                            Mentés
                        </button>
                    </div>
                </div>
            )}

            {/* Alkalmazások Rácsnézete */}
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                    {apps.length === 0 && !isAdding && (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted bg-light/50 rounded-xl border-2 border-dashed border-medium">
                            <Globe className="w-16 h-16 mb-4 opacity-40" />
                            <p className="text-lg font-medium">Még nincsenek mentett alkalmazások.</p>
                            <p className="text-sm mt-2">Kattintson az "Új Hozzáadása" gombra az első link rögzítéséhez.</p>
                        </div>
                    )}
                    
                    {apps.map(app => (
                        <div key={app.id} className="bg-surface border border-medium rounded-xl p-5 hover:border-accent hover:shadow-lg transition-all duration-300 flex flex-col group relative h-full">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-accent shadow-sm border border-medium/50">
                                    <Globe size={24} />
                                </div>
                                <button 
                                    onClick={() => handleDelete(app.id)}
                                    className={deleteButtonClass}
                                    title="Törlés"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <h4 className="font-bold text-dark text-lg mb-2 truncate" title={app.name}>{app.name}</h4>
                            <p className="text-muted text-sm mb-6 line-clamp-3 flex-grow">
                                {app.description || 'Nincs megadott leírás.'}
                            </p>

                            <a 
                                href={app.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-auto flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-lg transition-all border border-slate-700"
                            >
                                Megnyitás <ExternalLink size={16} />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
