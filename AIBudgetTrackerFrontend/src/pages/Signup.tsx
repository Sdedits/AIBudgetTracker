import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { UserPlus, Wallet, Shield, User } from 'lucide-react';

const Signup = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerUser({ username, email, password, role });
            alert('Registered successfully! Please log in.');
            navigate('/login');
        } catch (err: any) {
            alert(err.response?.data || 'Error registering user!');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Wallet className="text-blue-600" size={40} />
                        {/* FIX: Added 'pb-1' to prevent text clipping on descenders like 'g' */}
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent pb-1">
                            Budget Tracker
                        </h1>
                    </div>
                    <p className="text-gray-600">Create your account to start tracking your finances.</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign Up</h2>
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input 
                                type="text" 
                                placeholder="Choose a username" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
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
                                placeholder="Create a password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Type
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('USER')}
                                    className={`p-4 rounded-lg font-medium transition-all border-2 ${
                                        role === 'USER'
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                    }`}
                                >
                                    <User className="mx-auto mb-2" size={24} />
                                    User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('ADMIN')}
                                    className={`p-4 rounded-lg font-medium transition-all border-2 ${
                                        role === 'ADMIN'
                                            ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                                    }`}
                                >
                                    <Shield className="mx-auto mb-2" size={24} />
                                    Admin
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                        >
                            <UserPlus size={20} />
                            Sign Up
                        </button>
                    </form>
                    
                    <p className="text-center text-gray-600 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;


// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { registerUser } from '../services/api';
// import { UserPlus, Wallet, Shield, User } from 'lucide-react';

// const Signup = () => {
//     const [username, setUsername] = useState<string>('');
//     const [email, setEmail] = useState<string>('');
//     const [password, setPassword] = useState<string>('');
//     const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
//     const navigate = useNavigate();

//     const handleRegister = async (e: React.FormEvent) => {
//         e.preventDefault();
//         try {
//             await registerUser({ username, email, password, role });
//             alert('Registered successfully! Please log in.');
//             navigate('/login');
//         } catch (err: any) {
//             alert(err.response?.data || 'Error registering user!');
//         }
//     };

//     return (
//         <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
//             <div className="max-w-md w-full">
//                 <div className="text-center mb-8">
//                     <div className="flex items-center justify-center gap-2 mb-4">
//                         <Wallet className="text-blue-600" size={40} />
//                         <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
//                             Budget Tracker
//                         </h1>
//                     </div>
//                     <p className="text-gray-600">Create your account to start tracking your finances.</p>
//                 </div>
                
//                 <div className="bg-white rounded-2xl shadow-xl p-8">
//                     <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign Up</h2>
//                     <form onSubmit={handleRegister} className="space-y-6">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Username
//                             </label>
//                             <input 
//                                 type="text" 
//                                 placeholder="Choose a username" 
//                                 value={username} 
//                                 onChange={(e) => setUsername(e.target.value)} 
//                                 required 
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                             />
//                         </div>
                        
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Email
//                             </label>
//                             <input 
//                                 type="email" 
//                                 placeholder="Enter your email" 
//                                 value={email} 
//                                 onChange={(e) => setEmail(e.target.value)} 
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
//                                 placeholder="Create a password" 
//                                 value={password} 
//                                 onChange={(e) => setPassword(e.target.value)} 
//                                 required 
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                             />
//                         </div>
                        
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Account Type
//                             </label>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <button
//                                     type="button"
//                                     onClick={() => setRole('USER')}
//                                     className={`p-4 rounded-lg font-medium transition-all border-2 ${
//                                         role === 'USER'
//                                             ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
//                                             : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
//                                     }`}
//                                 >
//                                     <User className="mx-auto mb-2" size={24} />
//                                     User
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={() => setRole('ADMIN')}
//                                     className={`p-4 rounded-lg font-medium transition-all border-2 ${
//                                         role === 'ADMIN'
//                                             ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
//                                             : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
//                                     }`}
//                                 >
//                                     <Shield className="mx-auto mb-2" size={24} />
//                                     Admin
//                                 </button>
//                             </div>
//                         </div>
                        
//                         <button 
//                             type="submit"
//                             className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
//                         >
//                             <UserPlus size={20} />
//                             Sign Up
//                         </button>
//                     </form>
                    
//                     <p className="text-center text-gray-600 mt-6">
//                         Already have an account?{' '}
//                         <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
//                             Login
//                         </Link>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Signup;