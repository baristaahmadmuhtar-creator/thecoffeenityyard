import React, { useState, useEffect, useMemo, memo } from 'react';
import { Plus, X, Check, Loader2, Ban, ShoppingBag, Tag, LayoutGrid, List, Search, Minus, Layers, UtensilsCrossed, Info, Clock, Users, Package, Utensils } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '../hooks/useMenu'; 
import { useCart } from '../context/CartContext';
import { MixModal } from './MixModal'; 
import { doc, onSnapshot } from 'firebase/firestore'; 
import { db } from '../firebase';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

// --- SUB-COMPONENTS (MEMOIZED FOR PERFORMANCE) ---

const MenuGridItem = memo(({ item, onAdd, onViewDetails, formatBND }) => {
    const isOutOfStock = item.stock <= 0;
    const isLowStock = !isOutOfStock && item.stock <= 5;
    const isBundle = item.mixLimit && Number(item.mixLimit) > 1;
    
    const discount = (item.originalPrice && item.originalPrice > item.price)
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) 
        : 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.98 }}
            className={`
            group relative bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden 
            shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(202,34,42,0.15)]
            transition-all duration-300 flex flex-col h-full
            border border-slate-50 ring-1 ring-slate-100/50 cursor-pointer
            ${isOutOfStock ? 'opacity-80 grayscale-[0.5]' : ''}
            `}
            onClick={() => onViewDetails(item)}
        >
            {/* Image Container */}
            <div 
                className="aspect-[4/3] md:aspect-[4/3] w-full overflow-hidden relative bg-old-lace"
            >
                {/* Badges - Top Left */}
                <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5 pointer-events-none">
                    {item.badge && (
                        <div className="bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full shadow-sm border border-slate-100 uppercase">
                            {item.badge}
                        </div>
                    )}
                    {!isOutOfStock && discount > 0 && (
                        <div className="bg-flag-red text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <Tag size={10} className="fill-white"/> -{discount}%
                        </div>
                    )}
                </div>

                {/* Status Overlays - Top Right */}
                {isLowStock && (
                    <div className="absolute top-3 right-3 z-10 bg-orange-50/90 backdrop-blur text-orange-600 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm border border-orange-100 uppercase tracking-wide pointer-events-none">
                        {item.stock} Left
                    </div>
                )}

                {/* Bundle Indicator - Bottom Left - IMPROVED CLARITY */}
                {isBundle && (
                    <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 pointer-events-none border border-white/10">
                        <Layers size={12} className="text-pastry-yellow"/> 
                        <span className="uppercase tracking-wider">Multi-Pack</span>
                    </div>
                )}

                {/* Quick Add Button - Bottom Right - EMPHASIZED SPEED */}
                {!isOutOfStock && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onAdd(item); }}
                        className="absolute bottom-3 right-3 z-20 w-10 h-10 bg-white rounded-full text-slate-900 shadow-lg hover:bg-flag-red hover:text-white transition-all active:scale-90 flex items-center justify-center border border-slate-100 group-hover:scale-110"
                        aria-label={`Quick add ${item.name}`}
                    >
                        <Plus size={22} strokeWidth={3}/>
                    </button>
                )}

                {isOutOfStock && (
                    <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-flag-red pointer-events-none">
                        <div className="bg-white p-3 rounded-full shadow-xl mb-2 border border-slate-100">
                            <Ban size={24} className="opacity-100 text-flag-red"/>
                        </div>
                        <span className="font-black tracking-widest text-xs uppercase bg-white/90 px-4 py-1.5 rounded-full shadow-sm border border-slate-100">Sold Out</span>
                    </div>
                )}

                <img 
                    src={item.image} 
                    alt={item.name} 
                    className={`w-full h-full object-cover transition-transform duration-700 mix-blend-multiply ${
                        isOutOfStock ? 'scale-100' : 'group-hover:scale-110'
                    }`}
                    loading="lazy"
                    onError={e => e.target.src="https://placehold.co/600x400/FDF2E3/CA222A?text=Image+Unavailable"}
                />
            </div>

            {/* Content */}
            <div className="p-4 md:p-5 flex flex-col flex-grow relative">
                <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="font-bold text-slate-900 leading-tight text-base line-clamp-2 font-heading tracking-tight" title={item.name}>
                        {item.name}
                    </h3>
                </div>

                <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4 font-medium">
                    {item.description}
                </p>

                <div className="mt-auto pt-4 flex items-center justify-between gap-4 border-t border-dashed border-slate-100">
                    <div className="flex flex-col min-w-0">
                        {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-[10px] text-slate-400 line-through font-bold">
                                {formatBND(item.originalPrice)}
                            </span>
                        )}
                        <div className="flex items-baseline gap-1">
                            <span className={`text-lg font-black tracking-tight ${isOutOfStock ? 'text-slate-400' : 'text-flag-red'}`}>
                                {formatBND(item.price)}
                            </span>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">/{item.unit}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

