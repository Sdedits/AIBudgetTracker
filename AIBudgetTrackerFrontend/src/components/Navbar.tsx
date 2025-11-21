import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
    Wallet, User, LogOut, Home, TrendingUp, PieChart, 
    Download, MessageCircle, PiggyBank, BarChart3 
} from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const [role, setRole] = React.useState<string | null>(null);
    const location = useLocation(); // 1. Get current route location

    const brandLink = isAuthenticated ? '/dashboard' : '/';

    React.useEffect(() => {
        if (!isAuthenticated) {
            setRole(null);
            return;
        }
        // fetch profile to obtain role
        import('../services/api').then(mod => {
            const token = localStorage.getItem('token') || '';
            mod.getProfile(token).then(res => setRole(res.data?.role)).catch(() => setRole(null));
        });
    }, [isAuthenticated]);

    // 2. Helper to generate class names based on active state
    const getLinkClass = (path: string) => {
        const isActive = location.pathname === path;
        return `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            isActive 
                ? 'bg-blue-50 text-blue-600' // Active State
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600' // Inactive State
        }`;
    };

    // Special helper for Owner link to maintain yellow theme
    const getOwnerLinkClass = (path: string) => {
        const isActive = location.pathname === path;
        return `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            isActive 
                ? 'bg-yellow-50 text-yellow-600' 
                : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'
        }`;
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="w-full px-0">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to={brandLink} className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            <Wallet className="text-blue-600" size={32} />
                            Budget Tracker
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            (role === 'ADMIN' || role === 'OWNER') ? (
                                <>
                                    {role === 'OWNER' && (
                                        <Link to="/admin" className={getOwnerLinkClass('/admin')}>
                                            <TrendingUp size={20} />
                                            <span className="font-medium">Owner</span>
                                        </Link>
                                    )}
                                    <Link to="/admin" className={getLinkClass('/admin')}>
                                        <TrendingUp size={20} />
                                        <span className="font-medium">Admin</span>
                                    </Link>
                                    <Link to="/forum" className={getLinkClass('/forum')}>
                                        <MessageCircle size={20} />
                                        <span className="font-medium">Forum</span>
                                    </Link>
                                    <Link to="/export" className={getLinkClass('/export')}>
                                        <Download size={20} />
                                        <span className="font-medium">Export</span>
                                    </Link>
                                    <Link to="/profile" className={getLinkClass('/profile')}>
                                        <User size={20} />
                                        <span className="font-medium">Profile</span>
                                    </Link>
                                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium">
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                                        <Home size={20} />
                                        <span className="font-medium">Dashboard</span>
                                    </Link>
                                    <Link to="/transactions" className={getLinkClass('/transactions')}>
                                        <TrendingUp size={20} />
                                        <span className="font-medium">Transactions</span>
                                    </Link>
                                    {/* --- NEW ANALYTICS LINK --- */}
                                    <Link to="/analytics" className={getLinkClass('/analytics')}>
                                        <BarChart3 size={20} />
                                        <span className="font-medium">Analytics</span>
                                    </Link>
                                    <Link to="/budget" className={getLinkClass('/budget')}>
                                        <PieChart size={20} />
                                        <span className="font-medium">Budget</span>
                                    </Link>
                                    <Link to="/savings" className={getLinkClass('/savings')}>
                                        <PiggyBank size={20} />
                                        <span className="font-medium">Savings</span>
                                    </Link>
                                    <Link to="/export" className={getLinkClass('/export')}>
                                        <Download size={20} />
                                        <span className="font-medium">Export</span>
                                    </Link>
                                    <Link to="/forum" className={getLinkClass('/forum')}>
                                        <MessageCircle size={20} />
                                        <span className="font-medium">Forum</span>
                                    </Link>
                                    <Link to="/profile" className={getLinkClass('/profile')}>
                                        <User size={20} />
                                        <span className="font-medium">Profile</span>
                                    </Link>
                                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium">
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </>
                            )
                        ) : (
                            <>
                                <Link to="/login" className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                    Login
                                </Link>
                                <Link to="/signup" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;









//for navbar to be on Left side vertical

// import React, { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
// import { 
//     Wallet, User, LogOut, Home, TrendingUp, PieChart, 
//     Download, MessageCircle, PiggyBank, BarChart3, Menu, X 
// } from 'lucide-react';

// const Navbar = () => {
//     const { isAuthenticated, logout } = useAuth();
//     const [role, setRole] = React.useState<string | null>(null);
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//     const location = useLocation();

//     const brandLink = isAuthenticated ? '/dashboard' : '/';

//     React.useEffect(() => {
//         if (!isAuthenticated) {
//             setRole(null);
//             return;
//         }
//         import('../services/api').then(mod => {
//             const token = localStorage.getItem('token') || '';
//             mod.getProfile(token).then(res => setRole(res.data?.role)).catch(() => setRole(null));
//         });
//     }, [isAuthenticated]);

//     // Helper: Active Link Style (Vertical)
//     const getLinkClass = (path: string) => {
//         const isActive = location.pathname === path;
//         return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
//             isActive 
//                 ? 'bg-blue-50 text-blue-600 shadow-sm' 
//                 : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
//         }`;
//     };

//     // Helper: Owner Link Style
//     const getOwnerLinkClass = (path: string) => {
//         const isActive = location.pathname === path;
//         return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
//             isActive 
//                 ? 'bg-yellow-50 text-yellow-600 shadow-sm' 
//                 : 'text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
//         }`;
//     };

//     return (
//         <>
//             {/* --- Mobile Header (Visible on small screens) --- */}
//             <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 shadow-sm">
//                 <Link to={brandLink} className="flex items-center gap-2 text-xl font-bold text-gray-800">
//                     <div className="bg-blue-600 p-1.5 rounded-lg text-white">
//                         <Wallet size={20} />
//                     </div>
//                     Budget Tracker
//                 </Link>
//                 <button 
//                     onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                     className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
//                 >
//                     {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//                 </button>
//             </div>

//             {/* --- Sidebar Navigation --- */}
//             <nav className={`
//                 fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex flex-col transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
//                 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
//             `}>
//                 {/* Logo Area (Desktop) */}
//                 <div className="h-20 flex items-center px-6 border-b border-gray-100">
//                     <Link to={brandLink} className="flex items-center gap-3 text-xl font-bold text-gray-900">
//                         <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md">
//                             <Wallet size={24} />
//                         </div>
//                         <span>BudgetWise</span>
//                     </Link>
//                 </div>

//                 {/* Navigation Links */}
//                 <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
//                     {isAuthenticated ? (
//                         (role === 'ADMIN' || role === 'OWNER') ? (
//                             <>
//                                 <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Management</div>
//                                 {role === 'OWNER' && (
//                                     <Link to="/admin" className={getOwnerLinkClass('/admin')} onClick={() => setIsMobileMenuOpen(false)}>
//                                         <TrendingUp size={20} />
//                                         <span>Owner Panel</span>
//                                     </Link>
//                                 )}
//                                 <Link to="/admin" className={getLinkClass('/admin')} onClick={() => setIsMobileMenuOpen(false)}>
//                                     <TrendingUp size={20} />
//                                     <span>Admin Panel</span>
//                                 </Link>
                                
//                                 <div className="mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Menu</div>
//                                 <Link to="/forum" className={getLinkClass('/forum')} onClick={() => setIsMobileMenuOpen(false)}>
//                                     <MessageCircle size={20} />
//                                     <span>Forum</span>
//                                 </Link>
//                                 <Link to="/export" className={getLinkClass('/export')} onClick={() => setIsMobileMenuOpen(false)}>
//                                     <Download size={20} />
//                                     <span>Export Data</span>
//                                 </Link>
//                                 <Link to="/profile" className={getLinkClass('/profile')} onClick={() => setIsMobileMenuOpen(false)}>
//                                     <User size={20} />
//                                     <span>Profile</span>
//                                 </Link>
//                             </>
//                         ) : (
//                             <>
//                                 <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Overview</div>
//                                 <Link to="/dashboard" className={getLinkClass('/dashboard')} onClick={() => setIsMobileMenuOpen(false)}>
//                                     <Home size={20} />
//                                     <span>Dashboard</span>
//                                 </Link>
//                                 <Link to="/analytics" className={getLinkClass('/analytics')} onClick={() => setIsMobileMenuOpen(false)}>
//                                     <BarChart3 size={20} />
//                                     <span>Analytics</span>
//                                 </Link>

//                                 <div className="mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Finance</div>
//                                 <Link to="/transactions" className={getLinkClass('/transactions')} onClick={() => setIsMobileMenuOpen(false)}>
//                                     <TrendingUp size={20} />
//                                     <span>Transactions</span>
//                                 </Link>
//                                 <Link to="/budget" className={getLinkClass('/budget')} onClick={() => setIsMobileMenuOpen(false)}>
//                                     <PieChart size={20} />
//                                     <span>Budgets</span>
//                                 </Link>
//                                 <Link to="/savings" className={getLinkClass('/savings')} onClick={() => setIsMobileMenuOpen(false)}>
//                                     <PiggyBank size={20} />
//                                     <span>Savings</span>
//                                 </Link>

//                                 <div className="mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Community</div>
//                                 <Link to="/forum" className={getLinkClass('/forum')} onClick={() => setIsMobileMenuOpen(false)}>
//                                     <MessageCircle size={20} />
//                                     <span>Forum</span>
//                                 </Link>
                                
//                                 <div className="mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Settings</div>
//                                 <Link to="/export" className={getLinkClass('/export')} onClick={() => setIsMobileMenuOpen(false)}>
//                                     <Download size={20} />
//                                     <span>Export</span>
//                                 </Link>
//                                 <Link to="/profile" className={getLinkClass('/profile')} onClick={() => setIsMobileMenuOpen(false)}>
//                                     <User size={20} />
//                                     <span>Profile</span>
//                                 </Link>
//                             </>
//                         )
//                     ) : (
//                         <div className="space-y-3">
//                             <Link to="/login" className="flex w-full items-center justify-center px-4 py-3 text-blue-600 font-medium bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
//                                 Login
//                             </Link>
//                             <Link to="/signup" className="flex w-full items-center justify-center px-4 py-3 text-white font-medium bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all" onClick={() => setIsMobileMenuOpen(false)}>
//                                 Sign Up
//                             </Link>
//                         </div>
//                     )}
//                 </div>

//                 {/* Footer User Area */}
//                 {isAuthenticated && (
//                     <div className="p-4 border-t border-gray-100 bg-gray-50">
//                         <button 
//                             onClick={() => {
//                                 logout();
//                                 setIsMobileMenuOpen(false);
//                             }}
//                             className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
//                         >
//                             <LogOut size={20} />
//                             <span>Logout</span>
//                         </button>
//                     </div>
//                 )}
//             </nav>

//             {/* Mobile Overlay */}
//             {isMobileMenuOpen && (
//                 <div 
//                     className="md:hidden fixed inset-0 bg-black/20 z-30 backdrop-blur-sm"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                 />
//             )}
//         </>
//     );
// };

// export default Navbar;