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
                    className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}
                />
                
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-sm rounded-2xl shadow-2xl z-20 overflow-hidden flex flex-col max-h-[85vh]"
                >
                    <div className="p-5 border-b border-old-lace flex justify-between items-center bg-old-lace">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg bbh-hegarty-regular">Customize Bundle</h3>
                            <p className="text-xs text-slate-500">Select exactly {limit} items</p>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200">
                            <X size={20} className="text-slate-400 hover:text-slate-700"/>
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
                                    <div key={variant} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:border-almond-silk transition-colors bg-white">
                                        <span className="text-sm font-bold text-slate-700">{variant}</span>
                                        
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleRemove(variant)}
                                                disabled={count === 0}
                                                className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${count > 0 ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-slate-100 text-slate-300 cursor-not-allowed'}`}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            
                                            <span className={`text-sm font-bold w-4 text-center ${count > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                                                {count}
                                            </span>

                                            <button 
                                                onClick={() => handleAdd(variant)}
                                                disabled={isMaxReached}
                                                className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${!isMaxReached ? 'border-almond-silk text-flag-red hover:bg-old-lace' : 'border-slate-100 text-slate-300 cursor-not-allowed'}`}
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
                                            ? 'border-flag-red bg-old-lace shadow-sm' 
                                            : isDisabled 
                                                ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed' 
                                                : 'border-slate-200 hover:border-almond-silk hover:bg-white'
                                        }
                                    `}
                                >
                                    <span className={`text-sm font-bold ${isSelected ? 'text-flag-red' : 'text-slate-600'}`}>{variant}</span>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-flag-red border-flag-red' : 'border-slate-300 bg-white'}`}>
                                        {isSelected && <Check size={12} className="text-white" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-5 border-t border-old-lace bg-old-lace mt-auto">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Selected</span>
                            <span className={`text-sm font-black ${selectedMix.length === limit ? 'text-green-600' : 'text-flag-red'}`}>
                                {selectedMix.length} / {limit}
                            </span>
                        </div>
                        <button 
                            onClick={() => onConfirm(selectedMix)}
                            disabled={selectedMix.length !== limit}
                            className={`
                                w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg flex justify-center items-center gap-2
                                ${selectedMix.length === limit 
                                    ? 'bg-slate-900 hover:bg-flag-red hover:shadow-flag-red/20 active:scale-[0.98]' 
                                    : 'bg-slate-300 cursor-not-allowed shadow-none'
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