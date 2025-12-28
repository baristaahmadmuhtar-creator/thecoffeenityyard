import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'; 
import { auth } from './firebase'; 
import { AdminDashboard } from './AdminDashboard'; 
import { Loader2, ShieldCheck, Lock, LogOut } from 'lucide-react'; 
import toast from 'react-hot-toast'; 

export const AdminGuard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    // Cek status login saat komponen pertama kali dimuat
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe; 
    }, []);

    // Fungsi untuk menerjemahkan kode error Firebase
    const getFriendlyErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return "Access Denied. Incorrect credentials.";
            case 'auth/invalid-email':
                return "Invalid email format.";
            case 'auth/user-disabled':
                return "This admin account has been disabled.";
            default:
                return "Authentication failed. Please try again.";
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoggingIn(true);
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Welcome back, Admin!");
        } catch (err) {
            const errorMessage = getFriendlyErrorMessage(err.code);
            setError(errorMessage);
            console.error("Firebase Auth Error:", err.code, err.message);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = () => {
        signOut(auth); 
        toast.success("Logged out successfully!");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-old-lace">
                <Loader2 className="animate-spin text-flag-red mr-2" size={32} /> 
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Authenticating...</span>
            </div>
        );
    }

    if (user) {
        // Dashboard
        return (
            <>
                <div className="flex justify-between items-center p-4 md:px-8 bg-old-lace border-b border-almond-silk">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-flag-red" size={24} />
                        <span className="text-lg font-black text-slate-800 font-heading tracking-tight">ADMIN DASHBOARD</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden md:inline text-xs font-bold text-slate-400 uppercase tracking-wider">{user.email}</span>
                        <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-white font-bold bg-slate-900 hover:bg-flag-red px-4 py-2 rounded-xl shadow-lg transition-colors">
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                </div>
                <AdminDashboard />
            </>
        );
    }

    // Form Login
    return (
        <div className="min-h-screen flex items-center justify-center bg-old-lace p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-almond-silk/40 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-flag-red/5 rounded-full blur-[80px]"></div>

            <form onSubmit={handleLogin} className="relative z-10 p-8 md:p-10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-900/10 rounded-[2.5rem] w-full max-w-md border border-white/50 animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-flag-red to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-flag-red/30 text-white">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 font-heading">Admin Portal</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Restricted Access Only</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                        <p className="text-red-600 text-sm font-bold leading-tight">{error}</p>
                    </div>
                )}
                
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <input
                            type="email"
                            placeholder="admin@coffeennity.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoggingIn}
                            className="w-full p-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-flag-red/10 focus:border-flag-red transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoggingIn}
                            className="w-full p-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-flag-red/10 focus:border-flag-red transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full mt-8 bg-slate-900 text-white font-bold text-lg p-4 rounded-2xl hover:bg-flag-red transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-xl hover:shadow-flag-red/30 active:scale-[0.98]"
                >
                    {isLoggingIn ? (
                        <>
                            <Loader2 className="animate-spin" size={20} /> Verifying...
                        </>
                    ) : (
                        "Access Dashboard"
                    )}
                </button>
            </form>
        </div>
    );
};