const MenuListItem = memo(({ item, onAdd, onViewDetails, formatBND }) => {
    const isOutOfStock = item.stock <= 0;
    const isBundle = item.mixLimit && Number(item.mixLimit) > 1;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onViewDetails(item)}
            className={`flex gap-3 md:gap-4 p-3 md:p-4 rounded-[1.5rem] md:rounded-3xl border transition-all cursor-pointer ${
                isOutOfStock 
                ? 'bg-slate-50 border-slate-100 opacity-60 grayscale' 
                : 'bg-white border-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(202,34,42,0.08)]'
            }`}
        >
            <div 
                className="w-24 h-24 sm:w-32 sm:h-32 bg-old-lace rounded-2xl overflow-hidden shrink-0 relative"
            >
                <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" loading="lazy" onError={e => e.target.src="https://placehold.co/600x400/FDF2E3/CA222A?text=No+Image"} />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase text-flag-red border border-flag-red px-2 py-1 rounded-md bg-white">Sold Out</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col flex-grow py-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col pr-2">
                        <h3 className="font-bold text-slate-900 text-base md:text-lg leading-tight font-heading line-clamp-2">{item.name}</h3>
                        {isBundle && (
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                                <Layers size={10} className="text-flag-red"/> Multi-Pack
                            </div>
                        )}
                    </div>
                    <span className="text-flag-red font-black text-base md:text-lg whitespace-nowrap">{formatBND(item.price)}</span>
                </div>
                <p 
                    className="text-slate-500 text-xs line-clamp-2 mt-1 mb-2 leading-relaxed font-medium"
                >
                    {item.description}
                </p>
                
                <div className="mt-auto flex justify-between items-end gap-4">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider shrink-0">{item.category}</span>
                    
                    {/* Quick Add Button for List View */}
                    {!isOutOfStock && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAdd(item); }}
                            className="p-2.5 bg-slate-900 rounded-xl text-white shadow-md hover:bg-flag-red transition-all active:scale-90 flex items-center justify-center"
                            aria-label={`Quick add ${item.name}`}
                        >
                            <Plus size={18} strokeWidth={3}/>
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

