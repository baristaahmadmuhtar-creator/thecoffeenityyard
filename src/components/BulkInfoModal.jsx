import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Star, FileText, DollarSign, Coffee, Briefcase, Truck, MousePointerClick } from 'lucide-react';

const BULK_BENEFITS = [
  {
    title: "One Platform. One Order. One Invoice",
    desc: "Everything is centralized—from menu selection to quantity confirmation and delivery coordination.",
    icon: FileText
  },
  {
    title: "The More You Order, The More You Save",
    desc: "Our pricing is designed to reward scale. Larger quantities = better discounts. Clear tiered pricing. No hidden costs. Perfect for companies and event planners who want value without compromising quality.",
    icon: DollarSign
  },
  {
    title: "Consistent Taste & Quality, Every Batch",
    desc: "Bulk doesn’t mean basic. Every drink and item is prepared using Coffeenityyard’s standard recipes and quality control, ensuring: Same taste, Same presentation, Same experience—just in larger volumes.",
    icon: Coffee
  },
  {
    title: "Ideal for Corporate & Group Needs",
    desc: "Designed specifically for: Corporate meetings & trainings, Office pantry supply, Events & functions, Community gatherings, and Private celebrations. We understand timing, quantities, and professionalism matter.",
    icon: Briefcase
  },
  {
    title: "Reliable Scheduling & Delivery",
    desc: "We plan bulk orders properly. Pre-scheduled preparation, on-time delivery, and clear communication from confirmation to fulfillment. So you can focus on your event—not the logistics.",
    icon: Truck
  },
  {
    title: "Transparent & Easy Ordering Process",
    desc: "Our bulk order website is built for clarity: Simple quantity input, Instant overview of pricing, and Clear discounts applied automatically. No back-and-forth. No confusion.",
    icon: MousePointerClick
  }
];

export const BulkInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}
        />
        
        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="p-6 border-b border-old-lace flex justify-between items-start bg-old-lace sticky top-0 z-20">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight bbh-hegarty-regular">What is Coffeenityyard Bulk Order?</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">Centralized • Organized • Cost-Efficient</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition shadow-sm border border-slate-100">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto scrollbar-thin space-y-8 bg-white">
            <div className="bg-old-lace p-6 rounded-2xl border border-almond-silk space-y-4 text-slate-800 leading-relaxed text-sm md:text-base">
              <p>
                <strong>Coffeenityyard Bulk Order</strong> is a centralized ordering platform designed for customers who need large quantities of coffee, beverages, and selected food items—made simple, organized, and cost-efficient.
              </p>
              <p>
                Whether it’s for <strong>corporate meetings, events, offices, celebrations, or group orders</strong>, our bulk order system allows customers to place one seamless order with better pricing, consistent quality, and reliable delivery—all in one place.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2 bbh-hegarty-regular">
                <Star className="text-flag-red fill-flag-red" size={20}/> Why Order in Bulk with Coffeenityyard?
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {BULK_BENEFITS.map((benefit, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-almond-silk hover:shadow-md transition-all bg-white group">
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-old-lace border border-old-lace flex items-center justify-center text-flag-red group-hover:bg-almond-silk transition-colors">
                        <benefit.icon size={20} />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm md:text-base mb-1.5">{idx + 1}. {benefit.title}</h5>
                      <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-old-lace bg-white sticky bottom-0 z-20">
            <button onClick={onClose} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-flag-red transition shadow-lg flex justify-center items-center gap-2 text-sm md:text-base">
              <ArrowRight size={20} /> Understood, Let's Order
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};