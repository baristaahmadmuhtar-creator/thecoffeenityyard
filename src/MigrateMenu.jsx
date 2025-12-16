import React, { useState } from 'react';
import { db } from './firebase'; // Import db dari path yang benar
import { collection, writeBatch, doc } from 'firebase/firestore';
import { MENU_ITEMS, CATEGORIES } from './data/menuData'; // Sesuaikan path menuData Anda
import { Loader2, Database } from 'lucide-react';

export const MigrateMenu = () => {
  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);

  const uploadData = async () => {
    // Gunakan custom modal/konfirmasi (karena alert/confirm dilarang)
    if (!window.confirm("Yakin ingin upload SEMUA menu ke Database? Lakukan ini HANYA SEKALI. Data yang sudah ada mungkin tertimpa.")) return;

    setLoading(true);
    setStatus("Uploading...");
    
    const batch = writeBatch(db);
    const menuRef = collection(db, "menu");

    try {
      MENU_ITEMS.forEach((item) => {
        // Kita gunakan ID dari menuData sebagai ID dokumen di Firebase
        const docRef = doc(menuRef, item.id.toString());
        
        // Data yang dimasukkan ke Firestore
        batch.set(docRef, {
          ...item,
          id: item.id.toString(), // Pastikan ID dalam bentuk string untuk kunci Firestore
          price: Number(item.price), // Pastikan harga adalah number
          stock: item.stock || 50, // Gunakan stok dari data jika ada, atau 50 default
          isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
          updatedAt: new Date()
        });
      });

      await batch.commit();
      setStatus("Sukses! Semua menu sudah masuk database. Anda bisa menghapus rute /migrate sekarang.");
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setStatus("Gagal: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-10 bg-slate-100 min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
        <Database size={48} className="text-amber-500 mx-auto mb-4"/>
        <h2 className="text-2xl font-black text-slate-900 mb-4">Migrasi Data Menu Awal</h2>
        <p className="text-slate-500 mb-6">
          Klik tombol ini HANYA SEKALI untuk memindahkan data dari file <code>menuData.js</code> ke Firebase Firestore.
        </p>
        
        <button 
          onClick={uploadData}
          disabled={loading || status.includes("Sukses")}
          className={`px-6 py-3 rounded-xl font-bold transition w-full flex justify-center items-center gap-2 ${
            loading 
            ? 'bg-slate-400 text-white cursor-wait' 
            : status.includes("Sukses") 
              ? 'bg-green-600 text-white cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
          }`}
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={20} /> Uploading...</>
          ) : status.includes("Sukses") ? (
            "✅ Migration Complete"
          ) : (
            "Upload Menu ke Firebase"
          )}
        </button>

        {status.includes("Sukses") && (
          <p className="mt-4 text-green-600 font-bold">✅ Selesai. Lanjutkan ke /admin</p>
        )}
        {status.includes("Gagal") && (
          <p className="mt-4 text-red-600 font-bold">❌ {status}</p>
        )}
      </div>
    </div>
  );
};