const ProductDetailModal = ({ item, isOpen, onClose, onAdd, formatBND }) => {
    useBodyScrollLock(isOpen);
    if (!isOpen || !item) return null;
    const isBundle = item.mixLimit && Number(item.mixLimit) > 1;
    const isOutOfStock = item.stock <= 0;
    
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} 
                />
                <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
                    transition={{ type: "spring", damping: 25, stiffness: 300 }} 
                    drag={window.innerWidth < 768 ? "y" : false} 
                    dragConstraints={{ top: 0, bottom: 0 }} 
                    dragElastic={{ top: 0, bottom: 0.2 }} 
                    onDragEnd={(e, { offset, velocity }) => { if (offset.y > 100 || velocity.y > 100) onClose(); }} 
                    className="bg-white w-full md:max-w-4xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col md:flex-row h-[90dvh] md:h-auto md:max-h-[85vh] overflow-hidden md:border border-white/50"
                >
                    {/* Handle for mobile */}
                    <div className="md:hidden w-full flex justify-center pt-3 pb-1 absolute top-0 left-0 z-20 pointer-events-none">
                        <div className="w-12 h-1.5 bg-white/80 rounded-full shadow-sm backdrop-blur-sm" />
                    </div>
                    
                    <div className="relative h-64 md:h-auto md:w-1/2 bg-old-lace shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" onError={e => e.target.src="https://placehold.co/600x400/FDF2E3/CA222A?text=Image+Unavailable"}/>
                        <button onClick={onClose} className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full hover:bg-white hover:text-red-500 transition-colors shadow-sm z-30 active:scale-95"><X size={24} className="text-slate-900"/></button>
                        {item.badge && (<div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg z-20">{item.badge}</div>)}
                    </div>
                    
                    <div className="flex flex-col md:w-1/2 flex-1 min-h-0 bg-white relative">
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow">
                            <div className="flex flex-col justify-between items-start gap-2 mb-6">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-heading text-slate-900 leading-none mb-3">{item.name}</h2>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-old-lace text-slate-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{item.category}</span>
                                        {isBundle && (<span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Layers size={12}/> Potluck Package</span>)}
                                    </div>
                                </div>
                                <div className="mt-4 pb-4 border-b border-dashed border-slate-200 w-full">
                                    <span className="block text-4xl font-black text-flag-red tracking-tight">{formatBND(item.price)}</span>
                                    <span className="text-slate-400 font-bold text-xs uppercase">Price per {item.unit}</span>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2 text-sm uppercase tracking-wide"><Info size={16} className="text-flag-red"/> Description</h4>
                                    <p className="text-slate-600 leading-relaxed font-medium">{item.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm"><Users size={20}/></div>
                                        <div><p className="text-[10px] text-slate-400 font-bold uppercase">Min Order</p><p className="font-bold text-slate-900">{item.minQty} {item.unit}</p></div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-xl text-orange-600 shadow-sm"><Clock size={20}/></div>
                                        <div><p className="text-[10px] text-slate-400 font-bold uppercase">Prep Time</p><p className="font-bold text-slate-900">{item.prepTime || 24} Hours</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-white z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] pb-safe-bottom shrink-0">
                            <button onClick={() => { onAdd(item); onClose(); }} disabled={isOutOfStock} className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${isOutOfStock ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-flag-red hover:shadow-flag-red/20 active:scale-95'}`}>
                                {isOutOfStock ? 'Sold Out' : (isBundle ? <><UtensilsCrossed size={20}/> Configure Package</> : <><ShoppingBag size={20}/> Add to Tray</>)}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const OptionModal = ({ item, isOpen, onClose, onConfirm, onMixSelect }) => {
    const [selected, setSelected] = useState('');
    const [qty, setQty] = useState(1);
    useBodyScrollLock(isOpen);
    
    useEffect(() => { 
        if (item) { 
            setQty(item.minQty || 1); 
            setSelected(item.options?.choices?.[0] || ''); 
        } 
    }, [item]);
    
    const handleSelect = (choice) => { setSelected(choice); if (navigator.vibrate) navigator.vibrate(5); };
    if (!isOpen || !item || !item.options || !item.options.choices) return null;
    
    const handleConfirm = () => { 
        if (selected.toLowerCase() === 'mixed' || selected.toLowerCase() === 'mix') { 
            onMixSelect(item); 
        } else { 
            onConfirm(selected, qty); 
        } 
    };
    
    const increaseQty = () => { setQty(q => q + 1); if(navigator.vibrate) navigator.vibrate(5); };
    const decreaseQty = () => { setQty(q => (q > (item.minQty || 1) ? q - 1 : q)); if(navigator.vibrate) navigator.vibrate(5); };
    const isMixSelected = selected.toLowerCase() === 'mixed' || selected.toLowerCase() === 'mix';
    
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
                <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
                    transition={{ type: "spring", damping: 25, stiffness: 300 }} 
                    drag={window.innerWidth < 768 ? "y" : false} 
                    dragConstraints={{ top: 0, bottom: 0 }} 
                    dragElastic={{ top: 0, bottom: 0.2 }} 
                    onDragEnd={(e, { offset, velocity }) => { if (offset.y > 100 || velocity.y > 100) onClose(); }} 
                    className="bg-old-lace w-full md:max-w-sm rounded-t-[2rem] md:rounded-[2rem] shadow-2xl z-10 overflow-hidden border-t border-white/50 max-h-[85vh] flex flex-col relative" 
                    role="dialog" aria-modal="true"
                >
                    <div className="md:hidden w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing" onClick={onClose}><div className="w-12 h-1.5 bg-slate-300 rounded-full" /></div>
                    
                    <div className="p-6 pb-4 flex justify-between items-center bg-old-lace sticky top-0 z-20 border-b border-almond-silk/50 shrink-0">
                        <div className="pr-4">
                            <h3 className="font-heading text-2xl text-slate-900 leading-none">{item.name}</h3>
                            <p className="text-flag-red font-bold text-xs uppercase tracking-widest mt-1">{item.options.title || 'Select Options'}</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white hover:bg-almond-silk rounded-full transition-colors text-slate-400 hover:text-slate-900 shadow-sm active:scale-95" aria-label="Close"><X size={20}/></button>
                    </div>
                    
                    <div className="p-6 pt-4 space-y-3 overflow-y-auto custom-scrollbar flex-grow bg-old-lace">
                        {item.options.choices.map((choice) => (
                            <motion.div 
                                key={choice} 
                                whileTap={{ scale: 0.98 }} 
                                onClick={() => handleSelect(choice)} 
                                className={`p-4 rounded-xl cursor-pointer flex justify-between items-center transition-all duration-200 border-2 ${selected === choice ? 'border-flag-red bg-white text-flag-red font-bold shadow-md ring-1 ring-flag-red/20' : 'border-white bg-white/50 text-slate-600 hover:bg-white hover:border-almond-silk'}`}
                            >
                                <span className="text-sm font-bold">{choice}</span>
                                {selected === choice && <div className="bg-flag-red text-white p-1 rounded-full"><Check size={14} strokeWidth={4}/></div>}
                            </motion.div>
                        ))}
                    </div>
                    
                    <div className="p-6 pt-4 border-t border-almond-silk/50 bg-white pb-safe-bottom space-y-4 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                        {!isMixSelected && (
                            <div className="flex justify-between items-center bg-old-lace p-2 rounded-xl">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-3">Quantity</span>
                                <div className="flex items-center gap-3 bg-white rounded-lg p-1 shadow-sm">
                                    <button onClick={decreaseQty} disabled={qty <= (item.minQty || 1)} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors disabled:opacity-30 text-slate-800 active:scale-90"><Minus size={18} strokeWidth={2.5}/></button>
                                    <span className="w-8 text-center font-black text-lg text-slate-900">{qty}</span>
                                    <button onClick={increaseQty} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors text-slate-800 active:scale-90"><Plus size={18} strokeWidth={2.5}/></button>
                                </div>
                            </div>
                        )}
                        <button onClick={handleConfirm} className="w-full py-4 bg-slate-900 hover:bg-flag-red text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-flag-red/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg">
                            {isMixSelected ? 'Start Building Mix' : `Add ${qty} to Tray`}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// --- MAIN COMPONENT ---

export const MenuSection = ({ onModalChange }) => {
  const [activeMenuTab, setActiveMenuTab] = useState('alacarte'); // 'alacarte' | 'potluck'
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); 
  const [searchTerm, setSearchTerm] = useState("");
  
  // MODAL STATES
  const [modalItem, setModalItem] = useState(null); // Options Modal
  const [mixModalItem, setMixModalItem] = useState(null); // Bundle Mix Modal
  const [viewModalItem, setViewModalItem] = useState(null); // New Product Detail Modal

  const { addToCart, formatBND } = useCart();
  const { menuItems, loadingMenu, errorMenu } = useMenu();

  const [categories, setCategories] = useState(["All", "Foods", "Desserts", "Coffee", "Others"]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "categories"), (doc) => {
        if (doc.exists() && doc.data().list) {
            setCategories(["All", ...doc.data().list]);
        }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (onModalChange) {
        onModalChange(!!modalItem || !!mixModalItem || !!viewModalItem);
    }
  }, [modalItem, mixModalItem, viewModalItem, onModalChange]);

  const filteredItems = useMemo(() => {
      return menuItems.filter(item => {
          if (item.isAvailable === false) return false;
          
          // SEARCH FILTER
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = !searchTerm || 
                                item.name.toLowerCase().includes(searchLower) || 
                                item.description?.toLowerCase().includes(searchLower);
          
          // STRICT TAB SEPARATION LOGIC
          const itemCategory = item.category || '';
          
          // Is it a Potluck item? ONLY if category IS "Potluck" (case-insensitive)
          const isPotluckCategory = itemCategory.toLowerCase() === 'potluck';

          // Tab Filtering
          let matchesTab = false;
          if (activeMenuTab === 'potluck') {
              matchesTab = isPotluckCategory;
          } else {
              // Ala Carte Tab: Show everything EXCEPT Potluck category
              matchesTab = !isPotluckCategory;
          }

          // Category Sub-filter (Only for Ala Carte really, as Potluck usually just has one list)
          let matchesCategoryFilter = true;
          if (activeMenuTab === 'alacarte') {
              matchesCategoryFilter = activeCategory === "All" || itemCategory === activeCategory;
          }

          return matchesTab && matchesCategoryFilter && matchesSearch;
      });
  }, [menuItems, activeCategory, searchTerm, activeMenuTab]);

  const getPriceFromOption = (optionStr, defaultPrice) => {
      const match = optionStr.match(/\$(\d+(\.\d+)?)/);
      return match ? parseFloat(match[1]) : defaultPrice;
  };

  const handleAddToCartClick = (item) => {
      if (item.stock <= 0) return; 
      
      if (item.options) {
          if (item.allowDuplicate === true || (item.mixLimit && Number(item.mixLimit) > 1)) {
              setMixModalItem(item);
          } else {
              setModalItem(item); 
          }
      } else {
          addToCart(item, item.minQty || 1); 
      }
  };

  const handleConfirmOption = (choice, quantity) => {
      if (modalItem) {
          const price = getPriceFromOption(choice, modalItem.price);
          addToCart(modalItem, quantity, choice, price); 
          setModalItem(null);
      }
  };

  const handleMixSelect = (item) => {
      setModalItem(null); 
      setTimeout(() => setMixModalItem(item), 150); 
  };

  const handleConfirmMix = (selectedVariants, bundleQty) => {
      if (mixModalItem) {
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

          addToCart(mixModalItem, bundleQty, mixString, avgPrice);
          setMixModalItem(null);
      }
  };

  const getMixLimit = (item) => {
      if (!item) return 2;
      return item.mixLimit ? Number(item.mixLimit) : (item.minQty > 1 ? Number(item.minQty) : 2);
  };

  const mixLimit = getMixLimit(mixModalItem);

  const ViewToggleButton = ({ className }) => (
      <div className={`flex bg-white/50 backdrop-blur-sm p-1 rounded-full shrink-0 border border-white shadow-sm ${className}`}>
        <button 
            onClick={() => { setViewMode('grid'); if(navigator.vibrate) navigator.vibrate(5); }}
            className={`p-2.5 rounded-full transition-all flex items-center justify-center active:scale-90 ${
                viewMode === 'grid' ? 'bg-flag-red text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
            aria-label="Grid View"
        >
            <LayoutGrid size={18} strokeWidth={2.5}/>
        </button>
        <button 
            onClick={() => { setViewMode('list'); if(navigator.vibrate) navigator.vibrate(5); }}
            className={`p-2.5 rounded-full transition-all flex items-center justify-center active:scale-90 ${
                viewMode === 'list' ? 'bg-flag-red text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
            aria-label="List View"
        >
            <List size={18} strokeWidth={2.5}/>
        </button>
    </div>
  );

  const listVariant = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  if (loadingMenu) {
      return (
          <section id="menu" className="py-24 min-h-[50vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-flag-red" size={40} />
                <span className="text-slate-400 font-medium tracking-widest text-xs uppercase">Loading Menu...</span>
              </div>
          </section>
      );
  }

  if (errorMenu) {
      return (
          <section id="menu" className="py-24 text-center">
              <h2 className="text-4xl font-heading text-red-600 mb-4">Connection Error</h2>
              <p className="text-lg text-slate-600">{errorMenu}</p>
          </section>
      );
  }

  return (
    <section id="menu" className="relative z-20 min-h-screen container mx-auto px-3 md:px-6">
        
        {/* --- PAGE TITLE (SCROLLS AWAY) --- */}
        <div className="mb-6 mt-4 md:mt-8">
            <div className="flex flex-col gap-1 px-1">
                <span className="text-flag-red font-bold tracking-widest uppercase text-xs">Bulk & Event Orders, Made Simple</span>
                <h1 className="text-4xl md:text-6xl font-heading tracking-tight text-slate-900 leading-[0.9]">Our Menu</h1>
                <p className="text-slate-500 text-sm font-medium mt-2 max-w-md">Curated bundles for your perfect gathering. Freshly prepared and delivered.</p>
            </div>
        </div>

        {/* --- MAIN TAB SWITCHER (Improved Context) --- */}
        <div className="mb-8 px-4 md:px-0 flex flex-col items-center">
            <div className="bg-white/60 backdrop-blur-md rounded-full p-1.5 border border-white shadow-sm flex items-center w-full max-w-[360px] mx-auto relative isolate overflow-hidden ring-1 ring-slate-200/50">
                {/* Sliding Background */}
                <div 
                    className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-flag-red rounded-full shadow-md transition-transform duration-300 ease-out z-0`}
                    style={{ 
                        left: '6px',
                        transform: activeMenuTab === 'alacarte' ? 'translateX(0)' : 'translateX(calc(100% + 6px))'
                    }}
                />
                
                <button 
                    onClick={() => { setActiveMenuTab('alacarte'); setActiveCategory('All'); if(navigator.vibrate) navigator.vibrate(5); }}
                    className={`flex-1 relative z-10 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors duration-300 active:scale-95 ${
                        activeMenuTab === 'alacarte' ? 'text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Utensils size={16} strokeWidth={2.5} className={`shrink-0 ${activeMenuTab === 'alacarte' ? 'text-old-lace' : 'text-slate-400'}`} />
                    <span className={activeMenuTab === 'alacarte' ? 'text-old-lace' : ''}>Ala Carte</span>
                </button>
                <button 
                    onClick={() => { setActiveMenuTab('potluck'); setActiveCategory('All'); if(navigator.vibrate) navigator.vibrate(5); }}
                    className={`flex-1 relative z-10 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors duration-300 active:scale-95 ${
                        activeMenuTab === 'potluck' ? 'text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Package size={16} strokeWidth={2.5} className={`shrink-0 ${activeMenuTab === 'potluck' ? '' : 'text-slate-400'}`} />
                    <span className={activeMenuTab === 'potluck' ? 'text-old-lace' : ''}>Potluck</span>
                </button>
            </div>
            
            {/* Helper Text below tabs */}
            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {activeMenuTab === 'alacarte' ? 'Individual Trays & Items' : 'Curated Packages & Bundles'}
            </div>
        </div>

        {/* --- FILTER BAR (ONLY VISIBLE IN ALA CARTE MODE) --- */}
        {activeMenuTab === 'alacarte' && (
            <div className="mb-6 px-1">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative group w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-flag-red transition-colors" />
                        </div>
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search cravings..."
                            className="block w-full pl-10 pr-10 py-3 border border-white/60 rounded-2xl leading-5 bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-flag-red/20 focus:border-flag-red transition-all shadow-sm font-medium text-sm"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                <X size={16} className="bg-slate-200 rounded-full p-0.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 overflow-hidden">
                        {/* Horizontal Scrollable Categories */}
                        <div className="relative flex-grow min-w-0 bg-white/50 p-1.5 rounded-2xl md:rounded-full border border-white/50 shadow-sm overflow-hidden">
                            <div className="flex gap-1 w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                                {categories.filter(c => c.toLowerCase() !== "potluck").map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`
                                        relative snap-center shrink-0 px-4 py-2.5 md:px-6 rounded-xl md:rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap z-10 active:scale-95
                                        ${activeCategory === cat ? 'text-white' : 'text-slate-600 hover:text-flag-red'}
                                    `}
                                >
                                    {activeCategory === cat && (
                                        <motion.div
                                            layoutId="activeCategory"
                                            className="absolute inset-0 bg-flag-red rounded-xl md:rounded-full shadow-md -z-10"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    {cat}
                                </button>
                                ))}
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent pointer-events-none md:hidden rounded-r-2xl"/>
                        </div>
                        
                        {/* View Toggle */}
                        <div className="shrink-0 hidden sm:block">
                            <ViewToggleButton />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ITEMS */}
        <div className="mt-4 min-h-[50vh]">
            {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white/40 rounded-[3rem] border border-white border-dashed text-center px-4">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <ShoppingBag className="text-slate-300" size={32} strokeWidth={1.5}/>
                    </div>
                    <h3 className="text-xl font-heading text-slate-900 mb-2">No items found</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">
                        {activeMenuTab === 'potluck' 
                            ? "No Potluck packages available yet." 
                            : (searchTerm ? `We couldn't find anything matching "${searchTerm}"` : "This category is currently empty.")}
                    </p>
                    {activeMenuTab === 'alacarte' && (
                        <button onClick={() => { setActiveCategory("All"); setSearchTerm(""); }} className="mt-6 px-6 py-3 bg-white text-flag-red font-bold rounded-xl border border-slate-200 hover:bg-flag-red hover:text-white transition-colors shadow-sm text-sm active:scale-95">
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <motion.div 
                key={`${activeCategory}-${viewMode}-${searchTerm}-${activeMenuTab}`} 
                variants={listVariant} 
                initial="hidden" 
                animate="show"
                className={`grid gap-4 md:gap-6 ${
                    viewMode === 'grid' 
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                }`}
                >
                {filteredItems.map(item => (
                    viewMode === 'grid' 
                    ? <MenuGridItem 
                        key={item.id} 
                        item={item} 
                        onAdd={handleAddToCartClick} 
                        onViewDetails={setViewModalItem}
                        formatBND={formatBND} 
                      />
                    : <MenuListItem 
                        key={item.id} 
                        item={item} 
                        onAdd={handleAddToCartClick} 
                        onViewDetails={setViewModalItem}
                        formatBND={formatBND} 
                      />
                ))}
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

        <ProductDetailModal 
            isOpen={!!viewModalItem}
            item={viewModalItem}
            onClose={() => setViewModalItem(null)}
            onAdd={handleAddToCartClick}
            formatBND={formatBND}
        />
    </section>
  );
};