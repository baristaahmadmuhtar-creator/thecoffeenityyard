import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = ({ isOpen, onClose, onCheckout }) => {
  const { cart, cartTotal, cartCount, updateQuantity, removeFromCart, formatBND } = useCart();
  
  if (!isOpen) return null; 

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Terang */}
          <motion.div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          />

          {/* Drawer Panel Putih */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-[450px] bg-white shadow-2xl shadow-slate-400/20 z-[70] flex flex-col border-l border-slate-100"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <div>
                 <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    Your Tray <span className="text-amber-700 text-sm font-bold bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1"><Package size={14}/> {cartCount} Items</span>
                 </h2>
                 <p className="text-slate-500 text-sm mt-1">Review your bulk order items.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors bg-slate-50">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items (Latar belakang sedikit abu-abu agar kontras dengan kartu putih) */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6 bg-slate-50/50 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-6">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
                    <ShoppingBag className="w-12 h-12 text-slate-300" />
                  </div>
                  <div className="text-center">
                      <p className="text-xl font-bold text-slate-700">Your tray is empty.</p>
                      <p className="text-slate-500 text-sm mt-2">Looks like you haven't added anything yet.</p>
                  </div>
                  <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-amber-500 text-amber-600 font-bold rounded-xl hover:bg-amber-50 transition-all shadow-sm">Browse Our Menu</button>
                </div>
              ) : (
                cart.map(item => (
                  // Kartu Item Putih dengan Shadow Halus
                  <motion.div layout initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} key={item.cartId} className="flex gap-5 p-5 bg-white rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] border border-slate-100 relative group">
                    <div className="flex-shrink-0 w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-100 relative">
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply transition-transform group-hover:scale-105" />
                       {item.selectedOption && (
                           <div className="absolute bottom-0 left-0 right-0 bg-slate-900/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 text-center truncate">
                               {item.selectedOption}
                           </div>
                       )}
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                             <h3 className="text-slate-900 font-bold text-base leading-snug max-w-[160px]">{item.name}</h3>
                             <button onClick={() => removeFromCart(item.cartId)} className="text-slate-300 hover:text-red-500 transition-colors p-1 absolute top-3 right-3">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-amber-600 font-black text-lg mt-1">{formatBND(item.price * item.quantity)}</p>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full p-1 shadow-sm">
                            <button onClick={() => updateQuantity(item.cartId, -1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded-full transition-all"><Minus className="w-4 h-4" /></button>
                            <span className="w-10 text-center text-base font-bold text-slate-900">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartId, 1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded-full transition-all"><Plus className="w-4 h-4" /></button>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{item.unit}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Checkout Section (Putih) */}
            <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] z-10">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-slate-500 font-medium text-sm">Subtotal ({cartCount} items)</span>
                 <span className="text-slate-900 font-bold text-lg">{formatBND(cartTotal)}</span>
              </div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <span className="text-slate-900 font-bold text-xl">Grand Total</span>
                <span className="text-amber-600 font-black text-3xl">{formatBND(cartTotal)}</span>
              </div>
              
              <button
                onClick={onCheckout}
                disabled={cart.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-3 transition-all shadow-xl ${
                  cart.length === 0 
                  ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed' 
                  : 'bg-slate-900 text-white hover:bg-amber-600 hover:shadow-amber-600/30 active:scale-[0.99]'
                }`}
              >
                Proceed to Checkout <ArrowRight size={20}/>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};