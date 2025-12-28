import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check } from 'lucide-react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDangerous = false }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                    onClick={onClose}
                />
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-white/50"
                >
                    <div className="p-6 text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border ${isDangerous ? 'bg-red-50 border-red-100 text-flag-red' : 'bg-old-lace border-almond-silk text-slate-800'}`}>
                            <AlertTriangle size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-heading text-slate-900 mb-2">{title}</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => { onConfirm(); onClose(); }}
                            className={`flex-1 py-3 font-bold rounded-xl text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm ${
                                isDangerous 
                                ? 'bg-flag-red hover:bg-red-700 shadow-red-500/20' 
                                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
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