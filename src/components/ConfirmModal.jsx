import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDangerous = false }) => {
    if (!isOpen) return null;

    const vibrate = () => {
        if (navigator.vibrate) navigator.vibrate(5);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                    onClick={onClose}
                />
                <motion.div 
                    initial={{ y: '100%', opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    exit={{ y: '100%', opacity: 0 }} 
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={{ top: 0, bottom: 0.2 }}
                    onDragEnd={(e, { offset, velocity }) => {
                        if (offset.y > 100 || velocity.y > 100) onClose();
                    }}
                    className="bg-white w-full md:max-w-sm rounded-t-[2rem] md:rounded-[2rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border-t border-white/50 max-h-[85vh]"
                >
                    {/* Mobile Drag Handle */}
                    <div className="md:hidden w-full flex justify-center pt-3 pb-1 bg-white cursor-grab active:cursor-grabbing shrink-0" onClick={onClose}>
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                    </div>

                    <div className="p-6 text-center pt-4 md:pt-8 overflow-y-auto custom-scrollbar flex-grow">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border ${isDangerous ? 'bg-red-50 border-red-100 text-flag-red' : 'bg-old-lace border-almond-silk text-slate-800'}`}>
                            <AlertTriangle size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-heading text-slate-900 mb-2 leading-tight">{title}</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed px-2">
                            {message}
                        </p>
                    </div>

                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3 pb-safe-bottom shrink-0">
                        <button 
                            onClick={() => { vibrate(); onClose(); }}
                            className="flex-1 py-3.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95 text-sm uppercase tracking-wide"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => { vibrate(); onConfirm(); onClose(); }}
                            className={`flex-1 py-3.5 font-bold rounded-xl text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-wide ${
                                isDangerous 
                                ? 'bg-flag-red hover:bg-red-700 shadow-red-500/30' 
                                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30'
                            }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};