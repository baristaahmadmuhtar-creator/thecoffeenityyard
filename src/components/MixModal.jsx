import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MixModal = ({ isOpen, onClose, onConfirm, baseItem, variants, limit = 2, allowDuplicates = true }) => {
    const [selectedMix, setSelectedMix] = useState([]);

    // Reset saat dibuka
    useEffect(() => {
        if (isOpen) setSelectedMix([]);
    }, [isOpen]);

    // Hitung jumlah per varian yang sudah dipilih
    const getCount = (variant) => selectedMix.filter(v => v === variant).length;

    // --- LOGIC A: Counter (+ / -) untuk AllowDuplicates = TRUE ---
    const handleAdd = (variant) => {
        if (selectedMix.length < limit) {
            setSelectedMix([...selectedMix, variant]);
        }
    };
    const handleRemove = (variant) => {
        const index = selectedMix.indexOf(variant);
        if (index > -1) {
            const newMix = [...selectedMix];
            newMix.splice(index, 1);
            setSelectedMix(newMix);
        }
    };

    // --- LOGIC B: Toggle (Select/Unselect) untuk AllowDuplicates = FALSE ---
    const handleToggle = (variant) => {
        const isSelected = selectedMix.includes(variant);
        
        if (isSelected) {
            // Jika sudah dipilih, remove
            setSelectedMix(selectedMix.filter(v => v !== variant));
        } else {
            // Jika belum dipilih dan masih ada slot, add
            if (selectedMix.length < limit) {
                setSelectedMix([...selectedMix, variant]);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}
                />
                
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="bg-old-lace w-full max-w-sm rounded-3xl shadow-2xl z-20 overflow-hidden flex flex-col max-h-[85vh] border border-almond-silk"
                >
                    <div className="p-5 border-b border-almond-silk flex justify-between items-center bg-almond-silk/30">
                        <div>
                            <h3 className="font-bold text-flag-red-2 text-xl font-pirata tracking-wide">Customize Bundle</h3>
                            <p className="text-xs text-tomato-jam">Select exactly {limit} items</p>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/50">
                            <X size={20} className="text-tomato-jam hover:text-flag-red-2"/>
                        </button>
                    </div>

                    <div className="p-5 space-y-3 overflow-y-auto custom-scrollbar">
                        {variants.map((variant) => {
                            if (variant.toLowerCase() === 'mixed' || variant.toLowerCase() === 'mix') return null;
                            
                            const count = getCount(variant);
                            const isMaxReached = selectedMix.length >= limit;
                            const isSelected = selectedMix.includes(variant);

                            // RENDER MODE A: ALLOW DUPLICATES (COUNTER STYLE)
                            if (allowDuplicates) {
                                return (
                                    <div key={variant} className="flex justify-between items-center p-3 rounded-xl border border-almond-silk hover:border-flag-red transition-colors bg-white">
                                        <span className="text-sm font-bold text-flag-red-2">{variant}</span>
                                        
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleRemove(variant)}
                                                disabled={count === 0}
                                                className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${count > 0 ? 'border-tomato-jam text-tomato-jam hover:bg-almond-silk' : 'border-almond-silk text-almond-silk cursor-not-allowed'}`}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            
                                            <span className={`text-sm font-bold w-4 text-center ${count > 0 ? 'text-flag-red-2' : 'text-almond-silk'}`}>
                                                {count}
                                            </span>

                                            <button 
                                                onClick={() => handleAdd(variant)}
                                                disabled={isMaxReached}
                                                className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${!isMaxReached ? 'border-flag-red text-flag-red hover:bg-almond-silk' : 'border-almond-silk text-almond-silk cursor-not-allowed'}`}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            // RENDER MODE B: NO DUPLICATES (TOGGLE STYLE)
                            const isDisabled = !isSelected && isMaxReached;
                            return (
                                <div 
                                    key={variant}
                                    onClick={() => !isDisabled && handleToggle(variant)}
                                    className={`
                                        p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all
                                        ${isSelected 
                                            ? 'border-flag-red bg-almond-silk shadow-sm' 
                                            : isDisabled 
                                                ? 'border-almond-silk bg-almond-silk/30 opacity-60 cursor-not-allowed' 
                                                : 'border-almond-silk hover:border-flag-red hover:bg-white'
                                        }
                                    `}
                                >
                                    <span className={`text-sm font-bold ${isSelected ? 'text-flag-red-2' : 'text-tomato-jam'}`}>{variant}</span>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-flag-red border-flag-red' : 'border-almond-silk bg-white'}`}>
                                        {isSelected && <Check size={12} className="text-old-lace" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-5 border-t border-almond-silk bg-old-lace mt-auto">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-tomato-jam uppercase tracking-wider">Total Selected</span>
                            <span className={`text-sm font-black ${selectedMix.length === limit ? 'text-[#25D366]' : 'text-flag-red'}`}>
                                {selectedMix.length} / {limit}
                            </span>
                        </div>
                        <button 
                            onClick={() => onConfirm(selectedMix)}
                            disabled={selectedMix.length !== limit}
                            className={`
                                w-full py-3 rounded-xl font-bold text-old-lace transition-all shadow-lg flex justify-center items-center gap-2
                                ${selectedMix.length === limit 
                                    ? 'bg-flag-red-2 hover:bg-flag-red hover:shadow-flag-red/20 active:scale-[0.98]' 
                                    : 'bg-almond-silk text-tomato-jam/50 cursor-not-allowed shadow-none'
                                }
                            `}
                        >
                            {selectedMix.length === limit ? `Confirm Selection` : `Select ${limit - selectedMix.length} more`}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
