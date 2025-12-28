import React, { useState } from 'react';
import { X, Sparkles, Loader2, CheckCircle, Users, PartyPopper, Wallet, ArrowRight, ChevronLeft, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenuData } from '../hooks/useMenuData';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { GoogleGenAI, Type } from "@google/genai";
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const AIPlanner = ({ onClose }) => {
    const { menuItems: firestoreMenu, loadingMenu } = useMenuData();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const { addToCart, formatBND } = useCart();
    
    // Lock scroll
    useBodyScrollLock(true);
    
    // FORM STATES
    const [guests, setGuests] = useState("");
    const [eventType, setEventType] = useState("Gathering");
    const [budget, setBudget] = useState("Standard");

    if (loadingMenu) {
        return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/80 backdrop-blur-md">
                <Loader2 className="animate-spin text-flag-red" size={32}/>
            </div>
        );
    }
    
    const generatePlan = async () => {
        if (!guests || guests <= 0) {
            toast.error("Please enter a valid number of guests.", { position: "top-center" });
            return;
        }
        
        // Filter: Available, In Stock, and NOT excluded from AI
        const availableMenu = firestoreMenu.filter(item => 
            item.isAvailable && 
            item.stock > 0 && 
            !item.excludeFromAI
        );

        if (availableMenu.length === 0) {
            toast.error("No available items in the menu right now.");
            return;
        }

        // Use process.env.API_KEY as per strict standards
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            toast.error("System Error: AI API Key is missing.");
            return;
        }

        setLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: apiKey });
            const menuContext = availableMenu.map(i => ({
                id: i.id,  
                name: i.name,  
                minQty: i.minQty || 1,  
                price: i.price,
                stock: i.stock,
                options: i.options ? i.options.choices : []
            }));

            const prompt = `
              Role: Professional Catering Planner for 'The Coffeennity Yard'. Currency: BND.
              Context: Guests: ${guests} pax, Event: ${eventType}, Budget: ${budget}.
              Available Menu: ${JSON.stringify(menuContext)}
              Task: Create a menu package. Rules: Qty >= minQty, Qty <= stock.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            items: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        quantity: { type: Type.NUMBER },
                                        selectedOption: { type: Type.STRING, nullable: true },
                                        reason: { type: Type.STRING }
                                    },
                                    required: ["id", "quantity", "reason"]
                                }
                            }
                        },
                        required: ["summary", "items"]
                    }
                }
            });

            if (response.text) {
                // Sanitize response: remove markdown code fences if present
                let cleanText = response.text.trim();
                if (cleanText.startsWith('```json')) {
                    cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
                } else if (cleanText.startsWith('```')) {
                    cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim();
                }

                const json = JSON.parse(cleanText);
                setResult(json);
                setStep(2);
            } else {
                throw new Error("No text returned from AI");
            }

        } catch (e) {
            console.error("AI Error:", e);
            toast.error("AI is currently busy. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = () => {
        let addedCount = 0;
        result.items.forEach(rec => {
            const item = firestoreMenu.find(i => i.id === rec.id); 
            if (item) {
                const option = rec.selectedOption && rec.selectedOption !== "null" ? rec.selectedOption : null;
                addToCart(item, rec.quantity, option);
                addedCount++;
            }
        });
        if (addedCount > 0) {
            toast.success(`Added ${addedCount} items to your tray!`);
            onClose();
        }
    };

    const BudgetOption = ({ value, label, icon: Icon }) => (
        <button 
            onClick={() => setBudget(value)}
            className={`flex-1 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border shadow-sm active:scale-95 ${
                budget === value 
                ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/20 ring-2 ring-offset-2 ring-slate-900' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
            }`}
        >
            <Icon size={20} className={budget === value ? "text-flag-red" : "text-slate-400"}/>
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} 
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/50"
            >
                {/* Header */}
                <div className="p-6 bg-old-lace border-b border-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-white flex items-center justify-center text-flag-red">
                            <Sparkles size={20} /> 
                        </div>
                        <div>
                            <h3 className="text-xl font-heading text-slate-900 leading-none">Yard AI</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Planner</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/50 transition-colors">
                        <X className="text-slate-400 hover:text-slate-900"/>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-grow bg-white/50">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 ml-1">
                                        <Users size={14} className="text-flag-red"/> Guest Count
                                    </label>
                                    <input 
                                        type="number" 
                                        value={guests} 
                                        onChange={e => setGuests(e.target.value)} 
                                        className="w-full bg-white p-5 rounded-2xl text-slate-900 font-bold text-xl border border-slate-200 focus:border-flag-red focus:ring-4 focus:ring-flag-red/10 outline-none transition-all placeholder:text-slate-300 shadow-sm" 
                                        placeholder="e.g. 50" 
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 ml-1">
                                        <PartyPopper size={14} className="text-flag-red"/> Event Type
                                    </label>
                                    <div className="relative">
                                        <select 
                                            value={eventType} 
                                            onChange={e => setEventType(e.target.value)} 
                                            className="w-full bg-white p-5 rounded-2xl text-slate-900 font-bold text-lg border border-slate-200 focus:border-flag-red focus:ring-4 focus:ring-flag-red/10 outline-none appearance-none cursor-pointer shadow-sm"
                                        >
                                            <option>Birthday Party</option>
                                            <option>Office Meeting</option>
                                            <option>Family Gathering</option>
                                            <option>Wedding Reception</option>
                                            <option>Casual Hangout</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 ml-1">
                                        <Wallet size={14} className="text-flag-red"/> Budget Tier
                                    </label>
                                    <div className="flex gap-3">
                                        <BudgetOption value="Economy" label="Economy" icon={Wallet} />
                                        <BudgetOption value="Standard" label="Standard" icon={Sparkles} />
                                        <BudgetOption value="Premium" label="Premium" icon={PartyPopper} />
                                    </div>
                                </div>

                                <button 
                                    onClick={generatePlan} 
                                    disabled={loading || !guests} 
                                    className="w-full py-5 bg-flag-red text-white font-bold rounded-2xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 shadow-xl shadow-flag-red/20 transition-all active:scale-95 text-lg mt-4"
                                >
                                    {loading ? (
                                        <><Loader2 className="animate-spin" /> Thinking...</>
                                    ) : (
                                        <>Generate Plan <ArrowRight size={20}/></>
                                    )}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="bg-old-lace p-6 rounded-3xl border border-almond-silk shadow-sm relative">
                                    <Quote className="absolute top-4 left-4 text-flag-red/20" size={40}/>
                                    <p className="text-slate-700 font-medium italic relative z-10 text-center leading-relaxed text-sm md:text-base">
                                        "{result?.summary}"
                                    </p>
                                </div>

                                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                                  {result?.items.map((rec, i) => {
                                    const item = firestoreMenu.find(m => m.id === rec.id);
                                    if(!item) return null;
                                    return (
                                      <div key={i} className="flex gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-16 h-16 bg-old-lace rounded-xl overflow-hidden flex-shrink-0 border border-slate-50">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" onError={e => e.target.src="https://placehold.co/150?text=No+Img"}/>
                                        </div>
                                        <div className="flex-grow min-w-0 flex flex-col justify-center">
                                          <div className="flex justify-between items-start mb-1">
                                             <h4 className="text-slate-900 font-bold text-sm truncate pr-2">{item.name}</h4>
                                             <span className="text-xs font-black text-slate-700 whitespace-nowrap bg-old-lace px-2 py-1 rounded-lg border border-almond-silk">
                                                x{rec.quantity}
                                             </span>
                                          </div>
                                          
                                          {rec.selectedOption && rec.selectedOption !== "null" && (
                                              <span className="text-[10px] uppercase tracking-wider text-flag-red font-bold bg-red-50 w-fit px-1.5 rounded-md mb-1">
                                                  {rec.selectedOption}
                                              </span>
                                          )}
                                          
                                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 italic">"{rec.reason}"</p>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button 
                                        onClick={() => setStep(1)} 
                                        className="px-6 py-4 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
                                    >
                                        <ChevronLeft size={20}/>
                                    </button>
                                    <button 
                                        onClick={handleAccept} 
                                        className="flex-grow py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-flag-red transition-all shadow-lg hover:shadow-flag-red/30 flex justify-center items-center gap-2 active:scale-95"
                                    >
                                        <CheckCircle size={20}/> Add to Tray
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};