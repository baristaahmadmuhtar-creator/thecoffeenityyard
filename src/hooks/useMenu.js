import { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, onSnapshot, query } from 'firebase/firestore';

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [errorMenu, setErrorMenu] = useState(null);

  useEffect(() => {
    setLoadingMenu(true);

    // Fetch ALL data. We do NOT filter by stock here. 
    // The UI (MenuSection) will decide how to display "Sold Out" items.
    const q = query(collection(db, "menu")); 

    const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          const rawData = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          }));
          
          // Sort by Numeric ID to ensure consistent ordering
          rawData.sort((a, b) => (Number(a.id) || 9999) - (Number(b.id) || 9999));

          setMenuItems(rawData);
          setLoadingMenu(false);
          setErrorMenu(null); 
        } catch (err) {
          console.error("Error processing menu data:", err);
          setErrorMenu("Failed to load menu data.");
          setLoadingMenu(false);
        }
      }, 
      (error) => {
        console.error("Firestore snapshot error:", error);
        setErrorMenu("Connection failed. Please refresh.");
        setLoadingMenu(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { menuItems, loadingMenu, errorMenu };
};