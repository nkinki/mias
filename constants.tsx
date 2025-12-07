
import React from 'react';
import { Program } from './types';
import { 
    ScanText, FileText, FileSpreadsheet, Search, BookUp, Languages,
    Mail, MailCheck, Facebook, Twitter, Instagram, ImageUp, TrendingUp, HeartPulse, Palette, FileQuestion,
    AudioLines, ClipboardList, Video, Wand, Globe, ShieldCheck, MessageSquare, Volume2, Keyboard, Stethoscope, FileUser, UtensilsCrossed, TerminalSquare, Rocket, Swords, StickyNote, LayoutGrid, Scissors
} from 'lucide-react';
import { ImageToText } from './components/programs/ImageToText';
import { ImageToWord } from './components/programs/ImageToWord';
import { ImageToExcel } from './components/programs/ImageToExcel';
import { ImageAnalysis } from './components/programs/ImageAnalysis';
import { MockProgram } from './components/programs/MockProgram';
import { TextProcessor } from './components/programs/TextProcessor';
import { TextGenerator } from './components/programs/TextGenerator';
import { ImageToWebP } from './components/programs/ImageToWebP';
import { BiorhythmChart } from './components/programs/BiorhythmChart';
import { BmiAnalyzer } from './components/programs/BmiAnalyzer';
import { TextToImageGenerator } from './components/programs/TextToImageGenerator';
import { TextToVideoGenerator } from './components/programs/TextToVideoGenerator';
import { ImageEditor } from './components/programs/ImageEditor';
import { PdfQA } from './components/programs/PdfQA';
import { AudioTranscriber } from './components/programs/AudioTranscriber';
import { MeetingSummarizer } from './components/programs/MeetingSummarizer';
import { WebSummarizer } from './components/programs/WebSummarizer';
import { FactChecker } from './components/programs/FactChecker';
import { GeneralChat } from './components/programs/GeneralChat';
import { TextToSpeech } from './components/programs/TextToSpeech';
import { Dictation } from './components/programs/Dictation';
import { LabReportAnalyzer } from './components/programs/LabReportAnalyzer';
import { CvBuilder } from './components/programs/CvBuilder';
import { RecipeGenerator } from './components/programs/RecipeGenerator';
import { CodeDebugger } from './components/programs/CodeDebugger';
import { SlideDeckCreator } from './components/programs/SlideDeckCreator';
import { CryptoPostGenerator } from './components/programs/CryptoPostGenerator';
import { ChessAdGenerator } from './components/programs/ChessAdGenerator';
import { Notepad } from './components/programs/Notepad';
import { AiStudioApps } from './components/programs/AiStudioApps';
import { PdfSplitter } from './components/programs/PdfSplitter';


