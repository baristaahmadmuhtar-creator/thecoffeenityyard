import React from 'react';
import { Sparkles, ArrowRight, Star, Info } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const Hero = ({ openAI, openBulkInfo }) => {
  const { scrollY } = useScroll();
  
  // Parallax Effect
  const yText = useTransform(scrollY, [0, 300], [0, 50]);
  const opacityText = useTransform(scrollY, [0, 300], [1, 0]); 

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-old-lace py-12">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-almond-silk/60 via-old-lace to-old-lace pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-flag-red/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-tomato-jam/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 pt-10">
        <motion.div 
          style={{ y: yText, opacity: opacityText }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto text-center space-y-10"
        >

          {/* HEADLINE */}
          <div>
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white border border-almond-silk shadow-sm mb-6"
            >
                <Star size={16} className="fill-flag-red text-flag-red"/>
                <span className="text-tomato-jam text-xs font-bold tracking-wider uppercase">
                Pre-order Only • Bulk Catering  
                </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tighter text-flag-red-2 mb-6 font-pirata">
                ELEVATE YOUR <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-flag-red to-tomato-jam">
                EVENTS & GATHERINGS.
                </span>
            </h1>

            <p className="text-tomato-jam text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
                Experience the easiest way to order bulk food for your events, crafted by The Coffeennity Yard.
            </p>
          </div>

          {/* SPLIT OPTIONS (TILES) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto text-left">
            
            {/* OPTION 1: BULK ORDER INFO */}
            <motion.div 
              whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}
              onClick={openBulkInfo}
              className="group cursor-pointer bg-white p-8 rounded-[2rem] border border-almond-silk shadow-xl shadow-flag-red/5 hover:shadow-2xl hover:border-flag-red transition-all flex flex-col justify-between h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-old-lace rounded-bl-[80px] -mr-6 -mt-6 transition-all group-hover:bg-almond-silk"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-old-lace border border-almond-silk rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                  <Info className="text-flag-red-2" size={28}/>
                </div>
                <h3 className="text-2xl font-black text-flag-red-2 mb-2 group-hover:text-flag-red transition-colors font-pirata tracking-wide">What is Bulk Order?</h3>
                <p className="text-sm md:text-base text-tomato-jam font-medium leading-relaxed">
                  Coffeenityyard Bulk Order is a centralized platform designed for large quantity orders—simple, organized, and cost-efficient.
                </p>
              </div>
              <div className="mt-8 flex items-center text-flag-red-2 font-bold text-sm relative z-10">
                Read Details <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform"/>
              </div>
            </motion.div>

            {/* OPTION 2: AI MENU PLANNER */}
            <motion.div 
              whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}
              onClick={openAI}
              className="group cursor-pointer bg-flag-red-2 p-8 rounded-[2rem] border border-flag-red-2 shadow-2xl shadow-flag-red-2/20 hover:shadow-flag-red/20 transition-all flex flex-col justify-between h-full relative overflow-hidden"
            >
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-flag-red/30 rounded-full blur-3xl pointer-events-none group-hover:bg-flag-red/40 transition-all duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="text-old-lace" size={28}/>
                </div>
                <h3 className="text-2xl font-black text-white mb-2 flex flex-wrap items-center gap-2 font-pirata tracking-wide">
                  Create Menu with AI
                  <span className="bg-old-lace text-flag-red-2 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wide font-extrabold font-sans">Beta</span>
                </h3>
                <p className="text-sm md:text-base text-almond-silk font-medium leading-relaxed">
                  Seamless ordering for groups, events, and offices. More quantity, better value—same Coffeenityyard quality.
                </p>
              </div>
              <div className="mt-8 flex items-center text-old-lace font-bold text-sm relative z-10 group-hover:text-white transition-colors">
                Try Yard AI <Sparkles size={18} className="ml-2 group-hover:rotate-12 transition-transform"/>
              </div>
            </motion.div>

          </div>

          {/* Link Skip */}
          <div className="pt-6">
            <a href="#menu" className="inline-flex items-center text-tomato-jam/60 hover:text-flag-red-2 font-bold text-sm transition-all border-b border-transparent hover:border-flag-red-2 pb-0.5">
              Skip & Browse Full Menu <ArrowRight size={14} className="ml-1"/>
            </a>
          </div>

        </motion.div>
      </div>
    </section>
  );
};
