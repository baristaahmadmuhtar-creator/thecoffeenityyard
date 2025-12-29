import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, Info, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

export const Navbar = ({ openCart, openAI, openBulkInfo, openGallery }) => {
  const [scrolled, setScrolled] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    const checkScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    // Check immediately on mount
    checkScroll();

    let timeoutId;
    const handleScroll = () => {
        if (timeoutId) return;
        timeoutId = setTimeout(() => {
            checkScroll();
            timeoutId = null;
        }, 50); // Faster response
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('scroll', handleScroll);
        if(timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleAIClick = async () => {
      try {
          const docRef = doc(db, "settings", "ai");
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data().isUnderMaintenance) {
              toast.error("AI Planner is currently under maintenance.", {
                  icon: '🚧',
                  style: {
                      background: '#FFF7ED',
                      color: '#9A3412',
                      border: '1px solid #FFEDD5',
                      fontWeight: 'bold'
                  }
              });
          } else {
              openAI();
          }
      } catch (error) {
          console.error("Error checking AI status:", error);
          openAI(); // Default to open if check fails, or could block it.
      }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-2 md:pt-4 px-2 md:px-4 pointer-events-none">
      <motion.div 
        layout
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className={`
          pointer-events-auto
          flex justify-between items-center 
          transition-all duration-300 ease-in-out
          ${scrolled 
            ? 'w-full md:max-w-2xl bg-flag-red/95 backdrop-blur-md shadow-2xl shadow-flag-red/20 rounded-full py-2 px-4 md:py-3 md:px-5 border border-flag-red-dark/10' 
            : 'w-full max-w-7xl bg-white/80 backdrop-blur-md shadow-sm rounded-2xl md:rounded-full py-3 px-4 md:px-6 border border-white/50'
          }
        `}
      >
        {/* LOGO */}
        <motion.div
          layout="position"
          className="font-heading font-normal tracking-tight cursor-pointer select-none flex items-center gap-1 shrink-0"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className={`whitespace-nowrap transition-all ${scrolled ? 'text-old-lace text-lg' : 'text-flag-red text-2xl md:text-3xl'}`}>THE YARD</span>
          <span className={`whitespace-nowrap font-sans font-bold px-2 py-0.5 rounded-full ${scrolled ? 'bg-old-lace text-flag-red text-[10px]' : 'bg-flag-red text-old-lace text-xs mt-1'}`}>BULK.</span>
        </motion.div>

        {/* ACTION BUTTONS */}
        <motion.div layout="position" className="flex items-center gap-1.5 md:gap-3">

          {/* GALLERY BUTTON */}
          <button
            onClick={openGallery}
            className={`
              flex items-center gap-2 
              px-2 md:px-4 py-2 rounded-full font-bold text-xs transition-all active:scale-95
              ${scrolled ? 'hover:bg-flag-red-dark text-old-lace' : 'bg-transparent hover:bg-slate-100 text-slate-600'}
            `}
            aria-label="Gallery"
          >
            <Image size={18} />
            <span className="hidden sm:inline">Gallery</span>
          </button>

          {/* BULK INFO BUTTON */}
          <button
            onClick={openBulkInfo}
            className={`
              flex items-center gap-2 
              px-2 md:px-4 py-2 rounded-full font-bold text-xs transition-all active:scale-95
              ${scrolled ? 'hover:bg-flag-red-dark text-old-lace' : 'bg-transparent hover:bg-slate-100 text-slate-600'}
            `}
            aria-label="Info"
          >
            <Info size={18} />
            <span className={`hidden md:inline`}>Info</span>
          </button>

          {/* AI BUTTON - Hidden on Mobile */}
          <button
            onClick={handleAIClick}
            className={`
              hidden md:flex items-center gap-2 
              px-3 md:px-4 py-2 rounded-full font-bold text-xs transition-all group active:scale-95
              ${scrolled 
                ? 'bg-old-lace text-flag-red hover:bg-white' 
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10'
              }
            `}
          >
            <Sparkles size={16} className={`transition-transform group-hover:rotate-12 ${scrolled ? 'text-flag-red' : 'text-pastry-yellow'}`} />
            <span className="hidden xs:inline">ASK AI</span>
          </button>

          {/* CART BUTTON */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={openCart}
            className={`
              relative p-2.5 rounded-full transition-all active:bg-almond-silk
              ${scrolled ? 'bg-flag-red-dark text-old-lace' : 'bg-white shadow-sm hover:bg-white/80 text-flag-red border border-slate-100'}
            `}
          >
            <ShoppingBag size={20} strokeWidth={2.5} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className={`absolute -top-1 -right-1 text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm border ${scrolled ? 'bg-old-lace text-flag-red border-flag-red' : 'bg-flag-red text-white border-old-lace'}`}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

        </motion.div>
      </motion.div>
    </nav>
  );
};