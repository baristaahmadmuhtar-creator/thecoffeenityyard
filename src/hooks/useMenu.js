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
          
          // Sort by ID to ensure consistent ordering
          // Handles both numeric IDs ("101") and String IDs ("ITEM-123")
          rawData.sort((a, b) => {
              // Try to extract number from ID if possible
              const numA = parseFloat(a.id.replace(/[^0-9.]/g, ''));
              const numB = parseFloat(b.id.replace(/[^0-9.]/g, ''));

              // If both are valid numbers, sort numerically
              if (!isNaN(numA) && !isNaN(numB)) {
                  return numA - numB;
              }
              // Otherwise fallback to string comparison
              return String(a.id).localeCompare(String(b.id), undefined, { numeric: true, sensitivity: 'base' });
          });

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