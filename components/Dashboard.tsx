
import React, { useState, useEffect, useRef } from 'react';
import { ClockWidget } from './widgets/ClockWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import { CalculatorWidget } from './widgets/CalculatorWidget';
import { CurrencyWidget } from './widgets/CurrencyWidget';
import { NotepadWidget } from './widgets/NotepadWidget';
import { ProgramCard } from './ProgramCard';
import { Modal } from './Modal';
import { PROGRAMS } from '../constants';
import type { Program } from '../types';
import { WidgetFrame } from './WidgetFrame';
import { Moon, Sun, Timer, Play, Pause, RotateCcw } from 'lucide-react';

interface DashboardProps {
    toggleTheme: () => void;
    isDarkMode: boolean;
}

// --- Internal Components for Header ---

const CompactClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="flex items-center gap-2 pl-2">
            <span className="font-mono text-xl font-bold text-accent tracking-widest">
                {time.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
        </div>
    );
};

const CompactTimer: React.FC = () => {
    const [secondsLeft, setSecondsLeft] = useState(300); // Default 5 mins
    const [isActive, setIsActive] = useState(false);
    const [inputMinutes, setInputMinutes] = useState('5');
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive && secondsLeft > 0) {
            intervalRef.current = window.setInterval(() => {
                setSecondsLeft((s) => s - 1);
            }, 1000);
        } else if (secondsLeft === 0) {
            setIsActive(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Optional: Play sound here
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, secondsLeft]);

    const toggleTimer = () => {
        if (!isActive && secondsLeft === 0) {
            // Reset if starting from 0
             setSecondsLeft(parseInt(inputMinutes) * 60 || 300);
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setSecondsLeft(parseInt(inputMinutes) * 60 || 300);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^\d*$/.test(val) && val.length <= 3) {
            setInputMinutes(val);
            setSecondsLeft((parseInt(val) || 0) * 60);
        }
    };

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 mr-3 bg-slate-900 rounded-md px-3 py-1.5 border border-slate-700 shadow-sm text-white">
            <Timer className="w-4 h-4 text-gray-400" />
            
            {isActive ? (
                <span className="font-mono font-semibold text-white w-12 text-center">{formatTime(secondsLeft)}</span>
            ) : (
                <div className="flex items-center">
                    <input 
                        type="text" 
                        value={inputMinutes} 
                        onChange={handleInputChange}
                        className="w-8 bg-transparent text-right font-mono font-semibold text-white focus:outline-none focus:border-b border-accent"
                    />
                    <span className="text-xs text-gray-400 ml-0.5">p</span>
                </div>
            )}

            <button onClick={toggleTimer} className="text-accent hover:text-white transition-colors ml-1">
                {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </button>
            <button onClick={resetTimer} className="text-gray-500 hover:text-white transition-colors">
                <RotateCcw size={14} />
            </button>
        </div>
    );
};


// --- Main Dashboard Component ---

export const Dashboard: React.FC<DashboardProps> = ({ toggleTheme, isDarkMode }) => {
    const [activeProgram, setActiveProgram] = useState<Program | null>(null);

    const openProgram = (program: Program) => {
        setActiveProgram(program);
    };

    const closeModal = () => {
        setActiveProgram(null);
    };

    const headerRightControls = (
        <div className="flex items-center">
            <CompactTimer />
            <div className="h-6 w-px bg-medium mr-3"></div>
            <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-full hover:bg-light transition-colors group mr-1"
                title={isDarkMode ? "Váltás világos módra" : "Váltás sötét módra"}
            >
                {isDarkMode ? (
                    <Sun className="w-5 h-5 text-accent group-hover:rotate-90 transition-transform duration-500" />
                ) : (
                    <Moon className="w-5 h-5 text-muted group-hover:text-accent group-hover:-rotate-12 transition-transform duration-300" />
                )}
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <WidgetFrame 
                title="Programkönyvtár" 
                leftControls={<CompactClock />}
                headerControls={headerRightControls}
            >
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {PROGRAMS.map((program) => (
                        <ProgramCard key={program.id} program={program} onClick={() => openProgram(program)} />
                    ))}
                </div>
            </WidgetFrame>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <ClockWidget />
                <NotepadWidget />
                <WeatherWidget />
                <CurrencyWidget />
                <CalculatorWidget />
                <CalendarWidget />
            </div>

            {activeProgram && (
                <Modal title={activeProgram.name} onClose={closeModal}>
                    <activeProgram.component />
                </Modal>
            )}
        </div>
    );
};
