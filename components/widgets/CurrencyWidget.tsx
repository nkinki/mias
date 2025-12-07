import React, { useState, useEffect } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Rates {
    HUF?: number;
    USD?: number;
    CHF?: number;
    GBP?: number;
}

export const CurrencyWidget: React.FC = () => {
    const [rates, setRates] = useState<Rates>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('https://open.er-api.com/v6/latest/EUR');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setRates({
                HUF: data.rates.HUF,
                USD: data.rates.USD,
                CHF: data.rates.CHF,
                GBP: data.rates.GBP
            });
        } catch (e) {
            setError('Hiba az árfolyamok lekérésekor');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
        const interval = setInterval(fetchRates, 3600000); // Fetch every hour
        return () => clearInterval(interval);
    }, []);

    const hufPerEur = rates.HUF?.toFixed(2);
    const hufPerUsd = rates.HUF && rates.USD ? (rates.HUF / rates.USD).toFixed(2) : '...';
    const hufPerChf = rates.HUF && rates.CHF ? (rates.HUF / rates.CHF).toFixed(2) : '...';
    const hufPerGbp = rates.HUF && rates.GBP ? (rates.HUF / rates.GBP).toFixed(2) : '...';

    const renderContent = () => {
        if (loading) return <p className="text-muted">Adatok lekérése...</p>;
        if (error) return <p className="text-red-500">{error}</p>;
        return (
            <div className="text-left w-full space-y-1">
                <div className="flex justify-between items-baseline w-full px-2">
                    <span className="font-semibold text-muted">EUR/HUF:</span>
                    <span className="text-dark text-base font-bold">{hufPerEur}</span>
                </div>
                <div className="flex justify-between items-baseline w-full px-2">
                    <span className="font-semibold text-muted">USD/HUF:</span>
                    <span className="text-dark text-base font-bold">{hufPerUsd}</span>
                </div>
                <div className="flex justify-between items-baseline w-full px-2">
                    <span className="font-semibold text-muted">CHF/HUF:</span>
                    <span className="text-dark text-base font-bold">{hufPerChf}</span>
                </div>
                <div className="flex justify-between items-baseline w-full px-2">
                    <span className="font-semibold text-muted">GBP/HUF:</span>
                    <span className="text-dark text-base font-bold">{hufPerGbp}</span>
                </div>
            </div>
        );
    };

    return (
        <WidgetFrame title="Valutaárfolyamok">
            {renderContent()}
        </WidgetFrame>
    );
};