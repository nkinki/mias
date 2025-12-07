import React from 'react';
import { Sparkles, Image, FileText, Mic, ArrowRight, ShieldCheck, Zap, LayoutDashboard } from 'lucide-react';

interface LandingPageProps {
    onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-light font-sans text-dark flex flex-col">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <div className="bg-accent text-white p-2 rounded-lg">
                        <Sparkles size={24} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">MI Asszisztens</span>
                </div>
                <button 
                    onClick={onStart}
                    className="text-sm font-semibold text-muted hover:text-accent transition-colors"
                >
                    Belépés
                </button>
            </nav>

            {/* Hero Section */}
            <header className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-accent text-sm font-medium mb-8">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    v4.0 Kiadás – Új Gemini 2.5 Integrációval
                </div>
                
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-dark mb-8 tracking-tight leading-tight">
                    Az Ön intelligens <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">digitális társa.</span>
                </h1>
                
                <p className="text-xl text-muted mb-12 max-w-2xl leading-relaxed">
                    Növelje hatékonyságát mesterséges intelligenciával. 
                    Képelemzés, dokumentumkezelés, valós idejű fordítás és hangasszisztens egyetlen letisztult felületen.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                        onClick={onStart}
                        className="group bg-accent hover:bg-accent-hover text-white text-lg font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                    >
                        Irányítópult Megnyitása
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                         onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                         className="bg-white hover:bg-gray-50 text-dark border border-medium text-lg font-semibold py-4 px-8 rounded-full transition-colors"
                    >
                        Funkciók felfedezése
                    </button>
                </div>
            </header>

            {/* Stats / Trust Banner */}
            <div className="w-full bg-white border-y border-medium py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-3xl font-bold text-dark mb-1">30+</div>
                        <div className="text-sm text-muted">Beépített Eszköz</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-dark mb-1">24/7</div>
                        <div className="text-sm text-muted">Elérhetőség</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-dark mb-1">Gemini 2.5</div>
                        <div className="text-sm text-muted">Legújabb Modell</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-dark mb-1">100%</div>
                        <div className="text-sm text-muted">Ingyenes</div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-dark mb-4">Mindent egy helyen</h2>
                    <p className="text-muted max-w-2xl mx-auto">
                        Felejtse el a tucatnyi különálló alkalmazást. Az MI Asszisztens integrálja a legfontosabb irodai és kreatív eszközöket.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={<LayoutDashboard />}
                        title="Átlátható Irányítópult"
                        description="Minden eszköz könnyen elérhető egy modern, testreszabható felületről."
                    />
                    <FeatureCard 
                        icon={<Image />}
                        title="Fejlett Képelemzés"
                        description="Ismerje fel a képek tartalmát, nyerjen ki szöveget vagy konvertáljon táblázatokat Excelbe."
                    />
                    <FeatureCard 
                        icon={<Mic />}
                        title="Hangasszisztens"
                        description="Beszélgessen az MI-vel, diktáljon leveleket vagy hallgassa meg a dokumentumait."
                    />
                    <FeatureCard 
                        icon={<FileText />}
                        title="Intelligens Írás"
                        description="Generáljon e-maileket, jelentéseket, önéletrajzot vagy blogbejegyzéseket másodpercek alatt."
                    />
                    <FeatureCard 
                        icon={<ShieldCheck />}
                        title="Tényellenőrzés"
                        description="Ellenőrizze az információk hitelességét valós idejű internetes kereséssel."
                    />
                    <FeatureCard 
                        icon={<Zap />}
                        title="Gyors Eszközök"
                        description="Számológép, valutaváltó, időjárás és naptár mindig kéznél."
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-medium py-12 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                         <div className="bg-dark text-white p-1.5 rounded">
                            <Sparkles size={16} />
                        </div>
                        <span className="font-bold text-dark">MI Asszisztens</span>
                    </div>
                    <p className="text-muted text-sm">
                        Készült a Google Gemini technológiájával. &copy; 2025
                    </p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl border border-medium hover:border-accent/50 hover:shadow-lg transition-all duration-300 group">
        <div className="w-12 h-12 bg-blue-50 text-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
        </div>
        <h3 className="text-xl font-bold text-dark mb-3">{title}</h3>
        <p className="text-muted leading-relaxed">
            {description}
        </p>
    </div>
);
