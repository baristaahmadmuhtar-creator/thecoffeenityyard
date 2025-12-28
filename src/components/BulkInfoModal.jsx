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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}
        />
        
        <motion.div 
          initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden border border-white/50"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-white sticky top-0 z-20">
            <div>
              <h3 className="text-3xl font-heading text-slate-900 leading-none mb-2">Bulk Ordering.</h3>
              <p className="text-slate-500 font-medium">Centralized • Organized • Cost-Efficient</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition shadow-sm">
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto scrollbar-thin space-y-8 bg-white/50">
            <div className="bg-old-lace p-6 rounded-3xl border border-white shadow-sm text-slate-800 leading-relaxed font-medium">
              <p className="mb-4">
                <span className="font-bold text-flag-red">Coffeenityyard Bulk Order</span> is designed for customers who need large quantities of coffee, beverages, and selected food items.
              </p>
              <p>
                Whether it’s for <strong>corporate meetings, events, or celebrations</strong>, place one seamless order with better pricing and reliable delivery.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Star className="text-flag-red fill-flag-red" size={18}/> Key Benefits
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {BULK_BENEFITS.map((benefit, idx) => (
                  <div key={idx} className="flex gap-4 p-5 rounded-2xl border border-white bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
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
          <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-20">
            <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-flag-red transition-all shadow-xl hover:shadow-flag-red/20 flex justify-center items-center gap-2 text-lg active:scale-[0.98]">
              Start Ordering <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};