import { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, onSnapshot } from 'firebase/firestore';

// Hook ini mengambil SEMUA data menu dari Firestore (termasuk yang stoknya habis)
// Tujuannya agar AI memiliki konteks penuh tentang semua produk yang tersedia di database.
export const useMenuData = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  useEffect(() => {
    // onSnapshot akan mendengarkan perubahan real-time
    const unsubscribe = onSnapshot(collection(db, "menu"), 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        // Data diurutkan berdasarkan ID untuk konsistensi
        data.sort((a, b) => (a.id > b.id) ? 1 : -1);

        setMenuItems(data);
        setLoadingMenu(false);
      }, 
      (error) => {
        console.error("Error fetching menu data for AI:", error);
        setLoadingMenu(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { menuItems, loadingMenu };
};