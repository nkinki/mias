import React, { useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarWidget: React.FC = () => {
    const [date, setDate] = useState(new Date());

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const month = date.getMonth();
    const year = date.getFullYear();

    const monthName = date.toLocaleDateString('hu-HU', { month: 'long' });
    const yearNum = date.getFullYear();

    const daysCount = daysInMonth(month, year);
    const firstDay = (firstDayOfMonth(month, year) + 6) % 7; // Monday is 0

    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysCount }, (_, i) => i + 1);

    const today = new Date();
    const isToday = (day: number) => 
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const changeMonth = (delta: number) => {
        setDate(currentDate => {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() + delta);
            return newDate;
        });
    };

    return (
        <WidgetFrame title="Naptár">
            <div className="w-full">
                <div className="flex justify-between items-center mb-2 px-2">
                    <button onClick={() => changeMonth(-1)} className="text-muted hover:text-dark"><ChevronLeft size={20} /></button>
                    <div className="font-bold text-dark text-center">{monthName} {yearNum}</div>
                    <button onClick={() => changeMonth(1)} className="text-muted hover:text-dark"><ChevronRight size={20} /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'].map(day => (
                        <div key={day} className="font-bold text-muted">{day}</div>
                    ))}
                    {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                    {days.map(day => (
                        <div key={day} className={`
                            flex items-center justify-center w-6 h-6 rounded-full
                            ${isToday(day) ? 'bg-accent text-white' : 'text-dark'}
                        `}>
                            {day}
                        </div>
                    ))}
                </div>
            </div>
        </WidgetFrame>
    );
};