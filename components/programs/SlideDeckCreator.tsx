
import React, { useState, useRef } from 'react';
import { generatePresentation, generateImageFromText } from '../../services/geminiService';
import type { Presentation, Slide } from '../../types';
import { Presentation as PresentationIcon, ChevronLeft, ChevronRight, Download, Wand2, FileText, LayoutTemplate, Copy, ImagePlus, Loader2 } from 'lucide-react';

// Globals loaded from CDNs in index.html
declare const saveAs: any;
declare const PptxGenJS: any;

export const SlideDeckCreator: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [presentation, setPresentation] = useState<Presentation | null>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [slideImages, setSlideImages] = useState<{[key: number]: string}>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!inputText.trim()) {
            setError('Kérjük, adjon meg forrásanyagot a prezentációhoz.');
            return;
        }

        setIsLoading(true);
        setError('');
        setPresentation(null);
        setCurrentSlideIndex(0);
        setSlideImages({});

        try {
            const result = await generatePresentation(inputText);
            setPresentation(result);
        } catch (err: any) {
            setError(err.message || 'Hiba történt a generálás során.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImage = async (index: number) => {
        if (!presentation || !presentation.slides[index].imagePrompt) return;
        
        setIsImageLoading(true);
        try {
            const prompt = presentation.slides[index].imagePrompt || "Abstract professional background";
            // Make the prompt more specific for presentation slides
            const enhancedPrompt = `${prompt}, high quality, professional presentation style, photorealistic, 4k`;
            
            const base64Image = await generateImageFromText(enhancedPrompt);
            const imageUrl = `data:image/png;base64,${base64Image}`;
            
            setSlideImages(prev => ({
                ...prev,
                [index]: imageUrl
            }));
        } catch (err) {
            console.error("Image generation failed", err);
            // Optional: show a toast or error message specifically for image gen
        } finally {
            setIsImageLoading(false);
        }
    };

    const nextSlide = () => {
        if (presentation && currentSlideIndex < presentation.slides.length - 1) {
            setCurrentSlideIndex(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1);
        }
    };

    const handleExportPPTX = async () => {
        if (!presentation) return;

        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';
        pptx.title = presentation.topic;

        presentation.slides.forEach((slide, index) => {
            const pptSlide = pptx.addSlide();
            
            // Title
            pptSlide.addText(slide.title, { 
                x: 0.5, y: 0.5, w: '90%', h: 1, 
                fontSize: 32, bold: true, color: '363636', fontFace: 'Arial' 
            });

            // Content (Bullet points)
            const bulletText = slide.content.map(point => ({ 
                text: point, 
                options: { fontSize: 18, color: '505050', breakLine: true, bullet: true } 
            }));
            
            pptSlide.addText(bulletText, { 
                x: 0.5, y: 1.8, w: '50%', h: 4, 
                fontFace: 'Arial', lineSpacing: 30 
            });

            // Image
            const imgData = slideImages[index];
            if (imgData) {
                pptSlide.addImage({ data: imgData, x: 6, y: 1.8, w: 4, h: 3 });
            } else {
                 // Placeholder text if no image
                 pptSlide.addText("(Hely a képnek)", {
                     x: 6, y: 1.8, w: 4, h: 3,
                     fontSize: 14, color: 'CCCCCC', align: 'center',
                     shape: pptx.ShapeType.rect, fill: { color: 'F0F0F0' }
                 });
            }

            // Speaker Notes
            pptSlide.addNotes(slide.speakerNotes);
        });

        const safeFilename = presentation.topic.substring(0, 20).replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        pptx.writeFile({ fileName: `Prezentacio_${safeFilename}.pptx` });
    };

    return (
        <div className="h-full flex flex-col">
            {!presentation && (
                <div className="space-y-6 max-w-2xl mx-auto w-full mt-8">
                     <div className="bg-light p-6 rounded-lg border border-medium shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-accent/10 p-2 rounded-lg">
                                <FileText className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <h3 className="font-bold text-dark text-lg">Új Prezentáció Létrehozása</h3>
                                <p className="text-sm text-muted">Forrásanyagból professzionális diák, képekkel.</p>
                            </div>
                        </div>
                        
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Illessze be ide a szöveget, vázlatot vagy jegyzeteket..."
                            rows={8}
                            className="w-full bg-surface text-dark placeholder-muted rounded-md px-4 py-3 border border-medium focus:outline-none focus:ring-2 focus:ring-accent mb-4 resize-none"
                        />
                         <button
                            onClick={handleGenerate}
                            disabled={isLoading || !inputText.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-3 px-4 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Generálás folyamatban...</span>
                                </>
                            ) : (
                                <>
                                    <Wand2 size={20}/>
                                    <span>Prezentáció Generálása</span>
                                </>
                            )}
                        </button>
                    </div>
                    {error && <div className="text-red-500 text-center bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
                </div>
            )}

            {presentation && (
                <div className="flex flex-col h-full animate-fade-in space-y-4">
                    {/* Toolbar */}
                    <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-medium shadow-sm">
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => setPresentation(null)}
                                className="px-3 py-1.5 text-sm font-medium text-muted hover:text-dark hover:bg-light rounded-md transition-colors"
                            >
                                ← Vissza
                            </button>
                            <div className="h-6 w-px bg-medium mx-1"></div>
                            <h2 className="font-bold text-dark truncate max-w-md">{presentation.topic}</h2>
                        </div>
                        <button 
                            onClick={handleExportPPTX}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-md font-semibold transition-all shadow-sm hover:shadow"
                        >
                            <Download size={18} />
                            <span>Exportálás (.pptx)</span>
                        </button>
                    </div>

                    <div className="flex flex-grow gap-6 min-h-0">
                        {/* Left Sidebar: Slide Thumbnails */}
                        <div className="w-48 flex-shrink-0 flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-thin">
                            {presentation.slides.map((slide, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlideIndex(idx)}
                                    className={`flex flex-col gap-2 p-2 rounded-lg border-2 transition-all text-left group
                                        ${currentSlideIndex === idx 
                                            ? 'border-accent bg-accent/5 ring-2 ring-accent/20' 
                                            : 'border-transparent hover:bg-light hover:border-medium'}
                                    `}
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <span className={`text-xs font-bold ${currentSlideIndex === idx ? 'text-accent' : 'text-muted'}`}>
                                            {idx + 1}. Dia
                                        </span>
                                    </div>
                                    <div className="w-full aspect-video bg-white border border-medium rounded overflow-hidden relative">
                                         {/* Tiny preview simulation */}
                                         <div className="p-1">
                                             <div className="h-1 w-3/4 bg-gray-300 mb-1 rounded-full"></div>
                                             <div className="space-y-0.5">
                                                <div className="h-0.5 w-full bg-gray-100"></div>
                                                <div className="h-0.5 w-5/6 bg-gray-100"></div>
                                                <div className="h-0.5 w-4/6 bg-gray-100"></div>
                                             </div>
                                         </div>
                                         {slideImages[idx] && (
                                             <img src={slideImages[idx]} alt="" className="absolute bottom-1 right-1 w-1/3 h-1/3 object-cover rounded-sm border border-gray-200" />
                                         )}
                                    </div>
                                    <span className="text-xs font-medium truncate text-dark group-hover:text-accent transition-colors">
                                        {slide.title}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Center: Main Editor / Preview */}
                        <div className="flex-grow flex flex-col gap-4">
                            {/* Slide Preview Area */}
                            <div className="flex-grow bg-white border border-medium rounded-xl shadow-lg relative overflow-hidden flex flex-col">
                                <div className="absolute top-4 right-4 text-xs font-bold text-gray-300 select-none">
                                    ELŐNÉZET
                                </div>
                                
                                <div className="p-12 flex-grow flex flex-col">
                                    <h1 className="text-4xl font-bold text-gray-800 mb-8 leading-tight">
                                        {presentation.slides[currentSlideIndex].title}
                                    </h1>
                                    
                                    <div className="flex gap-8 items-start h-full">
                                        <div className="flex-1">
                                            <ul className="space-y-4">
                                                {presentation.slides[currentSlideIndex].content.map((point, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-xl text-gray-600">
                                                        <span className="w-2 h-2 mt-2.5 bg-accent rounded-full flex-shrink-0"></span>
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[200px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 relative group">
                                            {slideImages[currentSlideIndex] ? (
                                                <div className="relative w-full h-full">
                                                    <img 
                                                        src={slideImages[currentSlideIndex]} 
                                                        alt="Slide visual" 
                                                        className="w-full h-full object-contain rounded-md shadow-sm" 
                                                    />
                                                    <button 
                                                        onClick={() => handleGenerateImage(currentSlideIndex)}
                                                        className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow hover:bg-white text-dark opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Újra generálás"
                                                    >
                                                        <Wand2 size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <ImagePlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-sm text-gray-500 mb-4">Nincs kép generálva</p>
                                                    <button
                                                        onClick={() => handleGenerateImage(currentSlideIndex)}
                                                        disabled={isImageLoading}
                                                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors flex items-center gap-2 mx-auto border border-slate-700"
                                                    >
                                                        {isImageLoading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                                                        Generálás
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation Buttons (Inside Preview) */}
                                <div className="absolute inset-y-0 left-0 flex items-center">
                                    <button onClick={prevSlide} disabled={currentSlideIndex === 0} className="p-2 m-2 bg-black/5 hover:bg-black/10 rounded-full disabled:opacity-0 transition-opacity">
                                        <ChevronLeft size={24} className="text-gray-600" />
                                    </button>
                                </div>
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                     <button onClick={nextSlide} disabled={currentSlideIndex === presentation.slides.length - 1} className="p-2 m-2 bg-black/5 hover:bg-black/10 rounded-full disabled:opacity-0 transition-opacity">
                                        <ChevronRight size={24} className="text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Speaker Notes Panel */}
                            <div className="bg-surface border border-medium rounded-lg p-4 h-32 overflow-y-auto">
                                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Előadói Jegyzetek</h4>
                                <p className="text-dark text-sm leading-relaxed font-serif">
                                    {presentation.slides[currentSlideIndex].speakerNotes}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
