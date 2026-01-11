import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Thermometer, Droplets, Sun, Activity, Waves, ShieldAlert
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [resData, resHistory] = await Promise.all([
                axios.get('http://localhost:5000/api/dashboard', { headers }),
                axios.get('http://localhost:5000/api/history', { headers })
            ]);

            setData(resData.data);
            setHistory(resHistory.data);
        } catch (err) {
            console.error("Dashboard Error:", err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="flex justify-between items-end mb-10">
                <div>
                    <p className="text-nature-600 font-medium tracking-widest text-sm uppercase mb-1">Live Monitoring</p>
                    <h1 className="text-4xl lg:text-5xl font-serif font-bold text-classic-slate">Sector A-1</h1>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                    <span className="text-sm font-semibold text-slate-600">System Active</span>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-10">
                {/* CSI Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="xl:col-span-1 glass-panel p-8 rounded-3xl relative overflow-hidden group flex flex-col justify-between"
                >
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Crop Stress Index</h3>
                    <div className="flex flex-col items-center relative z-10">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                                    className={`${data?.csi < 40 ? 'text-emerald-500' : data?.csi < 70 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * (data?.csi || 0)) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-serif font-bold text-slate-800">{data?.csi?.toFixed(0) || 0}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Chart Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="xl:col-span-2 glass-panel p-8 rounded-3xl flex flex-col"
                >
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Trend Analysis</h3>
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorCsi" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontFamily: 'Inter' }} />
                                <Area type="monotone" dataKey="csi" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorCsi)" isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Primary Factor Card (Re-instated as separate card since Weather is gone) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="xl:col-span-1 bg-gradient-to-br from-classic-slate to-nature-900 p-8 rounded-3xl text-white flex flex-col justify-center items-center text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShieldAlert size={100} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Primary Factor</h3>
                        <ShieldAlert size={48} className="mx-auto mb-4 text-red-400" />
                        <span className="text-2xl font-serif font-bold leading-tight block">
                            {data?.primary_stress_factor || 'None'}
                        </span>
                        <p className="text-xs text-slate-500 mt-4 border-t border-white/10 pt-4">
                            Real-time analysis active
                        </p>
                    </div>
                </motion.div>
            </div>

            <h3 className="text-classic-slate text-2xl font-serif font-bold mb-6">Sensor Telemetry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SensorCard title="Temperature" value={data?.sensor_values?.temperature?.toFixed(1)} unit="°C" icon={<Thermometer strokeWidth={1.5} />} trend="Stable" color="orange" />
                <SensorCard title="Humidity" value={data?.sensor_values?.humidity?.toFixed(1)} unit="%" icon={<Droplets strokeWidth={1.5} />} trend="Rising" color="cyan" />
                <SensorCard title="Soil Moisture" value={data?.sensor_values?.soil_moisture} unit="" icon={<Waves strokeWidth={1.5} />} trend="Optimal" color="amber" />
                <SensorCard title="Light Intensity" value={data?.sensor_values?.light_intensity} unit="lx" icon={<Sun strokeWidth={1.5} />} trend="High" color="yellow" />
                <SensorCard title="Water Level" value={data?.sensor_values?.water_level?.toFixed(1)} unit="cm" icon={<Waves strokeWidth={1.5} />} trend="Normal" color="blue" />
                <SensorCard title="Security" value={data?.sensor_values?.intrusion_count > 0 ? "Breach" : "Secure"} unit="" icon={<ShieldAlert strokeWidth={1.5} />} trend={data?.sensor_values?.intrusion_count > 0 ? "Warning" : "Safe"} color={data?.sensor_values?.intrusion_count > 0 ? "red" : "emerald"} />
            </div>
        </motion.div>
    );
};

const colorStyles = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const SensorCard = ({ title, value, unit, icon, trend, color }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="glass-panel p-6 rounded-2xl hover:shadow-xl transition-all duration-300"
    >
        <div className="flex justify-between items-start">
            <div className={`p-3 rounded-lg border ${colorStyles[color] || 'bg-slate-50'}`}>
                {icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100 px-2 py-1 rounded-md bg-white">
                {trend}
            </span>
        </div>
        <div className="mt-5">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-serif font-bold text-slate-800 mt-1">
                {value ?? '--'} <span className="text-xs text-slate-400 font-sans font-normal ml-1">{unit}</span>
            </p>
        </div>
    </motion.div>
);

export default Dashboard;
