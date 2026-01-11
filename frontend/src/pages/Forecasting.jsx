import WeatherWidget from '../components/WeatherWidget';
import { motion } from 'framer-motion';

const Forecasting = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <header className="mb-10">
                <p className="text-nature-600 font-medium tracking-widest text-sm uppercase mb-1">Environmental Intelligence</p>
                <h1 className="text-4xl font-serif font-bold text-classic-slate">Weather Forecast</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-[500px]">
                    <WeatherWidget />
                </div>

                {/* Placeholder for future advanced weather data */}
                <div className="glass-panel p-8 rounded-3xl flex flex-col justify-center items-center text-center">
                    <div className="p-6 bg-slate-50 rounded-full mb-6">
                        <img src="https://cdn-icons-png.flaticon.com/512/1163/1163661.png" alt="Map" className="w-16 h-16 opacity-50 opacity-graysale" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-slate-700 mb-2">Regional Radar</h3>
                    <p className="text-slate-500 max-w-xs">
                        Doppler radar integration and precipitation mapping coming in the next update.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Forecasting;
