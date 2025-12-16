import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'; 
import { auth } from './firebase'; // Import auth dari path yang benar
import { AdminDashboard } from './AdminDashboard'; 
import { Loader2 } from 'lucide-react'; 
import toast from 'react-hot-toast'; // Pastikan Anda juga mengimpor toast di sini

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
                return "Login gagal. Email atau password salah. (Cek huruf besar/kecil)";
            case 'auth/invalid-email':
                return "Format email tidak valid.";
            case 'auth/user-disabled':
                return "Akun admin ini telah dinonaktifkan.";
            default:
                return "Terjadi kesalahan saat login. Coba lagi.";
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoggingIn(true);
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-amber-500 mr-2" size={24} /> 
                <span className="text-slate-600">Checking Authentication...</span>
            </div>
        );
    }

    if (user) {
        // Dashboard
        return (
            <>
                <div className="flex justify-between p-4 bg-slate-100 border-b border-slate-200">
                    <span className="text-lg font-black text-slate-700">THE COFFEENITY YARD - ADMIN</span>
                    <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-bold bg-white px-3 py-1 rounded-lg shadow-sm transition">
                        Logout ({user.email})
                    </button>
                </div>
                <AdminDashboard />
            </>
        );
    }

    // Form Login
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form onSubmit={handleLogin} className="p-8 bg-white shadow-2xl rounded-xl w-full max-w-sm space-y-6 border border-gray-100">
                <h2 className="text-3xl font-black text-slate-900 text-center">🔐 Admin Login</h2>
                {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium text-center border border-red-200">{error}</p>}
                
                <input
                    type="email"
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoggingIn}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition disabled:bg-gray-100"
                />
                
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoggingIn}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition disabled:bg-gray-100"
                />

                <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-slate-900 text-white font-bold p-4 rounded-lg hover:bg-amber-600 transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg"
                >
                    {isLoggingIn ? (
                        <>
                            <Loader2 className="animate-spin" size={20} /> Authenticating...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </form>
        </div>
    );
};