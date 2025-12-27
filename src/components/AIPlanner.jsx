import React, { useState } from 'react';
import { X, Sparkles, Loader2, CheckCircle, Users, PartyPopper, Wallet, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenuData } from '../hooks/useMenuData';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export const AIPlanner = ({ onClose }) => {
    const { menuItems: firestoreMenu, loadingMenu } = useMenuData();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const { addToCart, formatBND } = useCart();
    
    // FORM STATES
    const [guests, setGuests] = useState("");
    const [eventType, setEventType] = useState("Gathering");
    const [budget, setBudget] = useState("Standard");

    // Tampilkan loading jika menu belum dimuat dari Firestore
    if (loadingMenu) {
        return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-old-lace p-6 rounded-xl shadow-2xl flex items-center gap-3 border border-almond-silk">
                    <Loader2 className="animate-spin text-flag-red" size={24}/>
                    <span className="text-flag-red-2 font-bold">Loading Menu Data...</span>
                </div>
            </div>
        );
    }
    
    // --- LOGIC: GENERATE AI PLAN ---
    const generatePlan = async () => {
        if (!guests || guests <= 0) {
            toast.error("Please enter a valid number of guests.", { position: "top-center" });
            return;
        }
        
        // Pastikan ada item menu yang tersedia
        const availableMenu = firestoreMenu.filter(item => item.isAvailable && item.stock > 0);
        if (availableMenu.length === 0) {
            toast.error("No available items in the menu right now. Check back later.");
            return;
        }

        setLoading(true);
        
        // API KEY
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        // Persiapkan data menu yang LEBIH BARU untuk AI
        const menuContext = availableMenu.map(i => ({
            id: i.id,  
            name: i.name,  
            minQty: i.minQty || 1,  
            price: i.price, 
            stock: i.stock, 
            options: i.options ? i.options.choices : null
        }));

        const prompt = `
          You are a Professional Catering Planner for 'The Coffeennity Yard'. Currency: BND.
          
          [AVAILABLE MENU DATA - Use this ONLY]
          ${JSON.stringify(menuContext)}
          
          [USER REQUEST]
          - Guests: ${guests} pax
          - Event Type: ${eventType}
          - Budget Level: ${budget}
          
          [TASK]
          Create a complete catering menu package strictly based on the AVAILABLE MENU DATA.
          
          [RULES]
          1. Quantity MUST be >= minQty for each item.
          2. Total suggested quantity MUST NOT exceed the item's stock level.
          3. If an item has 'options', you MUST pick one specific option string from the list provided (e.g. "Pepperoni ($15)").
          4. Output ONLY raw JSON (no markdown formatting).
          
          [OUTPUT JSON FORMAT]
          {
            "summary": "A short, exciting description of this menu package (max 20 words).",
            "items": [
              { "id": 101, "quantity": 5, "selectedOption": "Pepperoni ($15)", "reason": "Perfect for sharing" }
            ]
          }
        `;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });
            
            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("AI returned no results.");
            }

            let text = data.candidates[0].content.parts[0].text;
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            
            const json = JSON.parse(text);
            setResult(json);
            setStep(2);
            toast.success("Menu plan generated!", { icon: "✨" });

        } catch (e) {
            console.error(e);
            toast.error("AI is currently busy. Please try again manually.", {
                style: { background: '#fff', color: '#333' }
            });
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC: ACCEPT & ADD TO CART ---
    const handleAccept = () => {
        let addedCount = 0;
        
        result.items.forEach(rec => {
            const item = firestoreMenu.find(i => i.id === rec.id); 
            if (item) {
                addToCart(item, rec.quantity, rec.selectedOption || null);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            toast.success(`Added ${addedCount} items to your tray!`);
            onClose();
        }
    };

    // --- UI HELPERS ---
    const BudgetOption = ({ value, label, icon: Icon }) => (
        <button 
            onClick={() => setBudget(value)}
            className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                budget === value 
                ? 'bg-almond-silk border-flag-red text-flag-red-2 ring-1 ring-flag-red' 
                : 'bg-white border-almond-silk text-tomato-jam hover:bg-white/80'
            }`}
        >
            <Icon size={20} className={budget === value ? "text-flag-red" : "text-tomato-jam/50"}/>
            <span className="text-xs font-bold">{label}</span>
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
                className="bg-old-lace w-full max-w-lg rounded-3xl relative z-10 border border-almond-silk shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="p-5 border-b border-almond-silk flex justify-between items-center bg-old-lace sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-almond-silk rounded-lg shadow-sm">
                            <Sparkles className="text-flag-red" size={20}/> 
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-flag-red-2 tracking-wide font-pirata">YARD AI</h3>
                            <p className="text-xs text-tomato-jam font-medium">Smart Catering Assistant</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-almond-silk transition-colors">
                        <X className="text-tomato-jam hover:text-flag-red-2"/>
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Input: Guests */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-tomato-jam flex items-center gap-2">
                                        <Users size={16} className="text-flag-red"/> Total Guests
                                    </label>
                                    <input 
                                        type="number" 
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={guests} 
                                        onChange={e => setGuests(e.target.value)} 
                                        className="w-full bg-white p-4 rounded-xl text-flag-red-2 font-bold border border-almond-silk focus:border-flag-red focus:ring-4 focus:ring-flag-red/10 outline-none transition-all placeholder:text-tomato-jam/50 text-lg" 
                                        placeholder="e.g. 30" 
                                    />
                                </div>

                                {/* Input: Event Type */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-tomato-jam flex items-center gap-2">
                                        <PartyPopper size={16} className="text-flag-red"/> Event Type
                                    </label>
                                    <div className="relative">
                                        <select 
                                            value={eventType} 
                                            onChange={e => setEventType(e.target.value)} 
                                            className="w-full bg-white p-4 rounded-xl text-flag-red-2 font-bold border border-almond-silk focus:border-flag-red outline-none appearance-none cursor-pointer"
                                        >
                                            <option>Birthday Party</option>
                                            <option>Office Meeting</option>
                                            <option>Family Gathering</option>
                                            <option>Wedding Reception</option>
                                            <option>Casual Hangout</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-tomato-jam">▼</div>
                                    </div>
                                </div>

                                {/* Input: Budget */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-tomato-jam flex items-center gap-2">
                                        <Wallet size={16} className="text-flag-red"/> Budget Level
                                    </label>
                                    <div className="flex gap-3">
                                        <BudgetOption value="Economy" label="Economy" icon={Wallet} />
                                        <BudgetOption value="Standard" label="Standard" icon={Sparkles} />
                                        <BudgetOption value="Premium" label="Premium" icon={PartyPopper} />
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button 
                                    onClick={generatePlan} 
                                    disabled={loading || !guests} 
                                    className="w-full py-4 bg-flag-red-2 text-old-lace font-bold rounded-xl hover:bg-flag-red disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex justify-center items-center gap-2 shadow-xl shadow-flag-red/10 transition-all active:scale-95"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" /> Analyzing Menu...
                                        </>
                                    ) : (
                                        <>
                                            Generate Menu Plan <ArrowRight size={18}/>
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="space-y-5"
                            >
                                {/* AI Summary */}
                                <div className="bg-almond-silk/30 p-4 rounded-xl border border-almond-silk flex gap-3 items-start">
                                    <Sparkles className="text-flag-red flex-shrink-0 mt-1" size={18}/>
                                    <div>
                                        <h4 className="font-bold text-flag-red-2 text-sm mb-1 font-pirata tracking-wide">AI Recommendation</h4>
                                        <p className="text-sm text-tomato-jam italic leading-relaxed">"{result?.summary}"</p>
                                    </div>
                                </div>

                                {/* List Items */}
                                <div className="space-y-3">
                                  {result?.items.map((rec, i) => {
                                    const item = firestoreMenu.find(m => m.id === rec.id);
                                    if(!item) return null;
                                    return (
                                      <div key={i} className="flex gap-3 bg-white p-3 rounded-xl border border-almond-silk shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-16 h-16 bg-almond-silk rounded-lg overflow-hidden flex-shrink-0 relative">
                                            {/* Anda perlu memastikan item.image ada di database atau set placeholder */}
                                            <img src={item.image || `https://placehold.co/64x64/E0E7FF/4F46E5?text=${item.name.charAt(0)}`} alt={item.name} className="w-full h-full object-cover mix-blend-multiply"/>
                                        </div>
                                        <div className="flex-grow">
                                          <div className="flex justify-between items-start">
                                             <h4 className="text-flag-red-2 font-bold text-sm line-clamp-1">{item.name}</h4>
                                             <span className="text-xs font-mono font-bold text-tomato-jam whitespace-nowrap ml-2">
                                                {formatBND ? formatBND(item.price * rec.quantity) : `$${item.price * rec.quantity}`}
                                             </span>
                                          </div>
                                          
                                          {/* Menampilkan Varian yang dipilih AI */}
                                          {rec.selectedOption && (
                                              <div className="text-[10px] uppercase tracking-wider text-flag-red-2 font-bold bg-almond-silk inline-block px-1.5 py-0.5 rounded mt-1 border border-almond-silk">
                                                  {rec.selectedOption}
                                              </div>
                                          )}

                                          <div className="flex justify-between items-end mt-2">
                                             <p className="text-xs text-tomato-jam/70 italic leading-tight line-clamp-1 mr-2">{rec.reason}</p>
                                             <div className="bg-flag-red-2 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                                x{rec.quantity}
                                             </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2 border-t border-almond-silk mt-2">
                                    <button 
                                        onClick={() => setStep(1)} 
                                        className="flex-1 py-3 bg-almond-silk text-tomato-jam font-bold rounded-xl hover:bg-almond-silk/80 transition-colors flex justify-center items-center gap-2"
                                    >
                                        <ChevronLeft size={18}/> Retry
                                    </button>
                                    <button 
                                        onClick={handleAccept} 
                                        className="flex-[2] py-3 bg-flag-red-2 text-old-lace font-bold rounded-xl hover:bg-flag-red transition-all flex justify-center items-center gap-2 shadow-lg active:scale-95"
                                    >
                                        <CheckCircle size={18}/> Add All to Tray
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
