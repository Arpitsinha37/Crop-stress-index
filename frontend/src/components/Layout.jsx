import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Activity, Sun, LogOut, Sprout } from 'lucide-react';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group ${isActive
                        ? 'bg-white/10 text-white shadow-inner border border-white/5'
                        : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                    }`}
            >
                <Icon size={20} className={isActive ? 'text-classic-gold' : 'group-hover:text-emerald-200'} />
                <span className="font-medium hidden lg:block tracking-wide">{label}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-classic-cream flex font-sans">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-nature-900 text-white flex flex-col z-50 shadow-2xl">
                <div className="p-8 flex items-center gap-3 border-b border-nature-800">
                    <Sprout className="text-classic-gold w-8 h-8" />
                    <span className="text-2xl font-serif font-bold tracking-wider hidden lg:block text-white">AgriSense</span>
                </div>

                <nav className="flex-1 p-6 space-y-4">
                    <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" />
                    <NavItem to="/analytics" icon={Activity} label="Analytics" />
                    <NavItem to="/forecasting" icon={Sun} label="Forecasting" />
                </nav>

                <div className="p-6 border-t border-nature-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-4 text-red-300 hover:bg-red-500/10 rounded-xl transition group"
                    >
                        <LogOut size={20} className="group-hover:text-red-400" />
                        <span className="font-medium hidden lg:block group-hover:text-red-400">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-20 lg:ml-64 p-8 lg:p-12 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
