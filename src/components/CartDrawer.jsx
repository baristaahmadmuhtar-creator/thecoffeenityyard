import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const CartDrawer = ({ isOpen, onClose, onCheckout }) => {
  const { cart, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart, formatBND } = useCart();
  
  useBodyScrollLock(isOpen);

  if (!isOpen) return null; 

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            className="fixed top-0 right-0 h-[100dvh] w-full md:max-w-[480px] bg-old-lace shadow-2xl z-[70] flex flex-col border-l border-white/50"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="pt-safe-top pt-6 pb-4 px-6 md:px-8 flex justify-between items-start bg-old-lace/95 backdrop-blur-md z-10 sticky top-0 border-b border-almond-silk/30 shrink-0">
              <div>
                 <h2 className="text-3xl font-heading text-slate-900 leading-none mb-2">Your Tray.</h2>
                 <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                    <span className="bg-flag-red text-white px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{cartCount} Items</span>
                    Ready for checkout
                 </p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 -mr-2 rounded-full text-slate-400 hover:bg-white hover:text-slate-900 transition-colors active:scale-90"
                aria-label="Close cart"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow px-4 md:px-6 py-4 overflow-y-auto space-y-3 md:space-y-4 scrollbar-thin pb-48 relative">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 space-y-6 relative">
                  {/* Decorative Blob */}
                  <div className="absolute w-48 h-48 bg-almond-silk/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
                  
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-2 border-almond-silk border-dashed shadow-sm">
                    <ShoppingBag className="w-10 h-10 text-almond-silk" strokeWidth={1.5} />
                  </div>
                  <div className="text-center space-y-1">
                      <p className="text-xl font-heading text-slate-900">Your tray is empty.</p>
                      <p className="text-slate-500 text-sm">Add some delicious items to get started.</p>
                  </div>
                  <button onClick={onClose} className="px-8 py-3 bg-flag-red text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg hover:shadow-flag-red/20 active:scale-95 text-sm uppercase tracking-wider">
                    Browse Menu
                  </button>
                </div>
              ) : (
                <>
                    <div className="flex justify-end px-2">
                        <button onClick={clearCart} className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                            <Trash2 size={12}/> Clear Tray
                        </button>
                    </div>
                    {cart.map(item => (
                    <motion.div 
                        layout 
                        initial={{opacity:0, y:10}} 
                        animate={{opacity:1, y:0}} 
                        exit={{opacity:0, scale: 0.9}}
                        key={item.cartId} 
                        className="flex gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-[1.5rem] border border-white shadow-sm hover:shadow-md transition-shadow group relative"
                    >
                        {/* Image */}
                        <div className="flex-shrink-0 w-20 h-20 bg-old-lace rounded-2xl overflow-hidden relative border border-slate-50">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-110" onError={e => e.target.src="https://placehold.co/150x150/FDF2E3/CA222A?text=Image"}/>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-grow flex flex-col justify-between py-0.5 min-w-0">
                        <div className="pr-8">
                            <h3 className="text-slate-900 font-bold text-sm leading-snug line-clamp-2 font-sans">{item.name}</h3>
                            {item.selectedOption && (
                            <div className="text-xs text-slate-500 font-medium mt-1 truncate bg-old-lace px-2 py-0.5 rounded-md inline-block max-w-full">
                                {item.selectedOption}
                            </div>
                            )}
                        </div>
                        
                        <div className="flex justify-between items-end mt-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-old-lace rounded-lg p-1 border border-almond-silk/50 shadow-inner">
                                    <button onClick={() => updateQuantity(item.cartId, -1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-md transition-all active:scale-90"><Minus size={14} strokeWidth={3} /></button>
                                    <span className="w-6 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.cartId, 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-md transition-all active:scale-90"><Plus size={14} strokeWidth={3} /></button>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-400 font-medium block">Total</span>
                                <span className="text-flag-red font-black text-sm">{formatBND(item.price * item.quantity)}</span>
                            </div>
                        </div>
                        </div>

                        <button 
                            onClick={() => removeFromCart(item.cartId)} 
                            className="absolute top-2 right-2 p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-90"
                        >
                            <Trash2 size={16} />
                        </button>
                    </motion.div>
                    ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 border-t border-white/50 bg-old-lace/80 backdrop-blur-xl z-20 space-y-4 pb-safe-bottom shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="text-slate-900 font-bold">{formatBND(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-dashed border-slate-300">
                    <span className="text-slate-900 font-heading text-2xl">Total</span>
                    <div className="text-right">
                        <span className="text-xs text-slate-400 font-medium mb-1 block">BND</span>
                        <span className="text-flag-red font-black text-4xl leading-none tracking-tighter">{formatBND(cartTotal).replace('BND', '').trim()}</span>
                    </div>
                  </div>
              </div>
              
              <button
                onClick={onCheckout}
                disabled={cart.length === 0}
                className={`w-full py-4 rounded-2xl font-bold text-base tracking-wide uppercase flex justify-center items-center gap-3 transition-all shadow-xl ${
                  cart.length === 0 
                  ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' 
                  : 'bg-flag-red text-white hover:bg-flag-red-dark hover:shadow-flag-red/30 active:scale-[0.98]'
                }`}
              >
                Checkout <ArrowRight size={18}/>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};