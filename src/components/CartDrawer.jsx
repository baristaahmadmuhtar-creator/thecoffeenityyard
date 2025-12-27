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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-[450px] bg-old-lace shadow-2xl shadow-flag-red/10 z-[70] flex flex-col border-l border-almond-silk"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-almond-silk flex justify-between items-center bg-old-lace z-10">
              <div>
                 <h2 className="text-2xl font-black text-flag-red-2 flex items-center gap-3 font-pirata tracking-wide">
                    Your Tray <span className="text-flag-red text-sm font-bold bg-almond-silk px-3 py-1 rounded-full flex items-center gap-1 font-sans"><Package size={14}/> {cartCount} Items</span>
                 </h2>
                 <p className="text-tomato-jam text-sm mt-1">Review your bulk order items.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full text-tomato-jam hover:bg-almond-silk hover:text-flag-red-2 transition-colors bg-white border border-almond-silk">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6 bg-almond-silk/20 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-tomato-jam space-y-6">
                  <div className="w-24 h-24 bg-almond-silk rounded-full flex items-center justify-center shadow-inner">
                    <ShoppingBag className="w-12 h-12 text-white" />
                  </div>
                  <div className="text-center">
                      <p className="text-xl font-bold text-flag-red-2">Your tray is empty.</p>
                      <p className="text-tomato-jam text-sm mt-2">Looks like you haven't added anything yet.</p>
                  </div>
                  <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-flag-red text-flag-red font-bold rounded-xl hover:bg-almond-silk transition-all shadow-sm">Browse Our Menu</button>
                </div>
              ) : (
                cart.map(item => (
                  // Kartu Item Putih
                  <motion.div layout initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} key={item.cartId} className="flex gap-5 p-5 bg-white rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] border border-almond-silk relative group">
                    <div className="flex-shrink-0 w-24 h-24 bg-almond-silk rounded-xl overflow-hidden border border-almond-silk relative">
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply transition-transform group-hover:scale-105" />
                       {item.selectedOption && (
                           <div className="absolute bottom-0 left-0 right-0 bg-flag-red-2/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 text-center truncate">
                               {item.selectedOption}
                           </div>
                       )}
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                             <h3 className="text-flag-red-2 font-bold text-base leading-snug max-w-[160px]">{item.name}</h3>
                             <button onClick={() => removeFromCart(item.cartId)} className="text-tomato-jam/50 hover:text-flag-red transition-colors p-1 absolute top-3 right-3">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-flag-red font-black text-lg mt-1">{formatBND(item.price * item.quantity)}</p>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="flex items-center bg-almond-silk border border-almond-silk rounded-full p-1 shadow-sm">
                            <button onClick={() => updateQuantity(item.cartId, -1)} className="w-8 h-8 flex items-center justify-center text-tomato-jam hover:text-flag-red-2 hover:bg-white rounded-full transition-all"><Minus className="w-4 h-4" /></button>
                            <span className="w-10 text-center text-base font-bold text-flag-red-2">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartId, 1)} className="w-8 h-8 flex items-center justify-center text-tomato-jam hover:text-flag-red-2 hover:bg-white rounded-full transition-all"><Plus className="w-4 h-4" /></button>
                        </div>
                        <span className="text-xs text-tomato-jam font-medium">{item.unit}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Checkout Section */}
            <div className="p-6 border-t border-almond-silk bg-old-lace shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] z-10">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-tomato-jam font-medium text-sm">Subtotal ({cartCount} items)</span>
                 <span className="text-flag-red-2 font-bold text-lg">{formatBND(cartTotal)}</span>
              </div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-almond-silk">
                <span className="text-flag-red-2 font-bold text-xl font-pirata tracking-wide">Grand Total</span>
                <span className="text-flag-red font-black text-3xl">{formatBND(cartTotal)}</span>
              </div>
              
              <button
                onClick={onCheckout}
                disabled={cart.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-3 transition-all shadow-xl ${
                  cart.length === 0 
                  ? 'bg-almond-silk text-tomato-jam/50 shadow-none cursor-not-allowed' 
                  : 'bg-flag-red-2 text-white hover:bg-flag-red hover:shadow-flag-red/30 active:scale-[0.99]'
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
