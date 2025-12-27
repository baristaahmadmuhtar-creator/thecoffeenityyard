import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Clock, User, MessageSquare, ChevronRight, Check, ChevronLeft, ChevronRight as RightArrow, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const formatDate = (dateString) => {
    if (!dateString) return 'Select Date';
    try {
        const date = new Date(dateString + 'T00:00:00'); 
        if (isNaN(date)) return 'Select Date';
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return 'Select Date';
    }
};

const toYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatTimeAMPM = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; 
    return `${hours}:${m} ${ampm}`;
};

const DatePickerModal = ({ isOpen, onClose, onSelect, initialDate, minDateObj }) => {
    const effectiveMinDate = minDateObj || new Date();
    const minDateYYYYMMDD = toYYYYMMDD(effectiveMinDate);
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [displayDate, setDisplayDate] = useState(new Date()); 

    const calendarDays = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; 
        
        const days = [];
        for (let i = startDayIndex; i > 0; i--) {
            days.push({ date: new Date(year, month, 1 - i), currentMonth: false });
        }
        const lastDayOfMonth = new Date(year, month + 1, 0);
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push({ date: new Date(year, month, i), currentMonth: true });
        }
        let dayCounter = 1;
        while (days.length < 42) {
             days.push({ date: new Date(year, month + 1, dayCounter++), currentMonth: false });
        }
        return days; 
    }, [displayDate]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-old-lace rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-almond-silk"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-bold text-flag-red-2 flex items-center gap-2 font-pirata tracking-wide">
                            <Calendar size={24} className="text-flag-red"/> Select Date
                        </h4>
                        <div className="flex gap-1">
                            <button onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-2 hover:bg-almond-silk text-flag-red-2 rounded-lg"><ChevronLeft size={20}/></button>
                            <button onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-2 hover:bg-almond-silk text-flag-red-2 rounded-lg"><RightArrow size={20}/></button>
                        </div>
                    </div>
                    <div className="text-center font-bold text-lg mb-4 text-flag-red-2">
                        {displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-tomato-jam uppercase">
                        {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <span key={d}>{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((dayObj, index) => {
                            const dateStr = toYYYYMMDD(dayObj.date);
                            const isDisabled = dateStr < minDateYYYYMMDD;
                            const isSelected = dateStr === selectedDate;
                            
                            return (
                                <button 
                                    key={index}
                                    disabled={isDisabled}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={`w-full aspect-square rounded-xl text-sm font-bold transition-all ${
                                        isSelected ? 'bg-flag-red text-old-lace shadow-lg shadow-flag-red/30' : 
                                        isDisabled ? 'text-almond-silk cursor-not-allowed' : 'text-flag-red-2 hover:bg-almond-silk hover:text-flag-red'
                                    }`}
                                >
                                    {dayObj.date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                    <button onClick={() => { onSelect(selectedDate); onClose(); }} disabled={!selectedDate} className="w-full py-3.5 mt-6 bg-flag-red-2 text-old-lace font-bold rounded-xl hover:bg-flag-red transition-all disabled:opacity-50">
                        Confirm Date
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const TimePickerModal = ({ isOpen, onClose, onSelect, initialTime, minTimeStr }) => {
    const [selectedTime, setSelectedTime] = useState(initialTime);
    const timeInputRef = React.useRef(null); // Ref untuk input time

    useEffect(() => {
        if (isOpen && minTimeStr && (!initialTime || initialTime < minTimeStr)) {
            setSelectedTime(minTimeStr);
        }
    }, [isOpen, minTimeStr, initialTime]);

    const handleConfirm = () => {
        if (!selectedTime) return;
        const [h, m] = selectedTime.split(':').map(Number);
        const mins = h * 60 + m;
        
        if (mins < 420 || mins > 1380) { 
            toast.error("We are open from 07:00 AM to 11:00 PM.");
            return;
        }
        if (minTimeStr) {
            const [mh, mm] = minTimeStr.split(':').map(Number);
            if (mins < mh * 60 + mm) {
                toast.error(`Earliest pickup is ${formatTimeAMPM(minTimeStr)}`);
                return;
            }
        }
        onSelect(selectedTime);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
             <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-old-lace rounded-3xl p-6 w-full max-w-sm shadow-2xl"
                >
                    <h4 className="text-xl font-bold text-flag-red-2 mb-6 flex items-center gap-2 font-pirata tracking-wide">
                        <Clock size={24} className="text-flag-red"/> Select Time
                    </h4>
                    
                    <div 
                        className="bg-white rounded-2xl p-6 border border-almond-silk mb-4 cursor-pointer active:bg-almond-silk"
                        onClick={() => timeInputRef.current?.showPicker?.()} 
                    >
                        <input 
                            ref={timeInputRef}
                            type="time" 
                            value={selectedTime} 
                            onChange={(e) => setSelectedTime(e.target.value)} 
                            className="w-full bg-transparent text-4xl font-bold text-center outline-none text-flag-red-2 cursor-pointer"
                        />
                    </div>
                    
                    <button 
                        onClick={handleConfirm} 
                        className="w-full py-4 bg-flag-red-2 text-old-lace font-bold rounded-xl hover:bg-flag-red transition-all shadow-lg"
                    >
                        Confirm Time
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export const PreOrderForm = ({ onClose }) => {
  const { cart, cartTotal, formatBND } = useCart();
  const [formData, setFormData] = useState({ name: '', date: '', time: '', notes: '' });
  const [modalOpen, setModalOpen] = useState(null);

  const { minDateObj, minTimeForTodayStr } = useMemo(() => {
      const now = new Date();
      let maxPrepHours = 0;
      let forceNextDay = false;

      cart.forEach(item => {
          const itemPrep = Number(item.prepTime || 24); 
          if (itemPrep >= 24) forceNextDay = true;
          if (itemPrep > maxPrepHours) maxPrepHours = itemPrep;
      });

      const openingTime = new Date(); openingTime.setHours(7, 0, 0, 0); 
      let startTime = now < openingTime ? openingTime : now;
      let earliest = new Date(startTime.getTime() + (maxPrepHours * 3600000));
      
      if (earliest < openingTime) earliest = openingTime;

      const closing = new Date(); closing.setHours(23, 0, 0, 0);
      let resDate = new Date();
      let resTime = null;

      if (forceNextDay || earliest > closing) {
          resDate.setDate(now.getDate() + 1);
          resDate.setHours(0,0,0,0);
      } else {
          resDate.setHours(0,0,0,0);
          resTime = `${String(earliest.getHours()).padStart(2,'0')}:${String(earliest.getMinutes()).padStart(2,'0')}`;
      }
      return { minDateObj: resDate, minTimeForTodayStr: resTime };
  }, [cart]);

  const handleSend = () => {
    if (!formData.name || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields."); return;
    }
    
    const orderID = Math.floor(1000 + Math.random() * 9000); 
    let msg = `*📦 NEW ORDER - #${orderID}*\n─────────────────\n`;
    msg += `👤 *CUSTOMER INFO*\nName : *${formData.name}*\nDate : ${formatDate(formData.date)}\nTime : ${formatTimeAMPM(formData.time)}\n─────────────────\n\n`;
    msg += `🛒 *ORDER LIST (${cart.length} Items)*\n`;
    
    cart.forEach((item, idx) => {
      let dName = item.name;
      if (item.selectedOption) dName = dName.split('(')[0].trim();
      msg += `${idx + 1}. *${dName}* (x${item.quantity})\n`;
      if (item.selectedOption) msg += `   └ _${item.selectedOption.replace(/[()]/g, '')}_\n`;
      msg += `   💲 ${formatBND(item.price * item.quantity)}\n\n`;
    });

    if(formData.notes) msg += `─────────────────\n📝 *NOTES:*\n_${formData.notes}_\n`;
    msg += `─────────────────\n💰 *TOTAL: ${formatBND(cartTotal)}*\n─────────────────\nThank you! 🙏`;

    window.open(`https://wa.me/6738304535?text=${encodeURIComponent(msg)}`, '_blank');
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-old-lace w-full max-w-lg rounded-t-3xl md:rounded-3xl relative z-10 shadow-2xl h-[90vh] md:h-auto flex flex-col"
          >
            <div className="p-6 border-b border-almond-silk flex justify-between items-center">
              <div>
                  <h3 className="text-2xl font-black text-flag-red-2 flex items-center gap-2 font-pirata tracking-wide"><ClipboardList className="text-flag-red"/> Checkout</h3>
                  <p className="text-tomato-jam text-sm">Finalize your order.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-almond-silk hover:bg-white text-tomato-jam"><X size={24} className="text-tomato-jam"/></button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-grow">
              <div>
                  <label className="text-sm font-bold text-tomato-jam mb-2 flex gap-2"><User size={16} className="text-flag-red"/> Name</label>
                  <input type="text" placeholder="Your Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white rounded-xl px-4 py-3.5 border border-almond-silk outline-none focus:border-flag-red focus:bg-white transition-all font-bold text-flag-red-2 placeholder-tomato-jam/50"/>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-sm font-bold text-tomato-jam mb-2 flex gap-2"><Calendar size={16} className="text-flag-red"/> Date</label>
                    <div onClick={() => setModalOpen('date')} className="bg-white border border-almond-silk rounded-xl px-4 py-3.5 flex justify-between items-center cursor-pointer hover:bg-almond-silk/30">
                        <span className={`font-bold ${formData.date ? 'text-flag-red-2' : 'text-tomato-jam/50'}`}>{formatDate(formData.date)}</span>
                        <ChevronRight size={18} className="text-tomato-jam"/>
                    </div>
                 </div>
                 <div>
                    <label className="text-sm font-bold text-tomato-jam mb-2 flex gap-2"><Clock size={16} className="text-flag-red"/> Time</label>
                    <div onClick={() => setModalOpen('time')} className="bg-white border border-almond-silk rounded-xl px-4 py-3.5 flex justify-between items-center cursor-pointer hover:bg-almond-silk/30">
                        <span className={`font-bold ${formData.time ? 'text-flag-red-2' : 'text-tomato-jam/50'}`}>{formData.time ? formatTimeAMPM(formData.time) : 'Select Time'}</span>
                        <ChevronRight size={18} className="text-tomato-jam"/>
                    </div>
                 </div>
              </div>

              <div>
                 <label className="text-sm font-bold text-tomato-jam mb-2 flex gap-2"><MessageSquare size={16} className="text-flag-red"/> Notes</label>
                 <textarea className="w-full bg-white rounded-xl px-4 py-3 border border-almond-silk outline-none focus:border-flag-red focus:bg-white h-24 resize-none font-medium text-flag-red-2 placeholder-tomato-jam/50" placeholder="Optional..." onChange={e => setFormData({...formData, notes: e.target.value})}>{formData.notes}</textarea>
              </div>
            </div>

            <div className="p-6 border-t border-almond-silk bg-old-lace md:rounded-b-3xl">
              <div className="flex justify-between items-center mb-4 px-1">
                  <span className="text-tomato-jam font-bold">Total Estimate</span>
                  <span className="text-flag-red font-black text-2xl">{formatBND(cartTotal)}</span>
              </div>
              <button onClick={handleSend} className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-lg rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg active:scale-[0.99]">
                Place Order <ChevronRight size={20}/>
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
      
      <DatePickerModal 
          isOpen={modalOpen === 'date'} 
          onClose={() => setModalOpen(null)} 
          onSelect={(date) => setFormData({...formData, date, time: ''})} 
          initialDate={formData.date}
          minDateObj={minDateObj} 
      />

      <TimePickerModal
          isOpen={modalOpen === 'time'}
          onClose={() => setModalOpen(null)}
          onSelect={(time) => setFormData({...formData, time})}
          initialTime={formData.time}
          minTimeStr={minTimeForTodayStr}
      />
    </>
  );
};
