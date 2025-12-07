import React, { useState, useEffect } from 'react';
import { WidgetFrame } from '../WidgetFrame';

export const ClockWidget: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const formattedTime = time.toLocaleTimeString('hu-HU', {
        timeZone: 'Europe/Budapest',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const formattedDate = time.toLocaleDateString('hu-HU', {
        timeZone: 'Europe/Budapest',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <WidgetFrame title="Helyi Idő">
            <div className="text-center">
                <p className="text-3xl font-bold text-dark tracking-widest">{formattedTime}</p>
                <p className="text-sm text-muted">{formattedDate}</p>
            </div>
        </WidgetFrame>
    );
};