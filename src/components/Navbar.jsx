import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

export const Navbar = ({ openCart, openAI, openBulkInfo }) => {
  const [scrolled, setScrolled] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 
      ${scrolled
        ? 'bg-white/90 backdrop-blur-lg py-3 shadow-sm border-b border-slate-100'
        : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 flex justify-between items-center">

        {/* LOGO (TIDAK DIUBAH - SESUAI ASLINYA) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="
            font-black tracking-tight cursor-pointer select-none
            text-base sm:text-xl md:text-2xl lg:text-3xl
            flex items-center gap-1 text-slate-900
            whitespace-nowrap
          "
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="whitespace-nowrap">THE YARD</span>
          <span className="hidden xs:inline whitespace-nowrap"></span>
          <span className="text-amber-600 whitespace-nowrap">BULK ORDER.</span>
        </motion.div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">

          {/* BULK INFO BUTTON - MUNCUL DI SEMUA DEVICE (Mobile & Desktop) */}
          <button
            onClick={openBulkInfo}
            className="
              flex items-center gap-2 
              px-3 py-2 md:px-4 md:py-2.5 
              bg-white hover:bg-slate-50
              border border-transparent hover:border-slate-200
              rounded-full 
              text-slate-500 hover:text-slate-800 text-xs md:text-sm font-bold
              transition-all
            "
          >
            <Info size={16} />
            <span>Bulk Info</span>
          </button>

          {/* AI BUTTON - DISEMBUNYIKAN DI HP (hidden md:flex) */}
          <button
            onClick={openAI}
            className="
              hidden md:flex items-center gap-2 
              px-5 py-2.5 
              bg-slate-50 hover:bg-white
              border border-slate-200 hover:border-amber-300
              rounded-full 
              text-slate-700 text-sm font-bold
              transition-all shadow-sm group
            "
          >
            <Sparkles
              size={16}
              className="text-amber-500 group-hover:rotate-12 transition-transform"
            />
            <span className="group-hover:text-amber-600 transition-colors">
              YARD AI
            </span>
          </button>

          {/* CART BUTTON */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCart}
            className="
              relative p-3 rounded-full 
              text-slate-800 hover:text-amber-600 
              transition-colors
            "
          >
            <ShoppingBag size={24} strokeWidth={2} />

            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="
                    absolute top-1.5 right-1.5 
                    bg-amber-600 text-white 
                    text-[10px] sm:text-[11px] font-bold 
                    w-4.5 h-4.5 sm:w-5 sm:h-5 
                    flex items-center justify-center
                    rounded-full shadow-md 
                    border border-white
                  "
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

        </div>
      </div>
    </nav>
  );
};
