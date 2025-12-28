import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MixModal = ({ isOpen, onClose, onConfirm, baseItem, variants, limit = 2, allowDuplicates = true }) => {
    const [selectedMix, setSelectedMix] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setSelectedMix([]);
        }
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const getCount = (variant) => selectedMix.filter(v => v === variant).length;

    const vibrate = () => {
        if (navigator.vibrate) navigator.vibrate(10);
    };

    const handleAdd = (variant) => {
        if (selectedMix.length < limit) {
            setSelectedMix([...selectedMix, variant]);
            vibrate();
        }
    };
    const handleRemove = (variant) => {
        const index = selectedMix.indexOf(variant);
        if (index > -1) {
            const newMix = [...selectedMix];
            newMix.splice(index, 1);
            setSelectedMix(newMix);
            vibrate();
        }
    };

    const handleToggle = (variant) => {
        const isSelected = selectedMix.includes(variant);
        if (isSelected) {
            setSelectedMix(selectedMix.filter(v => v !== variant));
        } else {
            if (selectedMix.length < limit) {
                setSelectedMix([...selectedMix, variant]);
            }
        }
        vibrate();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}
                />
                
                <motion.div 
                    initial={{ y: '100%' }} 
                    animate={{ y: 0 }} 
                    exit={{ y: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={{ top: 0, bottom: 0.2 }}
                    onDragEnd={(e, { offset, velocity }) => {
                        if (offset.y > 100 || velocity.y > 100) onClose();
                    }}
                    className="bg-old-lace w-full md:max-w-sm rounded-t-[2rem] md:rounded-[2rem] shadow-2xl z-20 overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] border-t border-white/50 relative"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mix-modal-title"
                >
                    {/* Mobile Drag Handle */}
                    <div className="md:hidden w-full flex justify-center pt-3 pb-1 bg-old-lace" onClick={onClose}>
                        <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                    </div>

                    <div className="p-6 pt-2 md:pt-6 border-b border-almond-silk/50 flex justify-between items-center bg-old-lace sticky top-0 z-10 shrink-0">
                        <div>
                            <h3 id="mix-modal-title" className="font-heading text-2xl text-slate-900 leading-tight pr-2">{baseItem?.name || 'Build Bundle'}</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">Pick <span className="font-bold text-flag-red">{limit}</span> items to complete bundle</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white hover:bg-almond-silk rounded-full transition-colors shrink-0 shadow-sm" aria-label="Close">
                            <X size={20} className="text-slate-500"/>
                        </button>
                    </div>

                    <div className="p-6 space-y-3 overflow-y-auto custom-scrollbar flex-grow bg-old-lace">
                        {variants.map((variant) => {
                            if (variant.toLowerCase() === 'mixed' || variant.toLowerCase() === 'mix') return null;
                            
                            const count = getCount(variant);
                            const isMaxReached = selectedMix.length >= limit;
                            const isSelected = selectedMix.includes(variant);

                            if (allowDuplicates) {
                                return (
                                    <div key={variant} className={`flex justify-between items-center p-4 rounded-xl border transition-colors shadow-sm ${count > 0 ? 'bg-white border-flag-red ring-1 ring-flag-red/10' : 'bg-white border-white'}`}>
                                        <span className={`text-sm font-bold ${count > 0 ? 'text-slate-900' : 'text-slate-600'}`}>{variant}</span>
                                        
                                        <div className="flex items-center gap-3 bg-old-lace rounded-lg p-1 border border-almond-silk/50">
                                            <button 
                                                onClick={() => handleRemove(variant)}
                                                disabled={count === 0}
                                                className={`w-9 h-9 flex items-center justify-center rounded-md transition-all active:scale-90 ${count > 0 ? 'bg-white shadow text-slate-900 hover:text-red-500' : 'text-slate-300 cursor-not-allowed'}`}
                                            >
                                                <Minus size={16} strokeWidth={2.5} />
                                            </button>
                                            
                                            <span className={`text-base font-black w-6 text-center ${count > 0 ? 'text-flag-red' : 'text-slate-300'}`}>
                                                {count}
                                            </span>

                                            <button 
                                                onClick={() => handleAdd(variant)}
                                                disabled={isMaxReached}
                                                className={`w-9 h-9 flex items-center justify-center rounded-md transition-all active:scale-90 ${!isMaxReached ? 'bg-white shadow text-slate-900 hover:text-flag-red' : 'text-slate-300 cursor-not-allowed'}`}
                                            >
                                                <Plus size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            const isDisabled = !isSelected && isMaxReached;
                            return (
                                <div 
                                    key={variant}
                                    onClick={() => !isDisabled && handleToggle(variant)}
                                    className={`
                                        p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all shadow-sm active:scale-98
                                        ${isSelected 
                                            ? 'border-flag-red bg-white ring-1 ring-flag-red' 
                                            : isDisabled 
                                                ? 'border-white bg-slate-50 opacity-60 cursor-not-allowed' 
                                                : 'border-white hover:border-almond-silk bg-white'
                                        }
                                    `}
                                >
                                    <span className={`text-sm font-bold ${isSelected ? 'text-flag-red' : 'text-slate-600'}`}>{variant}</span>
                                    {isSelected && <div className="bg-flag-red text-white p-1 rounded-full shadow-sm"><Check size={14} strokeWidth={3}/></div>}
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-6 border-t border-almond-silk/50 bg-white mt-auto space-y-4 pb-safe-bottom shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                        {/* Progress Bar */}
                        <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bundle Progress</span>
                            <div className="flex gap-1.5">
                                {Array.from({length: limit}).map((_, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={false}
                                        animate={{ 
                                            backgroundColor: i < selectedMix.length ? '#CA222A' : '#E2E8F0',
                                            scale: i < selectedMix.length ? 1.2 : 1
                                        }}
                                        className={`w-3 h-3 rounded-full transition-colors`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={() => onConfirm(selectedMix, 1)}
                            disabled={selectedMix.length !== limit}
                            className={`
                                w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex justify-center items-center gap-2
                                ${selectedMix.length === limit 
                                    ? 'bg-slate-900 hover:bg-flag-red hover:shadow-flag-red/20 active:scale-[0.98]' 
                                    : 'bg-slate-300 cursor-not-allowed shadow-none'
                                }
                            `}
                        >
                            {selectedMix.length === limit ? `Add Bundle to Tray` : `Select ${limit - selectedMix.length} more item(s)`}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};