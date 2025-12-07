import React, { useState, useEffect } from 'react';
import { WidgetFrame } from '../WidgetFrame';

const HISTORY_LENGTH = 20; // A megjelenítendő adatpontok száma
const CHART_HEIGHT = 20; // Kisebb magasság a kompaktabb nézetért

const generatePath = (data: number[], width: number, height: number): string => {
    if (data.length < 1) return `M0,${height}`;
    // Biztosítjuk, hogy elegendő pontunk legyen a teljes szélességű vonal kirajzolásához
    const displayData = [...Array(Math.max(0, HISTORY_LENGTH - data.length)).fill(data[0] || 0), ...data];

    const points = displayData.map((point, index) => {
        const x = (index / (HISTORY_LENGTH - 1)) * width;
        const y = height - (point / 100) * height; // Az Y koordináta invertálása, mert az SVG-ben a 0 a teteje
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return `M ${points.join(' L ')}`;
};

const LineChart: React.FC<{ label: string; data: number[] }> = ({ label, data }) => {
    const currentValue = data[data.length - 1] || 0;
    const colorClass = currentValue > 85 ? 'text-red-500' : currentValue > 65 ? 'text-yellow-500' : 'text-accent';
    const path = generatePath(data, 100, CHART_HEIGHT);
    const gradientId = `gradient-${label.replace(/\s+/g, '')}`;

    return (
        <div className="w-full">
            <div className="flex justify-between items-baseline mb-1 text-sm">
                <span className="text-muted">{label}</span>
                <span className="font-bold text-dark">{currentValue}%</span>
            </div>
            <svg viewBox={`0 0 100 ${CHART_HEIGHT}`} className="w-full h-auto" preserveAspectRatio="none" aria-hidden="true">
                 <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" className={`${colorClass}`} stopOpacity="0.3" />
                        <stop offset="100%" className={`${colorClass}`} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d={path + ` L 100,${CHART_HEIGHT} L 0,${CHART_HEIGHT} Z`}
                    fill={`url(#${gradientId})`}
                    stroke="none"
                />
                <path
                    d={path}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`${colorClass} transition-colors duration-300`}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};


export const SystemMonitorWidget: React.FC = () => {
    const [cpuHistory, setCpuHistory] = useState<number[]>([25]);
    const [ramHistory, setRamHistory] = useState<number[]>([60]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCpuHistory(prev => {
                const latest = prev[prev.length - 1] || 25;
                const newValue = Math.round(Math.max(10, Math.min(90, latest + (Math.random() - 0.5) * 10)));
                return [...prev.slice(-(HISTORY_LENGTH - 1)), newValue];
            });
            setRamHistory(prev => {
                const latest = prev[prev.length - 1] || 60;
                const newValue = Math.round(Math.max(30, Math.min(95, latest + (Math.random() - 0.5) * 5)));
                return [...prev.slice(-(HISTORY_LENGTH - 1)), newValue];
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetFrame title="Rendszerfigyelő">
            <div className="w-full space-y-2 px-2">
                <LineChart label="CPU Terhelés" data={cpuHistory} />
                <LineChart label="RAM Használat" data={ramHistory} />
            </div>
        </WidgetFrame>
    );
};