import React, { useState, useEffect } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { Sun, Cloud, Zap, CloudRain, Snowflake, CloudFog, Sunrise, Sunset } from 'lucide-react';

interface WeatherData {
    city: string;
    temp: number;
    description: string;
    icon: React.ReactNode;
    sunrise: string;
    sunset: string;
}

const getWeatherDescription = (code: number): string => {
    const descriptions: { [key: number]: string } = {
        0: 'Tiszta égbolt', 1: 'Nagyrészt tiszta', 2: 'Részben felhős', 3: 'Borult',
        45: 'Köd', 48: 'Dérlerakódásos köd',
        51: 'Enyhe szitálás', 53: 'Mérsékelt szitálás', 55: 'Sűrű szitálás',
        56: 'Enyhe ónos szitálás', 57: 'Sűrű ónos szitálás',
        61: 'Enyhe eső', 63: 'Mérsékelt eső', 65: 'Erős eső',
        66: 'Enyhe ónos eső', 67: 'Erős ónos eső',
        71: 'Enyhe havazás', 73: 'Mérsékelt havazás', 75: 'Erős havazás',
        77: 'Jégszemcse',
        80: 'Enyhe zápor', 81: 'Mérsékelt zápor', 82: 'Heves zápor',
        85: 'Enyhe hózápor', 86: 'Heves hózápor',
        95: 'Zivatar', 96: 'Zivatar enyhe jégesővel', 99: 'Zivatar heves jégesővel',
    };
    return descriptions[code] || 'Ismeretlen';
};

const getWeatherIcon = (code: number): React.ReactNode => {
    const iconProps = { className: "w-12 h-12 text-dark" };
    if (code <= 1) return <Sun {...iconProps} />;
    if (code >= 2 && code <= 3) return <Cloud {...iconProps} />;
    if (code === 45 || code === 48) return <CloudFog {...iconProps} />;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain {...iconProps} />;
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <Snowflake {...iconProps} />;
    if (code >= 95 && code <= 99) return <Zap {...iconProps} />;
    return <Cloud {...iconProps} />; // Alapértelmezett
};


export const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = async () => {
        setError(null);
        try {
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=47.50&longitude=19.04&current_weather=true&daily=sunrise,sunset&timezone=Europe/Budapest');
            if (!response.ok) {
                throw new Error('Az időjárási adatok lekérése sikertelen.');
            }
            const data = await response.json();
            
            const formatTime = (isoString: string) => {
                return new Date(isoString).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
            };

            const weatherData: WeatherData = {
                city: 'Budapest',
                temp: Math.round(data.current_weather.temperature),
                description: getWeatherDescription(data.current_weather.weathercode),
                icon: getWeatherIcon(data.current_weather.weathercode),
                sunrise: formatTime(data.daily.sunrise[0]),
                sunset: formatTime(data.daily.sunset[0]),
            };
            setWeather(weatherData);
        } catch (e) {
            setError('Hiba a frissítéskor.');
            console.error(e);
        } finally {
            if (loading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchWeather();
        const interval = setInterval(fetchWeather, 30 * 60 * 1000); // 30 perc
        return () => clearInterval(interval);
    }, []);


    const renderContent = () => {
        if (loading) return <p className="text-muted">Adatok lekérése...</p>;
        if (error && !weather) return <p className="text-red-500">{error}</p>;
        if (weather) {
            return (
                <div className="text-center w-full">
                    {weather.icon}
                    <p className="text-2xl font-bold mt-2">{weather.temp}°C</p>
                    <p className="text-sm text-muted">{weather.description}</p>
                    
                    <div className="w-full mt-3 pt-3 border-t border-medium text-xs text-dark">
                        <div className="flex justify-around items-center">
                            <div className="flex items-center gap-1.5" title="Napkelte">
                                <Sunrise className="w-4 h-4 text-muted" />
                                <span>{weather.sunrise}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Napnyugta">
                                <Sunset className="w-4 h-4 text-muted" />
                                <span>{weather.sunset}</span>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <WidgetFrame title="Időjárás">
            {renderContent()}
        </WidgetFrame>
    );
};