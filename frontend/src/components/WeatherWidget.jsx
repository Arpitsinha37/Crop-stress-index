import { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudRain, Sun, Cloud, Wind, Droplets, MapPin, Loader2, ThermometerSun } from 'lucide-react';
import { motion } from 'framer-motion';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState('Local Field');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(fetchWeather, handleError);
        } else {
            setError("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    }, []);

    const handleError = (err) => {
        console.error(err);
        setError("Location permission denied. Showing default (New York).");
        // Fallback to a default location (e.g., New York)
        fetchWeather({ coords: { latitude: 40.7128, longitude: -74.0060 } });
    };

    const fetchWeather = async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            // Open-Meteo API (Free, No Key)
            // https://open-meteo.com/en/docs
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

            const res = await axios.get(url);
            setWeather(res.data);

            // Optional: Reverse Geocoding to get City Name (using a free API if reliable, or just coords)
            // For now, we'll stick to 'Your Location' or try a simple reverse geocoding if needed.
            // Let's try to get a better name if possible via Open-Meteo Geocoding API? No, keep it simple.

        } catch (err) {
            setError("Failed to fetch weather data.");
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIcon = (code) => {
        if (code <= 1) return <Sun className="text-yellow-500 w-8 h-8" />;
        if (code <= 3) return <Cloud className="text-gray-400 w-8 h-8" />;
        if (code <= 67) return <CloudRain className="text-blue-400 w-8 h-8" />;
        return <CloudRain className="text-indigo-600 w-8 h-8" />;
    };

    const getWeatherDesc = (code) => {
        if (code === 0) return "Clear Sky";
        if (code <= 3) return "Partly Cloudy";
        if (code <= 48) return "Foggy";
        if (code <= 67) return "Rainy";
        if (code <= 77) return "Snowy";
        return "Stormy";
    };

    if (loading) return (
        <div className="glass-panel p-6 rounded-3xl h-full flex items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mr-2" /> detecting location...
        </div>
    );

    const current = weather?.current;
    const daily = weather?.daily;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel p-6 rounded-3xl text-classic-slate h-full relative overflow-hidden"
        >
            {/* Background Decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                        <MapPin size={12} />
                        <span>Local Forecast</span>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-slate-800">
                        {current?.temperature_2m?.toFixed(1)}°C
                    </h3>
                    <p className="text-sm font-medium text-slate-500">
                        {getWeatherDesc(current?.weather_code)}
                    </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                    {getWeatherIcon(current?.weather_code)}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                <div className="bg-slate-50 p-2 rounded-lg">
                    <Droplets size={16} className="mx-auto text-cyan-500 mb-1" />
                    <span className="block text-xs text-slate-400 font-bold">HUMIDITY</span>
                    <span className="font-semibold text-slate-700">{current?.relative_humidity_2m}%</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                    <ThermometerSun size={16} className="mx-auto text-orange-500 mb-1" />
                    <span className="block text-xs text-slate-400 font-bold">UV INDEX</span>
                    <span className="font-semibold text-slate-700">{current?.uv_index?.toFixed(1)}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                    <Wind size={16} className="mx-auto text-gray-400 mb-1" />
                    <span className="block text-xs text-slate-400 font-bold">WIND</span>
                    <span className="font-semibold text-slate-700">{current?.wind_speed_10m} <span className="text-[9px]">km/h</span></span>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">3-Day Forecast</h4>
                {daily?.time?.slice(0, 3).map((date, i) => (
                    <div key={date} className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <div className="flex items-center gap-2">
                            {getWeatherIcon(daily.weather_code[i])}
                            <span className="font-bold text-slate-700">
                                {daily.temperature_2m_max[i].toFixed(0)}° / <span className="text-slate-400">{daily.temperature_2m_min[i].toFixed(0)}°</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
        </motion.div>
    );
};

export default WeatherWidget;
