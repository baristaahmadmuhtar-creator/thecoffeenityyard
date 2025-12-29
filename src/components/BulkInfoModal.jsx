import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Star, FileText, DollarSign, Coffee, Briefcase, Truck, MousePointerClick } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const BULK_BENEFITS = [
  {
    title: "One Platform. One Order.",
    desc: "Everything is centralized—from menu selection to quantity confirmation and delivery coordination.",
    icon: FileText
  },
  {
    title: "Volume Discounts",
    desc: "Larger quantities = better discounts. Clear tiered pricing with no hidden costs.",
    icon: DollarSign
  },
  {
    title: "Consistent Quality",
    desc: "Every batch is prepared using standard recipes ensuring the same taste and presentation.",
    icon: Coffee
  },
  {
    title: "Corporate Ready",
    desc: "Perfect for meetings, trainings, pantry supply, and company events.",
    icon: Briefcase
  },
  {
    title: "Reliable Scheduling",
    desc: "Pre-scheduled preparation and on-time delivery so you can focus on your event.",
    icon: Truck
  },
  {
    title: "Instant Pricing",
    desc: "Simple quantity input with an instant overview of pricing and discounts.",
    icon: MousePointerClick
  }
];

export const BulkInfoModal = ({ isOpen, onClose }) => {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}
        />
        
        <motion.div 
          initial={{ y: "100%" }} 
          animate={{ y: 0 }} 
          exit={{ y: "100%" }} 
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.2 }}
          onDragEnd={(e, { offset, velocity }) => {
             if (offset.y > 100 || velocity.y > 100) onClose();
          }}
          className="bg-white w-full max-w-3xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col h-[92vh] md:h-auto md:max-h-[85vh] overflow-hidden border-t border-white/50"
        >
          {/* Mobile Drag Handle */}
          <div className="md:hidden w-full flex justify-center pt-3 pb-1 bg-white shrink-0 cursor-grab active:cursor-grabbing" onClick={onClose}>
             <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-white sticky top-0 z-20 shrink-0">
            <div>
              <h3 className="text-2xl md:text-3xl font-heading text-slate-900 leading-none mb-2">Bulk Ordering.</h3>
              <p className="text-slate-500 font-medium text-sm md:text-base">Centralized • Organized • Cost-Efficient</p>
            </div>
            <button onClick={onClose} className="p-2.5 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition shadow-sm active:scale-95">
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-8 bg-slate-50/50 flex-grow">
            <div className="bg-white p-6 rounded-3xl border border-white shadow-sm text-slate-700 leading-relaxed font-medium">
              <p className="mb-4">
                <span className="font-bold text-flag-red bg-red-50 px-1 rounded">Coffeenityyard Bulk Order</span> is designed for customers who need large quantities of coffee, beverages, and selected food items.
              </p>
              <p>
                Whether it’s for <strong>corporate meetings, events, or celebrations</strong>, place one seamless order with better pricing and reliable delivery.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Star className="text-flag-red fill-flag-red" size={18}/> Key Benefits
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BULK_BENEFITS.map((benefit, idx) => (
                  <div key={idx} className="flex gap-4 p-5 rounded-2xl border border-white bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all group active:scale-[0.99]">
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-old-lace flex items-center justify-center text-flag-red group-hover:bg-flag-red group-hover:text-white transition-all duration-300 shadow-sm border border-almond-silk/50">
                        <benefit.icon size={20} />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-base mb-1">{benefit.title}</h5>
                      <p className="text-sm text-slate-500 leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-20 pb-safe-bottom shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-flag-red transition-all shadow-xl hover:shadow-flag-red/30 flex justify-center items-center gap-2 text-lg active:scale-[0.97]">
              Start Ordering <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};