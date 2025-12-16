import React, { useState } from 'react';
import { db } from './firebase'; 
import { collection, writeBatch, doc } from 'firebase/firestore';
import { MENU_ITEMS } from './data/menuData'; 
import { Loader2, Database, ShieldAlert, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';

export const MigrateMenu = () => {
  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const SECRET_PIN = import.meta.env.VITE_MIGRATION_PIN; 

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pin === SECRET_PIN) {
        setIsAuthenticated(true);
        toast.success("Akses Diberikan! Hati-hati.", { icon: '🔓' });
    } else {
        toast.error("PIN SALAH! Akses Ditolak.", { icon: '⛔' });
        setPin("");
    }
  };

  const uploadData = async () => {
    if (!window.confirm("⚠️ PERINGATAN KERAS ⚠️\n\nTindakan ini akan menimpa database dengan data menu awal.\nApakah Anda yakin 100%?")) return;

    setLoading(true);
    setStatus("Sedang menghubungkan ke server...");
    
    const batch = writeBatch(db);
    const menuRef = collection(db, "menu");

    try {
      MENU_ITEMS.forEach((item) => {
        const docRef = doc(menuRef, item.id.toString());
        batch.set(docRef, {
          ...item,
          id: item.id.toString(),
          price: Number(item.price),
          stock: item.stock || 50,
          isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
          updatedAt: new Date()
        });
      });

      await batch.commit();
      setStatus("Sukses! Semua menu sudah masuk database. SANGAT DISARANKAN: Hapus rute /migrate sekarang.");
      setLoading(false);
      toast.success("Database berhasil di-update!");
    } catch (error) {
      console.error("Error:", error);
      setStatus("Gagal: " + error.message);
      setLoading(false);
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <form onSubmit={handleUnlock} className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-sm text-center space-y-6">
                <div className="bg-red-500/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center border-2 border-red-500/50">
                    <Lock size={40} className="text-red-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white mb-2">Restricted Area</h2>
                    <p className="text-slate-400 text-sm">Halaman ini berbahaya karena dapat mereset database. Masukkan PIN Admin.</p>
                </div>
                
                <input 
                    type="password" 
                    maxLength={6}
                    placeholder="Enter 6-Digit PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-3xl font-black tracking-[0.5em] p-4 rounded-xl bg-slate-900 border border-slate-600 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:text-slate-700 placeholder:text-sm placeholder:tracking-normal"
                />

                <button type="submit" className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20">
                    UNLOCK SYSTEM
                </button>
            </form>
        </div>
    );
  }

  return (
    <div className="p-10 bg-amber-50 min-h-screen flex flex-col items-center justify-center border-8 border-slate-900">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-amber-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-500"></div>
        
        <Unlock size={48} className="text-green-500 mx-auto mb-4"/>
        <h2 className="text-2xl font-black text-slate-900 mb-2">System Unlocked</h2>
        <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg font-bold mb-6 border border-yellow-200">
            ⚠ MODE MIGRASI AKTIF. Hati-hati dalam menekan tombol.
        </div>
        
        <p className="text-slate-500 mb-6 text-sm">
          Klik tombol di bawah ini untuk meng-upload <code>menuData.js</code> ke Firebase. Data lama yang memiliki ID sama akan ditimpa.
        </p>
        
        <button 
          onClick={uploadData}
          disabled={loading || status.includes("Sukses")}
          className={`px-6 py-4 rounded-xl font-bold transition w-full flex justify-center items-center gap-2 shadow-xl ${
            loading 
            ? 'bg-slate-400 text-white cursor-wait' 
            : status.includes("Sukses") 
              ? 'bg-green-600 text-white cursor-default'
              : 'bg-slate-900 text-white hover:bg-red-600'
          }`}
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={20} /> Memproses Data...</>
          ) : status.includes("Sukses") ? (
            "✅ Migration Complete"
          ) : (
            <><Database size={20} /> EKSEKUSI MIGRASI</>
          )}
        </button>

        {status.includes("Sukses") && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
             <p className="text-green-700 font-bold text-sm">✅ Selesai. Segera tutup halaman ini.</p>
          </div>
        )}
        
        {status.includes("Gagal") && (
          <p className="mt-4 text-red-600 font-bold bg-red-50 p-2 rounded">❌ {status}</p>
        )}
      </div>
    </div>
  );
};