export const PROGRAMS: Program[] = [
    {
        id: 'notepad-app',
        name: 'Jegyzetfüzet',
        description: 'Gyors jegyzetek, linkek és ötletek mentése. Automatikusan szinkronizálódik a widgettel.',
        icon: StickyNote,
        component: Notepad,
    },
    {
        id: 'ai-studio-apps',
        name: 'AI Studio Alkalmazások',
        description: 'Mentse el és rendszerezze kedvenc AI Studio projektjeit és webalkalmazásait egy helyen.',
        icon: LayoutGrid,
        component: AiStudioApps,
    },
    {
        id: 'pdf-splitter',
        name: 'PDF Daraboló',
        description: 'Válasszon ki oldalakat egy PDF dokumentumból, és mentse el őket új fájlként.',
        icon: Scissors,
        component: PdfSplitter,
    },
    {
        id: 'chess-ad',
        name: 'FarChess Reklám Generátor',
        description: 'Profi, letisztult posztok generálása sakkversenyekről és frissítésekről semleges stílusban.',
        icon: Swords,
        component: ChessAdGenerator,
    },
    {
        id: 'crypto-post',
        name: 'Lambo Lotto Poszt',
        description: 'Generáljon hype posztokat a $CHESS és @base.base.eth tagekkel egy kattintással.',
        icon: Rocket,
        component: CryptoPostGenerator,
    },
    {
        id: 'general-chat',
        name: 'Általános Csevegő',
        description: 'Indítson egy általános célú beszélgetést az MI-vel bármilyen témában.',
        icon: MessageSquare,
        component: GeneralChat,
    },
    {
        id: 'slide-deck-creator',
        name: 'Prezentáció Készítő',
        description: 'Generáljon strukturált prezentáció vázlatokat képleírásokkal bármilyen témából.',
        icon: FileText,
        component: SlideDeckCreator,
    },
    {
        id: 'img-to-text',
        name: 'Szöveg Kinyerése Képből',
        description: 'Nyerjen ki és másoljon szöveget bármely feltöltött képfájlból optikai karakterfelismerés (OCR) segítségével.',
        icon: ScanText,
        component: ImageToText,
    },
    {
        id: 'img-to-word',
        name: 'Képből Word',
        description: 'Alakítsa át a képen látható szöveget egy letölthető Word dokumentummá.',
        icon: FileText,
        component: ImageToWord,
    },
    {
        id: 'img-to-excel',
        name: 'Képből Excel',
        description: 'Konvertálja a képen látható táblázatokat szerkeszthető Excel formátumba.',
        icon: FileSpreadsheet,
        component: ImageToExcel,
    },
    {
        id: 'img-analysis',
        name: 'Képelemzés',
        description: 'Elemezze a képek tartalmát, és tegyen fel konkrét kérdéseket a részletekről.',
        icon: Search,
        component: ImageAnalysis,
    },
    {
        id: 'cv-builder',
        name: 'Önéletrajz Varázsló',
        description: 'Generáljon professzionális önéletrajzot a megadott adatok, tapasztalatok és készségek alapján.',
        icon: FileUser,
        component: CvBuilder,
    },
    {
        id: 'code-debugger',
        name: 'Kód Generátor & Hibakereső',
        description: 'Generáljon kódrészleteket természetes nyelvi leírásból, vagy keressen hibákat meglévő kódban.',
        icon: TerminalSquare,
        component: CodeDebugger,
    },
    {
        id: 'recipe-generator',
        name: 'Ételrecept Generátor',
        description: 'Írja be a rendelkezésre álló alapanyagokat, és kapjon receptjavaslatokat az elkészítési útmutatóval együtt.',
        icon: UtensilsCrossed,
        component: RecipeGenerator,
    },
    {
        id: 'web-summarizer',
        name: 'Weboldal Összefoglaló',
        description: 'Készítsen összefoglalót egy weboldal tartalmáról a Google Keresés segítségével, forrásokkal együtt.',
        icon: Globe,
        component: WebSummarizer,
    },
    {
        id: 'fact-checker',
        name: 'Tényellenőrző',
        description: 'Ellenőrizze egy állítás valódiságát a Google Keresés által talált webes források alapján.',
        icon: ShieldCheck,
        component: FactChecker,
    },
    {
        id: 'pdf-qa',
        name: 'PDF Kérdés-Válasz',
        description: 'Töltsön fel egy PDF dokumentumot, és tegyen fel kérdéseket a tartalmával kapcsolatban.',
        icon: FileQuestion,
        component: PdfQA,
    },
    {
        id: 'audio-transcribe',
        name: 'Hangfelvétel Átirata',
        description: 'Töltsön fel egy audiofájlt (pl. interjú), és az MI elkészíti annak teljes szöveges átiratát.',
        icon: AudioLines,
        component: AudioTranscriber,
    },
     {
        id: 'text-to-speech',
        name: 'Szöveg Felolvasása',
        description: 'Generáljon hanganyagot magyar szövegből. Választhat női és férfi hang között, és letöltheti az eredményt.',
        icon: Volume2,
        component: TextToSpeech,
    },
    {
        id: 'dictation',
        name: 'Gépírónő',
        description: 'Alakítsa a mikrofonba mondott beszédet szöveggé valós időben. Ideális jegyzeteléshez vagy diktáláshoz.',
        icon: Keyboard,
        component: Dictation,
    },
    {
        id: 'meeting-summary',
        name: 'Meeting Összefoglaló',
        description: 'Készítsen rövid összefoglalót és teendőlistát egy megbeszélés szöveges átiratából.',
        icon: ClipboardList,
        component: MeetingSummarizer,
    },
    {
        id: 'img-to-webp',
        name: 'WebP Konverter',
        description: 'Konvertáljon képeket a modern WebP formátumra, vagy alakítsa vissza őket PNG/JPEG formátumba.',
        icon: ImageUp,
        component: ImageToWebP,
    },
    {
        id: 'text-to-image',
        name: 'Szövegből Kép',
        description: 'Hozzon létre egyedi képeket szöveges leírások alapján a legújabb képgeneráló MI segítségével.',
        icon: Palette,
        component: TextToImageGenerator,
    },
    {
        id: 'text-to-video',
        name: 'Szövegből Videó',
        description: 'Generáljon rövid videóklipeket szöveges leírás alapján a VEO modell segítségével.',
        icon: Video,
        component: TextToVideoGenerator,
    },
    {
        id: 'image-editor',
        name: 'MI Képszerkesztő',
        description: 'Szerkesszen képeket szöveges utasítások segítségével (pl. "adj hozzá egy kalapot").',
        icon: Wand,
        component: ImageEditor,
    },
    {
        id: 'biorhythm-chart',
        name: 'Bioritmus Grafikon',
        description: 'Generáljon személyes fizikai, érzelmi és intellektuális ciklusgrafikont a születési dátuma alapján.',
        icon: TrendingUp,
        component: BiorhythmChart,
    },
    {
        id: 'bmi-analyzer',
        name: 'BMI Kalkulátor',
        description: 'Számítsa ki testtömegindexét (BMI) magasság, súly, életkor és nem alapján, és kapjon részletes elemzést.',
        icon: HeartPulse,
        component: BmiAnalyzer,
    },
    {
        id: 'lab-report-analyzer',
        name: 'Laborlelet Kiértékelő',
        description: 'Töltsd fel a laborleleted, és kapj egy közérthető elemzést az eredményeidről és javaslatokat.',
        icon: Stethoscope,
        component: LabReportAnalyzer,
    },
    {
        id: 'translate-hu',
        name: 'Fordítás magyarra',
        description: 'Fordítson le szöveges dokumentumokat magyar nyelvre.',
        icon: Languages,
        component: () => <TextProcessor mode="translate-hu" />,
    },
    {
        id: 'translate-en',
        name: 'Fordítás angolra',
        description: 'Fordítson le szöveges dokumentumokat angol nyelvre.',
        icon: Languages,
        component: () => <TextProcessor mode="translate-en" />,
    },
    {
        id: 'summarize',
        name: 'Összefoglaló Készítése',
        description: 'Készítsen rövid, tömör összefoglalót hosszabb dokumentumok tartalmáról.',
        icon: BookUp,
        component: () => <TextProcessor mode="summarize" />,
    },
    {
        id: 'email-writer',
        name: 'E-mail Író',
        description: 'Generáljon professzionális e-maileket néhány kulcsszó vagy utasítás alapján.',
        icon: Mail,
        component: () => <TextGenerator mode="email-writer" />,
    },
    {
        id: 'email-rewriter',
        name: 'E-mail Átíró',
        description: 'Írja át a meglévő e-maileket különböző stílusokban: professzionális, barátságos, stb.',
        icon: MailCheck,
        component: () => <TextGenerator mode="email-rewriter" />,
    },
    {
        id: 'facebook-ad',
        name: 'Facebook Hirdetés',
        description: 'Generáljon figyelemfelkeltő hirdetési szövegeket Facebookra termékekhez vagy szolgáltatásokhoz.',
        icon: Facebook,
        component: () => <TextGenerator mode="facebook-ad" />,
    },
    {
        id: 'twitter-ad',
        name: 'Twitter Poszt',
        description: 'Készítsen rövid, hatásos Twitter posztokat, a karakterkorlátot figyelembe véve.',
        icon: Twitter,
        component: () => <TextGenerator mode="twitter-ad" />,
    },
    {
        id: 'instagram-ad',
        name: 'Instagram Poszt',
        description: 'Írjon vonzó leírásokat és hashtageket Instagram posztokhoz.',
        icon: Instagram,
        component: () => <TextGenerator mode="instagram-ad" />,
    },
];