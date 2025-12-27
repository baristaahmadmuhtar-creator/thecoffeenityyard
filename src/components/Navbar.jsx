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
        ? 'bg-old-lace/95 backdrop-blur-xl py-3 shadow-sm border-b border-almond-silk'
        : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 flex justify-between items-center">

        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="
            font-heading font-normal tracking-wide cursor-pointer select-none
            text-lg sm:text-2xl md:text-3xl lg:text-4xl
            flex items-center gap-1 text-slate-900
            whitespace-nowrap
          "
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="whitespace-nowrap">THE YARD</span>
          <span className="hidden xs:inline whitespace-nowrap"></span>
          <span className="text-flag-red whitespace-nowrap">BULK ORDER.</span>
        </motion.div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">

          {/* BULK INFO BUTTON */}
          <button
            onClick={openBulkInfo}
            className="
              flex items-center gap-2 
              px-3 py-2 md:px-4 md:py-2.5 
              bg-white hover:bg-almond-silk/50
              border border-transparent hover:border-almond-silk
              rounded-full 
              text-slate-600 hover:text-flag-red text-xs md:text-sm font-bold
              transition-all shadow-sm
            "
          >
            <Info size={16} />
            <span>Bulk Info</span>
          </button>

          {/* AI BUTTON */}
          <button
            onClick={openAI}
            className="
              hidden md:flex items-center gap-2 
              px-5 py-2.5 
              bg-white/80 hover:bg-white
              border border-almond-silk hover:border-flag-red
              rounded-full 
              text-slate-800 text-sm font-bold
              transition-all shadow-sm group
            "
          >
            <Sparkles
              size={16}
              className="text-flag-red group-hover:rotate-12 transition-transform"
            />
            <span className="group-hover:text-flag-red transition-colors">
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
              text-slate-800 hover:text-flag-red 
              bg-white/50 hover:bg-white
              border border-transparent hover:border-almond-silk
              transition-all
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
                    bg-flag-red text-white 
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