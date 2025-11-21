import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import BudgetDashboard from './pages/BudgetDashboard';
import Savings from './pages/Savings';
import Analytics from './pages/Analytics';
import Export from './pages/Export';
import Forum from './pages/Forum';
import Admin from './pages/Admin';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Navbar />
                {/* ADDED WRAPPER HERE:
                   - md:ml-64: Pushes content to the right on desktop (width of sidebar)
                   - pt-16: Pushes content down on mobile (height of mobile header)
                   - md:pt-0: Removes top padding on desktop
                   - min-h-screen: Ensures background covers full height
                */}
                {/* <main className="md:ml-64 pt-16 md:pt-3 min-h-screen bg-gray-50 transition-all duration-300"> */}
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<ProtectedRoute />}>
                            <Route path="" element={<Dashboard />} />
                        </Route>
                        <Route path="/profile" element={<ProtectedRoute />}>
                            <Route path="" element={<Profile />} />
                        </Route>
                        <Route path="/transactions" element={<ProtectedRoute />}>
                            <Route path="" element={<Transactions />} />
                        </Route>
                        <Route path="/budget" element={<ProtectedRoute />}>
                            <Route path="" element={<BudgetDashboard />} />
                        </Route>
                        <Route path="/savings" element={<ProtectedRoute />}>
                            <Route path="" element={<Savings />} />
                        </Route>
                        <Route path="/analytics" element={<ProtectedRoute />}>
                            <Route path="" element={<Analytics />} />
                        </Route>
                        <Route path="/export" element={<ProtectedRoute />}>
                            <Route path="" element={<Export />} />
                        </Route>
                        <Route path="/forum" element={<ProtectedRoute />}>
                            <Route path="" element={<Forum />} />
                        </Route>
                        <Route path="/admin" element={<ProtectedRoute />}>
                            <Route path="" element={<Admin />} />
                        </Route>
                    </Routes>
                </main>
            </AuthProvider>
        </Router>
    );
}

export default App;