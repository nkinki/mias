import React, { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

// Biorhythm cycle lengths in days
const PHYSICAL_CYCLE = 23;
const EMOTIONAL_CYCLE = 28;
const INTELLECTUAL_CYCLE = 33;
const CHART_DAYS = 31; // Show a month-long view, centered on today

interface BiorhythmDataPoint {
    date: Date;
    physical: number;
    emotional: number;
    intellectual: number;
}

// Function to calculate the number of days between two dates
const daysBetween = (date1: Date, date2: Date): number => {
    return (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
};

// Function to calculate the biorhythm value for a given number of days
const calculateBiorhythm = (days: number, cycle: number): number => {
    return Math.sin((2 * Math.PI * days) / cycle) * 100;
};


export const BiorhythmChart: React.FC = () => {
    const [birthDate, setBirthDate] = useState('');
    const [chartData, setChartData] = useState<BiorhythmDataPoint[]>([]);
    const [error, setError] = useState('');

    const handleGenerateChart = () => {
        if (!birthDate) {
            setError('Kérjük, adja meg a születési dátumát.');
            setChartData([]);
            return;
        }

        const birthDateObj = new Date(birthDate);
        const today = new Date();
        
        // Reset time part to avoid timezone issues
        birthDateObj.setUTCHours(0, 0, 0, 0);
        today.setUTCHours(0, 0, 0, 0);

        if (birthDateObj > today) {
            setError('A születési dátum nem lehet a jövőben.');
            setChartData([]);
            return;
        }

        setError('');
        const data: BiorhythmDataPoint[] = [];
        const middleIndex = Math.floor(CHART_DAYS / 2);

        for (let i = 0; i < CHART_DAYS; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i - middleIndex);
            
            const daysLived = daysBetween(birthDateObj, date);

            data.push({
                date,
                physical: calculateBiorhythm(daysLived, PHYSICAL_CYCLE),
                emotional: calculateBiorhythm(daysLived, EMOTIONAL_CYCLE),
                intellectual: calculateBiorhythm(daysLived, INTELLECTUAL_CYCLE),
            });
        }
        setChartData(data);
    };

    const SVG_WIDTH = 800;
    const SVG_HEIGHT = 400;
    const PADDING = 40;

    const chartPaths = useMemo(() => {
        if (chartData.length === 0) return { physical: '', emotional: '', intellectual: '' };

        const toSvgPoint = (dayIndex: number, value: number): [number, number] => {
            const x = PADDING + (dayIndex / (CHART_DAYS - 1)) * (SVG_WIDTH - 2 * PADDING);
            const y = (SVG_HEIGHT / 2) - (value / 100) * (SVG_HEIGHT / 2 - PADDING);
            return [x, y];
        };
        
        const createPath = (key: keyof Omit<BiorhythmDataPoint, 'date'>) => {
             return chartData
                .map((point, i) => toSvgPoint(i, point[key]))
                .map((p, i) => (i === 0 ? 'M' : 'L') + `${p[0]},${p[1]}`)
                .join(' ');
        };

        return {
            physical: createPath('physical'),
            emotional: createPath('emotional'),
            intellectual: createPath('intellectual'),
        };
    }, [chartData]);
    
    const todayIndex = Math.floor(CHART_DAYS / 2);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-light border border-medium rounded-lg">
                <label htmlFor="birthdate" className="font-semibold text-dark flex-shrink-0">Születési Dátum:</label>
                <input
                    id="birthdate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="bg-surface text-dark rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent flex-grow w-full sm:w-auto"
                    max={new Date().toISOString().split('T')[0]} // Cannot select future date
                />
                <button
                    onClick={handleGenerateChart}
                    disabled={!birthDate}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <TrendingUp size={20}/>
                    <span>Grafikon Létrehozása</span>
                </button>
            </div>

            {error && <div className="text-red-500 text-center" role="alert">{error}</div>}

            {chartData.length > 0 && (
                <div className="bg-surface p-4 rounded-lg border border-medium">
                    <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto" aria-labelledby="chart-title">
                        <title id="chart-title">Bioritmus grafikon</title>
                        {/* Y-axis labels and lines */}
                        <text x="10" y={PADDING} fill="#6b7280" fontSize="12">+100%</text>
                        <line x1={PADDING} y1={PADDING} x2={SVG_WIDTH - PADDING} y2={PADDING} stroke="#e2e8f0" strokeDasharray="4"/>
                        
                        <text x="10" y={SVG_HEIGHT / 2 + 4} fill="#6b7280" fontSize="12">0%</text>
                        <line x1={PADDING} y1={SVG_HEIGHT / 2} x2={SVG_WIDTH - PADDING} y2={SVG_HEIGHT / 2} stroke="#d1d5db" />
                        
                        <text x="10" y={SVG_HEIGHT - PADDING + 4} fill="#6b7280" fontSize="12">-100%</text>
                        <line x1={PADDING} y1={SVG_HEIGHT - PADDING} x2={SVG_WIDTH - PADDING} y2={SVG_HEIGHT - PADDING} stroke="#e2e8f0" strokeDasharray="4"/>
                        
                        {/* Today line */}
                        <line 
                            x1={PADDING + (todayIndex / (CHART_DAYS - 1)) * (SVG_WIDTH - 2 * PADDING)}
                            y1={PADDING - 10}
                            x2={PADDING + (todayIndex / (CHART_DAYS - 1)) * (SVG_WIDTH - 2 * PADDING)}
                            y2={SVG_HEIGHT - PADDING + 10}
                            stroke="#2563eb"
                            strokeWidth="2"
                        />
                        <text 
                            x={PADDING + (todayIndex / (CHART_DAYS - 1)) * (SVG_WIDTH - 2 * PADDING)}
                            y={PADDING - 15}
                            fill="#2563eb"
                            textAnchor="middle"
                            fontSize="12"
                            fontWeight="bold"
                        >
                            Ma
                        </text>
                        
                        {/* X-axis labels */}
                         {chartData.map((d, i) => {
                            if (i % 7 === 0 || i === chartData.length-1) { // Label every week
                                return (
                                    <text 
                                        key={i}
                                        x={PADDING + (i / (CHART_DAYS - 1)) * (SVG_WIDTH - 2 * PADDING)}
                                        y={SVG_HEIGHT - PADDING + 25}
                                        fill="#6b7280"
                                        textAnchor="middle"
                                        fontSize="12"
                                    >
                                        {d.date.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                                    </text>
                                )
                            }
                            return null;
                         })}
                        
                        {/* Biorhythm paths */}
                        <path d={chartPaths.physical} fill="none" stroke="#ef4444" strokeWidth="3" />
                        <path d={chartPaths.emotional} fill="none" stroke="#3b82f6" strokeWidth="3" />
                        <path d={chartPaths.intellectual} fill="none" stroke="#22c55e" strokeWidth="3" />
                    </svg>
                     <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-1 bg-[#ef4444] rounded-full"></div>
                            <span className="text-sm text-dark">Fizikai (23 nap)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-1 bg-[#3b82f6] rounded-full"></div>
                            <span className="text-sm text-dark">Érzelmi (28 nap)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-1 bg-[#22c55e] rounded-full"></div>
                            <span className="text-sm text-dark">Intellektuális (33 nap)</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};