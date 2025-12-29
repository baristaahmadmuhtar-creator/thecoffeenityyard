import React from 'react';
import { Sparkles, ArrowRight, Info, ChefHat, Clock, ShieldCheck } from 'lucide-react';
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
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden py-20">
      
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
          className="max-w-5xl mx-auto text-center space-y-10 will-change-transform"
        >

          {/* HEADLINE */}
          <div className="flex flex-col items-center">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-sm mb-6"
            >
                <Clock size={14} className="text-flag-red" />
                <span className="text-slate-600 text-[10px] md:text-xs font-bold tracking-widest uppercase font-sans">
                  Order in 3 minutes • 100% Reliable
                </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-normal leading-[0.9] tracking-tighter text-slate-900 mb-6">
                EVENT FOOD,<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-flag-red to-orange-700 drop-shadow-sm">
                  SOLVED.
                </span>
            </h1>

            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium font-sans px-4">
                The stress-free way to feed your crowd. 
                Premium bulk platters & coffee, coordinated perfectly for your event.
            </p>
          </div>

          {/* ACTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto text-left">
            
            {/* CARD 1: BROWSE MENU (Speed Focus) */}
            <a href="#menu" className="group block h-full">
              <motion.div 
                whileHover={{ y: -5, scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="h-full bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(202,34,42,0.1)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                    <div className="w-12 h-12 bg-old-lace rounded-2xl flex items-center justify-center mb-4 text-flag-red group-hover:scale-110 transition-transform">
                        <ChefHat size={24} strokeWidth={2}/>
                    </div>
                    <h3 className="text-xl font-heading text-slate-900 mb-1">Browse Menu</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Choose from curated bundles and platters designed for groups.
                    </p>
                </div>
                <div className="mt-6 flex items-center text-flag-red font-bold text-xs tracking-wider uppercase">
                  Start Ordering <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                </div>
              </motion.div>
            </a>

            {/* CARD 2: AI PLANNER (Low Effort Focus) */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleAIClick}
              className="h-full cursor-pointer bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 hover:shadow-flag-red/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-0"></div>
              <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-flag-red/20 blur-[80px] rounded-full group-hover:bg-flag-red/30 transition-all duration-700"></div>
              
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-pastry-yellow group-hover:rotate-12 transition-transform">
                          <Sparkles size={24} />
                      </div>
                      <span className="bg-flag-red text-white text-[10px] px-2 py-1 rounded-lg uppercase font-bold tracking-widest">Fast</span>
                  </div>
                  
                  <h3 className="text-xl font-heading text-white mb-1">Let AI Build It</h3>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">
                      Tell us your budget & pax. We'll generate the perfect order instantly.
                  </p>
              </div>
              <div className="relative z-10 mt-6 flex items-center text-old-lace font-bold text-xs tracking-wider uppercase group-hover:text-white transition-colors">
                Try AI Planner <Sparkles size={14} className="ml-2"/>
              </div>
            </motion.div>

          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 pt-4 opacity-70">
             <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={16} className="text-flag-red"/> Verified Quality
             </div>
             <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <Clock size={16} className="text-flag-red"/> On-Time Ready
             </div>
             <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-flag-red transition-colors" onClick={openBulkInfo}>
                <Info size={16} className="text-flag-red"/> Bulk Benefits
             </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
};