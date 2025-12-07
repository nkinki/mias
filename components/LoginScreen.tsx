
import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
    onLogin: (password: string) => boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onLogin(password);
        if (!success) {
            setError(true);
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-glow">
                        <Lock className="w-8 h-8 text-blue-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">MI Asszisztens</h1>
                    <p className="text-slate-400">A folytatáshoz kérjük, adja meg a jelszót.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Jelszó</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-600"
                            placeholder="••••••••"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            Hibás jelszó. Próbálja újra.
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                        <span>Belépés</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <div className="mt-6 text-center">
                         <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                            <ShieldCheck size={12} />
                            <span>Privát Hozzáférés</span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
