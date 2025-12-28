import React from 'react';
import { Sparkles, ArrowRight, Info, ChefHat, Mouse } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

export const Hero = ({ openAI, openBulkInfo }) => {
  const { scrollY } = useScroll();
  
  // Parallax Effect
  const yText = useTransform(scrollY, [0, 500], [0, 100]);
  const opacityText = useTransform(scrollY, [0, 300], [1, 0]); 

  const handleAIClick = async () => {
      try {
          const docRef = doc(db, "settings", "ai");
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data().isUnderMaintenance) {
              toast.error("AI Planner is currently under maintenance.", {
                  icon: '🚧',
                  style: {
                      background: '#FFF7ED',
                      color: '#9A3412',
                      border: '1px solid #FFEDD5',
                      fontWeight: 'bold'
                  }
              });
          } else {
              openAI();
          }
      } catch (error) {
          console.error("Error checking AI status:", error);
          openAI();
      }
  };

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden py-20">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-old-lace pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-almond-silk/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob will-change-transform"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-flag-red/5 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000 will-change-transform"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-16">
        <motion.div 
          style={{ y: yText, opacity: opacityText }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-6xl mx-auto text-center space-y-12 will-change-transform"
        >

          {/* HEADLINE */}
          <div className="flex flex-col items-center">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-sm mb-8"
            >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-flag-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-flag-red"></span>
                </span>
                <span className="text-flag-red text-[10px] md:text-xs font-bold tracking-widest uppercase font-sans">
                  Bulk & Event Orders, Made Simple
                </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-9xl font-heading font-normal leading-[0.9] tracking-tighter text-slate-900 mb-8">
                ELEVATE <span className="italic font-serif text-slate-400">your</span> <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-flag-red to-orange-700 drop-shadow-sm">
                  GATHERINGS.
                </span>
            </h1>

            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium font-sans px-4">
                Experience the easiest way to order artisanal food & coffee in bulk. 
                Perfect for corporate events, parties, and family feasts.
            </p>
          </div>

          {/* ACTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto text-left">
            
            {/* CARD 1: BULK INFO */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={openBulkInfo}
              className="group cursor-pointer bg-[#FFFBF7]/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(202,34,42,0.1)] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Info size={120} className="text-flag-red rotate-12"/>
              </div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm text-flag-red group-hover:scale-110 transition-transform border border-white">
                        <ChefHat size={28} strokeWidth={1.5}/>
                    </div>
                    <h3 className="text-2xl font-heading text-slate-900 mb-2">How it works?</h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-[80%]">
                        Learn about our seamless bulk ordering process, pricing tiers, and delivery.
                    </p>
                </div>
                <div className="mt-8 flex items-center text-flag-red font-bold text-xs tracking-wider uppercase">
                  Read Details <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                </div>
              </div>
            </motion.div>

            {/* CARD 2: AI PLANNER - HIDDEN ON MOBILE */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleAIClick}
              className="hidden md:block group cursor-pointer bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 hover:shadow-flag-red/30 transition-all duration-300 relative overflow-hidden"
            >
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-0"></div>
              <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-flag-red/20 blur-[80px] rounded-full group-hover:bg-flag-red/30 transition-all duration-700"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-pastry-yellow group-hover:rotate-12 transition-transform">
                            <Sparkles size={28} />
                        </div>
                        <span className="bg-flag-red text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-widest border border-white/10">Beta</span>
                    </div>
                    
                    <h3 className="text-2xl font-heading text-white mb-2">Yard AI Planner</h3>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-[90%]">
                        Not sure what to order? Let our AI curate the perfect menu package for your budget.
                    </p>
                </div>
                <div className="mt-8 flex items-center text-old-lace font-bold text-xs tracking-wider uppercase group-hover:text-white transition-colors">
                  Try It Now <Sparkles size={14} className="ml-2"/>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Link Skip */}
          <div className="pt-8">
            <a href="#menu" className="inline-flex flex-col items-center text-slate-400 hover:text-flag-red transition-colors group">
              <span className="text-[10px] font-bold uppercase tracking-widest mb-3">Scroll to Order</span>
              <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center pt-2 group-hover:border-flag-red transition-colors">
                  <motion.div 
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-1 h-1.5 bg-slate-300 rounded-full group-hover:bg-flag-red"
                  />
              </div>
            </a>
          </div>

        </motion.div>
      </div>
    </section>
  );
};