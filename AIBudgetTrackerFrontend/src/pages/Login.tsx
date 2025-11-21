import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Wallet } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { login } = useAuth();

    const friendlyMessage = (raw: string) => {
        const lower = raw.toLowerCase();
        if (lower.includes('banned')) return 'Your account has been banned. Please contact support if you think this is a mistake.';
        if (lower.includes('admin approval')) return 'Your admin account is pending owner approval. You will be notified once it is approved.';
        if (lower.includes('invalid password') || lower.includes('not found') || lower.includes('username')) return 'Invalid username or password.';
        // fallback: strip any leading "Error:" text
        return raw.replace(/^Error:\s*/i, '');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        try {
            await login({ username, password });
        } catch (err: any) {
            const raw = (err && err.message) ? err.message : 'Login failed. Please try again.';
            setErrorMessage(friendlyMessage(raw));
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Wallet className="text-blue-600" size={40} />
                        {/* FIX: Added 'pb-1' here to prevent the 'g' from being cut off */}
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent pb-1">
                            Budget Tracker
                        </h1>
                    </div>
                    <p className="text-gray-600">Welcome back! Please login to your account.</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input 
                                type="text" 
                                placeholder="Enter your username" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)}
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input 
                                type="password" 
                                placeholder="Enter your password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                        >
                            <LogIn size={20} />
                            Login
                        </button>
                        {errorMessage && (
                            <p className="text-center text-sm text-red-600 mt-3" role="alert">{errorMessage}</p>
                        )}
                    </form>
                    
                    <p className="text-center text-gray-600 mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;



// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
// import { LogIn, Wallet } from 'lucide-react';

// const Login = () => {
//     const [username, setUsername] = useState<string>('');
//     const [password, setPassword] = useState<string>('');
//     const [errorMessage, setErrorMessage] = useState<string | null>(null);
//     const { login } = useAuth();

//     const friendlyMessage = (raw: string) => {
//         const lower = raw.toLowerCase();
//         if (lower.includes('banned')) return 'Your account has been banned. Please contact support if you think this is a mistake.';
//         if (lower.includes('admin approval')) return 'Your admin account is pending owner approval. You will be notified once it is approved.';
//         if (lower.includes('invalid password') || lower.includes('not found') || lower.includes('username')) return 'Invalid username or password.';
//         // fallback: strip any leading "Error:" text
//         return raw.replace(/^Error:\s*/i, '');
//     };

//     const handleLogin = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setErrorMessage(null);
//         try {
//             await login({ username, password });
//         } catch (err: any) {
//             const raw = (err && err.message) ? err.message : 'Login failed. Please try again.';
//             setErrorMessage(friendlyMessage(raw));
//         }
//     };

//     return (
//         <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
//             <div className="max-w-md w-full">
//                 <div className="text-center mb-8">
//                     <div className="flex items-center justify-center gap-2 mb-3">
//                         <Wallet className="text-blue-600" size={40} />
//                         <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
//                             Budget Tracker
//                         </h1>
//                     </div>
//                     <p className="text-gray-600">Welcome back! Please login to your account.</p>
//                 </div>
                
//                 <div className="bg-white rounded-2xl shadow-xl p-8">
//                     <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
//                     <form onSubmit={handleLogin} className="space-y-6">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Username
//                             </label>
//                             <input 
//                                 type="text" 
//                                 placeholder="Enter your username" 
//                                 value={username} 
//                                 onChange={(e) => setUsername(e.target.value)}
//                                 required 
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                             />
//                         </div>
                        
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Password
//                             </label>
//                             <input 
//                                 type="password" 
//                                 placeholder="Enter your password" 
//                                 value={password} 
//                                 onChange={(e) => setPassword(e.target.value)} 
//                                 required 
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                             />
//                         </div>
                        
//                         <button 
//                             type="submit"
//                             className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
//                         >
//                             <LogIn size={20} />
//                             Login
//                         </button>
//                         {errorMessage && (
//                             <p className="text-center text-sm text-red-600 mt-3" role="alert">{errorMessage}</p>
//                         )}
//                     </form>
                    
//                     <p className="text-center text-gray-600 mt-6">
//                         Don't have an account?{' '}
//                         <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
//                             Sign Up
//                         </Link>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Login;
