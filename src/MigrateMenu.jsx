import React, { useState } from 'react';
import { db } from './firebase'; 
import { collection, writeBatch, doc } from 'firebase/firestore';
import { MENU_ITEMS } from './data/menuData'; 
import { Loader2, Database, ShieldAlert, Lock, Unlock, CheckCircle, AlertTriangle } from 'lucide-react';
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
        toast.success("System Unlocked", { icon: '🔓' });
    } else {
        toast.error("Access Denied", { icon: '⛔' });
        setPin("");
    }
  };

  const uploadData = async () => {
    if (!window.confirm("⚠️ CRITICAL WARNING ⚠️\n\nThis will OVERWRITE existing menu data with the local template.\nAre you absolutely sure?")) return;

    setLoading(true);
    setStatus("Connecting to Firestore...");
    
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
      setStatus("Migration Successful. Please delete this route.");
      setLoading(false);
      toast.success("Database Updated Successfully!");
    } catch (error) {
      console.error("Error:", error);
      setStatus("Failed: " + error.message);
      setLoading(false);
      toast.error("System Error");
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-old-lace flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor matching AdminGuard */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-almond-silk/40 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-flag-red/5 rounded-full blur-[80px]"></div>

            <form onSubmit={handleUnlock} className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/50 w-full max-w-sm text-center space-y-8 relative z-10 animate-in zoom-in-95 duration-300">
                <div className="bg-red-50 p-6 rounded-3xl w-24 h-24 mx-auto flex items-center justify-center border border-red-100 shadow-inner">
                    <ShieldAlert size={40} className="text-flag-red" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2 font-heading">Restricted Area</h2>
                    <p className="text-slate-500 text-sm font-medium">Database Migration Tool.<br/>Authorized Personnel Only.</p>
                </div>
                
                <div className="relative">
                    <input 
                        type="password" 
                        maxLength={6}
                        placeholder="••••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center text-4xl font-black tracking-[0.5em] p-4 rounded-2xl bg-white border border-slate-200 text-slate-900 focus:border-flag-red focus:ring-4 focus:ring-flag-red/10 outline-none transition-all placeholder:text-slate-200 shadow-sm"
                    />
                </div>

                <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-flag-red text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-flag-red/30 active:scale-95">
                    UNLOCK SYSTEM
                </button>
            </form>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 border-[10px] border-slate-900">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center border border-slate-100 relative overflow-hidden">
        {/* Caution Strip */}
        <div className="absolute top-0 left-0 w-full h-3 bg-stripes-red"></div>
        
        <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-bold text-xs uppercase tracking-widest mb-6">
                <Unlock size={14}/> System Unlocked
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 font-heading">Database Migration</h2>
            <div className="bg-amber-50 text-amber-900 p-4 rounded-2xl text-left text-sm font-medium border border-amber-100 flex gap-3 items-start">
                <AlertTriangle className="shrink-0 mt-0.5" size={18}/>
                <p>Running this tool will <strong>overwrite</strong> existing menu items in Firestore with data from <code>menuData.js</code> based on ID match.</p>
            </div>
        </div>
        
        <div className="space-y-4">
            <button 
            onClick={uploadData}
            disabled={loading || status.includes("Successful")}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex justify-center items-center gap-3 ${
                loading 
                ? 'bg-slate-100 text-slate-400 cursor-wait' 
                : status.includes("Successful") 
                ? 'bg-green-500 text-white cursor-default shadow-green-500/20'
                : 'bg-slate-900 text-white hover:bg-flag-red hover:shadow-flag-red/20 active:scale-95'
            }`}
            >
            {loading ? (
                <><Loader2 className="animate-spin" size={24} /> Processing...</>
            ) : status.includes("Successful") ? (
                <><CheckCircle size={24}/> Migration Complete</>
            ) : (
                <><Database size={24} /> EXECUTE MIGRATION</>
            )}
            </button>

            {status.includes("Successful") && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-slate-400 text-xs mt-4">Safe to close this window.</p>
                </div>
            )}
            
            {status.includes("Failed") && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 mt-4 text-sm break-words">
                    Error: {status}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};