import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Check, Loader2, Ban, ShoppingBag, Tag, LayoutGrid, List } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '../hooks/useMenu'; 
import { useCart } from '../context/CartContext';
import { MixModal } from './MixModal'; 
import { doc, onSnapshot } from 'firebase/firestore'; 
import { db } from '../firebase';

// --- OPTION MODAL (STANDARD) ---
const OptionModal = ({ item, isOpen, onClose, onConfirm, onMixSelect }) => {
    const [selected, setSelected] = useState(item?.options?.choices[0] || '');

    if (!isOpen || !item || !item.options || !item.options.choices) return null;

    const handleConfirm = () => {
        if (selected.toLowerCase() === 'mixed' || selected.toLowerCase() === 'mix') {
            onMixSelect(item);
        } else {
            onConfirm(selected);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}
                />
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-sm rounded-2xl shadow-2xl z-10 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-old-lace">
                        <h3 className="font-heading text-xl text-slate-800">{item.options.title || 'Select Options'}</h3>
                        <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-flag-red"/></button>
                    </div>
                    <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                        {item.options.choices.map((choice) => (
                            <div 
                                key={choice}
                                onClick={() => setSelected(choice)}
                                className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                                    selected === choice 
                                    ? 'border-flag-red bg-old-lace text-flag-red font-semibold shadow-sm' 
                                    : 'border-slate-200 hover:bg-old-lace text-slate-600'
                                }`}
                            >
                                <span>{choice}</span>
                                {selected === choice && <Check size={18} className="text-flag-red"/>}
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-100">
                        <button 
                            onClick={handleConfirm}
                            className="w-full py-3 bg-flag-red hover:bg-flag-red-2 text-white font-bold rounded-xl shadow-lg shadow-flag-red/20 transition-all active:scale-95"
                        >
                            {selected.toLowerCase() === 'mixed' ? 'Continue to Mix' : 'Confirm Selection'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); 
  const [modalItem, setModalItem] = useState(null);
  const [mixModalItem, setMixModalItem] = useState(null); 
  const { addToCart, formatBND } = useCart();
  const { menuItems, loadingMenu, errorMenu } = useMenu();

  // REALTIME CATEGORIES STATE
  const [categories, setCategories] = useState(["All", "Foods", "Desserts", "Coffee", "Others"]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "categories"), (doc) => {
        if (doc.exists() && doc.data().list) {
            setCategories(["All", ...doc.data().list]);
        }
    });
    return () => unsub();
  }, []);

  const filteredItems = activeCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const getPriceFromOption = (optionStr, defaultPrice) => {
      const match = optionStr.match(/\$(\d+(\.\d+)?)/);
      return match ? parseFloat(match[1]) : defaultPrice;
  };

  const handleAddToCartClick = (item) => {
      if (item.stock <= 0 || item.isAvailable === false) return; 
      if (item.options) {
          setModalItem(item);
      } else {
          addToCart(item, item.minQty || 1); 
      }
  };

  const handleConfirmOption = (choice) => {
      if (modalItem) {
          const price = getPriceFromOption(choice, modalItem.price);
          addToCart(modalItem, modalItem.minQty || 1, choice, price); 
          setModalItem(null);
      }
  };

  const handleMixSelect = (item) => {
      setModalItem(null); 
      setTimeout(() => setMixModalItem(item), 150); 
  };

  const handleConfirmMix = (selectedVariants) => {
      if (mixModalItem) {
          // UPDATE: Logic untuk format string (support duplicate)
          // Contoh: "2x Margherita, 1x Pepperoni"
          const counts = {};
          selectedVariants.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
          
          const mixStringDetails = Object.entries(counts)
            .map(([name, count]) => count > 1 ? `${count}x ${name}` : name)
            .join(', ');
            
          const mixString = `Mixed: ${mixStringDetails}`;

          const totalPrice = selectedVariants.reduce((sum, variant) => {
              return sum + getPriceFromOption(variant, mixModalItem.price);
          }, 0);
          const avgPrice = totalPrice / selectedVariants.length;

          addToCart(mixModalItem, mixModalItem.minQty || 1, mixString, avgPrice);
          setMixModalItem(null);
      }
  };

  const getMixLimit = (item) => {
      if (!item) return 2;
      return item.mixLimit ? item.mixLimit : (item.minQty > 1 ? item.minQty : 2);
  };

  const mixLimit = getMixLimit(mixModalItem);

  // --- REUSABLE COMPONENTS ---
  const ViewToggleButton = ({ className }) => (
      <div className={`flex bg-old-lace p-1 rounded-xl shrink-0 border border-almond-silk ${className}`}>
        <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-flag-red' : 'text-slate-400 hover:text-slate-600'
            }`}
            aria-label="Grid View"
        >
            <LayoutGrid size={20} strokeWidth={2.5}/>
        </button>
        <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                viewMode === 'list' ? 'bg-white shadow-sm text-flag-red' : 'text-slate-400 hover:text-slate-600'
            }`}
            aria-label="List View"
        >
            <List size={20} strokeWidth={2.5}/>
        </button>
    </div>
  );

  const listVariant = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95 }
  };

  if (loadingMenu) {
      return (
          <section id="menu" className="py-24 bg-old-lace min-h-screen flex items-center justify-center">
              <Loader2 className="animate-spin text-flag-red mr-2" size={32} />
              <span className="text-xl font-bold text-slate-700">Loading Menu...</span>
          </section>
      );
  }

  if (errorMenu) {
      return (
          <section id="menu" className="py-24 bg-old-lace min-h-screen text-center">
              <h2 className="text-4xl font-heading text-red-600 mb-4">Connection Error</h2>
              <p className="text-lg text-slate-600">{errorMenu}</p>
          </section>
      );
  }

  return (
    <section id="menu" className="py-12 md:py-24 bg-old-lace min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* --- HEADER NAVIGATION (RESPONSIVE) --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6">
          
          <div className="flex items-center justify-between md:justify-start w-full md:w-auto">
             <h2 className="text-3xl md:text-5xl font-heading tracking-tight text-slate-900">OUR MENU</h2>
             <ViewToggleButton className="md:hidden" />
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto relative">
            <div className="relative w-full md:w-auto">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto justify-start md:justify-end scrollbar-hide px-1 snap-x">
                    {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 shadow-sm border ${
                        activeCategory === cat 
                            ? 'bg-flag-red border-flag-red text-white shadow-flag-red/30' 
                            : 'bg-white border-almond-silk text-slate-600 hover:bg-almond-silk/30 hover:text-slate-900'
                        }`}
                    >
                        {cat}
                    </button>
                    ))}
                    <div className="w-6 shrink-0 md:hidden"></div>
                </div>
                <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-old-lace to-transparent pointer-events-none md:hidden rounded-r-xl" />
            </div>
            <ViewToggleButton className="hidden md:flex" />
          </div>

        </div>

        {/* --- LIST ITEMS --- */}
        {filteredItems.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-almond-silk border-dashed">
                 <ShoppingBag className="mx-auto text-almond-silk mb-4" size={56}/>
                 <p className="text-slate-500 font-medium">No items available in this category.</p>
                 <button onClick={() => setActiveCategory("All")} className="mt-4 text-flag-red font-bold hover:underline">View All Items</button>
             </div>
        ) : (
            <motion.div 
              key={`${activeCategory}-${viewMode}`} 
              variants={listVariant} 
              initial="hidden" 
              animate="show"
              className={`grid gap-3 md:gap-8 ${
                  viewMode === 'grid' 
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              }`}
            >
              {filteredItems.map(item => {
                const isOutOfStock = item.stock <= 0 || item.isAvailable === false;
                const isLowStock = !isOutOfStock && item.stock <= 5;
                const discount = (item.originalPrice && item.originalPrice > item.price)
                    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) 
                    : 0;

                const isGrid = viewMode === 'grid';
                const imageHeight = isGrid ? 'h-36 xs:h-40 md:h-48' : 'h-64 md:h-72';
                const contentPadding = isGrid ? 'p-3.5' : 'p-5 md:p-6';
                const titleSize = isGrid 
                    ? 'text-sm font-bold leading-tight min-h-[2.5em]' 
                    : 'text-lg md:text-2xl font-heading mb-1';
                const priceSize = isGrid ? 'text-base' : 'text-xl md:text-2xl';

                return (
                    <motion.div
                      key={item.id}
                      variants={cardVariant}
                      exit="exit"
                      layout
                      className={`
                        bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-almond-silk 
                        shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] 
                        transition-all duration-300 flex flex-col h-full group touch-manipulation
                        ${isOutOfStock ? 'opacity-80 grayscale-[0.8]' : ''}
                      `}
                    >
                      <div className={`${imageHeight} w-full overflow-hidden relative shrink-0 bg-old-lace`}>
                        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 flex flex-col items-start gap-1.5">
                            {item.badge && (
                                <div className="bg-white/95 backdrop-blur text-slate-900 text-[10px] md:text-xs font-bold px-2 py-1 rounded-lg shadow-sm border border-white/50">
                                    {item.badge}
                                </div>
                            )}
                            {!isOutOfStock && discount > 0 && (
                                <div className="bg-flag-red text-white text-[10px] md:text-xs font-black px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                    <Tag size={10} className="fill-white"/> SAVE {discount}%
                                </div>
                            )}
                        </div>

                        {isLowStock && (
                              <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm animate-pulse">
                                 {item.stock} LEFT
                             </div>
                        )}

                        {isOutOfStock && (
                              <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-[1px] flex flex-col items-center justify-center">
                                 <div className="bg-red-600 text-white px-4 py-1.5 rounded-xl font-black text-sm tracking-widest border-2 border-white shadow-xl transform -rotate-6">
                                    SOLD OUT
                                 </div>
                             </div>
                        )}

                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className={`w-full h-full object-cover transition-transform duration-700 mix-blend-multiply ${
                              isOutOfStock ? 'scale-100' : 'group-hover:scale-110'
                          }`}
                          loading="lazy"
                          onError={e => e.target.src="https://placehold.co/600x400/f1f5f9/94a3b8?text=Image+Unavailable"}
                        />
                      </div>

                      <div className={`${contentPadding} flex flex-col flex-grow`}>
                        <div className={`flex ${isGrid ? 'flex-col gap-1.5' : 'flex-col md:flex-row md:justify-between'} mb-2`}>
                          <h3 className={`${titleSize} text-slate-800 line-clamp-2`}>
                              {item.name}
                          </h3>
                          
                          <div className={`flex items-baseline ${isGrid ? 'gap-1.5' : 'flex-col md:items-end'} mt-auto`}>
                            {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-[10px] md:text-xs text-slate-400 font-semibold line-through decoration-slate-400/50">
                                    {formatBND(item.originalPrice)}
                                </span>
                            )}
                            <div className="flex items-baseline gap-1">
                                <span className={`${priceSize} font-black tracking-tight ${isOutOfStock ? 'text-slate-400' : 'text-flag-red'}`}>
                                    {formatBND(item.price)}
                                </span>
                                <span className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase">/{item.unit}</span>
                            </div>
                          </div>
                        </div>

                        <p className={`text-slate-500 text-xs md:text-sm mb-4 flex-grow leading-relaxed ${isGrid ? 'hidden md:block' : 'line-clamp-2'}`}>
                          {item.description}
                        </p>

                        <button 
                          onClick={() => handleAddToCartClick(item)}
                          disabled={isOutOfStock}
                          className={`w-full py-2.5 md:py-3.5 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
                            isOutOfStock 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                            : 'bg-slate-900 text-white hover:bg-flag-red hover:shadow-lg hover:shadow-flag-red/20'
                          }`}
                        >
                          {isOutOfStock ? (
                              <> <Ban size={14} /> <span className="hidden xs:inline">Out of Stock</span> </>
                          ) : (
                              <> <Plus size={16} /> {item.options ? "Select" : "Add"} </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                );
              })}
            </motion.div>
        )}
      </div>

      <OptionModal 
        isOpen={!!modalItem} 
        item={modalItem} 
        onClose={() => setModalItem(null)} 
        onConfirm={handleConfirmOption}
        onMixSelect={handleMixSelect}
      />

      <MixModal 
        isOpen={!!mixModalItem}
        baseItem={mixModalItem}
        variants={mixModalItem?.options?.choices || []}
        limit={mixLimit} 
        allowDuplicates={mixModalItem?.allowDuplicate} 
        onClose={() => setMixModalItem(null)}
        onConfirm={handleConfirmMix}
      />
    </section>
  );
};