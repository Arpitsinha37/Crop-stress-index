import { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { motion } from 'framer-motion';

const Analytics = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(res.data);
            } catch (err) {
                console.error("Analytics Fetch Error", err);
            }
        };
        fetchHistory();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <header className="mb-10">
                <p className="text-nature-600 font-medium tracking-widest text-sm uppercase mb-1">Deep Dive</p>
                <h1 className="text-4xl font-serif font-bold text-classic-slate">Data Analytics</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Temperature Trend */}
                <div className="glass-panel p-8 rounded-3xl">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Temperature History (°C)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" hide />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Area type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={3} fill="url(#colorTemp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Humidity Trend */}
                <div className="glass-panel p-8 rounded-3xl">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Humidity History (%)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" hide />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Area type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={3} fill="url(#colorHum)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CSI vs Temp Correlation (Mock Vis) */}
                <div className="glass-panel p-8 rounded-3xl lg:col-span-2">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Composite Analysis (CSI vs Temp)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" hide />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Legend />
                                <Bar dataKey="csi" fill="#10b981" name="Stress Index" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="temperature" fill="#f97316" name="Temperature" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default Analytics;
